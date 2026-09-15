import { GoogleGenAI } from "@google/genai";
import {
  ResumeDesignSchema,
  type ResumeDesign,
} from "@/lib/ai/resume-design-schema";

const MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function extractJson(text: string): string {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("AI did not return valid JSON.");
  }

  return cleaned.slice(start, end + 1);
}

const SYSTEM_PROMPT = `
You are HirePro's AI Resume Design Engine.

Your job is to convert a user's resume design description
into a professional, practical and ATS-friendly resume design.

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Follow the provided schema exactly.
3. Never invent fields outside the schema.
4. Never use invalid enum values.
5. The design must remain professional and usable.
6. ATS compatibility is extremely important.
7. Avoid excessive graphics.
8. Avoid complicated tables.
9. Avoid decorative elements that can interfere with ATS parsing.
10. Never reduce readability for visual appearance.
11. Use colors with strong text/background contrast.
12. Prefer standard web-safe or commonly available fonts.
13. A photo is optional.
14. If the user asks for a photo and the selected template supports it,
    enable the photo.
15. ATS resumes should normally use single-column layouts.
16. Two-column layouts may be used for modern/professional resumes,
    but the design must remain readable.
17. Do not create unrealistic or flashy designs unless explicitly requested.
18. Preserve professional resume conventions.
19. Keep the number of sections practical.
20. Do not remove important resume sections just for design purposes.

ATS DESIGN PRINCIPLES:

- readable typography
- clear section headings
- consistent spacing
- strong hierarchy
- minimal decoration
- no unnecessary icons
- no text embedded in images
- no complex visual charts
- no excessive colors
- no unusual fonts
- no distracting backgrounds

COLOR RULES:

- Use valid CSS color values.
- Prefer hex colors.
- Keep body text dark enough to read.
- Keep backgrounds light unless the user explicitly requests otherwise.
- Primary and secondary colors should work together professionally.

PHOTO RULES:

- ATS template: photo should normally be disabled.
- Professional/Modern/Executive templates may use a photo.
- Photo must never interfere with the resume text.
- Use circle, square or rounded shapes only.

SECTION RULES:

Possible sections:

summary
skills
experience
education
projects
certifications
achievements
languages

Prioritize sections based on the user's requested style
and typical professional resume conventions.

DEFAULT DESIGN:

If the user provides little or no design information,
create a clean professional ATS-friendly design.

DEFAULT COLORS:

primary: #1E3A8A
secondary: #2563EB
text: #0F172A
mutedText: #64748B
background: #FFFFFF
border: #E2E8F0
`;

async function generateWithModel(
  model: string,
  designDescription: string
): Promise<ResumeDesign> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const prompt = `
USER'S RESUME DESIGN DESCRIPTION:

${designDescription || "Create a clean, professional and ATS-friendly resume."}

Convert this description into the required ResumeDesign JSON schema.

Remember:
- Return ONLY JSON.
- Do not include markdown.
- Do not include explanations.
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("AI returned an empty design response.");
  }

  const jsonText = extractJson(text);
  const parsed = JSON.parse(jsonText);

  return ResumeDesignSchema.parse(parsed);
}

export async function generateResumeDesign(
  designDescription: string
): Promise<ResumeDesign> {
  const cleanDescription =
    designDescription?.trim() ||
    "Create a clean, professional and ATS-friendly resume.";

  let lastError: unknown = null;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await generateWithModel(
          model,
          cleanDescription
        );
      } catch (error) {
        lastError = error;

        console.error(
          `Resume design generation failed: ${model}, attempt ${attempt}`,
          error
        );

        if (attempt < 3) {
          await sleep(1000 * attempt);
        }
      }
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Unable to generate resume design."
  );
}