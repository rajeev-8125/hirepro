import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";

import {
  ResumeDesignSchema,
  type ResumeDesign,
} from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
) {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      await request.json();

    const resumeValidation =
      ResumeSchema.safeParse(
        body?.resume,
      );

    const designValidation =
      ResumeDesignSchema.safeParse(
        body?.design,
      );

    if (
      !resumeValidation.success ||
      !designValidation.success
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid resume draft.",
        },
        {
          status: 400,
        },
      );
    }

    const resume:
      ResumeData =
      resumeValidation.data;

    const design:
      ResumeDesign =
      designValidation.data;

    const resumeId =
      typeof body?.resumeId ===
      "string"
        ? body.resumeId
        : null;

    const template =
      typeof body?.template ===
      "string"
        ? body.template
        : "professional-clean";

    const title =
      resume.personal.name?.trim()
        ? `${resume.personal.name.trim()} Resume`
        : "Untitled Resume";

    /*
     * UPDATE EXISTING DRAFT
     */

    if (resumeId) {
      const { data, error } =
        await supabase
          .from("resumes")
          .update({
            title,

            resume_data:
              resume,

            design_config:
              design,

            template,

            source_type:
              body?.sourceType ||
              "manual",

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            resumeId,
          )
          .eq(
            "user_id",
            user.id,
          )
          .select(
            "id, updated_at",
          )
          .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,

          resumeId:
            data.id,

          updatedAt:
            data.updated_at,
        });
      }
    }

    /*
     * CREATE NEW DRAFT
     */

    const { data, error } =
      await supabase
        .from("resumes")
        .insert({
          user_id:
            user.id,

          title,

          resume_data:
            resume,

          design_config:
            design,

          template,

          source_type:
            body?.sourceType ||
            "manual",

          is_primary:
            true,
        })
        .select(
          "id, updated_at",
        )
        .single();

    if (error || !data) {
      console.error(
        "Resume draft save error:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            error?.message ||
            "Failed to save draft.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,

      resumeId:
        data.id,

      updatedAt:
        data.updated_at,
    });
  } catch (error) {
    console.error(
      "Resume draft error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save draft.",
      },
      {
        status: 500,
      },
    );
  }
}