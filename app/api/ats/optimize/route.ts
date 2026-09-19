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
} from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const MAX_OPTIMIZATION_ATTEMPTS = 3;

/* ============================================================
   ATS-SAFE DESIGN
============================================================ */

const ATS_SAFE_DESIGN = {
  layout: "single-column",

  density: "balanced",

  style: "ats",

  colors: {
    primary: "#1E3A8A",
    secondary: "#2563EB",
    text: "#0F172A",
    mutedText: "#64748B",
    background: "#FFFFFF",
    border: "#E2E8F0",
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

function getSafeDesign() {
  return ResumeDesignSchema.parse(
    ATS_SAFE_DESIGN,
  );
}

/* ============================================================
   HELPERS
============================================================ */

function cleanText(
  text: string,
): string {
  return text
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
  if (typeof value !== "string") {
    return 2;
  }

  const number =
    Number(value);

  if (number === 1) {
    return 1;
  }

  if (number === 3) {
    return 3;
  }

  return 2;
}

function resumeToText(
  resume: ResumeData,
): string {
  const parts: string[] = [];

  const p =
    resume.personal;

  [
    p.name,
    p.email,
    p.phone,
    p.location,
    p.linkedin,
    p.github,
    p.website,
  ].forEach((value) => {
    if (value) {
      parts.push(value);
    }
  });

  if (
    resume.professionalSummary
  ) {
    parts.push(
      "PROFESSIONAL SUMMARY",
    );

    parts.push(
      resume.professionalSummary,
    );
  }

  if (resume.skills.length) {
    parts.push("SKILLS");

    for (const group of resume.skills) {
      if (group.category) {
        parts.push(
          group.category,
        );
      }

      if (group.items.length) {
        parts.push(
          group.items.join(", "),
        );
      }
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
      );

      parts.push(
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
    parts.push("ACHIEVEMENTS");

    parts.push(
      ...resume.achievements,
    );
  }

  if (resume.languages.length) {
    parts.push("LANGUAGES");

    parts.push(
      resume.languages.join(", "),
    );
  }

  for (
    const section of
      resume.additionalSections
  ) {
    if (section.title) {
      parts.push(
        section.title,
      );
    }

    parts.push(
      ...section.items,
    );
  }

  return cleanText(
    parts
      .filter(Boolean)
      .join("\n"),
  );
}

function buildRepairFeedback(
  originalScore: number,
  candidateScore: number,
  candidateATS: ATSResult,
): string {
  const keywordFixes =
    candidateATS.keywordMatch
      .missingKeywords
      .slice(0, 20);

  const skillFixes =
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
IMPORTANT REPAIR REQUIRED.

The previous optimization was NOT accepted.

Original ATS score:
${originalScore}/100

Previous optimized score:
${candidateScore}/100

The optimized version lost ATS points.

You must produce a stronger candidate.

Focus on the following remaining missing keywords:

${
  keywordFixes.length
    ? keywordFixes.join(", ")
    : "None returned"
}

Remaining missing skills:

${
  skillFixes.length
    ? skillFixes.join(", ")
    : "None returned"
}

Remaining recommendations:

${
  recommendations.length
    ? recommendations.join("\n")
    : "None returned"
}

DO NOT solve this by inventing facts.

Instead:
- restore anything that was unnecessarily removed
- improve keyword placement
- improve skills organization
- strengthen factual experience wording
- improve summary alignment
- preserve all education
- preserve all projects
- preserve all certifications
- preserve all original facts

The next version must be better than the previous version.
`;
}

/* ============================================================
   PDF TEXT EXTRACTION
============================================================ */

async function extractResumeText(
  file: File,
): Promise<{
  text: string;
  pageCount: number;
}> {
  if (file.size === 0) {
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

  const name =
    file.name.toLowerCase();

  if (
    file.type !==
      "application/pdf" &&
    !name.endsWith(".pdf")
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
      "This PDF does not contain readable pages.",
    );
  }

  if (pdf.numPages > 20) {
    throw new Error(
      "Resume PDF cannot contain more than 20 pages.",
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

/* ============================================================
   POST
============================================================ */

export async function POST(
  request: Request,
) {
  try {
    /* --------------------------------------------------------
       AUTH
    -------------------------------------------------------- */

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

    /* --------------------------------------------------------
       FORM DATA
    -------------------------------------------------------- */

    const formData =
      await request.formData();

    const file =
      formData.get(
        "resume",
      );

    const atsResultValue =
      formData.get(
        "atsResult",
      );

    const jobDescriptionValue =
      formData.get(
        "jobDescription",
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

    /* --------------------------------------------------------
       ATS RESULT
    -------------------------------------------------------- */

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

    const originalATS =
      atsValidation.data;

    const originalScore =
      Math.round(
        originalATS.overallScore,
      );

    const jobDescription =
      typeof jobDescriptionValue ===
      "string"
        ? cleanText(
            jobDescriptionValue,
          )
        : "";

    /* --------------------------------------------------------
       EXTRACT ORIGINAL RESUME
    -------------------------------------------------------- */

    let extracted;

    try {
      extracted =
        await extractResumeText(
          file,
        );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to read the resume PDF.",
        },
        {
          status: 400,
        },
      );
    }

    const originalResumeText =
      extracted.text;

    /* --------------------------------------------------------
       OPTIMIZATION LOOP
    -------------------------------------------------------- */

    let bestResume:
      | ResumeData
      | null = null;

    let bestATS:
      | ATSResult
      | null = null;

    let bestScore =
      -1;

    let repairFeedback = "";

    const attempts: Array<{
      attempt: number;
      score: number;
      accepted: boolean;
    }> = [];

    for (
      let attempt = 1;
      attempt <=
      MAX_OPTIMIZATION_ATTEMPTS;
      attempt++
    ) {
      console.log(
        `[ATS] Optimization attempt ${attempt}/${MAX_OPTIMIZATION_ATTEMPTS}`,
      );

      let candidate: ResumeData;

      try {
        candidate =
          await optimizeResumeForATS(
            originalResumeText,
            originalATS,
            jobDescription,
            pageCount,
            repairFeedback,
          );
      } catch (error) {
        console.error(
          `[ATS] Optimization attempt ${attempt} failed:`,
          error,
        );

        if (!bestResume) {
          throw error;
        }

        continue;
      }

      const validation =
        ResumeSchema.safeParse(
          candidate,
        );

      if (
        !validation.success
      ) {
        console.error(
          "[ATS] Candidate validation failed:",
          validation.error.flatten(),
        );

        continue;
      }

      const verifiedResume =
        validation.data;

      const candidateText =
        resumeToText(
          verifiedResume,
        );

      if (
        candidateText.length <
        50
      ) {
        console.warn(
          "[ATS] Candidate contained too little text.",
        );

        continue;
      }

      /* ------------------------------------------------------
         SERVER-SIDE VERIFICATION
      ------------------------------------------------------ */

      let candidateATS: ATSResult;

      try {
        candidateATS =
          await generateATSResult(
            candidateText,
            jobDescription,
          );
      } catch (error) {
        console.error(
          "[ATS] Candidate verification failed:",
          error,
        );

        repairFeedback = `
The previous candidate could not be verified.

Regenerate the resume carefully.

Preserve the complete original factual content.
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

      console.log(
        `[ATS] Attempt ${attempt}: ${candidateScore}/100. Original: ${originalScore}/100. Accepted: ${accepted}`,
      );

      /* ------------------------------------------------------
         KEEP BEST CANDIDATE
      ------------------------------------------------------ */

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

      /* ------------------------------------------------------
         ACCEPT IF SCORE IS AT LEAST ORIGINAL
      ------------------------------------------------------ */

      if (accepted) {
        break;
      }

      /* ------------------------------------------------------
         REPAIR LOWER SCORE
      ------------------------------------------------------ */

      repairFeedback =
        buildRepairFeedback(
          originalScore,
          candidateScore,
          candidateATS,
        );
    }

    /* --------------------------------------------------------
       NO VALID CANDIDATE
    -------------------------------------------------------- */

    if (
      !bestResume ||
      !bestATS
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI could not produce a valid optimized resume. Please try again.",
        },
        {
          status: 502,
        },
      );
    }

    /* --------------------------------------------------------
       ACCEPTANCE STATUS
    -------------------------------------------------------- */

    const accepted =
      bestScore >=
      originalScore;

    const improved =
      bestScore >
      originalScore;

    const difference =
      bestScore -
      originalScore;

    /* --------------------------------------------------------
       DESIGN
    -------------------------------------------------------- */

    const optimizedDesign =
      getSafeDesign();

    /* --------------------------------------------------------
       RESPONSE
    -------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        originalScore,

        optimizedScore:
          bestScore,

        scoreDifference:
          difference,

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

        optimization: {
          usedMissingKeywords:
            true,

          usedMissingSkills:
            true,

          usedRecommendations:
            true,

          usedJobDescription:
            Boolean(
              jobDescription,
            ),

          preservedFacts:
            true,

          preventedFabrication:
            true,

          scoreProtected:
            true,
        },

        message: improved
          ? `Optimization accepted. ATS score improved from ${originalScore} to ${bestScore}.`
          : accepted
            ? `Optimization accepted. ATS score remained at ${bestScore}.`
            : `Best verified optimization scored ${bestScore}, below the original ${originalScore}. The resume was not falsely marked as improved.`,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[ATS] Optimization route error:",
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