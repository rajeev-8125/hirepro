import { GoogleGenAI } from "@google/genai";

import {
  ATSResultSchema,
  type ATSResult,
} from "@/lib/ai/ats-schema";

const PRIMARY_MODEL = "gemini-3.6-flash";

const FALLBACK_MODELS = [
  "gemini-2.0-flash",
];

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
}

function getGeminiClient() {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured.",
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

function buildPrompt(
  resumeText: string,
  jobDescription: string,
): string {
  const jobSection = jobDescription
    ? `
JOB DESCRIPTION:

${jobDescription}

Use this job description to identify:
- relevant keywords
- required skills
- important qualifications
- role-specific terminology
- missing or weakly represented requirements
`
    : `
NO JOB DESCRIPTION WAS PROVIDED.

Evaluate the resume against general ATS-friendly resume practices.

Do not assume a specific job title or employer.
`;

  return `
You are HirePro's ATS Resume Analyzer.

Analyze the uploaded resume as an Applicant Tracking System
(ATS) optimization assistant.

Your job is to provide an objective, structured analysis.

IMPORTANT RULES:

1. Do not invent information.
2. Do not assume experience that is not present.
3. Do not create fictional skills.
4. Do not create fictional companies.
5. Do not create fictional job titles.
6. Do not create fictional achievements.
7. Do not create fictional metrics.
8. Do not create fictional certifications.
9. Do not treat missing information as evidence that the candidate
   does not have the skill.
10. Only evaluate what can reasonably be determined from the
    provided resume.
11. If a job description is provided, compare the resume against it.
12. If no job description is provided, perform a general ATS analysis.
13. Keep recommendations actionable and concise.
14. The overall score must be between 0 and 100.
15. Every category score must be between 0 and 100.

ATS ANALYSIS AREAS:

A. KEYWORD MATCH
Evaluate:
- job-specific keywords
- technical keywords
- relevant terminology
- keyword coverage
- missing important keywords

B. FORMATTING
Evaluate ATS readability:
- section clarity
- standard headings
- excessive formatting
- tables
- columns
- graphics
- unusual symbols
- inconsistent structure
- readability

C. EXPERIENCE
Evaluate:
- clarity of responsibilities
- relevance
- action-oriented bullets
- measurable achievements when present
- role descriptions
- career progression

D. SKILLS
Evaluate:
- technical skills
- tools
- technologies
- relevant skills
- missing skills based on the job description

E. OVERALL QUALITY
Provide a concise summary explaining the main strengths
and the most important areas to improve.

SCORING:

Overall score should reflect the combined quality of:
- keyword alignment
- formatting compatibility
- experience quality
- skills alignment

Do not artificially inflate the score.

${jobSection}

RESUME:

${resumeText}

RETURN ONLY VALID JSON.

Use exactly this structure:

{
  "overallScore": 0,
  "keywordMatch": {
    "score": 0,
    "matchedKeywords": [],
    "missingKeywords": []
  },
  "formatting": {
    "score": 0,
    "issues": []
  },
  "experience": {
    "score": 0,
    "strengths": [],
    "weaknesses": []
  },
  "skills": {
    "score": 0,
    "matchedSkills": [],
    "missingSkills": []
  },
  "summary": "",
  "recommendations": [
    {
      "priority": "high",
      "recommendation": ""
    }
  ]
}
`;
}

function extractJson(
  responseText: string,
): unknown {
  const cleaned =
    responseText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1 ||
      lastBrace <= firstBrace
    ) {
      throw new Error(
        "Gemini returned invalid JSON.",
      );
    }

    const jsonText =
      cleaned.slice(
        firstBrace,
        lastBrace + 1,
      );

    return JSON.parse(jsonText);
  }
}

function isRetryableError(
  error: unknown,
): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes("503") ||
    message.includes("429") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("resource exhausted") ||
    message.includes("rate limit")
  );
}

async function generateWithModel(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
): Promise<ATSResult> {
  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      const response =
        await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType:
              "application/json",
          },
        });

      const responseText =
        response.text;

      if (!responseText) {
        throw new Error(
          "Gemini returned an empty ATS analysis.",
        );
      }

      const parsed =
        extractJson(responseText);

      const validation =
        ATSResultSchema.safeParse(
          parsed,
        );

      if (!validation.success) {
        console.error(
          "ATS schema validation failed:",
          validation.error.flatten(),
        );

        throw new Error(
          "Gemini returned an invalid ATS analysis structure.",
        );
      }

      return validation.data;
    } catch (error) {
      lastError = error;

      if (
        !isRetryableError(error) ||
        attempt === MAX_RETRIES
      ) {
        break;
      }

      await sleep(
        RETRY_DELAY_MS *
          (attempt + 1),
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "Failed to generate ATS analysis.",
      );
}

export async function generateATSResult(
  resumeText: string,
  jobDescription = "",
): Promise<ATSResult> {
  const cleanedResume =
    resumeText.trim();

  if (!cleanedResume) {
    throw new Error(
      "Resume text is required for ATS analysis.",
    );
  }

  const ai =
    getGeminiClient();

  const prompt =
    buildPrompt(
      cleanedResume,
      jobDescription.trim(),
    );

  const models = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS,
  ];

  let lastError: unknown;

  for (const model of models) {
    try {
      return await generateWithModel(
        ai,
        model,
        prompt,
      );
    } catch (error) {
      lastError = error;

      console.error(
        `ATS analysis failed using ${model}:`,
        error,
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "ATS analysis failed.",
      );
}