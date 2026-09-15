import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ATS check ID is required." },
        { status: 400 }
      );
    }

    const { data: check, error } = await supabase
      .from("ats_checks")
      .select(`
        id,
        job_description,
        created_at,
        ats_results (
          overall_score,
          result
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("ATS detail error:", error);

      return NextResponse.json(
        {
          error: "Failed to load ATS analysis.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (!check) {
      return NextResponse.json(
        { error: "ATS analysis not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      check,
    });
  } catch (error) {
    console.error("ATS detail API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load ATS analysis.",
      },
      { status: 500 }
    );
  }
}