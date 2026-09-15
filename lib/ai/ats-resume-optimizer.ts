import { GoogleGenAI } from "@google/genai";
import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";
import {
  ATSResultSchema,
  type ATSResult,
} from "@/lib/ai/ats-schema";

const models = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are HirePro AI Resume Optimization Engine.

Your task is to improve an existing candidate resume using an ATS analysis
and, when available, a target job description.

Your goal is to improve:
- ATS compatibility
- keyword alignment
- clarity
- professional wording
- relevance
- achievement-oriented language
- readability
- recruiter friendliness

IMPORTANT TRUTHFULNESS RULES:

1. NEVER invent experience.
2. NEVER invent employment.
3. NEVER invent companies.
4. NEVER invent job titles.
5. NEVER invent education.
6. NEVER invent certifications.
7. NEVER invent projects.
8. NEVER invent technologies.
9. NEVER invent achievements.
10. NEVER invent metrics, percentages, revenue, users, performance numbers,
    or business results.
11. NEVER change dates.
12. NEVER change contact information.
13. NEVER claim the candidate used a technology unless the original resume
    supports that technology.
14. NEVER add a missing skill merely because it appears in the job description.
15. A missing keyword may only be added when the existing resume provides
    legitimate evidence that the candidate has that skill or experience.
16. Preserve the candidate's actual career history.
17. If a recommendation cannot be safely implemented without inventing
    information, do not implement it.
18. You may improve grammar, wording, organization and clarity while preserving
    the original meaning.
19. You may naturally incorporate supported keywords into existing statements.
20. Keep the resume professional and concise.

OPTIMIZATION PRINCIPLES:

- Prioritize high-priority ATS recommendations.
- Then address medium-priority recommendations.
- Apply low-priority recommendations only when useful.
- Improve the professional summary when supported by the resume.
- Improve experience descriptions without changing facts.
- Improve project descriptions without changing facts.
- Improve skills organization.
- Preserve all genuine skills.
- Preserve all genuine projects.
- Preserve all genuine education.
- Preserve all genuine certifications.
- Preserve all genuine achievements.
- Preserve all genuine languages.
- Preserve all URLs.
- Preserve personal information exactly.

KEYWORD RULE:

If the job description contains a keyword such as:
"REST API"

you may include it only if the original resume contains evidence such as:
- REST API
- API development
- API integration
- backend API work
- a project clearly involving APIs

Do NOT add REST API merely because it appears in the job description.

OUTPUT:

Return ONLY valid JSON matching the provided ResumeSchema.

Do not return markdown.
Do not return explanations.
Do not return comments.
`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (
      start === -1 ||
      end === -1 ||
      end <= start
    ) {
      throw new Error("AI returned invalid JSON.");
    }

    return JSON.parse(
      cleaned.slice(start, end + 1)
    );
  }
}

async function optimizeWithModel(
  model: string,
  resumeText: string,
  jobDescription: string,
  atsResult: ATSResult
): Promise<ResumeData> {
  const jobSection = jobDescription.trim()
    ? `
TARGET JOB DESCRIPTION:

${jobDescription}

Use this job description to improve relevance and keyword alignment.
`
    : `
NO TARGET JOB DESCRIPTION WAS PROVIDED.

Perform general ATS-focused resume optimization.
`;

  const response = await ai.models.generateContent({
    model,

    contents: `
${SYSTEM_PROMPT}

ORIGINAL RESUME:

${resumeText}

${jobSection}

CURRENT ATS ANALYSIS:

${JSON.stringify(atsResult, null, 2)}

OPTIMIZATION TASK:

Improve the existing resume according to the ATS analysis.

Pay particular attention to:

HIGH PRIORITY RECOMMENDATIONS:
${atsResult.recommendations
  .filter((item) => item.priority === "high")
  .map((item) => `- ${item.recommendation}`)
  .join("\n") || "None"}

MEDIUM PRIORITY RECOMMENDATIONS:
${atsResult.recommendations
  .filter((item) => item.priority === "medium")
  .map((item) => `- ${item.recommendation}`)
  .join("\n") || "None"}

LOW PRIORITY RECOMMENDATIONS:
${atsResult.recommendations
  .filter((item) => item.priority === "low")
  .map((item) => `- ${item.recommendation}`)
  .join("\n") || "None"}

MISSING KEYWORDS:
${atsResult.keywordMatch.missingKeywords.join(", ") || "None"}

MISSING SKILLS:
${atsResult.skills.missingSkills.join(", ") || "None"}

FORMATTING ISSUES:
${atsResult.formatting.issues.join("\n") || "None"}

EXPERIENCE WEAKNESSES:
${atsResult.experience.weaknesses.join("\n") || "None"}

Create an optimized ResumeData object.

The optimized resume must remain truthful to the original resume.

Return the complete ResumeData JSON now.
`,

    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("AI returned an empty response.");
  }

  const json = extractJson(text);

  const validation = ResumeSchema.safeParse(json);

  if (!validation.success) {
    console.error(
      "ATS optimizer schema validation error:",
      validation.error.flatten()
    );

    throw new Error(
      "AI returned an invalid optimized resume structure."
    );
  }

  return validation.data;
}

export async function optimizeResumeForATS(
  resumeText: string,
  atsResult: ATSResult,
  jobDescription = ""
): Promise<ResumeData> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  if (!resumeText.trim()) {
    throw new Error(
      "Resume text cannot be empty."
    );
  }

  const atsValidation =
    ATSResultSchema.safeParse(atsResult);

  if (!atsValidation.success) {
    throw new Error(
      "Invalid ATS analysis provided."
    );
  }

  let lastError: unknown = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await optimizeWithModel(
          model,
          resumeText,
          jobDescription,
          atsValidation.data
        );
      } catch (error) {
        lastError = error;

        console.error(
          `ATS resume optimization failed with ${model}, attempt ${
            attempt + 1
          }:`,
          error
        );

        if (attempt < 2) {
          await sleep(
            1000 * Math.pow(2, attempt)
          );
        }
      }
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Unable to optimize resume."
  );
}