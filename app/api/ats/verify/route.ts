import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateATSResult } from "@/lib/ai/ats-generator";
import { ResumeSchema } from "@/lib/ai/resume-schema";

export const runtime = "nodejs";

function resumeDataToText(
  resume: Record<string, unknown>
): string {
  const sections: string[] = [];

  const personal = resume.personal as
    | Record<string, unknown>
    | undefined;

  if (personal) {
    sections.push(`
PERSONAL INFORMATION

Name: ${personal.name ?? ""}
Email: ${personal.email ?? ""}
Phone: ${personal.phone ?? ""}
Location: ${personal.location ?? ""}
LinkedIn: ${personal.linkedin ?? ""}
GitHub: ${personal.github ?? ""}
Website: ${personal.website ?? ""}
`);
  }

  if (typeof resume.professionalSummary === "string") {
    sections.push(`
PROFESSIONAL SUMMARY

${resume.professionalSummary}
`);
  }

  const skills = Array.isArray(resume.skills)
    ? resume.skills
    : [];

  if (skills.length > 0) {
    sections.push(`
SKILLS

${skills
  .map((skill) => {
    if (
      typeof skill !== "object" ||
      skill === null
    ) {
      return "";
    }

    const item =
      skill as Record<string, unknown>;

    const category =
      typeof item.category === "string"
        ? item.category
        : "";

    const items = Array.isArray(item.items)
      ? item.items.join(", ")
      : "";

    return `${category}: ${items}`;
  })
  .filter(Boolean)
  .join("\n")}
`);
  }

  const experience = Array.isArray(
    resume.experience
  )
    ? resume.experience
    : [];

  if (experience.length > 0) {
    sections.push(`
EXPERIENCE

${experience
  .map((entry) => {
    if (
      typeof entry !== "object" ||
      entry === null
    ) {
      return "";
    }

    const item =
      entry as Record<string, unknown>;

    const responsibilities =
      Array.isArray(
        item.responsibilities
      )
        ? item.responsibilities
            .map(
              (value) => `- ${String(value)}`
            )
            .join("\n")
        : "";

    return `
${item.role ?? ""}
${item.company ?? ""}
${item.location ?? ""}
${item.startDate ?? ""} - ${item.endDate ?? ""}

${responsibilities}
`;
  })
  .filter(Boolean)
  .join("\n")}
`);
  }

  const education = Array.isArray(
    resume.education
  )
    ? resume.education
    : [];

  if (education.length > 0) {
    sections.push(`
EDUCATION

${education
  .map((entry) => {
    if (
      typeof entry !== "object" ||
      entry === null
    ) {
      return "";
    }

    const item =
      entry as Record<string, unknown>;

    const details = Array.isArray(
      item.details
    )
      ? item.details
          .map(
            (value) => `- ${String(value)}`
          )
          .join("\n")
      : "";

    return `
${item.degree ?? ""}
${item.field ?? ""}
${item.institution ?? ""}
${item.location ?? ""}
${item.startDate ?? ""} - ${item.endDate ?? ""}

${details}
`;
  })
  .filter(Boolean)
  .join("\n")}
`);
  }

  const projects = Array.isArray(
    resume.projects
  )
    ? resume.projects
    : [];

  if (projects.length > 0) {
    sections.push(`
PROJECTS

${projects
  .map((entry) => {
    if (
      typeof entry !== "object" ||
      entry === null
    ) {
      return "";
    }

    const item =
      entry as Record<string, unknown>;

    const technologies =
      Array.isArray(
        item.technologies
      )
        ? item.technologies.join(", ")
        : "";

    return `
${item.name ?? ""}

${item.description ?? ""}

Technologies: ${technologies}
URL: ${item.url ?? ""}
`;
  })
  .filter(Boolean)
  .join("\n")}
`);
  }

  const certifications = Array.isArray(
    resume.certifications
  )
    ? resume.certifications
    : [];

  if (certifications.length > 0) {
    sections.push(`
CERTIFICATIONS

${certifications
  .map((entry) => {
    if (
      typeof entry !== "object" ||
      entry === null
    ) {
      return "";
    }

    const item =
      entry as Record<string, unknown>;

    return `
${item.name ?? ""}
Issuer: ${item.issuer ?? ""}
Date: ${item.date ?? ""}
URL: ${item.url ?? ""}
`;
  })
  .filter(Boolean)
  .join("\n")}
`);
  }

  const achievements = Array.isArray(
    resume.achievements
  )
    ? resume.achievements
    : [];

  if (achievements.length > 0) {
    sections.push(`
ACHIEVEMENTS

${achievements
  .map(
    (value) => `- ${String(value)}`
  )
  .join("\n")}
`);
  }

  const languages = Array.isArray(
    resume.languages
  )
    ? resume.languages
    : [];

  if (languages.length > 0) {
    sections.push(`
LANGUAGES

${languages.join(", ")}
`);
  }

  const additionalSections =
    Array.isArray(
      resume.additionalSections
    )
      ? resume.additionalSections
      : [];

  for (const section of additionalSections) {
    if (
      typeof section !== "object" ||
      section === null
    ) {
      continue;
    }

    const item =
      section as Record<string, unknown>;

    const title =
      typeof item.title === "string"
        ? item.title
        : "Additional Section";

    const items = Array.isArray(
      item.items
    )
      ? item.items
          .map(
            (value) => `- ${String(value)}`
          )
          .join("\n")
      : "";

    sections.push(`
${title.toUpperCase()}

${items}
`);
  }

  return sections.join("\n").trim();
}

export async function POST(
  request: Request
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const resumeValue = body?.resume;

    const jobDescription =
      typeof body?.jobDescription ===
      "string"
        ? body.jobDescription.trim()
        : "";

    const validation =
      ResumeSchema.safeParse(
        resumeValue
      );

    if (!validation.success) {
      console.error(
        "Optimized resume validation failed:",
        validation.error.flatten()
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The optimized resume has an invalid structure.",
        },
        { status: 400 }
      );
    }

    const resumeText =
      resumeDataToText(
        validation.data
      );

    if (!resumeText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The optimized resume contains no readable content.",
        },
        { status: 400 }
      );
    }

    /*
     * Run the SAME ATS engine used by
     * /api/ats/check.
     *
     * This is important because the AFTER
     * score must be measured using the same
     * scoring system as the BEFORE score.
     */

    const result =
      await generateATSResult(
        resumeText,
        jobDescription
      );

    return NextResponse.json({
      success: true,
      result,
      score: result.overallScore,
    });
  } catch (error) {
    console.error(
      "ATS verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify optimized resume.",
      },
      { status: 500 }
    );
  }
}