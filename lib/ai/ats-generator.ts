import { GoogleGenAI } from "@google/genai";
import {
  ATSResult,
  ATSResultSchema,
} from "./ats-schema";

const PRIMARY_MODEL =
  "gemini-3.6-flash";

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const MAX_ATTEMPTS = 3;

function getAI() {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

/* ==========================================================
   CLEAN GEMINI JSON
========================================================== */

function cleanJsonResponse(
  text: string
): string {
  let cleaned =
    text.trim();

  // Remove markdown code fences.
  cleaned =
    cleaned.replace(
      /^```json\s*/i,
      ""
    );

  cleaned =
    cleaned.replace(
      /^```\s*/i,
      ""
    );

  cleaned =
    cleaned.replace(
      /\s*```$/i,
      ""
    );

  cleaned =
    cleaned.trim();

  /*
   * Gemini can occasionally return additional
   * explanation before/after the JSON.
   *
   * Extract the outermost JSON object.
   */

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned =
      cleaned.slice(
        firstBrace,
        lastBrace + 1
      );
  }

  return cleaned.trim();
}

/* ==========================================================
   VALIDATE ATS RESULT
========================================================== */

function parseATSResult(
  text: string
): ATSResult {
  const cleaned =
    cleanJsonResponse(text);

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "[ATS] Gemini returned invalid JSON:",
      cleaned
    );

    throw new Error(
      "AI returned invalid JSON for the ATS analysis."
    );
  }

  const validation =
    ATSResultSchema.safeParse(
      parsed
    );

  if (
    !validation.success
  ) {
    console.error(
      "[ATS] Gemini returned invalid ATS structure:",
      validation.error.flatten()
    );

    console.error(
      "[ATS] Raw Gemini output:",
      cleaned
    );

    throw new Error(
      "AI returned an invalid ATS structure."
    );
  }

  return validation.data;
}

/* ==========================================================
   SYSTEM INSTRUCTIONS
========================================================== */

const SYSTEM_INSTRUCTIONS = `
You are an expert Applicant Tracking System (ATS) resume analyzer.

Your job is to analyze a candidate's resume against an optional job description.

You MUST follow these rules:

1. Analyze ONLY the information actually present in the resume.
2. Never invent candidate experience.
3. Never invent skills.
4. Never invent companies.
5. Never invent job titles.
6. Never invent education.
7. Never invent certifications.
8. Never invent achievements.
9. Never claim that a candidate has a skill that is not supported by the resume.
10. Missing keywords may be identified from the job description, but they must be clearly treated as missing from the resume.
11. Recommendations must be actionable and based on the analysis.
12. Do not rewrite the resume.
13. Do not create fictional information.
14. Do not use markdown.
15. Return ONLY one valid JSON object.
16. Do not surround the JSON with markdown code fences.
17. Do not add explanations before or after the JSON.

The JSON MUST follow this exact structure:

{
  "overallScore": number,
  "summary": string,
  "keywordMatch": {
    "score": number,
    "matchedKeywords": string[],
    "missingKeywords": string[]
  },
  "formatting": {
    "score": number,
    "issues": string[]
  },
  "experience": {
    "score": number,
    "strengths": string[],
    "weaknesses": string[]
  },
  "skills": {
    "score": number,
    "matchedSkills": string[],
    "missingSkills": string[]
  },
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "recommendation": string
    }
  ]
}

Additional rules:

- overallScore must be between 0 and 100.
- keywordMatch.score must be between 0 and 100.
- formatting.score must be between 0 and 100.
- experience.score must be between 0 and 100.
- skills.score must be between 0 and 100.
- All scores must be numbers, not strings.
- All arrays must contain strings.
- recommendations must contain objects.
- Every recommendation priority must be exactly "high", "medium", or "low".
- Do not use null.
- Do not omit required fields.
- Do not add unknown fields.
`;

/* ==========================================================
   BUILD PROMPT
========================================================== */

function buildPrompt(
  resumeText: string,
  jobDescription: string
) {
  return `
${SYSTEM_INSTRUCTIONS}

==================================================
RESUME
==================================================

${resumeText}

==================================================
JOB DESCRIPTION
==================================================

${
  jobDescription.trim()
    ? jobDescription
    : "No job description was provided. Perform a general ATS analysis."
}

==================================================
ANALYSIS INSTRUCTIONS
==================================================

Analyze the resume carefully.

OVERALL SCORE:

Calculate a realistic ATS compatibility score from 0 to 100.

KEYWORD MATCH:

If a job description is provided:
- identify important keywords present in both
- identify important job-description keywords missing from the resume

If there is no job description:
- evaluate important professional keywords present in the resume
- identify areas where relevant keywords could be clearer

FORMATTING:

Look for ATS-related issues such as:
- unusual formatting
- excessive symbols
- columns
- tables
- graphics
- unclear section headings
- inconsistent structure
- poor readability
- missing standard sections

Do NOT claim formatting problems that cannot reasonably be inferred from the extracted text.

EXPERIENCE:

Evaluate:
- clarity of roles
- responsibility descriptions
- measurable achievements when actually present
- relevance to the job description when provided
- strength and clarity of experience descriptions

Do not invent achievements.

SKILLS:

Compare the skills actually present in the resume with relevant job requirements.

Do not add skills to the matched list unless they are actually present in the resume.

RECOMMENDATIONS:

Provide practical recommendations.

Recommendations can suggest:
- improving wording
- making existing experience more measurable
- adding keywords that genuinely match the candidate's existing experience
- improving section structure
- correcting formatting
- clarifying existing skills

Never tell the candidate to claim a skill or experience they do not have.

==================================================
FINAL RESPONSE
==================================================

Return ONLY the JSON object.

No markdown.
No code fences.
No commentary.
No explanation.
`;
}

/* ==========================================================
   REPAIR MALFORMED RESPONSE
========================================================== */

async function repairATSResponse(
  ai: GoogleGenAI,
  malformedOutput: string
): Promise<ATSResult> {
  const repairPrompt = `
You are repairing an invalid ATS analysis JSON response.

Return ONLY valid JSON.

The required structure is:

{
  "overallScore": number,
  "summary": string,
  "keywordMatch": {
    "score": number,
    "matchedKeywords": string[],
    "missingKeywords": string[]
  },
  "formatting": {
    "score": number,
    "issues": string[]
  },
  "experience": {
    "score": number,
    "strengths": string[],
    "weaknesses": string[]
  },
  "skills": {
    "score": number,
    "matchedSkills": string[],
    "missingSkills": string[]
  },
  "recommendations": [
    {
      "priority": "high",
      "recommendation": string
    }
  ]
}

Important:

- Preserve the meaning of the original response.
- Do not invent candidate information.
- Do not add skills.
- Do not add experience.
- Do not add achievements.
- Convert numeric strings into numbers.
- Convert missing arrays into [].
- Convert missing strings into reasonable empty strings.
- Every recommendation priority MUST be one of:
  "high", "medium", "low".
- Scores MUST be numbers from 0 to 100.
- Return ONLY JSON.

INVALID RESPONSE:

${malformedOutput}
`;

  const response =
    await ai.models.generateContent(
      {
        model:
          PRIMARY_MODEL,

        contents:
          repairPrompt,

        config: {
          temperature: 0,
          responseMimeType:
            "application/json",
        },
      }
    );

  const output =
    response.text ?? "";

  return parseATSResult(
    output
  );
}

/* ==========================================================
   GENERATE ATS RESULT
========================================================== */

export async function generateATSResult(
  resumeText: string,
  jobDescription = ""
): Promise<ATSResult> {
  if (
    !resumeText ||
    !resumeText.trim()
  ) {
    throw new Error(
      "Resume text is empty."
    );
  }

  const ai =
    getAI();

  const prompt =
    buildPrompt(
      resumeText,
      jobDescription
    );

  const models = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS,
  ];

  let lastError:
    | unknown
    | null = null;

  /*
   * Try the primary model and fallbacks.
   */

  for (
    let modelIndex = 0;
    modelIndex <
    models.length;
    modelIndex++
  ) {
    const model =
      models[modelIndex];

    for (
      let attempt = 1;
      attempt <= MAX_ATTEMPTS;
      attempt++
    ) {
      try {
        console.log(
          `[ATS] Generating analysis with ${model}, attempt ${attempt}/${MAX_ATTEMPTS}`
        );

        const response =
          await ai.models.generateContent(
            {
              model,

              contents:
                prompt,

              config: {
                temperature: 0,

                responseMimeType:
                  "application/json",
              },
            }
          );

        const output =
          response.text ?? "";

        if (
          !output.trim()
        ) {
          throw new Error(
            "AI returned an empty ATS response."
          );
        }

        try {
          const result =
            parseATSResult(
              output
            );

          console.log(
            `[ATS] Valid ATS result generated with ${model}`
          );

          return result;
        } catch (validationError) {
          /*
           * The model returned something, but it didn't
           * exactly match the schema.
           *
           * Give Gemini one opportunity to repair its own
           * response.
           */

          console.warn(
            `[ATS] Invalid structure from ${model}. Attempting JSON repair.`
          );

          try {
            const repaired =
              await repairATSResponse(
                ai,
                cleanJsonResponse(
                  output
                )
              );

            console.log(
              `[ATS] Successfully repaired ATS response.`
            );

            return repaired;
          } catch (repairError) {
            console.error(
              "[ATS] Repair failed:",
              repairError
            );

            throw validationError;
          }
        }
      } catch (error) {
        lastError =
          error;

        console.error(
          `[ATS] ${model} attempt ${attempt} failed:`,
          error
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error);

        /*
         * Don't keep retrying obvious configuration
         * problems.
         */

        if (
          errorMessage.includes(
            "GEMINI_API_KEY"
          )
        ) {
          throw error;
        }

        /*
         * Small delay between retries.
         */

        if (
          attempt <
          MAX_ATTEMPTS
        ) {
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                1500 *
                  attempt
              )
          );
        }
      }
    }

    console.warn(
      `[ATS] Moving from model ${model} to next fallback model.`
    );
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Failed to generate a valid ATS analysis."
  );
}