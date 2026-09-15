import { GoogleGenAI } from "@google/genai";
import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";

const MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const SYSTEM_PROMPT = `
You are an expert professional resume writer and ATS optimization assistant.

Your task is to convert the user's information into a professional,
truthful, ATS-friendly resume.

The user will also provide design and presentation preferences.

IMPORTANT:

The design instructions control PRESENTATION only.

They must NEVER cause you to invent facts.

STRICT FACTUAL RULES:

1. NEVER invent information.
2. NEVER invent companies.
3. NEVER invent job titles.
4. NEVER invent degrees.
5. NEVER invent certifications.
6. NEVER invent projects.
7. NEVER invent dates.
8. NEVER invent technologies.
9. NEVER invent achievements.
10. NEVER invent contact information.
11. NEVER invent URLs.
12. Only use facts supplied by the user.
13. You may improve grammar and professional wording.
14. You may reorganize information for better presentation.
15. You may create a professional summary using only supplied facts.
16. If information is unavailable, use an empty string or empty array.
17. Do not use Markdown.
18. Return ONLY valid JSON.
19. Do not wrap JSON in code fences.

DESIGN RULES:

The user's design instructions should influence the generated resume's
content organization and presentation-friendly structure.

Examples of valid user preferences:

- modern
- clean
- professional
- minimalist
- corporate
- technical
- developer-focused
- executive
- creative
- dark blue
- simple
- compact
- skills-focused
- project-focused
- experience-focused
- ATS-friendly
- recruiter-friendly

Do NOT create unsupported visual information inside the resume data.

The actual visual template will be handled separately by the application.

JSON STRUCTURE:

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
  "additionalSections": []
}
`;

function extractJson(text: string): string {
  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace === -1 ||
    lastBrace === -1
  ) {
    throw new Error(
      "AI did not return valid JSON."
    );
  }

  return cleaned.slice(
    firstBrace,
    lastBrace + 1
  );
}

function asString(value: unknown): string {
  if (typeof value === "string") {
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

function asStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (
        item &&
        typeof item === "object" &&
        "text" in item
      ) {
        return asString(
          (item as {
            text?: unknown;
          }).text
        ).trim();
      }

      return asString(item).trim();
    })
    .filter(Boolean);
}

function normalizeResume(
  raw: any
): ResumeData {
  const personal =
    raw?.personal ?? {};

  const skills = Array.isArray(
    raw?.skills
  )
    ? raw.skills.map((skill: any) => {
        if (
          typeof skill === "string"
        ) {
          return {
            category: "Skills",
            items: asStringArray(
              skill.split(",")
            ),
          };
        }

        return {
          category: asString(
            skill?.category
          ),
          items: asStringArray(
            skill?.items
          ),
        };
      })
    : [];

  const experience =
    Array.isArray(raw?.experience)
      ? raw.experience.map(
          (item: any) => ({
            company: asString(
              item?.company
            ),
            role: asString(
              item?.role
            ),
            location: asString(
              item?.location
            ),
            startDate: asString(
              item?.startDate
            ),
            endDate: asString(
              item?.endDate
            ),
            responsibilities:
              asStringArray(
                item?.responsibilities
              ),
          })
        )
      : [];

  const education =
    Array.isArray(raw?.education)
      ? raw.education.map(
          (item: any) => ({
            institution:
              asString(
                item?.institution
              ),
            degree: asString(
              item?.degree
            ),
            field: asString(
              item?.field
            ),
            startDate: asString(
              item?.startDate
            ),
            endDate: asString(
              item?.endDate
            ),
            details:
              asStringArray(
                item?.details
              ),
          })
        )
      : [];

  const projects =
    Array.isArray(raw?.projects)
      ? raw.projects.map(
          (item: any) => ({
            name: asString(
              item?.name
            ),
            description:
              asString(
                item?.description
              ),
            technologies:
              asStringArray(
                item?.technologies
              ),
            url: asString(
              item?.url
            ),
          })
        )
      : [];

  const certifications =
    Array.isArray(
      raw?.certifications
    )
      ? raw.certifications.map(
          (item: any) => ({
            name: asString(
              item?.name
            ),
            issuer: asString(
              item?.issuer
            ),
            date: asString(
              item?.date
            ),
            url: asString(
              item?.url
            ),
          })
        )
      : [];

  const additionalSections =
    Array.isArray(
      raw?.additionalSections
    )
      ? raw.additionalSections.map(
          (item: any) => ({
            title: asString(
              item?.title
            ),
            items:
              asStringArray(
                item?.items
              ),
          })
        )
      : [];

  return {
    personal: {
      name: asString(
        personal?.name
      ),
      email: asString(
        personal?.email
      ),
      phone: asString(
        personal?.phone
      ),
      location: asString(
        personal?.location
      ),
      linkedin: asString(
        personal?.linkedin
      ),
      github: asString(
        personal?.github
      ),
      website: asString(
        personal?.website
      ),
    },

    professionalSummary:
      asString(
        raw?.professionalSummary
      ),

    skills,

    experience,

    education,

    projects,

    certifications,

    achievements:
      asStringArray(
        raw?.achievements
      ),

    languages:
      asStringArray(
        raw?.languages
      ),

    additionalSections,
  };
}

async function generateWithModel(
  model: string,
  userInformation: string,
  designInstructions: string
): Promise<ResumeData> {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing."
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const prompt = `
${SYSTEM_PROMPT}

========================================
USER INFORMATION
========================================

${userInformation}

========================================
USER'S RESUME DESIGN PREFERENCES
========================================

${designInstructions}

========================================
FINAL INSTRUCTION
========================================

Generate the resume using ONLY the factual information
provided by the user.

Use the design preferences to determine how the information
should be professionally organized and prioritized.

Do not invent anything.

Return ONLY the JSON object.
`;

  const response =
    await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType:
          "application/json",
        temperature: 0.2,
      },
    });

  const text = response.text;

  if (!text) {
    throw new Error(
      "AI returned an empty response."
    );
  }

  const jsonText =
    extractJson(text);

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(jsonText);
  } catch {
    throw new Error(
      "AI returned malformed JSON."
    );
  }

  const normalized =
    normalizeResume(parsed);

  const validation =
    ResumeSchema.safeParse(
      normalized
    );

  if (!validation.success) {
    console.error(
      "Resume validation error:",
      validation.error.flatten()
    );

    throw new Error(
      "AI returned an invalid resume structure."
    );
  }

  return validation.data;
}

export async function generateResume(
  userInformation: string,
  designInstructions: string = ""
): Promise<ResumeData> {
  if (!userInformation.trim()) {
    throw new Error(
      "Resume information is empty."
    );
  }

  const instructions =
    designInstructions.trim() ||
    "Create a clean, professional, modern and ATS-friendly resume.";

  let lastError: unknown =
    null;

  for (const model of MODELS) {
    for (
      let attempt = 1;
      attempt <= 3;
      attempt++
    ) {
      try {
        return await generateWithModel(
          model,
          userInformation,
          instructions
        );
      } catch (error) {
        lastError = error;

        console.error(
          `Resume generation failed using ${model}, attempt ${attempt}:`,
          error
        );

        if (attempt < 3) {
          await sleep(
            1000 *
              Math.pow(
                2,
                attempt - 1
              )
          );
        }
      }
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Unable to generate resume."
  );
}