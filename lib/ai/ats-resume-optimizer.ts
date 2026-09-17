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

export type ResumePageCount = 1 | 2 | 3;

/* ==========================================================
   BASIC HELPERS
========================================================== */

function cleanJsonResponse(
  raw: string,
): string {
  let cleaned = raw.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(
        /^```(?:json)?\s*/i,
        "",
      )
      .replace(
        /\s*```$/i,
        "",
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
      lastBrace + 1,
    );
  }

  return cleaned;
}

function safeString(
  value: unknown,
): string {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}

function safeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      safeString(item).trim(),
    )
    .filter(Boolean);
}

/* ==========================================================
   NORMALIZERS
========================================================== */

function normalizeSkills(
  value: unknown,
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
          obj.category,
        ),
        items: safeStringArray(
          obj.items,
        ),
      };
    })
    .filter(
      (
        item,
      ): item is ResumeData["skills"][number] =>
        item !== null,
    );
}

function normalizeExperience(
  value: unknown,
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
          obj.company,
        ),
        role: safeString(
          obj.role,
        ),
        location: safeString(
          obj.location,
        ),
        startDate: safeString(
          obj.startDate,
        ),
        endDate: safeString(
          obj.endDate,
        ),
        responsibilities:
          safeStringArray(
            obj.responsibilities,
          ),
      };
    })
    .filter(
      (
        item,
      ): item is ResumeData["experience"][number] =>
        item !== null,
    );
}

function normalizeEducation(
  value: unknown,
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
        institution: safeString(
          obj.institution,
        ),
        degree: safeString(
          obj.degree,
        ),
        field: safeString(
          obj.field,
        ),
        startDate: safeString(
          obj.startDate,
        ),
        endDate: safeString(
          obj.endDate,
        ),
        details:
          safeStringArray(
            obj.details,
          ),
      };
    })
    .filter(
      (
        item,
      ): item is ResumeData["education"][number] =>
        item !== null,
    );
}

function normalizeProjects(
  value: unknown,
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
          obj.name,
        ),
        description:
          safeString(
            obj.description,
          ),
        technologies:
          safeStringArray(
            obj.technologies,
          ),
        url: safeString(
          obj.url,
        ),
      };
    })
    .filter(
      (
        item,
      ): item is ResumeData["projects"][number] =>
        item !== null,
    );
}

function normalizeCertifications(
  value: unknown,
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
          obj.name,
        ),
        issuer: safeString(
          obj.issuer,
        ),
        date: safeString(
          obj.date,
        ),
        url: safeString(
          obj.url,
        ),
      };
    })
    .filter(
      (
        item,
      ): item is ResumeData["certifications"][number] =>
        item !== null,
    );
}

function normalizeAdditionalSections(
  value: unknown,
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
          obj.title,
        ),
        items: safeStringArray(
          obj.items,
        ),
      };
    })
    .filter(
      (
        item,
      ): item is ResumeData["additionalSections"][number] =>
        item !== null,
    );
}

/* ==========================================================
   COMPLETE RESUME NORMALIZATION
========================================================== */

function normalizeResume(
  value: unknown,
): unknown {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
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

  return {
    personal: {
      name: safeString(
        personal.name,
      ),
      email: safeString(
        personal.email,
      ),
      phone: safeString(
        personal.phone,
      ),
      location: safeString(
        personal.location,
      ),
      linkedin: safeString(
        personal.linkedin,
      ),
      github: safeString(
        personal.github,
      ),
      website: safeString(
        personal.website,
      ),
    },

    professionalSummary:
      safeString(
        obj.professionalSummary,
      ),

    skills: normalizeSkills(
      obj.skills,
    ),

    experience:
      normalizeExperience(
        obj.experience,
      ),

    education:
      normalizeEducation(
        obj.education,
      ),

    projects:
      normalizeProjects(
        obj.projects,
      ),

    certifications:
      normalizeCertifications(
        obj.certifications,
      ),

    achievements:
      safeStringArray(
        obj.achievements,
      ),

    languages:
      safeStringArray(
        obj.languages,
      ),

    additionalSections:
      normalizeAdditionalSections(
        obj.additionalSections,
      ),
  };
}

/* ==========================================================
   PARSE GEMINI RESPONSE
========================================================== */

function parseResumeResponse(
  raw: string,
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
        normalized,
      );

    if (!validation.success) {
      console.error(
        "[ATS OPTIMIZER] Resume validation failed:",
        validation.error.flatten(),
      );

      return {
        success: false,
        raw,
        error: JSON.stringify(
          validation.error.flatten(),
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
      error,
    );

    return {
      success: false,
      raw,
      error:
        error instanceof Error
          ? error.message
          : "Invalid JSON response.",
    };
  }
}

/* ==========================================================
   PAGE STRATEGY
========================================================== */

function getPageStrategy(
  pageCount: ResumePageCount,
): string {
  if (pageCount === 1) {
    return `
TARGET LENGTH: 1 PAGE

Create a highly concise professional resume.

Important:

- Do NOT delete factual information.
- Do NOT remove education entries.
- Do NOT remove experience entries.
- Do NOT remove projects.
- Do NOT remove certifications.
- Do NOT remove achievements.
- Do NOT remove skills.
- Do NOT invent information.

Use concise wording.

Reduce unnecessary repetition.

Use compact but meaningful bullet points.

Keep the most ATS-relevant information prominent.

The PDF renderer will control physical spacing.
`;
  }

  if (pageCount === 3) {
    return `
TARGET LENGTH: UP TO 3 PAGES

Allow enough space to preserve the candidate's
complete professional history.

Do NOT artificially shorten the resume.

Preserve all factual information.

Use detailed but concise professional wording.

Do not add filler merely to reach three pages.

The PDF renderer will control physical spacing.
`;
  }

  return `
TARGET LENGTH: UP TO 2 PAGES

Create a balanced professional resume.

Preserve all factual information.

Use concise professional wording.

Prioritize important ATS information.

Do not delete factual content simply to make
the resume shorter.

The PDF renderer will control physical spacing.
`;
}

/* ==========================================================
   OPTIMIZATION PROMPT
========================================================== */

function buildOptimizationPrompt(
  resumeText: string,
  atsResult: ATSResult,
  jobDescription: string,
  pageCount: ResumePageCount,
): string {
  const pageStrategy =
    getPageStrategy(
      pageCount,
    );

  return `
You are HirePro's expert ATS resume optimization engine.

You are optimizing a REAL candidate resume.

Your task is to improve ATS compatibility while
preserving the candidate's factual information.

==================================================
MOST IMPORTANT RULE
==================================================

THE ORIGINAL RESUME IS THE SINGLE SOURCE OF TRUTH.

You may improve wording.

You may improve organization.

You may improve keyword placement.

You may improve professional phrasing.

You may improve the summary.

You may improve weak bullet points.

BUT:

YOU MUST NEVER INVENT FACTS.

==================================================
NEVER INVENT
==================================================

Never invent:

- employers
- companies
- job titles
- employment dates
- education
- universities
- degrees
- certifications
- technologies
- programming languages
- frameworks
- tools
- projects
- responsibilities
- achievements
- metrics
- percentages
- numbers
- clients
- products
- awards
- locations
- languages
- links
- URLs
- job duties
- professional experience

If the original resume does not support a claim,
DO NOT make that claim.

==================================================
PRESERVE THE COMPLETE RESUME
==================================================

You MUST preserve every factual item from the
original resume.

Do not silently remove content.

Do not remove information merely because it is
not relevant to the provided job description.

The ATS optimizer is allowed to improve content,
not erase history.

==================================================
PERSONAL INFORMATION
==================================================

Preserve exactly:

- name
- email
- phone
- location
- LinkedIn
- GitHub
- website

Do not replace contact information.

Do not create missing contact information.

==================================================
EXPERIENCE
==================================================

Every original experience entry MUST remain.

Every original company MUST remain.

Every original role MUST remain.

Every original date MUST remain.

Every original responsibility MUST remain
in factual meaning.

You may improve grammar.

You may improve action verbs.

You may improve sentence structure.

You may make responsibilities more concise.

You may NOT fabricate metrics.

Example:

Original:
"Worked on Python API development."

Allowed:
"Developed Python APIs."

Not allowed:
"Developed Python APIs that improved performance by 40%."

The 40% would be fabricated if it was not
present in the original resume.

==================================================
EDUCATION
==================================================

THIS IS CRITICAL.

Every original education entry MUST remain.

If the original resume contains:

2 education entries

the output must contain:

2 education entries.

If an education entry contains multiple details,
preserve every factual detail.

You may rewrite grammar.

You may make wording more professional.

You may NOT remove education entries.

==================================================
PROJECTS
==================================================

Every original project MUST remain.

Every original project technology MUST remain.

Every original project URL MUST remain.

You may improve descriptions.

You may make project descriptions more ATS-friendly.

You may connect existing technologies to relevant
job-description wording ONLY when factually supported.

==================================================
CERTIFICATIONS
==================================================

Every original certification MUST remain.

Preserve:

- certification name
- issuer
- date
- URL

Do not create certifications.

==================================================
SKILLS
==================================================

Every skill explicitly supported by the original
resume must remain.

You may reorganize skills into categories.

You may normalize obvious naming variations.

Example:

React -> React.js

is acceptable.

But:

React -> React Native

is NOT acceptable unless React Native
is supported by the original resume.

==================================================
MISSING KEYWORDS
==================================================

The ATS analyzer identified missing keywords.

Process EVERY missing keyword individually.

For each missing keyword:

1. Search the original resume for factual support.
2. Check experience.
3. Check projects.
4. Check skills.
5. Check education.
6. Check certifications.
7. Check other sections.

If the candidate genuinely has evidence supporting
the keyword, integrate it naturally.

If the candidate does NOT have evidence,
DO NOT invent it.

Never keyword-stuff unsupported terms.

==================================================
MISSING SKILLS
==================================================

Process EVERY missing skill individually.

For every missing skill:

1. Search the original resume.
2. Determine whether the skill is already present
   under another name or section.
3. If supported, expose it more clearly.
4. If unsupported, do not add it.

Never claim experience the candidate does not have.

==================================================
ATS RECOMMENDATIONS
==================================================

Process EVERY recommendation individually.

Use the recommendations to improve:

- summary
- skills
- experience wording
- project wording
- keyword placement
- formatting-related content
- clarity
- recruiter readability

Do not implement a recommendation if doing so
would require inventing information.

==================================================
JOB DESCRIPTION
==================================================

When a job description is provided:

Use it to understand:

- important keywords
- required skills
- responsibilities
- terminology
- role expectations

Then align the resume using ONLY information
supported by the original resume.

Do not claim missing qualifications.

Do not fabricate experience.

==================================================
PROFESSIONAL SUMMARY
==================================================

Improve the professional summary.

The summary should:

- clearly describe the candidate
- use relevant existing skills
- contain supported keywords
- be concise
- be ATS-friendly
- avoid generic filler

Do not invent years of experience.

Do not invent achievements.

Do not invent technologies.

==================================================
BULLET POINT IMPROVEMENT
==================================================

Improve weak bullet points when possible.

Prefer:

Action + task + technology/context + result

BUT:

Only include a result when the original resume
supports that result.

Do not invent numbers.

==================================================
PAGE STRATEGY
==================================================

${pageStrategy}

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

==================================================
KEYWORD ANALYSIS
==================================================

Keyword Score:
${atsResult.keywordMatch.score}

Matched Keywords:
${JSON.stringify(
  atsResult.keywordMatch
    .matchedKeywords,
)}

Missing Keywords:
${JSON.stringify(
  atsResult.keywordMatch
    .missingKeywords,
)}

==================================================
SKILL ANALYSIS
==================================================

Skills Score:
${atsResult.skills.score}

Matched Skills:
${JSON.stringify(
  atsResult.skills
    .matchedSkills,
)}

Missing Skills:
${JSON.stringify(
  atsResult.skills
    .missingSkills,
)}

==================================================
EXPERIENCE ANALYSIS
==================================================

Experience Score:
${atsResult.experience.score}

Strengths:
${JSON.stringify(
  atsResult.experience
    .strengths,
)}

Weaknesses:
${JSON.stringify(
  atsResult.experience
    .weaknesses,
)}

==================================================
FORMATTING ANALYSIS
==================================================

Formatting Score:
${atsResult.formatting.score}

Formatting Issues:
${JSON.stringify(
  atsResult.formatting
    .issues,
)}

==================================================
RECOMMENDATIONS
==================================================

${JSON.stringify(
  atsResult.recommendations,
)}

==================================================
JOB DESCRIPTION
==================================================

${
  jobDescription.trim()
    ? jobDescription
    : "No job description provided. Optimize for general ATS compatibility."
}

==================================================
OPTIMIZATION PROCESS
==================================================

Before generating the final JSON, internally perform
the following process:

STEP 1:
Understand the complete original resume.

STEP 2:
Create an internal inventory of every factual item.

STEP 3:
Process every missing keyword individually.

STEP 4:
Process every missing skill individually.

STEP 5:
Process every ATS recommendation individually.

STEP 6:
Check the job description for relevant terminology.

STEP 7:
Only use supported keywords.

STEP 8:
Improve the professional summary.

STEP 9:
Improve weak experience statements.

STEP 10:
Improve project descriptions.

STEP 11:
Preserve all education information.

STEP 12:
Preserve all certifications.

STEP 13:
Preserve all achievements.

STEP 14:
Preserve all languages.

STEP 15:
Preserve all additional sections.

STEP 16:
Perform a final hallucination check.

==================================================
FINAL OUTPUT
==================================================

Return ONLY ONE valid JSON object.

The JSON MUST follow this exact structure:

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
FINAL INTERNAL CHECK
==================================================

Before returning the JSON verify:

- All personal information preserved.
- All experience entries preserved.
- All responsibilities preserved.
- All education entries preserved.
- All education details preserved.
- All projects preserved.
- All project technologies preserved.
- All certifications preserved.
- All achievements preserved.
- All languages preserved.
- All skills preserved.
- All additional sections preserved.
- Dates preserved.
- Companies preserved.
- Job titles preserved.
- No unsupported technology added.
- No unsupported certification added.
- No unsupported experience added.
- No fabricated metric added.
- No fabricated achievement added.
- No fabricated responsibility added.
- No keyword stuffing.
- No factual information removed.

RETURN ONLY JSON.
`;
}

/* ==========================================================
   JSON REPAIR
========================================================== */

async function repairResumeResponse(
  rawResponse: string,
  validationError: string,
  model: string,
): Promise<ResumeData | null> {
  const repairPrompt = `
You are HirePro's resume JSON repair engine.

Repair the following invalid JSON so that it
matches ResumeSchema exactly.

This is NOT a resume rewriting task.

Do NOT invent information.

Do NOT improve the resume.

Do NOT remove factual information.

Preserve the existing information.

==================================================
INVALID RESPONSE
==================================================

${rawResponse}

==================================================
VALIDATION ERROR
==================================================

${validationError}

==================================================
REQUIRED STRUCTURE
==================================================

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

Rules:

- Use empty strings instead of null.
- Use empty arrays instead of null.
- Preserve all existing factual content.
- Do not invent missing facts.
- Return only valid JSON.
`;

  try {
    const response =
      await ai.models.generateContent(
        {
          model,
          contents:
            repairPrompt,
          config: {
            temperature: 0,
            responseMimeType:
              "application/json",
          },
        },
      );

    const raw =
      response.text ?? "";

    if (!raw.trim()) {
      return null;
    }

    const cleaned =
      cleanJsonResponse(raw);

    const parsed =
      JSON.parse(cleaned);

    const normalized =
      normalizeResume(parsed);

    const validation =
      ResumeSchema.safeParse(
        normalized,
      );

    if (!validation.success) {
      console.error(
        "[ATS OPTIMIZER] Repair validation failed:",
        validation.error.flatten(),
      );

      return null;
    }

    return validation.data;
  } catch (error) {
    console.error(
      "[ATS OPTIMIZER] Repair failed:",
      error,
    );

    return null;
  }
}

/* ==========================================================
   GENERATE WITH MODEL
========================================================== */

async function generateWithModel(
  model: string,
  prompt: string,
): Promise<ResumeData> {
  let lastValidationError =
    "";

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      console.log(
        `[ATS OPTIMIZER] ${model} attempt ${attempt}`,
      );

      const response =
        await ai.models.generateContent(
          {
            model,
            contents: prompt,
            config: {
              temperature: 0.1,
              responseMimeType:
                "application/json",
            },
          },
        );

      const raw =
        response.text ?? "";

      if (!raw.trim()) {
        throw new Error(
          "AI returned an empty response.",
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
        parsed.error,
      );

      const repaired =
        await repairResumeResponse(
          raw,
          parsed.error,
          model,
        );

      if (repaired) {
        console.log(
          `[ATS OPTIMIZER] ${model} successfully repaired resume`,
        );

        return repaired;
      }
    } catch (error) {
      console.error(
        `[ATS OPTIMIZER] ${model} attempt ${attempt} failed:`,
        error,
      );

      if (
        attempt < MAX_ATTEMPTS
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1500,
            ),
        );
      }
    }
  }

  throw new Error(
    `AI returned an invalid optimized resume structure. ${
      lastValidationError
        ? `Validation error: ${lastValidationError}`
        : ""
    }`,
  );
}

/* ==========================================================
   MAIN ATS OPTIMIZER
========================================================== */

export async function optimizeResumeForATS(
  resumeText: string,
  atsResult: ATSResult,
  jobDescription: string,
  pageCount: ResumePageCount = 2,
): Promise<ResumeData> {
  if (
    !process.env.GEMINI_API_KEY
  ) {
    throw new Error(
      "GEMINI_API_KEY is not configured.",
    );
  }

  if (!resumeText.trim()) {
    throw new Error(
      "Resume text is empty.",
    );
  }

  const safePageCount: ResumePageCount =
    pageCount === 1 ||
    pageCount === 3
      ? pageCount
      : 2;

  const prompt =
    buildOptimizationPrompt(
      resumeText,
      atsResult,
      jobDescription,
      safePageCount,
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
        prompt,
      );
    } catch (error) {
      lastError = error;

      console.error(
        `[ATS OPTIMIZER] Model ${model} failed:`,
        error,
      );
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Failed to optimize resume with AI.",
  );
}