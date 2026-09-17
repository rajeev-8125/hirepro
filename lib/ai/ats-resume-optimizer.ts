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
 * Remove markdown fences and accidental text
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
 * Convert unknown value into an array of strings.
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
        responsibilities: safeStringArray(
          obj.responsibilities
        ),
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
        technologies: safeStringArray(
          obj.technologies
        ),
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
 * Normalize the complete Gemini resume response.
 */
function normalizeResume(
  value: unknown
): unknown {
  if (!value || typeof value !== "object") {
    return null;
  }

  const obj =
    value as Record<string, unknown>;

  const personal =
    obj.personal &&
    typeof obj.personal === "object"
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

    experience: normalizeExperience(
      obj.experience
    ),

    education: normalizeEducation(
      obj.education
    ),

    projects: normalizeProjects(
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
}

/**
 * Parse Gemini response and validate
 * against ResumeSchema.
 */
function parseResumeResponse(
  raw: string
):
  | {
      success: true;
      resume: ResumeData;
    }
  | {
      success: false;
      raw: string;
      error: string;
    } {
  try {
    const cleaned =
      cleanJsonResponse(raw);

    const parsed =
      JSON.parse(cleaned);

    const normalized =
      normalizeResume(parsed);

    const validation =
      ResumeSchema.safeParse(
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
 * Build the optimization prompt.
 *
 * IMPORTANT:
 * The AI is allowed to improve wording,
 * but it is NOT allowed to remove factual
 * information from the original resume.
 */
function buildOptimizationPrompt(
  resumeText: string,
  atsResult: ATSResult,
  jobDescription: string
): string {
  return `
You are HirePro's expert ATS resume optimization engine.

Your task is to optimize the candidate's resume for:

1. ATS compatibility
2. Recruiter readability
3. Job-description relevance
4. Clear professional wording
5. Strong keyword alignment
6. Better structure
7. Better achievement-oriented wording where supported

However, this is NOT permission to rewrite the candidate's history.

The ORIGINAL RESUME is the single source of truth.

==================================================
ABSOLUTE RULE: NEVER INVENT INFORMATION
==================================================

You MUST NOT invent:

- companies
- employers
- job titles
- dates
- degrees
- universities
- institutions
- certifications
- skills
- technologies
- projects
- achievements
- metrics
- percentages
- numbers
- responsibilities
- employment history
- internships
- links
- URLs
- awards
- locations
- languages
- tools
- frameworks
- clients
- products
- job duties

If a fact is not present in the original resume,
DO NOT create it.

==================================================
ABSOLUTE RULE: PRESERVE ALL EXISTING CONTENT
==================================================

The optimized resume MUST preserve the complete
factual structure of the original resume.

Optimization means improving presentation and wording.

It does NOT mean deleting information.

You MUST preserve EVERY existing:

- personal information
- email
- phone
- location
- LinkedIn
- GitHub
- website
- professional summary facts
- skill category
- individual skill
- experience entry
- company
- role
- location
- start date
- end date
- responsibility
- education entry
- institution
- degree
- field
- start date
- end date
- education detail
- project
- project description
- project technology
- project URL
- certification
- certification issuer
- certification date
- certification URL
- achievement
- language
- additional section
- additional section item

==================================================
EDUCATION PRESERVATION — CRITICAL
==================================================

This is especially important.

If the original resume contains:

2 education entries

the optimized resume MUST contain:

2 education entries.

If one education entry has:

3 details

the optimized version MUST retain all 3 factual details.

You may rewrite those details for clarity.

You may NOT remove them simply because
they are not directly related to the job description.

Never drop an education record.

==================================================
EXPERIENCE PRESERVATION — CRITICAL
==================================================

Every original experience entry MUST remain.

Every original responsibility MUST remain
in factual meaning.

You may:

- improve grammar
- improve clarity
- improve action verbs
- improve professional wording
- remove unnecessary repetition

You may NOT:

- remove an experience entry
- remove a company
- remove a role
- remove dates
- remove responsibilities
- invent metrics

==================================================
PROJECT PRESERVATION — CRITICAL
==================================================

Every original project MUST remain.

Every original technology MUST remain.

Every original project URL MUST remain.

You may improve the description using
only information already present.

==================================================
SKILLS PRESERVATION — CRITICAL
==================================================

Every skill explicitly supported by the
original resume must remain.

You may reorganize skills into categories.

You may emphasize skills relevant to the
job description.

You may NOT claim unsupported experience
with a technology.

For example:

If the resume says:
React

you may use:
React.js

if this is only a wording normalization.

But you may NOT create:

React Native

unless the original resume supports it.

==================================================
CONTACT INFORMATION PRESERVATION
==================================================

Never remove:

- name
- email
- phone
- location
- LinkedIn
- GitHub
- website

Preserve the actual values.

Do not replace them with invented values.

==================================================
DATES
==================================================

Dates are factual information.

Preserve them.

Do not change:

- months
- years
- start dates
- end dates

unless correcting an obvious formatting representation
without changing the underlying factual date.

==================================================
ATS OPTIMIZATION
==================================================

Use the ATS analysis below.

You may improve:

- keyword placement
- wording
- summary
- bullet clarity
- section ordering
- readability
- professional phrasing
- relevant emphasis

Only when supported by the original resume.

Missing keywords may be added ONLY if the original
resume already contains the underlying skill,
technology, responsibility, or experience.

Never keyword-stuff unsupported technologies.

==================================================
PAGE LENGTH
==================================================

Do NOT remove factual information to make
the resume shorter.

Page length will be controlled by the
resume rendering engine separately.

If content is too long for one page,
the renderer must adjust layout/spacing.

You must preserve the content.

==================================================
ORIGINAL RESUME
==================================================

${resumeText}

==================================================
ATS ANALYSIS
==================================================

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

==================================================
JOB DESCRIPTION
==================================================

${
  jobDescription
    ? jobDescription
    : "No job description was provided. Optimize for general ATS compatibility."
}

==================================================
OUTPUT REQUIREMENTS
==================================================

Return ONLY ONE valid JSON object.

The structure MUST be:

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

==================================================
FINAL VALIDATION BEFORE RESPONDING
==================================================

Before returning JSON, internally verify:

1. Every original education entry exists.
2. Every education detail remains.
3. Every original experience entry exists.
4. Every experience responsibility remains.
5. Every original project exists.
6. Every project technology remains.
7. Every original certification exists.
8. Every original achievement remains.
9. Every original language remains.
10. Every original skill remains.
11. Contact information remains.
12. Dates remain.
13. Companies remain.
14. Job titles remain.
15. No unsupported facts were invented.
16. No metrics were invented.
17. No sections were silently deleted.

If the optimized version would lose information,
DO NOT remove it.

Return the complete preserved resume instead.

Return ONLY JSON.
`;
}

/**
 * Repair malformed Gemini JSON.
 */
async function repairResumeResponse(
  rawResponse: string,
  validationError: string,
  model: string
): Promise<ResumeData | null> {
  const repairPrompt = `
You are HirePro's resume JSON repair system.

The AI generated an invalid resume object.

Repair the JSON so it exactly matches ResumeSchema.

IMPORTANT:

This is a repair operation.

DO NOT invent information.

DO NOT remove factual information.

DO NOT rewrite factual information.

Preserve the candidate's existing content.

The following fields MUST exist:

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

If a field is missing because it was genuinely
not present, use an empty string or empty array.

DO NOT use null.

DO NOT invent missing factual information.

==================================================
INVALID RESPONSE
==================================================

${rawResponse}

==================================================
VALIDATION ERROR
==================================================

${validationError}

Return ONLY the repaired JSON object.
`;

  try {
    const response =
      await ai.models.generateContent({
        model,
        contents: repairPrompt,
        config: {
          temperature: 0,
          responseMimeType:
            "application/json",
        },
      });

    const raw =
      response.text ?? "";

    const cleaned =
      cleanJsonResponse(raw);

    const parsed =
      JSON.parse(cleaned);

    const normalized =
      normalizeResume(parsed);

    const validation =
      ResumeSchema.safeParse(
        normalized
      );

    if (!validation.success) {
      console.error(
        "[ATS OPTIMIZER] Repair validation failed:",
        validation.error.flatten()
      );

      return null;
    }

    return validation.data;
  } catch (error) {
    console.error(
      "[ATS OPTIMIZER] Repair failed:",
      error
    );

    return null;
  }
}

/**
 * Generate optimized resume using a specific model.
 */
async function generateWithModel(
  model: string,
  prompt: string
): Promise<ResumeData> {
  let lastValidationError = "";

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      console.log(
        `[ATS OPTIMIZER] ${model} attempt ${attempt}`
      );

      const response =
        await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.1,
            responseMimeType:
              "application/json",
          },
        });

      const raw =
        response.text ?? "";

      if (!raw.trim()) {
        throw new Error(
          "AI returned an empty response."
        );
      }

      const parsed =
        parseResumeResponse(raw);

      if (parsed.success) {
        return parsed.resume;
      }

      lastValidationError =
        parsed.error;

      console.error(
        `[ATS OPTIMIZER] Invalid structure from ${model}:`,
        parsed.error
      );

      /**
       * Give Gemini a chance to repair
       * its own response.
       */
      const repaired =
        await repairResumeResponse(
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

      if (
        attempt < MAX_ATTEMPTS
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
    `AI returned an invalid optimized resume structure. ${
      lastValidationError || ""
    }`
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

  const prompt =
    buildOptimizationPrompt(
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