import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

function createSlug(name: string, id: string) {
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const shortId = id.replace(/-/g, "").slice(0, 8);

  return `${cleanName || "portfolio"}-${shortId}`;
}

export async function POST(
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

    // Get the portfolio and verify ownership
    const { data: portfolio, error: portfolioError } =
      await supabase
        .from("portfolios")
        .select("id, title, generated_data, slug, is_published")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // If already published, return the existing public URL
    if (portfolio.is_published && portfolio.slug) {
      return NextResponse.json({
        success: true,
        published: true,
        slug: portfolio.slug,
        url: `/p/${portfolio.slug}`,
      });
    }

    const name =
      portfolio.generated_data?.personal?.name ||
      portfolio.title ||
      "portfolio";

    const slug = createSlug(name, portfolio.id);

    const { data: updatedPortfolio, error: updateError } =
      await supabase
        .from("portfolios")
        .update({
          slug,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", portfolio.id)
        .eq("user_id", user.id)
        .select("id, slug, is_published")
        .single();

    if (updateError || !updatedPortfolio) {
      console.error("Publish error:", updateError);

      return NextResponse.json(
        {
          error: "Failed to publish portfolio",
          details: updateError?.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      published: true,
      slug: updatedPortfolio.slug,
      url: `/p/${updatedPortfolio.slug}`,
    });
  } catch (error) {
    console.error("Publish API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to publish portfolio",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { data: portfolio, error: findError } =
      await supabase
        .from("portfolios")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (findError || !portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("portfolios")
      .update({
        is_published: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Unpublish error:", updateError);

      return NextResponse.json(
        {
          error: "Failed to unpublish portfolio",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      published: false,
    });
  } catch (error) {
    console.error("Unpublish API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to unpublish portfolio",
      },
      { status: 500 }
    );
  }
}