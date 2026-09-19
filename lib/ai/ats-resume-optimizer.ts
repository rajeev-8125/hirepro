import { GoogleGenAI } from "@google/genai";

import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";

import type { ATSResult } from "@/lib/ai/ats-schema";

export type ResumePageCount = 1 | 2 | 3;

const PRIMARY_MODEL = "gemini-3.6-flash";

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const MAX_MODEL_ATTEMPTS = 2;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured.",
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

function cleanJson(raw: string): string {
  let text = raw.trim();

  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (
    first !== -1 &&
    last !== -1 &&
    last > first
  ) {
    return text.slice(first, last + 1);
  }

  return text;
}

function stringValue(
  value: unknown,
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

function stringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      stringValue(item),
    )
    .filter(Boolean);
}

function objectValue(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

function normalizeResume(
  value: unknown,
): unknown {
  const root =
    objectValue(value);

  const personal =
    objectValue(root.personal);

  const skills = Array.isArray(
    root.skills,
  )
    ? root.skills
        .map((item) => {
          const obj =
            objectValue(item);

          return {
            category:
              stringValue(
                obj.category,
              ),
            items:
              stringArray(
                obj.items,
              ),
          };
        })
        .filter(
          (item) =>
            item.category ||
            item.items.length > 0,
        )
    : [];

  const experience =
    Array.isArray(
      root.experience,
    )
      ? root.experience
          .map((item) => {
            const obj =
              objectValue(item);

            return {
              company:
                stringValue(
                  obj.company,
                ),
              role:
                stringValue(
                  obj.role,
                ),
              location:
                stringValue(
                  obj.location,
                ),
              startDate:
                stringValue(
                  obj.startDate,
                ),
              endDate:
                stringValue(
                  obj.endDate,
                ),
              responsibilities:
                stringArray(
                  obj.responsibilities,
                ),
            };
          })
          .filter(
            (item) =>
              item.company ||
              item.role ||
              item.responsibilities
                .length > 0,
          )
      : [];

  const education =
    Array.isArray(
      root.education,
    )
      ? root.education
          .map((item) => {
            const obj =
              objectValue(item);

            return {
              institution:
                stringValue(
                  obj.institution,
                ),
              degree:
                stringValue(
                  obj.degree,
                ),
              field:
                stringValue(
                  obj.field,
                ),
              startDate:
                stringValue(
                  obj.startDate,
                ),
              endDate:
                stringValue(
                  obj.endDate,
                ),
              details:
                stringArray(
                  obj.details,
                ),
            };
          })
          .filter(
            (item) =>
              item.institution ||
              item.degree ||
              item.field ||
              item.details
                .length > 0,
          )
      : [];

  const projects =
    Array.isArray(
      root.projects,
    )
      ? root.projects
          .map((item) => {
            const obj =
              objectValue(item);

            return {
              name:
                stringValue(
                  obj.name,
                ),
              description:
                stringValue(
                  obj.description,
                ),
              technologies:
                stringArray(
                  obj.technologies,
                ),
              url:
                stringValue(
                  obj.url,
                ),
            };
          })
          .filter(
            (item) =>
              item.name ||
              item.description ||
              item.technologies
                .length > 0,
          )
      : [];

  const certifications =
    Array.isArray(
      root.certifications,
    )
      ? root.certifications
          .map((item) => {
            const obj =
              objectValue(item);

            return {
              name:
                stringValue(
                  obj.name,
                ),
              issuer:
                stringValue(
                  obj.issuer,
                ),
              date:
                stringValue(
                  obj.date,
                ),
              url:
                stringValue(
                  obj.url,
                ),
            };
          })
          .filter(
            (item) =>
              item.name ||
              item.issuer,
          )
      : [];

  const additionalSections =
    Array.isArray(
      root.additionalSections,
    )
      ? root.additionalSections
          .map((item) => {
            const obj =
              objectValue(item);

            return {
              title:
                stringValue(
                  obj.title,
                ),
              items:
                stringArray(
                  obj.items,
                ),
            };
          })
          .filter(
            (item) =>
              item.title ||
              item.items.length > 0,
          )
      : [];

  return {
    personal: {
      name: stringValue(
        personal.name,
      ),
      email: stringValue(
        personal.email,
      ),
      phone: stringValue(
        personal.phone,
      ),
      location: stringValue(
        personal.location,
      ),
      linkedin: stringValue(
        personal.linkedin,
      ),
      github: stringValue(
        personal.github,
      ),
      website: stringValue(
        personal.website,
      ),
    },

    professionalSummary:
      stringValue(
        root.professionalSummary,
      ),

    skills,

    experience,

    education,

    projects,

    certifications,

    achievements:
      stringArray(
        root.achievements,
      ),

    languages:
      stringArray(
        root.languages,
      ),

    additionalSections,
  };
}

function parseResume(
  raw: string,
): ResumeData {
  let parsed: unknown;

  try {
    parsed = JSON.parse(
      cleanJson(raw),
    );
  } catch (error) {
    throw new Error(
      `AI returned invalid JSON: ${
        error instanceof Error
          ? error.message
          : "unknown error"
      }`,
    );
  }

  const normalized =
    normalizeResume(parsed);

  const validation =
    ResumeSchema.safeParse(
      normalized,
    );

  if (!validation.success) {
    console.error(
      "[ATS OPTIMIZER] Invalid ResumeData:",
      validation.error.flatten(),
    );

    throw new Error(
      "AI returned an invalid resume structure.",
    );
  }

  return validation.data;
}

function pageInstructions(
  pageCount: ResumePageCount,
): string {
  if (pageCount === 1) {
    return `
TARGET: ONE PAGE

Create a very concise one-page resume.

Use:
- compact summaries
- concise bullets
- no repetitive wording
- high-value information first

Never remove factual education,
experience, projects, certifications,
skills or achievements simply to fit one page.

The PDF renderer controls physical spacing.
`;
  }

  if (pageCount === 3) {
    return `
TARGET: UP TO THREE PAGES

Preserve the candidate's complete history.

Use enough detail for:
- experience
- projects
- education
- certifications
- achievements

Do not add filler just to reach three pages.

The PDF renderer controls physical spacing.
`;
  }

  return `
TARGET: UP TO TWO PAGES

Create a balanced professional resume.

Preserve all factual information.

Use concise but meaningful bullets.

The PDF renderer controls physical spacing.
`;
}

function buildPrompt(
  resumeText: string,
  atsResult: ATSResult,
  jobDescription: string,
  pageCount: ResumePageCount,
  repairFeedback: string,
): string {
  const missingKeywords =
    atsResult.keywordMatch.missingKeywords;

  const missingSkills =
    atsResult.skills.missingSkills;

  const recommendations =
    atsResult.recommendations;

  const weaknesses =
    atsResult.experience.weaknesses;

  return `
You are HirePro's senior ATS resume optimization engine.

Your task is to transform the supplied REAL resume into a
stronger ATS-compatible resume.

The candidate's original resume is the ONLY source of truth.

============================================================
ABSOLUTE FACTUAL ACCURACY
============================================================

NEVER invent:

- jobs
- companies
- job titles
- employment dates
- education
- degrees
- universities
- certifications
- technologies
- programming languages
- frameworks
- tools
- projects
- clients
- achievements
- metrics
- percentages
- numbers
- awards
- locations
- responsibilities
- URLs

If something is not supported by the original resume,
DO NOT add it.

============================================================
DO NOT DELETE FACTUAL INFORMATION
============================================================

Preserve:

- every experience entry
- every education entry
- every project
- every certification
- every explicit skill
- every achievement
- every language
- every contact detail

You may rewrite wording, but do not erase facts.

============================================================
ATS SCORE IMPROVEMENT
============================================================

The original ATS score is:

${atsResult.overallScore}/100

The optimization must specifically improve the areas
identified by the ATS analysis.

Missing keywords:

${missingKeywords.length > 0
  ? missingKeywords.join(", ")
  : "None identified"}

Missing skills:

${missingSkills.length > 0
  ? missingSkills.join(", ")
  : "None identified"}

Experience weaknesses:

${weaknesses.length > 0
  ? weaknesses.join("\n- ")
  : "None identified"}

ATS recommendations:

${
  recommendations.length > 0
    ? recommendations
        .map(
          (item) =>
            `- [${item.priority}] ${item.recommendation}`,
        )
        .join("\n")
    : "None identified"
}

============================================================
KEYWORD RULE
============================================================

Use missing keywords ONLY when they are factually supported
by the original resume.

If a missing keyword describes a technology or skill that
the candidate clearly demonstrates elsewhere in the original
resume, integrate it naturally.

Do NOT keyword-stuff.

Do NOT create a fake skills section containing unsupported
technologies.

Prefer natural placement in:

1. professional summary
2. skills
3. experience
4. projects

============================================================
EXPERIENCE OPTIMIZATION
============================================================

Improve weak bullets using:

ACTION + TASK + TECHNOLOGY/CONTEXT + RESULT

But NEVER invent results or metrics.

Example:

Original:
"Worked on Python API development."

Improved:
"Developed Python APIs for application functionality."

Do NOT write:

"Improved API performance by 40%."

unless 40% actually exists in the original resume.

============================================================
SUMMARY
============================================================

Write a concise ATS-friendly professional summary.

The summary must be based ONLY on facts present in the
original resume.

Do not introduce unsupported job titles or skills.

============================================================
SKILLS
============================================================

Preserve every supported skill.

Group them clearly.

Example:

Programming:
Python, Java, JavaScript

Web:
HTML, CSS, React

Database:
SQL, MySQL

Do not add technologies merely because they appear in
the job description.

============================================================
PROJECTS
============================================================

Preserve every original project.

Improve descriptions using only facts already present.

Preserve technologies.

============================================================
EDUCATION
============================================================

THIS IS MANDATORY.

Every education record in the source must remain.

Do not delete education to save space.

============================================================
CERTIFICATIONS
============================================================

Preserve every original certification.

Do not create certifications.

============================================================
FORMATTING STRATEGY
============================================================

The resulting structure should be:

CONTACT
PROFESSIONAL SUMMARY
SKILLS
EXPERIENCE
PROJECTS
EDUCATION
CERTIFICATIONS
ACHIEVEMENTS
LANGUAGES
ADDITIONAL SECTIONS

Use conventional section names.

Avoid:
- tables
- columns
- graphics
- decorative symbols
- progress bars
- skill percentages
- unnecessary icons

============================================================
${pageInstructions(pageCount)}
============================================================

============================================================
PREVIOUS VERIFICATION FEEDBACK
============================================================

${repairFeedback || "This is the first optimization attempt."}

If previous verification produced a lower score,
specifically fix the weaknesses mentioned in that feedback.

============================================================
JOB DESCRIPTION
============================================================

${
  jobDescription
    ? jobDescription
    : "No job description was supplied. Optimize for general ATS compatibility."
}

============================================================
ORIGINAL RESUME
============================================================

${resumeText}

============================================================
OUTPUT
============================================================

Return ONLY JSON.

The JSON must exactly represent:

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

Return ONLY the JSON object.
`;
}

async function callModel(
  model: string,
  prompt: string,
): Promise<ResumeData> {
  const ai = getAI();

  let lastError: unknown;

  for (
    let attempt = 0;
    attempt < MAX_MODEL_ATTEMPTS;
    attempt++
  ) {
    try {
      const response =
        await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType:
              "application/json",
            maxOutputTokens: 12000,
          },
        });

      const text =
        response.text;

      if (!text) {
        throw new Error(
          "Gemini returned an empty optimization response.",
        );
      }

      return parseResume(text);
    } catch (error) {
      lastError = error;

      const message =
        error instanceof Error
          ? error.message.toLowerCase()
          : String(error).toLowerCase();

      const retryable =
        message.includes("429") ||
        message.includes("503") ||
        message.includes("unavailable") ||
        message.includes("overloaded") ||
        message.includes(
          "resource exhausted",
        );

      if (!retryable) {
        break;
      }

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1500 *
              (attempt + 1),
          ),
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "Resume optimization failed.",
      );
}

export async function optimizeResumeForATS(
  resumeText: string,
  atsResult: ATSResult,
  jobDescription = "",
  pageCount: ResumePageCount = 2,
  repairFeedback = "",
): Promise<ResumeData> {
  if (!resumeText.trim()) {
    throw new Error(
      "Resume text is required.",
    );
  }

  const prompt =
    buildPrompt(
      resumeText,
      atsResult,
      jobDescription.trim(),
      pageCount,
      repairFeedback,
    );

  let lastError: unknown;

  const models = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS,
  ];

  for (const model of models) {
    try {
      return await callModel(
        model,
        prompt,
      );
    } catch (error) {
      lastError = error;

      console.error(
        `[ATS OPTIMIZER] ${model} failed:`,
        error,
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "Unable to optimize resume.",
      );
}