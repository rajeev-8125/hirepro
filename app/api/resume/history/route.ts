import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const resumeId = url.searchParams.get("resumeId");

    if (!resumeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume ID is required.",
        },
        { status: 400 },
      );
    }

    const { data: ownedResume, error: ownershipError } =
      await supabase
        .from("resumes")
        .select("id")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (ownershipError) {
      console.error(
        "[Resume History] ownership:",
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

    const { data: versions, error } = await supabase
      .from("resume_versions")
      .select(
        "id,resume_id,version_number,version_name,resume_data,design_config,template,created_at",
      )
      .eq("resume_id", resumeId)
      .order("version_number", { ascending: false });

    if (error) {
      console.error(
        "[Resume History] query:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load resume history.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      versions: versions ?? [],
    });
  } catch (error) {
    console.error(
      "[Resume History] unexpected:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load resume history.",
      },
      { status: 500 },
    );
  }
}
