import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("ATS history auth error:", authError);

      return NextResponse.json(
        {
          error: "Authentication failed.",
          details: authError.message,
        },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "You are not logged in.",
        },
        { status: 401 }
      );
    }

    /*
     * First load ATS checks.
     * We intentionally do NOT load ats_results here.
     * This helps us isolate any Supabase relationship problem.
     */
    const { data: checks, error: checksError } = await supabase
      .from("ats_checks")
      .select("id, job_description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (checksError) {
      console.error("ATS checks database error:", checksError);

      return NextResponse.json(
        {
          error: "Failed to load ATS checks.",
          details: checksError.message,
          code: checksError.code,
          hint: checksError.hint,
        },
        { status: 500 }
      );
    }

    /*
     * Load results separately.
     */
    const checkIds = (checks ?? []).map((check) => check.id);

    if (checkIds.length === 0) {
      return NextResponse.json({
        success: true,
        history: [],
      });
    }

    const { data: results, error: resultsError } = await supabase
      .from("ats_results")
      .select("ats_check_id, overall_score, result")
      .in("ats_check_id", checkIds);

    if (resultsError) {
      console.error("ATS results database error:", resultsError);

      return NextResponse.json(
        {
          error: "Failed to load ATS results.",
          details: resultsError.message,
          code: resultsError.code,
          hint: resultsError.hint,
        },
        { status: 500 }
      );
    }

    const history = (checks ?? []).map((check) => {
      const result = (results ?? []).find(
        (item) => item.ats_check_id === check.id
      );

      return {
        ...check,
        ats_results: result
          ? [
              {
                overall_score: result.overall_score,
                result: result.result,
              },
            ]
          : [],
      };
    });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("ATS history unexpected error:", error);

    return NextResponse.json(
      {
        error: "Unexpected error loading ATS history.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}