import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResume } from "@/lib/ai/resume-generator";
import { ResumeSchema, type ResumeData } from "@/lib/ai/resume-schema";
import { ResumeDesignSchema } from "@/lib/ai/resume-design-schema";
import { getAiTemplate, getTemplateDesign } from "@/lib/resume/template-library";
import { getDefaultCustomDesign, mergeDesign } from "@/lib/resume/design-utils";
import type { ResumeTemplateId } from "@/lib/resume/template-types";

export const runtime = "nodejs";

const TEMPLATE_IDS: ResumeTemplateId[] = [
  "blue-01",
  "blue-02",
  "blue-03",
  "blue-04",
  "student",
  "infographic-01",
  "infographic-02",
];

function isTemplateId(value: unknown): value is ResumeTemplateId {
  return typeof value === "string" && TEMPLATE_IDS.includes(value as ResumeTemplateId);
}

function safeName(value: string) {
  return (
    value.trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "Resume"
  );
}

function htmlToText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error || !user ? null : user };
}

async function fetchPublicLinkedIn(url: string) {
  const parsed = new URL(url);
  if (!(parsed.hostname === "linkedin.com" || parsed.hostname.endsWith(".linkedin.com"))) {
    throw new Error("Please provide a valid LinkedIn profile URL.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn returned HTTP ${response.status}.`);
    }

    const text = htmlToText(await response.text());
    if (text.length < 100) {
      throw new Error("LinkedIn profile did not contain enough readable information.");
    }

    return text.slice(0, 50000);
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      linkedinUrl?: string;
      profileText?: string;
      templateId?: string;
    };

    const linkedinUrl = body.linkedinUrl?.trim() ?? "";
    let sourceText = body.profileText?.trim() ?? "";
    let source = "profile_text";

    if (!sourceText && !linkedinUrl) {
      return NextResponse.json(
        { success: false, error: "Enter a LinkedIn profile URL or paste your LinkedIn profile text." },
        { status: 400 },
      );
    }

    if (!sourceText && linkedinUrl) {
      try {
        sourceText = await fetchPublicLinkedIn(linkedinUrl);
        source = "linkedin_url";
      } catch (error) {
        console.warn("[LinkedIn] public profile fetch failed:", error);
        return NextResponse.json(
          {
            success: false,
            error: "LinkedIn blocked automated profile access. Please paste your LinkedIn profile information into the text box and import again.",
          },
          { status: 422 },
        );
      }
    }

    if (sourceText.length < 20) {
      return NextResponse.json(
        { success: false, error: "Not enough LinkedIn information was provided." },
        { status: 400 },
      );
    }

    const templateId: ResumeTemplateId = isTemplateId(body.templateId)
      ? body.templateId
      : "blue-02";

    const resumeRaw = await generateResume(
      sourceText,
      `
You are HirePro's LinkedIn information importer.

Convert the supplied LinkedIn profile information into HirePro's existing ResumeData schema.

Rules:
- Extract facts from the supplied information.
- Never invent employers, dates, degrees, certifications, technologies, achievements, metrics or responsibilities.
- Improve grammar and structure only when the supplied information supports it.
- Preserve name, contact information, links, summary/about, experience, education, projects, certifications, skills, achievements and languages.
- Missing information must remain empty.
- Do not generate visual design instructions.
- Do not change the selected template.
- Return only data compatible with ResumeData.

Selected HirePro template: ${templateId}

LinkedIn information:
${sourceText}
      `.trim(),
    );

    const result = ResumeSchema.safeParse(resumeRaw);
    if (!result.success) {
      console.error("[LinkedIn] validation:", result.error.flatten());
      return NextResponse.json(
        { success: false, error: "LinkedIn information could not be converted into a valid resume." },
        { status: 502 },
      );
    }

    const resume: ResumeData = result.data;
    if (linkedinUrl && !resume.personal.linkedin) {
      resume.personal.linkedin = linkedinUrl;
    }

    const baseDesign = getTemplateDesign(templateId);
    const finalDesign = ResumeDesignSchema.parse(
      mergeDesign(baseDesign, {
        ...getDefaultCustomDesign(templateId),
        templateId,
      }),
    );

    const title = resume.personal.name?.trim()
      ? `${safeName(resume.personal.name)} Resume`
      : "My Resume";
    const aiTemplate = getAiTemplate(templateId);

    const { data: saved, error: saveError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
        source_type: "linkedin_import",
        resume_data: resume,
        design_config: finalDesign,
        template: aiTemplate,
        is_primary: true,
      })
      .select("id,title,template,updated_at")
      .single();

    if (saveError || !saved) {
      console.error("[LinkedIn] save:", saveError);
      return NextResponse.json(
        { success: false, error: saveError?.message || "Failed to save the imported resume." },
        { status: 500 },
      );
    }

    await supabase.from("resume_versions").insert({
      resume_id: saved.id,
      version_number: 1,
      version_name: "LinkedIn Import",
      resume_data: resume,
      design_config: finalDesign,
      template: aiTemplate,
    });

    return NextResponse.json({
      success: true,
      source,
      resume,
      design: finalDesign,
      resumeId: saved.id,
      template: templateId,
      aiTemplate,
      updatedAt: saved.updated_at,
      saved: true,
    });
  } catch (error) {
    console.error("[LinkedIn] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "LinkedIn import failed.",
      },
      { status: 500 },
    );
  }
}
