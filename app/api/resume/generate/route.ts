import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResume } from "@/lib/ai/resume-generator";
import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";
import {
  ResumeDesignSchema,
  type ResumeDesign,
} from "@/lib/ai/resume-design-schema";
import {
  getAiTemplate,
  getTemplateDefinition,
  getTemplateDesign,
} from "@/lib/resume/template-library";
import {
  getDefaultCustomDesign,
  mergeDesign,
} from "@/lib/resume/design-utils";
import type { ResumeTemplateId } from "@/lib/resume/template-types";

export const runtime = "nodejs";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

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

function decodeDataUrl(value: string) {
  const comma = value.indexOf(",");
  return Buffer.from(
    comma >= 0 ? value.slice(comma + 1) : value,
    "base64",
  );
}

function extensionFor(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function safeName(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "Resume"
  );
}

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

/* ============================================================
   GET — LOAD LATEST SAVED RESUME
   ============================================================ */

export async function GET(request: Request) {
  try {
    const { supabase, user } = await getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in.",
        },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const requestedResumeId = url.searchParams.get("id");

    let resumeQuery = supabase
      .from("resumes")
      .select(
        "id,title,resume_data,design_config,template,profile_image_path,updated_at",
      )
      .eq("user_id", user.id);

    if (requestedResumeId) {
      resumeQuery = resumeQuery.eq("id", requestedResumeId);
    } else {
      resumeQuery = resumeQuery
        .order("updated_at", { ascending: false })
        .limit(1);
    }

    const { data: record, error } =
      await resumeQuery.maybeSingle();

    if (error) {
      console.error("[Resume] latest query:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to load your saved resume.",
        },
        { status: 500 },
      );
    }

    if (!record) {
      return NextResponse.json({
        success: true,
        resume: null,
        design: null,
        template: null,
        profileImageUrl: null,
        resumeId: null,
        updatedAt: null,
      });
    }

    const resumeResult = ResumeSchema.safeParse(record.resume_data);
    const designResult = ResumeDesignSchema.safeParse(record.design_config);

    if (!resumeResult.success || !designResult.success) {
      console.error("[Resume] saved data validation failed", {
        resume: resumeResult.success
          ? null
          : resumeResult.error.flatten(),
        design: designResult.success
          ? null
          : designResult.error.flatten(),
      });

      return NextResponse.json(
        {
          success: false,
          error: "Your saved resume data is invalid.",
        },
        { status: 500 },
      );
    }

    let profileImageUrl: string | null = null;

    if (record.profile_image_path) {
      const { data } = await supabase.storage
        .from("profile-images")
        .createSignedUrl(record.profile_image_path, 60 * 60);

      profileImageUrl = data?.signedUrl ?? null;
    }

    const savedDesign = designResult.data;
    const designTemplateId =
      typeof savedDesign.custom?.templateId === "string" &&
      isTemplateId(savedDesign.custom.templateId)
        ? savedDesign.custom.templateId
        : null;

    return NextResponse.json({
      success: true,
      resume: resumeResult.data,
      design: savedDesign,
      template: designTemplateId ?? record.template ?? null,
      profileImageUrl,
      resumeId: record.id,
      updatedAt: record.updated_at,
    });
  } catch (error) {
    console.error("[Resume] latest error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load your resume.",
      },
      { status: 500 },
    );
  }
}

/* ============================================================
   POST — AI ENHANCE + SAVE

   Important architecture rule:

   AI controls CONTENT.
   User/template controls DESIGN.

   The selected PDF template therefore remains authoritative.
   AI must never replace the user's selected layout.
   ============================================================ */

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in.",
        },
        { status: 401 },
      );
    }

    let body: {
      userInformation?: string;
      templateId?: string;
      resumeDesignDescription?: string;
      profilePhoto?: string | null;
      profilePhotoName?: string | null;
      profilePhotoType?: string | null;
      customDesign?: ResumeDesign["custom"];
    };

    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const userInformation = body.userInformation?.trim();

    if (!userInformation) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume information is required.",
        },
        { status: 400 },
      );
    }

    const templateId: ResumeTemplateId = isTemplateId(body.templateId)
      ? body.templateId
      : "blue-01";

    const definition = getTemplateDefinition(templateId);
    const aiTemplate = getAiTemplate(templateId);

    /* ----------------------------------------------------------
       AI CONTENT ENHANCEMENT
       ---------------------------------------------------------- */

    const resumeRaw = await generateResume(
      userInformation,
      `
You are HirePro's resume content enhancement engine.

Create a polished, factual, recruiter-ready resume from the user's supplied information.

Selected template:
${definition.name}

Template category:
${definition.category}

Rules:
- Preserve the user's factual information.
- Never invent employers, dates, degrees, technologies, certifications, achievements, metrics or responsibilities.
- Improve grammar, clarity, action verbs and professional phrasing.
- Make bullets concise and achievement-oriented when the supplied evidence supports it.
- Preserve projects, education, certifications and relevant sections.
- Do not create unsupported keywords merely to increase ATS score.
- Keep the result compatible with the existing ResumeData schema.
- The visual template is controlled by HirePro and MUST NOT be changed by the AI.
- Do not return layout instructions.

User's design note is only context for writing tone:
${body.resumeDesignDescription?.trim() || "Professional, concise and recruiter-friendly."}
      `.trim(),
    );

    const resumeResult = ResumeSchema.safeParse(resumeRaw);

    if (!resumeResult.success) {
      console.error(
        "[Resume] AI resume validation:",
        resumeResult.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The AI returned invalid resume data. Please try again.",
        },
        { status: 502 },
      );
    }

    const resume: ResumeData = resumeResult.data;

    /* ----------------------------------------------------------
       TEMPLATE DESIGN
       ---------------------------------------------------------- */

    const baseDesign = getTemplateDesign(templateId);
    const defaults = getDefaultCustomDesign(templateId);

    const mergedDesign = mergeDesign(baseDesign, {
      ...defaults,
      ...(body.customDesign ?? {}),
      templateId,
    });

    /*
     * These structural properties are locked to the selected template.
     * Typography, colors and spacing can still be controlled by Styling.
     */
    const finalDesign = ResumeDesignSchema.parse({
      ...mergedDesign,
      layout: baseDesign.layout,
      style: baseDesign.style,
      sidebar: baseDesign.sidebar,
      ats: baseDesign.ats,
      custom: {
        ...mergedDesign.custom,
        templateId,
      },
    });

    /* ----------------------------------------------------------
       SAVE RESUME
       ---------------------------------------------------------- */

    const title = resume.personal.name?.trim()
      ? `${safeName(resume.personal.name)} Resume`
      : "My Resume";

    const { data: savedResume, error: saveError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
        source_type: "ai_generated",
        resume_data: resume,
        design_config: finalDesign,
        // Keep the DB-compatible AI family in the existing template column.
        // The exact selected template ID is stored in design_config.custom.templateId.
        template: aiTemplate,
        is_primary: true,
      })
      .select("id,title,template,profile_image_path")
      .single();

    if (saveError || !savedResume) {
      console.error("[Resume] save error:", saveError);

      return NextResponse.json(
        {
          success: false,
          error:
            saveError?.message ||
            "Failed to save the generated resume.",
        },
        { status: 500 },
      );
    }

    /* ----------------------------------------------------------
       VERSION
       ---------------------------------------------------------- */

    const { error: versionError } = await supabase
      .from("resume_versions")
      .insert({
        resume_id: savedResume.id,
        version_number: 1,
        version_name: "AI Enhanced",
        resume_data: resume,
        design_config: finalDesign,
        template: aiTemplate,
      });

    if (versionError) {
      console.warn("[Resume] version save warning:", versionError);
    }

    /* ----------------------------------------------------------
       PROFILE PHOTO
       ---------------------------------------------------------- */

    let profileImagePath: string | null = null;
    let profileImageUrl: string | null = null;

    if (body.profilePhoto && body.profilePhotoType) {
      try {
        const photo = decodeDataUrl(body.profilePhoto);

        if (photo.length > MAX_PHOTO_SIZE) {
          throw new Error(
            "Profile photo must be smaller than 5 MB.",
          );
        }

        profileImagePath =
          `${user.id}/${savedResume.id}/profile.${extensionFor(
            body.profilePhotoType,
          )}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(profileImagePath, photo, {
            contentType: body.profilePhotoType,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { error: pathError } = await supabase
          .from("resumes")
          .update({ profile_image_path: profileImagePath })
          .eq("id", savedResume.id)
          .eq("user_id", user.id);

        if (pathError) {
          console.warn(
            "[Resume] profile image path update warning:",
            pathError,
          );
        }

        const { data: signed } = await supabase.storage
          .from("profile-images")
          .createSignedUrl(profileImagePath, 60 * 60);

        profileImageUrl = signed?.signedUrl ?? null;
      } catch (photoError) {
        console.warn(
          "[Resume] profile photo upload skipped:",
          photoError,
        );
        profileImagePath = null;
      }
    }

    return NextResponse.json({
      success: true,
      resume,
      design: finalDesign,
      resumeId: savedResume.id,
      template: templateId,
      aiTemplate,
      profileImagePath,
      profileImageUrl,
      saved: true,
      versionNumber: 1,
    });
  } catch (error) {
    console.error("[Resume] generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate resume.",
      },
      { status: 500 },
    );
  }
}

/* ============================================================
   PATCH — PERSISTENT EDITING

   This endpoint NEVER calls AI. It only persists the current
   editor state for the authenticated user.
   ============================================================ */

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      resumeId?: string | null;
      resume?: unknown;
      design?: unknown;
      templateId?: string;
      createVersion?: boolean;
      versionName?: string;
    };

    const resumeResult = ResumeSchema.safeParse(body.resume);
    if (!resumeResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid resume data." },
        { status: 400 },
      );
    }

    const templateId: ResumeTemplateId = isTemplateId(body.templateId)
      ? body.templateId
      : "blue-02";

    const baseDesign = getTemplateDesign(templateId);
    const defaults = getDefaultCustomDesign(templateId);
    const suppliedDesign =
      body.design && typeof body.design === "object"
        ? (body.design as ResumeDesign)
        : null;
    const suppliedCustom = suppliedDesign?.custom ?? {};

    const finalDesign = ResumeDesignSchema.parse({
      ...mergeDesign(baseDesign, {
        ...defaults,
        ...suppliedCustom,
        templateId,
      }),
      layout: baseDesign.layout,
      style: baseDesign.style,
      sidebar: baseDesign.sidebar,
      ats: baseDesign.ats,
      custom: {
        ...defaults,
        ...suppliedCustom,
        templateId,
      },
    });

    const resume = resumeResult.data;
    const title = resume.personal.name?.trim()
      ? `${safeName(resume.personal.name)} Resume`
      : "My Resume";
    const aiTemplate = getAiTemplate(templateId);

    let resumeId =
      typeof body.resumeId === "string" && body.resumeId.trim()
        ? body.resumeId
        : null;

    if (resumeId) {
      const { data: existing, error } = await supabase
        .from("resumes")
        .select("id")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !existing) resumeId = null;
    }

    if (!resumeId) {
      const { data: latest } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      resumeId = latest?.id ?? null;
    }

    if (!resumeId) {
      const { data: created, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title,
          source_type: "manual_edit",
          resume_data: resume,
          design_config: finalDesign,
          template: aiTemplate,
          is_primary: true,
        })
        .select("id,title,updated_at")
        .single();

      if (error || !created) {
        console.error("[Resume PATCH] create:", error);
        return NextResponse.json(
          { success: false, error: error?.message || "Failed to save your resume." },
          { status: 500 },
        );
      }

      resumeId = created.id;

      await supabase.from("resume_versions").insert({
        resume_id: resumeId,
        version_number: 1,
        version_name: "First saved edit",
        resume_data: resume,
        design_config: finalDesign,
        template: aiTemplate,
      });

      return NextResponse.json({
        success: true,
        resumeId,
        resume,
        design: finalDesign,
        template: templateId,
        updatedAt: created.updated_at,
        versionNumber: 1,
      });
    }

    let nextVersion: number | null = null;

    if (body.createVersion === true) {
      const { data: latestVersion } = await supabase
        .from("resume_versions")
        .select("version_number")
        .eq("resume_id", resumeId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      nextVersion =
        Number(latestVersion?.version_number ?? 0) + 1;
    }

    const { data: updated, error: updateError } = await supabase
      .from("resumes")
      .update({
        title,
        resume_data: resume,
        design_config: finalDesign,
        template: aiTemplate,
        source_type: "manual_edit",
      })
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .select("id,title,updated_at")
      .single();

    if (updateError || !updated) {
      console.error("[Resume PATCH] update:", updateError);
      return NextResponse.json(
        { success: false, error: updateError?.message || "Failed to save your resume." },
        { status: 500 },
      );
    }

    if (body.createVersion === true && nextVersion !== null) {
      const { error: versionError } = await supabase
        .from("resume_versions")
        .insert({
          resume_id: resumeId,
          version_number: nextVersion,
          version_name:
            body.versionName?.trim() ||
            `Version ${nextVersion}`,
          resume_data: resume,
          design_config: finalDesign,
          template: aiTemplate,
        });

      if (versionError) {
        console.warn(
          "[Resume PATCH] version save warning:",
          versionError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      resumeId,
      resume,
      design: finalDesign,
      template: templateId,
      updatedAt: updated.updated_at,
      versionNumber: nextVersion,
      versionCreated: body.createVersion === true,
    });
  } catch (error) {
    console.error("[Resume PATCH] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save your resume.",
      },
      { status: 500 },
    );
  }
}

