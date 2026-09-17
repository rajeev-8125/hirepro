import { GoogleGenAI } from "@google/genai";
import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";

const PRIMARY_MODEL = "gemini-3.6-flash";

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const MAX_ATTEMPTS = 3;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Remove markdown fences and accidental text
 * around JSON returned by Gemini.
 */
function cleanJsonResponse(
  raw: string
): string {
  let cleaned = raw.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(
        /^```(?:json)?\s*/i,
        ""
      )
      .replace(
        /\s*```$/i,
        ""
      )
      .trim();
  }

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );
  }

  return cleaned;
}

/**
 * Convert unknown values into strings safely.
 */
function safeString(
  value: unknown
): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

/**
 * Convert unknown value to string array.
 */
function safeStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      safeString(item)
    )
    .filter(Boolean);
}

/**
 * Normalize skills.
 */
function normalizeSkills(
  value: unknown
): ResumeData["skills"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const obj =
        item as Record<
          string,
          unknown
        >;

      return {
        category: safeString(
          obj.category
        ),

        items:
          safeStringArray(
            obj.items
          ),
      };
    })
    .filter(
      (
        item
      ): item is ResumeData["skills"][number] =>
        item !== null
    );
}

/**
 * Normalize experience.
 */
function normalizeExperience(
  value: unknown
): ResumeData["experience"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const obj =
        item as Record<
          string,
          unknown
        >;

      return {
        company: safeString(
          obj.company
        ),

        role: safeString(
          obj.role
        ),

        location: safeString(
          obj.location
        ),

        startDate:
          safeString(
            obj.startDate
          ),

        endDate:
          safeString(
            obj.endDate
          ),

        responsibilities:
          safeStringArray(
            obj.responsibilities
          ),
      };
    })
    .filter(
      (
        item
      ): item is ResumeData["experience"][number] =>
        item !== null
    );
}

/**
 * Normalize education.
 */
function normalizeEducation(
  value: unknown
): ResumeData["education"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const obj =
        item as Record<
          string,
          unknown
        >;

      return {
        institution:
          safeString(
            obj.institution
          ),

        degree: safeString(
          obj.degree
        ),

        field: safeString(
          obj.field
        ),

        startDate:
          safeString(
            obj.startDate
          ),

        endDate:
          safeString(
            obj.endDate
          ),

        details:
          safeStringArray(
            obj.details
          ),
      };
    })
    .filter(
      (
        item
      ): item is ResumeData["education"][number] =>
        item !== null
    );
}

/**
 * Normalize projects.
 */
function normalizeProjects(
  value: unknown
): ResumeData["projects"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const obj =
        item as Record<
          string,
          unknown
        >;

      return {
        name: safeString(
          obj.name
        ),

        description:
          safeString(
            obj.description
          ),

        technologies:
          safeStringArray(
            obj.technologies
          ),

        url: safeString(
          obj.url
        ),
      };
    })
    .filter(
      (
        item
      ): item is ResumeData["projects"][number] =>
        item !== null
    );
}

/**
 * Normalize certifications.
 */
function normalizeCertifications(
  value: unknown
): ResumeData["certifications"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const obj =
        item as Record<
          string,
          unknown
        >;

      return {
        name: safeString(
          obj.name
        ),

        issuer: safeString(
          obj.issuer
        ),

        date: safeString(
          obj.date
        ),

        url: safeString(
          obj.url
        ),
      };
    })
    .filter(
      (
        item
      ): item is ResumeData["certifications"][number] =>
        item !== null
    );
}

/**
 * Normalize additional sections.
 */
function normalizeAdditionalSections(
  value: unknown
): ResumeData["additionalSections"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const obj =
        item as Record<
          string,
          unknown
        >;

      return {
        title: safeString(
          obj.title
        ),

        items:
          safeStringArray(
            obj.items
          ),
      };
    })
    .filter(
      (
        item
      ): item is ResumeData["additionalSections"][number] =>
        item !== null
    );
}

/**
 * Normalize the complete extracted resume.
 */
function normalizeResume(
  value: unknown
): ResumeData {
  if (
    !value ||
    typeof value !== "object"
  ) {
    throw new Error(
      "AI returned an invalid resume object."
    );
  }

  const obj =
    value as Record<
      string,
      unknown
    >;

  const personal =
    obj.personal &&
    typeof obj.personal ===
      "object"
      ? (obj.personal as Record<
          string,
          unknown
        >)
      : {};

  const normalized: ResumeData = {
    personal: {
      name: safeString(
        personal.name
      ),

      email: safeString(
        personal.email
      ),

      phone: safeString(
        personal.phone
      ),

      location: safeString(
        personal.location
      ),

      linkedin: safeString(
        personal.linkedin
      ),

      github: safeString(
        personal.github
      ),

      website: safeString(
        personal.website
      ),
    },

    professionalSummary:
      safeString(
        obj.professionalSummary
      ),

    skills:
      normalizeSkills(
        obj.skills
      ),

    experience:
      normalizeExperience(
        obj.experience
      ),

    education:
      normalizeEducation(
        obj.education
      ),

    projects:
      normalizeProjects(
        obj.projects
      ),

    certifications:
      normalizeCertifications(
        obj.certifications
      ),

    achievements:
      safeStringArray(
        obj.achievements
      ),

    languages:
      safeStringArray(
        obj.languages
      ),

    additionalSections:
      normalizeAdditionalSections(
        obj.additionalSections
      ),
  };

  const validation =
    ResumeSchema.safeParse(
      normalized
    );

  if (!validation.success) {
    console.error(
      "[ATS EXTRACTOR] Validation error:",
      validation.error.flatten()
    );

    throw new Error(
      "Extracted resume structure is invalid."
    );
  }

  return validation.data;
}

/**
 * Build the extraction prompt.
 *
 * This is EXTRACTION only.
 *
 * No optimization happens here.
 */
function buildExtractionPrompt(
  resumeText: string
): string {
  return `
You are the resume extraction engine for an ATS platform.

Your task is to extract the factual content from the uploaded resume text and convert it into structured JSON.

THIS IS NOT AN OPTIMIZATION TASK.

Do NOT improve wording.

Do NOT rewrite sentences.

Do NOT add keywords.

Do NOT invent achievements.

Do NOT invent technologies.

Do NOT invent companies.

Do NOT invent dates.

Do NOT invent education.

Do NOT invent certifications.

Do NOT invent contact information.

Do NOT remove factual information.

Preserve the candidate's original meaning and factual information.

If a field does not exist in the resume, return an empty string or empty array.

The output must contain exactly these top-level fields:

{
  "personal": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "website": ""
  },

  "professionalSummary": "",

  "skills": [
    {
      "category": "",
      "items": []
    }
  ],

  "experience": [
    {
      "company": "",
      "role": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": []
    }
  ],

  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "details": []
    }
  ],

  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "url": ""
    }
  ],

  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "url": ""
    }
  ],

  "achievements": [],

  "languages": [],

  "additionalSections": [
    {
      "title": "",
      "items": []
    }
  ]
}

EXTRACTION RULES:

1. Preserve all factual information.

2. Do not invent missing information.

3. Keep dates exactly as they appear whenever possible.

4. Keep company names exactly as written.

5. Keep job titles exactly as written.

6. Keep institution names exactly as written.

7. Keep project names exactly as written.

8. Extract technologies from project descriptions when explicitly mentioned.

9. Group skills into sensible categories only when the resume clearly provides enough information.

10. If skills are not categorized in the original resume, use categories such as:
    - Programming Languages
    - Frameworks
    - Databases
    - Tools
    - Other Skills

11. Do not create a professional summary if the resume does not contain one.

12. Do not convert a responsibility into an achievement unless the resume explicitly states it.

13. Do not infer employment dates.

14. Do not infer education dates.

15. Do not infer URLs.

16. Preserve URLs exactly when available.

17. Preserve email addresses exactly.

18. Preserve phone numbers exactly.

19. Preserve LinkedIn and GitHub URLs exactly.

20. If the PDF contains repeated header/footer text, avoid duplicating it.

21. Maintain the order of experience, education, projects and certifications as closely as possible.

22. Additional sections should contain factual sections that do not fit naturally into the standard categories.

Return ONLY valid JSON.

RESUME TEXT:

${resumeText}
`;
}

/**
 * Generate extraction using one Gemini model.
 */
async function generateWithModel(
  model: string,
  prompt: string
): Promise<ResumeData> {
  let lastError: unknown =
    null;

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      console.log(
        `[ATS EXTRACTOR] ${model} attempt ${attempt}/${MAX_ATTEMPTS}`
      );

      const response =
        await ai.models.generateContent(
          {
            model,

            contents: prompt,

            config: {
              temperature: 0,

              responseMimeType:
                "application/json",
            },
          }
        );

      const raw =
        response.text?.trim();

      if (!raw) {
        throw new Error(
          "Gemini returned an empty extraction response."
        );
      }

      const cleaned =
        cleanJsonResponse(raw);

      let parsed: unknown;

      try {
        parsed =
          JSON.parse(cleaned);
      } catch {
        throw new Error(
          "Gemini returned invalid JSON."
        );
      }

      return normalizeResume(
        parsed
      );
    } catch (error) {
      lastError = error;

      console.error(
        `[ATS EXTRACTOR] ${model} attempt ${attempt} failed:`,
        error
      );

      if (
        attempt <
        MAX_ATTEMPTS
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1500
            )
        );
      }
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Failed to extract resume content."
  );
}

/**
 * Public ATS PDF extraction function.
 *
 * Input:
 *   raw text extracted from uploaded PDF
 *
 * Output:
 *   structured resume content
 *
 * No database access.
 * No Resume Builder access.
 */
export async function extractResumeForATS(
  resumeText: string
): Promise<ResumeData> {
  if (
    !process.env.GEMINI_API_KEY
  ) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  const cleanText =
    resumeText.trim();

  if (!cleanText) {
    throw new Error(
      "Resume text is empty."
    );
  }

  const prompt =
    buildExtractionPrompt(
      cleanText
    );

  const models = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS,
  ];

  let lastError: unknown =
    null;

  for (const model of models) {
    try {
      return await generateWithModel(
        model,
        prompt
      );
    } catch (error) {
      lastError = error;

      console.error(
        `[ATS EXTRACTOR] Model ${model} failed:`,
        error
      );
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Failed to extract resume content."
  );
}