import type { ResumeData } from "@/lib/ai/resume-schema";

function addSection(
  lines: string[],
  title: string
) {
  lines.push("");
  lines.push(title.toUpperCase());
}

export function resumeDataToText(
  resume: ResumeData
): string {
  const lines: string[] = [];

  /*
   * --------------------------------------------------
   * PERSONAL INFORMATION
   * --------------------------------------------------
   */

  if (resume.personal) {
    if (resume.personal.name) {
      lines.push(
        resume.personal.name
      );
    }

    const contact = [
      resume.personal.email,
      resume.personal.phone,
      resume.personal.location,
      resume.personal.linkedin,
      resume.personal.github,
      resume.personal.website,
    ].filter(Boolean);

    if (contact.length > 0) {
      lines.push(
        contact.join(" | ")
      );
    }
  }

  /*
   * --------------------------------------------------
   * PROFESSIONAL SUMMARY
   * --------------------------------------------------
   */

  if (
    resume.professionalSummary?.trim()
  ) {
    addSection(
      lines,
      "Professional Summary"
    );

    lines.push(
      resume.professionalSummary.trim()
    );
  }

  /*
   * --------------------------------------------------
   * SKILLS
   * --------------------------------------------------
   */

  if (
    Array.isArray(resume.skills) &&
    resume.skills.length > 0
  ) {
    addSection(
      lines,
      "Skills"
    );

    for (const skillGroup of resume.skills) {
      if (!skillGroup) continue;

      const category =
        skillGroup.category?.trim();

      const items =
        Array.isArray(
          skillGroup.items
        )
          ? skillGroup.items.filter(Boolean)
          : [];

      if (
        category &&
        items.length > 0
      ) {
        lines.push(
          `${category}: ${items.join(", ")}`
        );
      } else if (
        items.length > 0
      ) {
        lines.push(
          items.join(", ")
        );
      }
    }
  }

  /*
   * --------------------------------------------------
   * EXPERIENCE
   * --------------------------------------------------
   */

  if (
    Array.isArray(resume.experience) &&
    resume.experience.length > 0
  ) {
    addSection(
      lines,
      "Experience"
    );

    for (const experience of resume.experience) {
      if (!experience) continue;

      lines.push(
        [
          experience.role,
          experience.company,
          experience.location,
        ]
          .filter(Boolean)
          .join(" | ")
      );

      const dates = [
        experience.startDate,
        experience.endDate,
      ].filter(Boolean);

      if (dates.length > 0) {
        lines.push(
          dates.join(" - ")
        );
      }

      if (
        Array.isArray(
          experience.responsibilities
        )
      ) {
        for (const responsibility of experience.responsibilities) {
          if (
            responsibility?.trim()
          ) {
            lines.push(
              `• ${responsibility.trim()}`
            );
          }
        }
      }
    }
  }

  /*
   * --------------------------------------------------
   * EDUCATION
   * --------------------------------------------------
   */

  if (
    Array.isArray(resume.education) &&
    resume.education.length > 0
  ) {
    addSection(
      lines,
      "Education"
    );

    for (const education of resume.education) {
      if (!education) continue;

      lines.push(
        [
          education.degree,
          education.field,
          education.institution,
        ]
          .filter(Boolean)
          .join(" | ")
      );

      const dates = [
        education.startDate,
        education.endDate,
      ].filter(Boolean);

      if (dates.length > 0) {
        lines.push(
          dates.join(" - ")
        );
      }

      if (
        Array.isArray(
          education.details
        )
      ) {
        for (const detail of education.details) {
          if (detail?.trim()) {
            lines.push(
              `• ${detail.trim()}`
            );
          }
        }
      }
    }
  }

  /*
   * --------------------------------------------------
   * PROJECTS
   * --------------------------------------------------
   */

  if (
    Array.isArray(resume.projects) &&
    resume.projects.length > 0
  ) {
    addSection(
      lines,
      "Projects"
    );

    for (const project of resume.projects) {
      if (!project) continue;

      if (project.name?.trim()) {
        lines.push(
          project.name.trim()
        );
      }

      if (
        project.description?.trim()
      ) {
        lines.push(
          project.description.trim()
        );
      }

      if (
        Array.isArray(
          project.technologies
        ) &&
        project.technologies.length > 0
      ) {
        lines.push(
          `Technologies: ${project.technologies.join(", ")}`
        );
      }

      if (project.url?.trim()) {
        lines.push(
          `URL: ${project.url.trim()}`
        );
      }
    }
  }

  /*
   * --------------------------------------------------
   * CERTIFICATIONS
   * --------------------------------------------------
   */

  if (
    Array.isArray(
      resume.certifications
    ) &&
    resume.certifications.length > 0
  ) {
    addSection(
      lines,
      "Certifications"
    );

    for (const certification of resume.certifications) {
      if (!certification) continue;

      lines.push(
        [
          certification.name,
          certification.issuer,
          certification.date,
        ]
          .filter(Boolean)
          .join(" | ")
      );

      if (
        certification.url?.trim()
      ) {
        lines.push(
          certification.url.trim()
        );
      }
    }
  }

  /*
   * --------------------------------------------------
   * ACHIEVEMENTS
   * --------------------------------------------------
   */

  if (
    Array.isArray(resume.achievements) &&
    resume.achievements.length > 0
  ) {
    addSection(
      lines,
      "Achievements"
    );

    for (const achievement of resume.achievements) {
      if (achievement?.trim()) {
        lines.push(
          `• ${achievement.trim()}`
        );
      }
    }
  }

  /*
   * --------------------------------------------------
   * LANGUAGES
   * --------------------------------------------------
   */

  if (
    Array.isArray(resume.languages) &&
    resume.languages.length > 0
  ) {
    addSection(
      lines,
      "Languages"
    );

    lines.push(
      resume.languages
        .filter(Boolean)
        .join(", ")
    );
  }

  /*
   * --------------------------------------------------
   * ADDITIONAL SECTIONS
   * --------------------------------------------------
   */

  if (
    Array.isArray(
      resume.additionalSections
    ) &&
    resume.additionalSections.length > 0
  ) {
    for (const section of resume.additionalSections) {
      if (!section) continue;

      if (
        section.title?.trim()
      ) {
        addSection(
          lines,
          section.title.trim()
        );
      }

      if (
        Array.isArray(section.items)
      ) {
        for (const item of section.items) {
          if (item?.trim()) {
            lines.push(
              `• ${item.trim()}`
            );
          }
        }
      }
    }
  }

  /*
   * --------------------------------------------------
   * CLEAN OUTPUT
   * --------------------------------------------------
   */

  return lines
    .join("\n")
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}