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
   GET — CURRENT USER'S SAVED RESUMES
   ============================================================ */

export async function GET() {
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

    const { data, error } = await supabase
      .from("resumes")
      .select(
        "id,title,template,source_type,is_primary,updated_at,created_at,profile_image_path",
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[Resume Manage GET]", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load your resumes.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      resumes: data ?? [],
    });
  } catch (error) {
    console.error("[Resume Manage GET] unexpected", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load resumes.",
      },
      { status: 500 },
    );
  }
}

/* ============================================================
   POST — DUPLICATE / RESTORE
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

    const body = (await request.json()) as {
      action?: "duplicate" | "restore";
      resumeId?: string;
      versionId?: string;
    };

    if (body.action === "duplicate") {
      if (!body.resumeId) {
        return NextResponse.json(
          {
            success: false,
            error: "Resume ID is required.",
          },
          { status: 400 },
        );
      }

      const { data: source, error: sourceError } =
        await supabase
          .from("resumes")
          .select(
            "id,title,resume_data,design_config,template,profile_image_path",
          )
          .eq("id", body.resumeId)
          .eq("user_id", user.id)
          .maybeSingle();

      if (sourceError) {
        console.error("[Resume duplicate] source:", sourceError);

        return NextResponse.json(
          {
            success: false,
            error: "Failed to load the resume.",
          },
          { status: 500 },
        );
      }

      if (!source) {
        return NextResponse.json(
          {
            success: false,
            error: "Resume not found.",
          },
          { status: 404 },
        );
      }

      const resumeResult = ResumeSchema.safeParse(
        source.resume_data,
      );

      const designResult = ResumeDesignSchema.safeParse(
        source.design_config,
      );

      if (!resumeResult.success || !designResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "The saved resume contains invalid data.",
          },
          { status: 422 },
        );
      }

      const duplicateTitle =
        source.title?.trim()
          ? `${source.title.trim()} Copy`
          : "Resume Copy";

      const { data: duplicate, error: insertError } =
        await supabase
          .from("resumes")
          .insert({
            user_id: user.id,
            title: duplicateTitle,
            source_type: "duplicate",
            resume_data: resumeResult.data,
            design_config: designResult.data,
            template: source.template,
            profile_image_path: source.profile_image_path,
            is_primary: false,
          })
          .select(
            "id,title,template,source_type,is_primary,created_at,updated_at",
          )
          .single();

      if (insertError || !duplicate) {
        console.error(
          "[Resume duplicate] insert:",
          insertError,
        );

        return NextResponse.json(
          {
            success: false,
            error:
              insertError?.message ||
              "Failed to duplicate resume.",
          },
          { status: 500 },
        );
      }

      const { error: versionError } = await supabase
        .from("resume_versions")
        .insert({
          resume_id: duplicate.id,
          version_number: 1,
          version_name: "Duplicated resume",
          resume_data: resumeResult.data,
          design_config: designResult.data,
          template: source.template,
        });

      if (versionError) {
        console.warn(
          "[Resume duplicate] version warning:",
          versionError,
        );
      }

      return NextResponse.json({
        success: true,
        resume: duplicate,
      });
    }

    if (body.action === "restore") {
      if (!body.resumeId || !body.versionId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Resume ID and version ID are required.",
          },
          { status: 400 },
        );
      }

      const { data: ownedResume, error: ownershipError } =
        await supabase
          .from("resumes")
          .select("id,title")
          .eq("id", body.resumeId)
          .eq("user_id", user.id)
          .maybeSingle();

      if (ownershipError) {
        console.error(
          "[Resume restore] ownership:",
          ownershipError,
        );

        return NextResponse.json(
          {
            success: false,
            error: "Failed to verify resume ownership.",
          },
          { status: 500 },
        );
      }

      if (!ownedResume) {
        return NextResponse.json(
          {
            success: false,
            error: "Resume not found.",
          },
          { status: 404 },
        );
      }

      const { data: version, error: versionError } =
        await supabase
          .from("resume_versions")
          .select(
            "id,resume_id,version_number,version_name,resume_data,design_config,template,created_at",
          )
          .eq("id", body.versionId)
          .eq("resume_id", body.resumeId)
          .maybeSingle();

      if (versionError) {
        console.error(
          "[Resume restore] version:",
          versionError,
        );

        return NextResponse.json(
          {
            success: false,
            error: "Failed to load the selected version.",
          },
          { status: 500 },
        );
      }

      if (!version) {
        return NextResponse.json(
          {
            success: false,
            error: "Resume version not found.",
          },
          { status: 404 },
        );
      }

      const resumeResult = ResumeSchema.safeParse(
        version.resume_data,
      );

      const designResult = ResumeDesignSchema.safeParse(
        version.design_config,
      );

      if (!resumeResult.success || !designResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "This version contains invalid data.",
          },
          { status: 422 },
        );
      }

      /*
       * Preserve the state that is currently in the main resume
       * as a new history snapshot before restoring the older one.
       */
      const { data: current } = await supabase
        .from("resumes")
        .select(
          "resume_data,design_config,template",
        )
        .eq("id", body.resumeId)
        .eq("user_id", user.id)
        .single();

      const { data: latestVersion } = await supabase
        .from("resume_versions")
        .select("version_number")
        .eq("resume_id", body.resumeId)
        .order("version_number", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      const nextVersion =
        Number(latestVersion?.version_number ?? 0) + 1;

      if (current) {
        const currentResume = ResumeSchema.safeParse(
          current.resume_data,
        );
        const currentDesign = ResumeDesignSchema.safeParse(
          current.design_config,
        );

        if (
          currentResume.success &&
          currentDesign.success
        ) {
          await supabase
            .from("resume_versions")
            .insert({
              resume_id: body.resumeId,
              version_number: nextVersion,
              version_name:
                `Before restoring v${version.version_number}`,
              resume_data: currentResume.data,
              design_config: currentDesign.data,
              template: current.template,
            });
        }
      }

      const restoreVersionNumber = nextVersion + 1;

      const { data: updated, error: updateError } =
        await supabase
          .from("resumes")
          .update({
            title:
              ownedResume.title ||
              "My Resume",
            resume_data: resumeResult.data,
            design_config: designResult.data,
            template: version.template,
            source_type: "restored_version",
          })
          .eq("id", body.resumeId)
          .eq("user_id", user.id)
          .select(
            "id,title,template,updated_at",
          )
          .single();

      if (updateError || !updated) {
        console.error(
          "[Resume restore] update:",
          updateError,
        );

        return NextResponse.json(
          {
            success: false,
            error:
              updateError?.message ||
              "Failed to restore this version.",
          },
          { status: 500 },
        );
      }

      const { error: restoreVersionError } =
        await supabase
          .from("resume_versions")
          .insert({
            resume_id: body.resumeId,
            version_number: restoreVersionNumber,
            version_name:
              `Restored from v${version.version_number}`,
            resume_data: resumeResult.data,
            design_config: designResult.data,
            template: version.template,
          });

      if (restoreVersionError) {
        console.warn(
          "[Resume restore] history warning:",
          restoreVersionError,
        );
      }

      return NextResponse.json({
        success: true,
        resumeId: body.resumeId,
        resume: resumeResult.data,
        design: designResult.data,
        template: version.template,
        updatedAt: updated.updated_at,
        versionNumber: restoreVersionNumber,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unsupported resume action.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("[Resume Manage POST]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Resume operation failed.",
      },
      { status: 500 },
    );
  }
}

/* ============================================================
   PATCH — RENAME
   ============================================================ */

export async function PATCH(request: Request) {
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

    const body = (await request.json()) as {
      resumeId?: string;
      title?: string;
    };

    const title = body.title?.trim();

    if (!body.resumeId || !title) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume ID and title are required.",
        },
        { status: 400 },
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume name cannot exceed 100 characters.",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("resumes")
      .update({ title })
      .eq("id", body.resumeId)
      .eq("user_id", user.id)
      .select("id,title,updated_at")
      .maybeSingle();

    if (error) {
      console.error("[Resume rename]", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      resume: data,
    });
  } catch (error) {
    console.error("[Resume Manage PATCH]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to rename resume.",
      },
      { status: 500 },
    );
  }
}

/* ============================================================
   DELETE — DELETE CURRENT USER'S RESUME
   ============================================================ */

export async function DELETE(request: Request) {
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
    const resumeId = url.searchParams.get("id");

    if (!resumeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume ID is required.",
        },
        { status: 400 },
      );
    }

    const { data: ownedResume } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!ownedResume) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume not found.",
        },
        { status: 404 },
      );
    }

    /*
     * Delete versions explicitly because we do not assume
     * ON DELETE CASCADE is configured.
     */
    const { error: versionDeleteError } =
      await supabase
        .from("resume_versions")
        .delete()
        .eq("resume_id", resumeId);

    if (versionDeleteError) {
      console.error(
        "[Resume delete] versions:",
        versionDeleteError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to remove resume history.",
        },
        { status: 500 },
      );
    }

    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "[Resume delete] resume:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: resumeId,
    });
  } catch (error) {
    console.error(
      "[Resume Manage DELETE]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete resume.",
      },
      { status: 500 },
    );
  }
}
