import { GoogleGenAI } from "@google/genai";

import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";

import type { ATSResult } from "@/lib/ai/ats-schema";

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
 * Remove markdown fences and other accidental text
 * around Gemini JSON responses.
 */
function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Convert unknown values into safe strings.
 */
function safeString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

/**
 * Convert an unknown value into an array of strings.
 */
function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => safeString(item).trim())
    .filter(Boolean);
}

/**
 * Normalize a skills section.
 */
function normalizeSkills(value: unknown): ResumeData["skills"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const obj = item as Record<string, unknown>;

      return {
        category: safeString(obj.category),
        items: safeStringArray(obj.items),
      };
    })
    .filter(
      (
        item
      ): item is {
        category: string;
        items: string[];
      } => item !== null
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
      if (!item || typeof item !== "object") {
        return null;
      }

      const obj = item as Record<string, unknown>;

      return {
        company: safeString(obj.company),
        role: safeString(obj.role),
        location: safeString(obj.location),
        startDate: safeString(obj.startDate),
        endDate: safeString(obj.endDate),
        responsibilities: safeStringArray(obj.responsibilities),
      };
    })
    .filter(
      (
        item
      ): item is {
        company: string;
        role: string;
        location: string;
        startDate: string;
        endDate: string;
        responsibilities: string[];
      } => item !== null
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
      if (!item || typeof item !== "object") {
        return null;
      }

      const obj = item as Record<string, unknown>;

      return {
        institution: safeString(obj.institution),
        degree: safeString(obj.degree),
        field: safeString(obj.field),
        startDate: safeString(obj.startDate),
        endDate: safeString(obj.endDate),
        details: safeStringArray(obj.details),
      };
    })
    .filter(
      (
        item
      ): item is {
        institution: string;
        degree: string;
        field: string;
        startDate: string;
        endDate: string;
        details: string[];
      } => item !== null
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
      if (!item || typeof item !== "object") {
        return null;
      }

      const obj = item as Record<string, unknown>;

      return {
        name: safeString(obj.name),
        description: safeString(obj.description),
        technologies: safeStringArray(obj.technologies),
        url: safeString(obj.url),
      };
    })
    .filter(
      (
        item
      ): item is {
        name: string;
        description: string;
        technologies: string[];
        url: string;
      } => item !== null
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
      if (!item || typeof item !== "object") {
        return null;
      }

      const obj = item as Record<string, unknown>;

      return {
        name: safeString(obj.name),
        issuer: safeString(obj.issuer),
        date: safeString(obj.date),
        url: safeString(obj.url),
      };
    })
    .filter(
      (
        item
      ): item is {
        name: string;
        issuer: string;
        date: string;
        url: string;
      } => item !== null
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
      if (!item || typeof item !== "object") {
        return null;
      }

      const obj = item as Record<string, unknown>;

      return {
        title: safeString(obj.title),
        items: safeStringArray(obj.items),
      };
    })
    .filter(
      (
        item
      ): item is {
        title: string;
        items: string[];
      } => item !== null
    );
}

/**
 * Normalize Gemini's output into the exact ResumeSchema shape.
 *
 * This is intentionally conservative.
 * Missing information becomes an empty string/array.
 * We never invent information.
 */
function normalizeResume(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return null;
  }

  const obj = value as Record<string, unknown>;

  const personal =
    obj.personal && typeof obj.personal === "object"
      ? (obj.personal as Record<string, unknown>)
      : {};

  return {
    personal: {
      name: safeString(personal.name),
      email: safeString(personal.email),
      phone: safeString(personal.phone),
      location: safeString(personal.location),
      linkedin: safeString(personal.linkedin),
      github: safeString(personal.github),
      website: safeString(personal.website),
    },

    professionalSummary: safeString(
      obj.professionalSummary
    ),

    skills: normalizeSkills(obj.skills),

    experience: normalizeExperience(obj.experience),

    education: normalizeEducation(obj.education),

    projects: normalizeProjects(obj.projects),

    certifications: normalizeCertifications(
      obj.certifications
    ),

    achievements: safeStringArray(obj.achievements),

    languages: safeStringArray(obj.languages),

    additionalSections: normalizeAdditionalSections(
      obj.additionalSections
    ),
  };
}

/**
 * Parse and validate Gemini output.
 */
function parseResumeResponse(
  raw: string
): {
  success: true;
  resume: ResumeData;
} | {
  success: false;
  raw: string;
  error: string;
} {
  try {
    const cleaned = cleanJsonResponse(raw);

    const parsed = JSON.parse(cleaned);

    const normalized = normalizeResume(parsed);

    const validation = ResumeSchema.safeParse(
      normalized
    );

    if (!validation.success) {
      console.error(
        "[ATS OPTIMIZER] Resume validation failed:",
        validation.error.flatten()
      );

      return {
        success: false,
        raw,
        error: JSON.stringify(
          validation.error.flatten()
        ),
      };
    }

    return {
      success: true,
      resume: validation.data,
    };
  } catch (error) {
    console.error(
      "[ATS OPTIMIZER] JSON parsing failed:",
      error
    );

    return {
      success: false,
      raw,
      error:
        error instanceof Error
          ? error.message
          : "Invalid JSON",
    };
  }
}

/**
 * Build the main optimization prompt.
 */
function buildOptimizationPrompt(
  resumeText: string,
  atsResult: ATSResult,
  jobDescription: string
): string {
  return `
You are an expert ATS resume optimization system.

Your job is to improve the candidate's resume for ATS compatibility and recruiter readability.

CRITICAL RULE:

You MUST NOT invent information.

You are allowed to:
- rewrite wording
- improve grammar
- improve clarity
- improve professional phrasing
- reorganize existing information
- improve bullet points
- emphasize existing relevant skills
- improve keyword placement when the keyword is genuinely supported by the original resume
- improve the professional summary using existing facts
- make responsibilities clearer
- improve project descriptions using only information already present
- remove unnecessary repetition

You MUST NOT:
- invent companies
- invent job titles
- invent dates
- invent degrees
- invent universities
- invent certifications
- invent skills
- invent technologies
- invent achievements
- invent metrics
- invent responsibilities
- invent projects
- invent employment
- invent links
- invent experience
- claim that the candidate used a technology unless the original resume supports it

If information is not present in the original resume, leave the corresponding field empty.

The original resume is the only source of truth.

--------------------------------------------------
ORIGINAL RESUME
--------------------------------------------------

${resumeText}

--------------------------------------------------
ATS ANALYSIS
--------------------------------------------------

Overall Score:
${atsResult.overallScore}

Summary:
${atsResult.summary}

Keyword Score:
${atsResult.keywordMatch.score}

Matched Keywords:
${JSON.stringify(
  atsResult.keywordMatch.matchedKeywords
)}

Missing Keywords:
${JSON.stringify(
  atsResult.keywordMatch.missingKeywords
)}

Formatting Score:
${atsResult.formatting.score}

Formatting Issues:
${JSON.stringify(
  atsResult.formatting.issues
)}

Experience Score:
${atsResult.experience.score}

Experience Strengths:
${JSON.stringify(
  atsResult.experience.strengths
)}

Experience Weaknesses:
${JSON.stringify(
  atsResult.experience.weaknesses
)}

Skills Score:
${atsResult.skills.score}

Matched Skills:
${JSON.stringify(
  atsResult.skills.matchedSkills
)}

Missing Skills:
${JSON.stringify(
  atsResult.skills.missingSkills
)}

Recommendations:
${JSON.stringify(
  atsResult.recommendations
)}

--------------------------------------------------
JOB DESCRIPTION
--------------------------------------------------

${
  jobDescription
    ? jobDescription
    : "No job description was provided. Optimize for general ATS compatibility."
}

--------------------------------------------------
OUTPUT REQUIREMENTS
--------------------------------------------------

Return ONLY ONE valid JSON object.

The JSON MUST follow this EXACT structure:

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

IMPORTANT:

Every field must exist.

Use empty strings for unavailable text.

Use empty arrays for unavailable lists.

Do not use null.

Do not use undefined.

Do not add extra top-level fields.

Do not return markdown.

Do not return explanations.

Return ONLY valid JSON.
`;
}

/**
 * Ask Gemini to repair malformed resume JSON.
 */
async function repairResumeResponse(
  rawResponse: string,
  validationError: string,
  model: string
): Promise<ResumeData | null> {
  const repairPrompt = `
You are a JSON repair system.

The AI generated an invalid resume object.

Your task is to repair it so it exactly matches the required ResumeSchema.

DO NOT change factual information.

DO NOT invent anything.

Only:
- fix JSON syntax
- add missing fields using empty strings or empty arrays
- convert null values into empty strings/arrays
- convert invalid primitive fields into valid strings
- convert invalid list fields into arrays
- remove unsupported extra fields

Required structure:

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

Validation error:

${validationError}

Invalid AI response:

${rawResponse}

Return ONLY corrected JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: repairPrompt,
      config: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "";

    const parsed = parseResumeResponse(raw);

    if (parsed.success) {
      return parsed.resume;
    }

    return null;
  } catch (error) {
    console.error(
      "[ATS OPTIMIZER] Repair failed:",
      error
    );

    return null;
  }
}

/**
 * Run Gemini with retry logic.
 */
async function generateWithModel(
  model: string,
  prompt: string
): Promise<ResumeData> {
  let lastRawResponse = "";
  let lastValidationError = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(
        `[ATS OPTIMIZER] ${model} attempt ${attempt}/${MAX_ATTEMPTS}`
      );

      const response =
        await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });

      const raw = response.text ?? "";

      lastRawResponse = raw;

      console.log(
        `[ATS OPTIMIZER] ${model} response length: ${raw.length}`
      );

      const parsed = parseResumeResponse(raw);

      if (parsed.success) {
        console.log(
          `[ATS OPTIMIZER] ${model} returned valid resume`
        );

        return parsed.resume;
      }

      lastValidationError = parsed.error;

      console.error(
        `[ATS OPTIMIZER] Invalid structure from ${model}:`,
        parsed.error
      );

      /**
       * Give Gemini one chance to repair its own output.
       */
      const repaired = await repairResumeResponse(
        raw,
        parsed.error,
        model
      );

      if (repaired) {
        console.log(
          `[ATS OPTIMIZER] ${model} successfully repaired resume`
        );

        return repaired;
      }
    } catch (error) {
      console.error(
        `[ATS OPTIMIZER] ${model} attempt ${attempt} failed:`,
        error
      );

      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1500)
        );
      }
    }
  }

  throw new Error(
    `AI returned an invalid optimized resume structure. ${lastValidationError || ""}`
  );
}

/**
 * Main exported optimizer.
 */
export async function optimizeResumeForATS(
  resumeText: string,
  atsResult: ATSResult,
  jobDescription: string
): Promise<ResumeData> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  if (!resumeText.trim()) {
    throw new Error(
      "Resume text is empty."
    );
  }

  const prompt = buildOptimizationPrompt(
    resumeText,
    atsResult,
    jobDescription
  );

  const models = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS,
  ];

  let lastError: unknown = null;

  for (const model of models) {
    try {
      return await generateWithModel(
        model,
        prompt
      );
    } catch (error) {
      lastError = error;

      console.error(
        `[ATS OPTIMIZER] Model ${model} failed:`,
        error
      );
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Failed to optimize resume with AI."
  );
}