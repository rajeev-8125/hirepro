import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  let next = requestUrl.searchParams.get("next") ?? "/dashboard";

  // Security: only allow internal paths
  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login?error=authentication_failed",
        requestUrl.origin,
      ),
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error);

    return NextResponse.redirect(
      new URL(
        "/login?error=authentication_failed",
        requestUrl.origin,
      ),
    );
  }

  return NextResponse.redirect(
    new URL(next, requestUrl.origin),
  );
}