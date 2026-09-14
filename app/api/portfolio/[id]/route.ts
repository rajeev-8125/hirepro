import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// GET portfolio
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

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

    const { data: portfolio, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load portfolio",
      },
      { status: 500 }
    );
  }
}

// UPDATE portfolio
export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

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

    const body = await request.json();

    const { generated_data, theme, title } = body;

    const { data: portfolio, error } = await supabase
      .from("portfolios")
      .update({
        generated_data,
        theme,
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error: "Failed to update portfolio",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update portfolio",
      },
      { status: 500 }
    );
  }
}