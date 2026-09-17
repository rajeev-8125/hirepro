import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // ---------------------------------------------------------
    // Get authenticated user
    // ---------------------------------------------------------
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Dashboard user error:", userError);
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // ---------------------------------------------------------
    // User information
    // ---------------------------------------------------------
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "HirePro User";

    const avatar =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;

    // ---------------------------------------------------------
    // Fetch portfolios
    // ---------------------------------------------------------
    const {
      data: portfolios,
      error: portfoliosError,
    } = await supabase
      .from("portfolios")
      .select("id, title, slug, updated_at, is_published")
      .eq("user_id", user.id)
      .order("updated_at", {
        ascending: false,
      });

    if (portfoliosError) {
      console.error(
        "Dashboard portfolios error:",
        portfoliosError,
      );
    }

    // ---------------------------------------------------------
    // Fetch resumes
    // ---------------------------------------------------------
    const {
      data: resumes,
      error: resumesError,
    } = await supabase
      .from("resumes")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", {
        ascending: false,
      });

    if (resumesError) {
      console.error(
        "Dashboard resumes error:",
        resumesError,
      );
    }

    // ---------------------------------------------------------
    // Fetch completed ATS checks
    //
    // IMPORTANT:
    // ATS remains independent from Resume Builder.
    // We only count the user's completed ATS checks.
    // ---------------------------------------------------------
    const {
      count: atsChecks,
      error: atsError,
    } = await supabase
      .from("ats_checks")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("status", "completed");

    if (atsError) {
      console.error(
        "Dashboard ATS error:",
        atsError,
      );
    }

    // ---------------------------------------------------------
    // Return dashboard data
    // ---------------------------------------------------------
    return NextResponse.json({
      user: {
        name,
        email: user.email || "",
        avatar,
      },

      portfolios: portfolios || [],

      resumes: resumes || [],

      stats: {
        portfolios: portfolios?.length || 0,
        resumes: resumes?.length || 0,
        atsChecks: atsChecks || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load dashboard",
      },
      {
        status: 500,
      },
    );
  }
}