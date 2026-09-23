import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  extractText,
  getDocumentProxy,
} from "unpdf";

import {
  optimizeResumeForATS,
  type ResumePageCount,
} from "@/lib/ai/ats-resume-optimizer";

import {
  generateATSResult,
} from "@/lib/ai/ats-analyzer";

import {
  ATSResultSchema,
  type ATSResult,
} from "@/lib/ai/ats-schema";

import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";

import {
  ResumeDesignSchema,
  type ResumeDesign,
} from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const MAX_ATTEMPTS = 5;

const ATS_SAFE_DESIGN: ResumeDesign =
  {
    layout: "single-column",

    density: "balanced",

    style: "ats",

    colors: {
      primary: "#1E3A8A",
      secondary: "#2563EB",
      text: "#0F172A",
      mutedText: "#64748B",
      background: "#FFFFFF",
      border: "#D8DEE8",
    },

    typography: {
      headingFont: "Arial",
      bodyFont: "Arial",
      headingSize: "medium",
      bodySize: "medium",
    },

    header: {
      alignment: "left",

      photo: {
        enabled: false,
        position: "right",
        shape: "circle",
        size: "small",
      },
    },

    sections: {
      order: [
        "summary",
        "skills",
        "experience",
        "projects",
        "education",
        "certifications",
        "achievements",
        "languages",
      ],

      emphasis: [
        "experience",
        "skills",
        "projects",
      ],
    },

    sidebar: {
      enabled: false,
      sections: [],
    },

    visual: {
      borderStyle: "subtle",
      cardStyle: "none",
      accentStyle: "line",
    },

    ats: {
      safe: true,
      tablesUsed: false,
      graphicsUsed: false,
      recommendedForATS: true,
    },
  };

function cleanText(
  value: string,
): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parsePageCount(
  value: FormDataEntryValue | null,
): ResumePageCount {
  if (
    typeof value !== "string"
  ) {
    return 2;
  }

  const parsed =
    Number(value);

  if (parsed === 1) {
    return 1;
  }

  if (parsed === 3) {
    return 3;
  }

  return 2;
}

function resumeToText(
  resume: ResumeData,
): string {
  const parts: string[] = [];

  const personal =
    resume.personal;

  parts.push(
    personal.name,
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.github,
    personal.website,
  );

  if (
    resume.professionalSummary
  ) {
    parts.push(
      "PROFESSIONAL SUMMARY",
      resume.professionalSummary,
    );
  }

  if (resume.skills.length) {
    parts.push("SKILLS");

    for (const group of resume.skills) {
      parts.push(
        group.category,
        group.items.join(", "),
      );
    }
  }

  if (resume.experience.length) {
    parts.push("EXPERIENCE");

    for (const item of resume.experience) {
      parts.push(
        item.role,
        item.company,
        item.location,
        item.startDate,
        item.endDate,
        ...item.responsibilities,
      );
    }
  }

  if (resume.projects.length) {
    parts.push("PROJECTS");

    for (const item of resume.projects) {
      parts.push(
        item.name,
        item.description,
        ...item.technologies,
        item.url,
      );
    }
  }

  if (resume.education.length) {
    parts.push("EDUCATION");

    for (const item of resume.education) {
      parts.push(
        item.institution,
        item.degree,
        item.field,
        item.startDate,
        item.endDate,
        ...item.details,
      );
    }
  }

  if (
    resume.certifications.length
  ) {
    parts.push(
      "CERTIFICATIONS",
    );

    for (
      const item of resume.certifications
    ) {
      parts.push(
        item.name,
        item.issuer,
        item.date,
        item.url,
      );
    }
  }

  if (resume.achievements.length) {
    parts.push(
      "ACHIEVEMENTS",
      ...resume.achievements,
    );
  }

  if (resume.languages.length) {
    parts.push(
      "LANGUAGES",
      resume.languages.join(", "),
    );
  }

  for (
    const section of
      resume.additionalSections
  ) {
    parts.push(
      section.title,
      ...section.items,
    );
  }

  return cleanText(
    parts
      .filter(Boolean)
      .join("\n"),
  );
}

function repairFeedback(
  originalScore: number,
  candidateScore: number,
  candidateATS: ATSResult,
): string {
  const missingKeywords =
    candidateATS.keywordMatch
      .missingKeywords
      .slice(0, 20);

  const missingSkills =
    candidateATS.skills
      .missingSkills
      .slice(0, 20);

  const recommendations =
    candidateATS.recommendations
      .slice(0, 8)
      .map(
        (item) =>
          `[${item.priority}] ${item.recommendation}`,
      );

  return `
REPAIR REQUIRED.

Original verified ATS score:
${originalScore}/100

Previous candidate score:
${candidateScore}/100

The previous candidate did not improve the verified score.

You MUST preserve all original factual information.

Fix the following:

Missing keywords:
${
  missingKeywords.length
    ? missingKeywords.join(", ")
    : "None"
}

Missing skills:
${
  missingSkills.length
    ? missingSkills.join(", ")
    : "None"
}

Recommendations:
${
  recommendations.length
    ? recommendations.join("\n")
    : "None"
}

IMPORTANT:

Do not invent facts.

Do not add unsupported technologies.

Do not add fake metrics.

Do not delete education.

Do not delete projects.

Do not delete certifications.

Do not delete experience.

Do not shorten the resume by removing factual information.

Improve keyword placement, section organization,
summary alignment and factual bullet wording.

The next candidate MUST be at least as strong as the
original and should improve the verified ATS score.
`;
}

async function extractResumeText(
  file: File,
) {
  if (
    file.size <= 0
  ) {
    throw new Error(
      "The uploaded resume is empty.",
    );
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      "Resume must be smaller than 5 MB.",
    );
  }

  const filename =
    file.name.toLowerCase();

  if (
    file.type !==
      "application/pdf" &&
    !filename.endsWith(".pdf")
  ) {
    throw new Error(
      "Only PDF resume files are supported.",
    );
  }

  const bytes =
    new Uint8Array(
      await file.arrayBuffer(),
    );

  const pdf =
    await getDocumentProxy(
      bytes,
    );

  if (
    !pdf.numPages ||
    pdf.numPages < 1
  ) {
    throw new Error(
      "The PDF contains no readable pages.",
    );
  }

  if (pdf.numPages > 20) {
    throw new Error(
      "Resume cannot contain more than 20 pages.",
    );
  }

  const extracted =
    await extractText(
      pdf,
      {
        mergePages: true,
      },
    );

  const text =
    cleanText(
      String(
        extracted.text ?? "",
      ),
    );

  if (text.length < 50) {
    throw new Error(
      "We could not extract enough readable text from this PDF.",
    );
  }

  return {
    text,
    pageCount:
      pdf.numPages,
  };
}

export async function POST(
  request: Request,
) {
  try {
    /* ==========================================================
       AUTH
    ========================================================== */

    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please sign in.",
        },
        {
          status: 401,
        },
      );
    }

    /* ==========================================================
       FORM DATA
    ========================================================== */

    const formData =
      await request.formData();

    const file =
      formData.get("resume");

    const atsResultValue =
      formData.get(
        "atsResult",
      );

    const jobDescriptionValue =
      formData.get(
        "jobDescription",
      );

    const resumeIdValue =
      formData.get(
        "resumeId",
      );

    const pageCount =
      parsePageCount(
        formData.get(
          "pageCount",
        ),
      );

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please upload your original resume PDF.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof atsResultValue !==
      "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please analyze the resume before optimizing it.",
        },
        {
          status: 400,
        },
      );
    }

    /* ==========================================================
       VALIDATE CLIENT ATS RESULT
    ========================================================== */

    let parsedATS: unknown;

    try {
      parsedATS =
        JSON.parse(
          atsResultValue,
        );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "The ATS analysis data is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    const atsValidation =
      ATSResultSchema.safeParse(
        parsedATS,
      );

    if (
      !atsValidation.success
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The ATS analysis structure is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    const clientATS =
      atsValidation.data;

    /* ==========================================================
       JOB DESCRIPTION
    ========================================================== */

    const jobDescription =
      typeof jobDescriptionValue ===
      "string"
        ? cleanText(
            jobDescriptionValue,
          )
        : "";

    /* ==========================================================
       EXTRACT ORIGINAL
    ========================================================== */

    const extracted =
      await extractResumeText(
        file,
      );

    const originalText =
      extracted.text;

    /* ==========================================================
       SERVER VERIFICATION OF ORIGINAL
    ========================================================== */

    let originalATS =
      clientATS;

    try {
      const serverATS =
        await generateATSResult(
          originalText,
          jobDescription,
        );

      const serverValidation =
        ATSResultSchema.safeParse(
          serverATS,
        );

      if (
        serverValidation.success
      ) {
        originalATS =
          serverValidation.data;
      }
    } catch (error) {
      console.warn(
        "[ATS] Server original verification failed. Using client analysis.",
        error,
      );
    }

    const originalScore =
      Math.round(
        originalATS.overallScore,
      );

    /* ==========================================================
       OPTIMIZATION
    ========================================================== */

    let bestResume:
      | ResumeData
      | null = null;

    let bestATS:
      | ATSResult
      | null = null;

    let bestScore =
      -1;

    let feedback = "";

    const attempts: Array<{
      attempt: number;
      score: number;
      accepted: boolean;
    }> = [];

    for (
      let attempt = 1;
      attempt <= MAX_ATTEMPTS;
      attempt++
    ) {
      console.log(
        `[ATS] Attempt ${attempt}/${MAX_ATTEMPTS}`,
      );

      let candidate: ResumeData;

      try {
        candidate =
          await optimizeResumeForATS(
            originalText,
            originalATS,
            jobDescription,
            pageCount,
            feedback,
          );
      } catch (error) {
        console.error(
          `[ATS] Optimization attempt ${attempt} failed`,
          error,
        );

        continue;
      }

      const candidateValidation =
        ResumeSchema.safeParse(
          candidate,
        );

      if (
        !candidateValidation.success
      ) {
        console.error(
          "[ATS] Invalid candidate:",
          candidateValidation.error.flatten(),
        );

        feedback = `
The previous output was not a valid ResumeData structure.

Return the exact required JSON structure.
Preserve every original section.
`;

        continue;
      }

      const verifiedResume =
        candidateValidation.data;

      const candidateText =
        resumeToText(
          verifiedResume,
        );

      if (
        candidateText.length < 50
      ) {
        feedback = `
The candidate resume was too short.

Preserve the complete original factual content.
`;

        continue;
      }

      let candidateATS:
        | ATSResult
        | null = null;

      try {
        const verification =
          await generateATSResult(
            candidateText,
            jobDescription,
          );

        const validation =
          ATSResultSchema.safeParse(
            verification,
          );

        if (
          validation.success
        ) {
          candidateATS =
            validation.data;
        }
      } catch (error) {
        console.error(
          "[ATS] Candidate verification failed:",
          error,
        );
      }

      if (!candidateATS) {
        feedback = `
Candidate verification failed.

Generate a clean, complete, valid resume.
Preserve all original factual information.
`;

        continue;
      }

      const candidateScore =
        Math.round(
          candidateATS.overallScore,
        );

      const accepted =
        candidateScore >=
        originalScore;

      attempts.push({
        attempt,
        score: candidateScore,
        accepted,
      });

      if (
        candidateScore >
        bestScore
      ) {
        bestScore =
          candidateScore;

        bestResume =
          verifiedResume;

        bestATS =
          candidateATS;
      }

      console.log(
        `[ATS] Attempt ${attempt}: ${candidateScore}; original ${originalScore}; accepted=${accepted}`,
      );

      if (accepted) {
        break;
      }

      feedback =
        repairFeedback(
          originalScore,
          candidateScore,
          candidateATS,
        );
    }

    /* ==========================================================
       NO CANDIDATE
    ========================================================== */

    if (
      !bestResume ||
      !bestATS
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "HirePro could not produce a verified optimized resume. Please try again.",
        },
        {
          status: 502,
        },
      );
    }

    /* ==========================================================
       FINAL DECISION
    ========================================================== */

    const improved =
      bestScore >
      originalScore;

    const accepted =
      bestScore >=
      originalScore;

    const scoreDifference =
      bestScore -
      originalScore;

    const optimizedDesign =
      ResumeDesignSchema.parse(
        ATS_SAFE_DESIGN,
      );

    /* ==========================================================
       SAVE ONLY ACCEPTED OPTIMIZATION
    ========================================================== */

    let saved = false;

    if (
      accepted &&
      typeof resumeIdValue ===
        "string" &&
      resumeIdValue
    ) {
      const {
        data: ownedResume,
      } = await supabase
        .from("resumes")
        .select(
          "id, template",
        )
        .eq(
          "id",
          resumeIdValue,
        )
        .eq(
          "user_id",
          user.id,
        )
        .maybeSingle();

      if (ownedResume) {
        const {
          error:
            updateError,
        } = await supabase
          .from("resumes")
          .update({
            resume_data:
              bestResume,

            design_config:
              optimizedDesign,

            template:
              "ats",
          })
          .eq(
            "id",
            ownedResume.id,
          )
          .eq(
            "user_id",
            user.id,
          );

        if (!updateError) {
          saved = true;

          const {
            data:
              versionRows,
          } = await supabase
            .from(
              "resume_versions",
            )
            .select(
              "version_number",
            )
            .eq(
              "resume_id",
              ownedResume.id,
            )
            .order(
              "version_number",
              {
                ascending: false,
              },
            )
            .limit(1);

          const nextVersion =
            (versionRows?.[0]
              ?.version_number ??
              0) + 1;

          await supabase
            .from(
              "resume_versions",
            )
            .insert({
              resume_id:
                ownedResume.id,

              version_number:
                nextVersion,

              version_name:
                improved
                  ? "ATS Optimized"
                  : "ATS Verified",

              resume_data:
                bestResume,

              design_config:
                optimizedDesign,

              template:
                "ats",
            });
        } else {
          console.error(
            "[ATS] Failed to save optimized resume:",
            updateError,
          );
        }
      }
    }

    /* ==========================================================
       RESPONSE
    ========================================================== */

    return NextResponse.json({
      success: true,

      originalScore,

      optimizedScore:
        bestScore,

      scoreDifference,

      improved,

      accepted,

      optimizedResume:
        bestResume,

      optimizedATSResult:
        bestATS,

      optimizedDesign,

      requestedPageCount:
        pageCount,

      originalPdfPageCount:
        extracted.pageCount,

      saved,

      verification: {
        performedOnServer:
          true,

        verified:
          true,

        accepted,

        improved,

        attempts:
          attempts.length,

        history:
          attempts,
      },

      message: improved
        ? `ATS optimization accepted. Score improved from ${originalScore} to ${bestScore}.`
        : accepted
          ? `ATS optimization verified. Score remained at ${bestScore}.`
          : `No optimization candidate improved the verified score. Best verified candidate: ${bestScore}/${originalScore}.`,
    });
  } catch (error) {
    console.error(
      "[ATS] Route error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while optimizing your resume.",
      },
      {
        status: 500,
      },
    );
  }
}