import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ALLOWED_MODES = ["summary", "bullets", "project", "achievement"] as const;
type EnhanceMode = (typeof ALLOWED_MODES)[number];

function extractJson(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("AI did not return valid JSON.");
  }
  return cleaned.slice(start, end + 1);
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      mode?: EnhanceMode;
      content?: string;
      context?: string;
    };

    const mode = body.mode;
    const content = cleanString(body.content);
    const context = cleanString(body.context);

    if (!mode || !ALLOWED_MODES.includes(mode)) {
      return NextResponse.json(
        { success: false, error: "Invalid enhancement mode." },
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Add some content before using AI enhancement." },
        { status: 400 },
      );
    }

    if (content.length > 12000) {
      return NextResponse.json(
        { success: false, error: "The selected content is too long. Please shorten it first." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const modeInstruction =
      mode === "summary"
        ? `Improve the professional summary. Keep it concise, natural and recruiter-friendly. Return one paragraph.`
        : mode === "bullets"
          ? `Improve the experience bullets. Return the same number of bullets as the input. Preserve the meaning and every factual claim. Do not add metrics, technologies, responsibilities or outcomes.`
          : mode === "project"
            ? `Improve the project description. Keep it concise and technically professional. Preserve every factual claim and do not invent features, users, metrics or technologies.`
            : `Improve the achievement wording. Preserve the exact factual achievement and any numbers. Do not invent or exaggerate results.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are HirePro's professional resume writing assistant.

${modeInstruction}

STRICT FACTUAL RULES:
- Use ONLY information present in the supplied content and context.
- Never invent companies, job titles, dates, technologies, metrics, users, awards, certifications, responsibilities or results.
- Never add a keyword simply because it sounds ATS-friendly.
- Never change numbers.
- Never change the factual meaning.
- Improve grammar, clarity, action verbs, concision and professional tone.
- Do not use Markdown formatting.
- Return ONLY valid JSON.

Context:
${context || "No additional context."}

Original content:
${content}

Return exactly:
{
  "improved": "...",
  "alternatives": ["...", "..."],
  "notes": "Briefly explain what was improved without introducing new facts."
}
`.trim(),
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned an empty response.");
    }

    const parsed = JSON.parse(extractJson(text)) as Record<string, unknown>;
    const improved = cleanString(parsed.improved);
    const alternatives = cleanArray(parsed.alternatives).slice(0, 2);
    const notes = cleanString(parsed.notes);

    if (!improved) {
      throw new Error("AI did not return an improved version.");
    }

    return NextResponse.json({
      success: true,
      data: {
        improved,
        alternatives,
        notes,
      },
    });
  } catch (error) {
    console.error("[Resume Enhancement] error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to enhance this content right now.",
      },
      { status: 500 },
    );
  }
}
