import type { ResumeData } from "@/lib/ai/resume-schema";

/**
 * ATS Resume Preserver
 *
 * Purpose:
 * Keep factual information from the original resume
 * when the AI optimization response accidentally omits it.
 *
 * The optimizer is still allowed to improve wording.
 * This helper only restores information that disappeared.
 */

function clean(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function uniqueStrings(
  values: string[],
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = clean(value);

    if (!cleaned) {
      continue;
    }

    const key = cleaned.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function mergeString(
  optimized: string,
  original: string,
): string {
  const optimizedValue = clean(optimized);
  const originalValue = clean(original);

  if (optimizedValue) {
    return optimizedValue;
  }

  return originalValue;
}

/**
 * Find an education entry that most likely represents
 * the same original education record.
 */
function findEducationMatch(
  optimized: ResumeData["education"],
  original: ResumeData["education"][number],
): ResumeData["education"][number] | undefined {
  const originalInstitution =
    clean(original.institution).toLowerCase();

  const originalDegree =
    clean(original.degree).toLowerCase();

  const originalField =
    clean(original.field).toLowerCase();

  return optimized.find((item) => {
    const institution =
      clean(item.institution).toLowerCase();

    const degree =
      clean(item.degree).toLowerCase();

    const field =
      clean(item.field).toLowerCase();

    if (
      originalInstitution &&
      institution &&
      originalInstitution === institution
    ) {
      return true;
    }

    if (
      originalDegree &&
      degree &&
      originalDegree === degree &&
      originalField &&
      field &&
      originalField === field
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Merge education without losing factual details.
 */
function preserveEducation(
  optimized: ResumeData["education"],
  original: ResumeData["education"],
): ResumeData["education"] {
  const result = [...optimized];

  for (const originalEducation of original) {
    const match =
      findEducationMatch(
        result,
        originalEducation,
      );

    if (match) {
      match.institution =
        mergeString(
          match.institution,
          originalEducation.institution,
        );

      match.degree =
        mergeString(
          match.degree,
          originalEducation.degree,
        );

      match.field =
        mergeString(
          match.field,
          originalEducation.field,
        );

      match.startDate =
        mergeString(
          match.startDate,
          originalEducation.startDate,
        );

      match.endDate =
        mergeString(
          match.endDate,
          originalEducation.endDate,
        );

      /*
       * CRITICAL:
       *
       * Never allow the AI optimizer to silently
       * delete original education details.
       */
      match.details =
        uniqueStrings([
          ...match.details,
          ...originalEducation.details,
        ]);
    } else {
      /*
       * Entire education entry disappeared.
       * Restore it exactly from the original resume.
       */
      result.push({
        institution:
          originalEducation.institution,

        degree:
          originalEducation.degree,

        field:
          originalEducation.field,

        startDate:
          originalEducation.startDate,

        endDate:
          originalEducation.endDate,

        details: [
          ...originalEducation.details,
        ],
      });
    }
  }

  return result;
}

/**
 * Find matching experience.
 */
function findExperienceMatch(
  optimized: ResumeData["experience"],
  original: ResumeData["experience"][number],
): ResumeData["experience"][number] | undefined {
  const originalCompany =
    clean(original.company).toLowerCase();

  const originalRole =
    clean(original.role).toLowerCase();

  return optimized.find((item) => {
    const company =
      clean(item.company).toLowerCase();

    const role =
      clean(item.role).toLowerCase();

    return (
      originalCompany &&
      company &&
      originalCompany === company &&
      originalRole &&
      role &&
      originalRole === role
    );
  });
}

/**
 * Preserve experience information.
 */
function preserveExperience(
  optimized: ResumeData["experience"],
  original: ResumeData["experience"],
): ResumeData["experience"] {
  const result = [...optimized];

  for (const originalExperience of original) {
    const match =
      findExperienceMatch(
        result,
        originalExperience,
      );

    if (match) {
      match.company =
        mergeString(
          match.company,
          originalExperience.company,
        );

      match.role =
        mergeString(
          match.role,
          originalExperience.role,
        );

      match.location =
        mergeString(
          match.location,
          originalExperience.location,
        );

      match.startDate =
        mergeString(
          match.startDate,
          originalExperience.startDate,
        );

      match.endDate =
        mergeString(
          match.endDate,
          originalExperience.endDate,
        );

      match.responsibilities =
        uniqueStrings([
          ...match.responsibilities,
          ...originalExperience.responsibilities,
        ]);
    } else {
      result.push({
        company:
          originalExperience.company,

        role:
          originalExperience.role,

        location:
          originalExperience.location,

        startDate:
          originalExperience.startDate,

        endDate:
          originalExperience.endDate,

        responsibilities: [
          ...originalExperience.responsibilities,
        ],
      });
    }
  }

  return result;
}

/**
 * Find matching project.
 */
function findProjectMatch(
  optimized: ResumeData["projects"],
  original: ResumeData["projects"][number],
): ResumeData["projects"][number] | undefined {
  const originalName =
    clean(original.name).toLowerCase();

  if (!originalName) {
    return undefined;
  }

  return optimized.find(
    (item) =>
      clean(item.name).toLowerCase() ===
      originalName,
  );
}

/**
 * Preserve project information.
 */
function preserveProjects(
  optimized: ResumeData["projects"],
  original: ResumeData["projects"],
): ResumeData["projects"] {
  const result = [...optimized];

  for (const originalProject of original) {
    const match =
      findProjectMatch(
        result,
        originalProject,
      );

    if (match) {
      match.name =
        mergeString(
          match.name,
          originalProject.name,
        );

      match.description =
        mergeString(
          match.description,
          originalProject.description,
        );

      match.url =
        mergeString(
          match.url,
          originalProject.url,
        );

      match.technologies =
        uniqueStrings([
          ...match.technologies,
          ...originalProject.technologies,
        ]);
    } else {
      result.push({
        name:
          originalProject.name,

        description:
          originalProject.description,

        technologies: [
          ...originalProject.technologies,
        ],

        url:
          originalProject.url,
      });
    }
  }

  return result;
}

/**
 * Find matching certification.
 */
function findCertificationMatch(
  optimized: ResumeData["certifications"],
  original: ResumeData["certifications"][number],
): ResumeData["certifications"][number] | undefined {
  const originalName =
    clean(original.name).toLowerCase();

  return optimized.find(
    (item) =>
      originalName &&
      clean(item.name).toLowerCase() ===
        originalName,
  );
}

/**
 * Preserve certifications.
 */
function preserveCertifications(
  optimized: ResumeData["certifications"],
  original: ResumeData["certifications"],
): ResumeData["certifications"] {
  const result = [...optimized];

  for (const originalCertification of original) {
    const match =
      findCertificationMatch(
        result,
        originalCertification,
      );

    if (match) {
      match.name =
        mergeString(
          match.name,
          originalCertification.name,
        );

      match.issuer =
        mergeString(
          match.issuer,
          originalCertification.issuer,
        );

      match.date =
        mergeString(
          match.date,
          originalCertification.date,
        );

      match.url =
        mergeString(
          match.url,
          originalCertification.url,
        );
    } else {
      result.push({
        name:
          originalCertification.name,

        issuer:
          originalCertification.issuer,

        date:
          originalCertification.date,

        url:
          originalCertification.url,
      });
    }
  }

  return result;
}

/**
 * Preserve skills.
 *
 * AI can reorganize and improve skills,
 * but it should not silently delete original skills.
 */
function preserveSkills(
  optimized: ResumeData["skills"],
  original: ResumeData["skills"],
): ResumeData["skills"] {
  const result = [...optimized];

  for (const originalSkillGroup of original) {
    const originalCategory =
      clean(
        originalSkillGroup.category,
      ).toLowerCase();

    const match =
      result.find(
        (item) =>
          clean(item.category)
            .toLowerCase() ===
          originalCategory,
      );

    if (match) {
      match.items =
        uniqueStrings([
          ...match.items,
          ...originalSkillGroup.items,
        ]);
    } else {
      result.push({
        category:
          originalSkillGroup.category,

        items: [
          ...originalSkillGroup.items,
        ],
      });
    }
  }

  return result;
}

/**
 * Preserve additional sections.
 */
function preserveAdditionalSections(
  optimized: ResumeData["additionalSections"],
  original: ResumeData["additionalSections"],
): ResumeData["additionalSections"] {
  const result = [...optimized];

  for (const originalSection of original) {
    const originalTitle =
      clean(
        originalSection.title,
      ).toLowerCase();

    const match =
      result.find(
        (item) =>
          clean(item.title)
            .toLowerCase() ===
          originalTitle,
      );

    if (match) {
      match.items =
        uniqueStrings([
          ...match.items,
          ...originalSection.items,
        ]);
    } else {
      result.push({
        title:
          originalSection.title,

        items: [
          ...originalSection.items,
        ],
      });
    }
  }

  return result;
}

/**
 * Preserve the original resume's factual content
 * after AI optimization.
 *
 * The optimized version remains the primary version.
 * Missing original information is restored.
 */
export function preserveOriginalResumeContent(
  optimized: ResumeData,
  original: ResumeData,
): ResumeData {
  const preserved: ResumeData = {
    personal: {
      name:
        mergeString(
          optimized.personal.name,
          original.personal.name,
        ),

      email:
        mergeString(
          optimized.personal.email,
          original.personal.email,
        ),

      phone:
        mergeString(
          optimized.personal.phone,
          original.personal.phone,
        ),

      location:
        mergeString(
          optimized.personal.location,
          original.personal.location,
        ),

      linkedin:
        mergeString(
          optimized.personal.linkedin,
          original.personal.linkedin,
        ),

      github:
        mergeString(
          optimized.personal.github,
          original.personal.github,
        ),

      website:
        mergeString(
          optimized.personal.website,
          original.personal.website,
        ),
    },

    professionalSummary:
      mergeString(
        optimized.professionalSummary,
        original.professionalSummary,
      ),

    skills:
      preserveSkills(
        optimized.skills,
        original.skills,
      ),

    experience:
      preserveExperience(
        optimized.experience,
        original.experience,
      ),

    education:
      preserveEducation(
        optimized.education,
        original.education,
      ),

    projects:
      preserveProjects(
        optimized.projects,
        original.projects,
      ),

    certifications:
      preserveCertifications(
        optimized.certifications,
        original.certifications,
      ),

    achievements:
      uniqueStrings([
        ...optimized.achievements,
        ...original.achievements,
      ]),

    languages:
      uniqueStrings([
        ...optimized.languages,
        ...original.languages,
      ]),

    additionalSections:
      preserveAdditionalSections(
        optimized.additionalSections,
        original.additionalSections,
      ),
  };

  return preserved;
}