import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import {
  extractText,
  getDocumentProxy,
} from "unpdf";

import { generateATSResult } from "@/lib/ai/ats-analyzer";
import { ATSResultSchema } from "@/lib/ai/ats-schema";
import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function cleanText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Converts the optimized ResumeData object into plain text
 * so the SAME ATS analyzer can verify it again.
 */
function resumeDataToText(
  resume: ResumeData,
): string {
  const parts: string[] = [];

  const personal = resume.personal;

  if (personal.name) {
    parts.push(personal.name);
  }

  if (personal.email) {
    parts.push(personal.email);
  }

  if (personal.phone) {
    parts.push(personal.phone);
  }

  if (personal.location) {
    parts.push(personal.location);
  }

  if (personal.linkedin) {
    parts.push(personal.linkedin);
  }

  if (personal.github) {
    parts.push(personal.github);
  }

  if (personal.website) {
    parts.push(personal.website);
  }

  // ------------------------------------------------------------
  // PROFESSIONAL SUMMARY
  // ------------------------------------------------------------

  if (resume.professionalSummary) {
    parts.push("PROFESSIONAL SUMMARY");
    parts.push(
      resume.professionalSummary,
    );
  }

  // ------------------------------------------------------------
  // SKILLS
  // ------------------------------------------------------------

  if (resume.skills.length > 0) {
    parts.push("SKILLS");

    for (const skillGroup of resume.skills) {
      if (skillGroup.category) {
        parts.push(
          skillGroup.category,
        );
      }

      if (skillGroup.items.length > 0) {
        parts.push(
          skillGroup.items.join(", "),
        );
      }
    }
  }

  // ------------------------------------------------------------
  // EXPERIENCE
  // ------------------------------------------------------------

  if (resume.experience.length > 0) {
    parts.push("EXPERIENCE");

    for (const experience of resume.experience) {
      if (experience.role) {
        parts.push(
          experience.role,
        );
      }

      if (experience.company) {
        parts.push(
          experience.company,
        );
      }

      if (experience.location) {
        parts.push(
          experience.location,
        );
      }

      if (experience.startDate) {
        parts.push(
          experience.startDate,
        );
      }

      if (experience.endDate) {
        parts.push(
          experience.endDate,
        );
      }

      for (
        const responsibility
        of experience.responsibilities
      ) {
        if (responsibility) {
          parts.push(
            responsibility,
          );
        }
      }
    }
  }

  // ------------------------------------------------------------
  // EDUCATION
  // ------------------------------------------------------------

  if (resume.education.length > 0) {
    parts.push("EDUCATION");

    for (const education of resume.education) {
      if (education.institution) {
        parts.push(
          education.institution,
        );
      }

      if (education.degree) {
        parts.push(
          education.degree,
        );
      }

      if (education.field) {
        parts.push(
          education.field,
        );
      }

      if (education.startDate) {
        parts.push(
          education.startDate,
        );
      }

      if (education.endDate) {
        parts.push(
          education.endDate,
        );
      }

      for (
        const detail
        of education.details
      ) {
        if (detail) {
          parts.push(detail);
        }
      }
    }
  }

  // ------------------------------------------------------------
  // PROJECTS
  // ------------------------------------------------------------

  if (resume.projects.length > 0) {
    parts.push("PROJECTS");

    for (const project of resume.projects) {
      if (project.name) {
        parts.push(project.name);
      }

      if (project.description) {
        parts.push(
          project.description,
        );
      }

      if (
        project.technologies.length > 0
      ) {
        parts.push(
          project.technologies.join(", "),
        );
      }

      if (project.url) {
        parts.push(project.url);
      }
    }
  }

  // ------------------------------------------------------------
  // CERTIFICATIONS
  // ------------------------------------------------------------

  if (
    resume.certifications.length > 0
  ) {
    parts.push("CERTIFICATIONS");

    for (
      const certification
      of resume.certifications
    ) {
      if (certification.name) {
        parts.push(
          certification.name,
        );
      }

      if (certification.issuer) {
        parts.push(
          certification.issuer,
        );
      }

      if (certification.date) {
        parts.push(
          certification.date,
        );
      }

      if (certification.url) {
        parts.push(
          certification.url,
        );
      }
    }
  }

  // ------------------------------------------------------------
  // ACHIEVEMENTS
  // ------------------------------------------------------------

  if (resume.achievements.length > 0) {
    parts.push("ACHIEVEMENTS");

    for (
      const achievement
      of resume.achievements
    ) {
      if (achievement) {
        parts.push(achievement);
      }
    }
  }

  // ------------------------------------------------------------
  // LANGUAGES
  // ------------------------------------------------------------

  if (resume.languages.length > 0) {
    parts.push("LANGUAGES");

    parts.push(
      resume.languages.join(", "),
    );
  }

  // ------------------------------------------------------------
  // ADDITIONAL SECTIONS
  // ------------------------------------------------------------

  if (
    resume.additionalSections.length > 0
  ) {
    for (
      const section
      of resume.additionalSections
    ) {
      if (section.title) {
        parts.push(
          section.title,
        );
      }

      for (
        const item
        of section.items
      ) {
        if (item) {
          parts.push(item);
        }
      }
    }
  }

  return cleanText(
    parts
      .filter(Boolean)
      .join("\n"),
  );
}

/**
 * Extract text from an uploaded PDF.
 *
 * ATS remains independent:
 * users can upload any PDF resume.
 */
async function extractPdfText(
  file: File,
): Promise<string> {
  if (file.size === 0) {
    throw new Error(
      "The uploaded PDF is empty.",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Resume PDF must be 5 MB or smaller.",
    );
  }

  const fileName =
    file.name.toLowerCase();

  if (
    file.type !==
      "application/pdf" &&
    !fileName.endsWith(".pdf")
  ) {
    throw new Error(
      "Only PDF resumes are supported.",
    );
  }

  const pdfData =
    new Uint8Array(
      await file.arrayBuffer(),
    );

  /**
   * IMPORTANT:
   * Use getDocumentProxy first.
   * This is the working unpdf pattern
   * used by /api/ats/check.
   */
  const pdf =
    await getDocumentProxy(
      pdfData,
    );

  const extracted =
    await extractText(pdf, {
      mergePages: true,
    });

  return cleanText(
    String(
      extracted.text ?? "",
    ),
  );
}

export async function POST(
  request: Request,
) {
  try {
    // ============================================================
    // 1. AUTHENTICATION
    // ============================================================

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
            "Unauthorized. Please sign in first.",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================================
    // 2. DETECT REQUEST TYPE
    // ============================================================

    const contentType =
      request.headers.get(
        "content-type",
      ) || "";

    let resumeText = "";
    let jobDescription = "";

    // ============================================================
    // 3. JSON REQUEST
    //
    // This is what improveResume() currently sends.
    // ============================================================

    if (
      contentType.includes(
        "application/json",
      )
    ) {
      const body =
        await request.json();

      if (!body?.resume) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Optimized resume data is required.",
          },
          {
            status: 400,
          },
        );
      }

      // Validate optimized ResumeData
      const parsedResume =
        ResumeSchema.safeParse(
          body.resume,
        );

      if (
        !parsedResume.success
      ) {
        console.error(
          "ATS verification ResumeSchema validation failed:",
          parsedResume.error.flatten(),
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "The optimized resume data is invalid.",
            details:
              parsedResume.error.flatten(),
          },
          {
            status: 400,
          },
        );
      }

      // Convert structured resume into text
      resumeText =
        resumeDataToText(
          parsedResume.data,
        );

      if (
        typeof body.jobDescription ===
        "string"
      ) {
        jobDescription =
          cleanText(
            body.jobDescription,
          );
      }
    }

    // ============================================================
    // 4. MULTIPART PDF REQUEST
    //
    // This keeps ATS independently usable for normal
    // uploaded PDF resumes.
    // ============================================================

    else if (
      contentType.includes(
        "multipart/form-data",
      )
    ) {
      const formData =
        await request.formData();

      const resumeFile =
        formData.get(
          "resume",
        );

      const jobDescriptionValue =
        formData.get(
          "jobDescription",
        );

      if (
        !(resumeFile instanceof File)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please upload a PDF resume.",
          },
          {
            status: 400,
          },
        );
      }

      try {
        resumeText =
          await extractPdfText(
            resumeFile,
          );
      } catch (
        pdfError
      ) {
        console.error(
          "ATS verification PDF extraction error:",
          pdfError,
        );

        return NextResponse.json(
          {
            success: false,
            error:
              pdfError instanceof Error
                ? pdfError.message
                : "We could not read this PDF.",
          },
          {
            status: 422,
          },
        );
      }

      if (
        typeof jobDescriptionValue ===
        "string"
      ) {
        jobDescription =
          cleanText(
            jobDescriptionValue,
          );
      }
    }

    // ============================================================
    // 5. UNSUPPORTED REQUEST
    // ============================================================

    else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unsupported verification request.",
        },
        {
          status: 415,
        },
      );
    }

    // ============================================================
    // 6. CHECK EXTRACTED/GENERATED TEXT
    // ============================================================

    if (
      !resumeText ||
      resumeText.length < 50
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not extract enough readable resume content for ATS verification.",
        },
        {
          status: 422,
        },
      );
    }

    // ============================================================
    // 7. RUN ATS AI ANALYZER
    // ============================================================

    let rawResult;

    try {
      rawResult =
        await generateATSResult(
          resumeText,
          jobDescription,
        );
    } catch (
      analysisError
    ) {
      console.error(
        "ATS verification analyzer error:",
        analysisError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            analysisError instanceof Error
              ? analysisError.message
              : "The ATS analyzer could not calculate the score.",
        },
        {
          status: 502,
        },
      );
    }

    // ============================================================
    // 8. VALIDATE AI RESULT
    // ============================================================

    const validation =
      ATSResultSchema.safeParse(
        rawResult,
      );

    if (
      !validation.success
    ) {
      console.error(
        "ATS verification result validation failed:",
        validation.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The ATS analyzer returned an invalid score result.",
          details:
            validation.error.flatten(),
        },
        {
          status: 502,
        },
      );
    }

    const result =
      validation.data;

    // ============================================================
    // 9. RETURN VERIFIED SCORE
    // ============================================================

    return NextResponse.json({
      success: true,

      score:
        result.overallScore,

      result,

      meta: {
        verified: true,

        source:
          contentType.includes(
            "application/json",
          )
            ? "optimized-resume-data"
            : "pdf",

        hasJobDescription:
          Boolean(
            jobDescription,
          ),

        resumeCharacters:
          resumeText.length,
      },
    });
  } catch (
    error
  ) {
    console.error(
      "ATS verification fatal error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while verifying the optimized resume.",
      },
      {
        status: 500,
      },
    );
  }
}