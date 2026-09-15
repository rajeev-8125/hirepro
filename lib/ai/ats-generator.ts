import { GoogleGenAI } from "@google/genai";
import { ATSResultSchema, type ATSResult } from "@/lib/ai/ats-schema";

const models = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are HirePro AI ATS Resume Analyzer.

Your job is to analyze a candidate resume and provide an accurate ATS
compatibility analysis.

IMPORTANT RULES:

1. Analyze only the information actually present in the resume.
2. NEVER invent candidate experience, skills, education, certifications,
   companies, technologies, achievements, or results.
3. If a job description is provided, compare the resume against that
   specific job description.
4. If no job description is provided, perform a general ATS analysis.
5. Do not claim a keyword is present if it is not present.
6. Missing keywords must genuinely be missing from the resume.
7. Formatting analysis should consider ATS readability.
8. Give practical recommendations.
9. Keep recommendations specific and useful.
10. Do not exaggerate the candidate's qualifications.
11. Overall score must be between 0 and 100.
12. Every individual score must be between 0 and 100.

SCORING:

overallScore:
Overall ATS compatibility score.

keywordMatch.score:
How well the resume matches the supplied job description.
If no job description exists, evaluate general keyword quality.

formatting.score:
Evaluate ATS-friendly formatting, structure, readability and consistency.

experience.score:
Evaluate relevance, clarity, structure and strength of the experience.

skills.score:
Evaluate how clearly and effectively relevant skills are represented.

KEYWORDS:

matchedKeywords:
Only keywords genuinely present in the resume.

missingKeywords:
Only keywords that would improve the resume based on the job description
or, when no job description exists, commonly expected relevant keywords
that are genuinely absent.

RECOMMENDATIONS:

Use:
- high
- medium
- low

Recommendations must be actionable.

OUTPUT:

Return ONLY valid JSON matching the provided schema.

Do not return markdown.
Do not return explanations outside JSON.
`;

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
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
      throw new Error(
        "AI returned invalid JSON."
      );
    }

    return JSON.parse(
      cleaned.slice(start, end + 1)
    );
  }
}

async function generateWithModel(
  model: string,
  resumeText: string,
  jobDescription: string
): Promise<ATSResult> {
  const jobSection = jobDescription.trim()
    ? `
JOB DESCRIPTION:

${jobDescription}

Analyze the resume specifically against this job description.
`
    : `
NO JOB DESCRIPTION WAS PROVIDED.

Perform a general ATS resume analysis.
`;

  const response =
    await ai.models.generateContent({
      model,

      contents: `
${SYSTEM_PROMPT}

RESUME:

${resumeText}

${jobSection}

Generate the complete ATS analysis JSON now.
`,

      config: {
        temperature: 0.2,
        responseMimeType:
          "application/json",
      },
    });

  const text = response.text;

  if (!text) {
    throw new Error(
      "AI returned an empty response."
    );
  }

  const json = extractJson(text);

  const validation =
    ATSResultSchema.safeParse(json);

  if (!validation.success) {
    console.error(
      "ATS schema validation error:",
      validation.error.flatten()
    );

    throw new Error(
      "AI returned an invalid ATS structure."
    );
  }

  return validation.data;
}

export async function generateATSResult(
  resumeText: string,
  jobDescription = ""
): Promise<ATSResult> {
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

  let lastError: unknown = null;

  for (const model of models) {
    for (
      let attempt = 0;
      attempt < 3;
      attempt++
    ) {
      try {
        return await generateWithModel(
          model,
          resumeText,
          jobDescription
        );
      } catch (error) {
        lastError = error;

        console.error(
          `ATS generation failed with ${model}, attempt ${
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
      : "Unable to generate ATS analysis."
  );
}