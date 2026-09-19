import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import {
  extractText,
  getDocumentProxy,
} from "unpdf";

import { generateATSResult } from "@/lib/ai/ats-analyzer";
import {
  ATSResultSchema,
  type ATSResult,
} from "@/lib/ai/ats-schema";

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
 * Convert optimized ResumeData into text.
 *
 * IMPORTANT:
 * Every supported section is included.
 * This prevents education, projects, certifications,
 * achievements, etc. from disappearing during verification.
 */
function resumeDataToText(
  resume: ResumeData,
): string {
  const parts: string[] = [];

  const personal = resume.personal;

  if (personal?.name) {
    parts.push(personal.name);
  }

  if (personal?.email) {
    parts.push(personal.email);
  }

  if (personal?.phone) {
    parts.push(personal.phone);
  }

  if (personal?.location) {
    parts.push(personal.location);
  }

  if (personal?.linkedin) {
    parts.push(personal.linkedin);
  }

  if (personal?.github) {
    parts.push(personal.github);
  }

  if (personal?.website) {
    parts.push(personal.website);
  }

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------

  if (resume.professionalSummary) {
    parts.push("PROFESSIONAL SUMMARY");
    parts.push(resume.professionalSummary);
  }

  // ------------------------------------------------------------
  // SKILLS
  // ------------------------------------------------------------

  if (Array.isArray(resume.skills)) {
    parts.push("SKILLS");

    for (const group of resume.skills) {
      if (group.category) {
        parts.push(group.category);
      }

      if (
        Array.isArray(group.items) &&
        group.items.length > 0
      ) {
        parts.push(group.items.join(", "));
      }
    }
  }

  // ------------------------------------------------------------
  // EXPERIENCE
  // ------------------------------------------------------------

  if (Array.isArray(resume.experience)) {
    parts.push("EXPERIENCE");

    for (const experience of resume.experience) {
      if (experience.role) {
        parts.push(experience.role);
      }

      if (experience.company) {
        parts.push(experience.company);
      }

      if (experience.location) {
        parts.push(experience.location);
      }

      if (experience.startDate) {
        parts.push(experience.startDate);
      }

      if (experience.endDate) {
        parts.push(experience.endDate);
      }

      if (
        Array.isArray(
          experience.responsibilities,
        )
      ) {
        for (
          const responsibility of
          experience.responsibilities
        ) {
          if (responsibility) {
            parts.push(responsibility);
          }
        }
      }
    }
  }

  // ------------------------------------------------------------
  // EDUCATION
  // ------------------------------------------------------------

  if (Array.isArray(resume.education)) {
    parts.push("EDUCATION");

    for (const education of resume.education) {
      if (education.institution) {
        parts.push(education.institution);
      }

      if (education.degree) {
        parts.push(education.degree);
      }

      if (education.field) {
        parts.push(education.field);
      }

      if (education.startDate) {
        parts.push(education.startDate);
      }

      if (education.endDate) {
        parts.push(education.endDate);
      }

      if (
        Array.isArray(education.details)
      ) {
        for (
          const detail of education.details
        ) {
          if (detail) {
            parts.push(detail);
          }
        }
      }
    }
  }

  // ------------------------------------------------------------
  // PROJECTS
  // ------------------------------------------------------------

  if (Array.isArray(resume.projects)) {
    parts.push("PROJECTS");

    for (const project of resume.projects) {
      if (project.name) {
        parts.push(project.name);
      }

      if (project.description) {
        parts.push(project.description);
      }

      if (
        Array.isArray(
          project.technologies,
        ) &&
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
    Array.isArray(
      resume.certifications,
    )
  ) {
    parts.push("CERTIFICATIONS");

    for (
      const certification of
      resume.certifications
    ) {
      if (certification.name) {
        parts.push(certification.name);
      }

      if (certification.issuer) {
        parts.push(certification.issuer);
      }

      if (certification.date) {
        parts.push(certification.date);
      }

      if (certification.url) {
        parts.push(certification.url);
      }
    }
  }

  // ------------------------------------------------------------
  // ACHIEVEMENTS
  // ------------------------------------------------------------

  if (
    Array.isArray(
      resume.achievements,
    )
  ) {
    parts.push("ACHIEVEMENTS");

    for (
      const achievement of
      resume.achievements
    ) {
      if (achievement) {
        parts.push(achievement);
      }
    }
  }

  // ------------------------------------------------------------
  // LANGUAGES
  // ------------------------------------------------------------

  if (
    Array.isArray(resume.languages) &&
    resume.languages.length > 0
  ) {
    parts.push("LANGUAGES");
    parts.push(
      resume.languages.join(", "),
    );
  }

  // ------------------------------------------------------------
  // ADDITIONAL SECTIONS
  // ------------------------------------------------------------

  if (
    Array.isArray(
      resume.additionalSections,
    )
  ) {
    for (
      const section of
      resume.additionalSections
    ) {
      if (section.title) {
        parts.push(section.title);
      }

      if (
        Array.isArray(section.items)
      ) {
        for (
          const item of section.items
        ) {
          if (item) {
            parts.push(item);
          }
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
    file.type !== "application/pdf" &&
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

/**
 * Safely extract a usable ATS result.
 *
 * Some AI providers may return numbers as strings.
 * This normalizes those values before Zod validation.
 */
function normalizeATSResult(
  value: unknown,
): unknown {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return value;
  }

  const input =
    value as Record<string, unknown>;

  const output: Record<
    string,
    unknown
  > = {
    ...input,
  };

  function numberValue(
    value: unknown,
  ): unknown {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      const parsed =
        Number(value);

      if (
        Number.isFinite(parsed)
      ) {
        return parsed;
      }
    }

    return value;
  }

  output.overallScore =
    numberValue(
      input.overallScore,
    );

  for (
    const sectionName of [
      "keywordMatch",
      "formatting",
      "experience",
      "skills",
    ]
  ) {
    const section =
      input[sectionName];

    if (
      section &&
      typeof section === "object"
    ) {
      const sectionObject =
        section as Record<
          string,
          unknown
        >;

      output[sectionName] = {
        ...sectionObject,
        score: numberValue(
          sectionObject.score,
        ),
      };
    }
  }

  return output;
}

/**
 * Make sure the analyzer result is actually usable.
 */
function validateATSResult(
  value: unknown,
): ATSResult | null {
  const normalized =
    normalizeATSResult(value);

  const parsed =
    ATSResultSchema.safeParse(
      normalized,
    );

  if (!parsed.success) {
    console.error(
      "ATS verification schema error:",
      parsed.error.flatten(),
    );

    return null;
  }

  return parsed.data;
}

export async function POST(
  request: Request,
) {
  try {
    // ============================================================
    // AUTH
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
    // REQUEST
    // ============================================================

    const contentType =
      request.headers.get(
        "content-type",
      ) || "";

    let resumeText = "";
    let jobDescription = "";

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

      const parsedResume =
        ResumeSchema.safeParse(
          body.resume,
        );

      if (
        !parsedResume.success
      ) {
        console.error(
          "Optimized resume validation failed:",
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
    } else if (
      contentType.includes(
        "multipart/form-data",
      )
    ) {
      const formData =
        await request.formData();

      const resumeFile =
        formData.get("resume");

      const jd =
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

      resumeText =
        await extractPdfText(
          resumeFile,
        );

      if (
        typeof jd === "string"
      ) {
        jobDescription =
          cleanText(jd);
      }
    } else {
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

    if (
      !resumeText ||
      resumeText.length < 50
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Not enough readable resume content was available for verification.",
        },
        {
          status: 422,
        },
      );
    }

    // ============================================================
    // ATS ANALYSIS
    // ============================================================

    let rawResult: unknown;

    try {
      rawResult =
        await generateATSResult(
          resumeText,
          jobDescription,
        );
    } catch (error) {
      console.error(
        "ATS verification analyzer error:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "The ATS analyzer could not calculate the optimized score.",
        },
        {
          status: 502,
        },
      );
    }

    // ============================================================
    // VALIDATE
    // ============================================================

    const result =
      validateATSResult(
        rawResult,
      );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The ATS analyzer returned an invalid verification result.",
        },
        {
          status: 502,
        },
      );
    }

    // ============================================================
    // SUCCESS
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        result,

        score:
          result.overallScore,

        overallScore:
          result.overallScore,

        meta: {
          verified: true,
          source:
            contentType.includes(
              "application/json",
            )
              ? "optimized-resume"
              : "pdf",

          hasJobDescription:
            Boolean(
              jobDescription,
            ),

          resumeCharacters:
            resumeText.length,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
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
