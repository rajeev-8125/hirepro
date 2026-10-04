import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=missing_auth_code&next=${encodeURIComponent(next)}`, url.origin),
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth] OAuth callback error:", error);
      return NextResponse.redirect(
        new URL(`/login?error=authentication_failed&next=${encodeURIComponent(next)}`, url.origin),
      );
    }

    return NextResponse.redirect(new URL(next, url.origin));
  } catch (error) {
    console.error("[Auth] OAuth callback exception:", error);
    return NextResponse.redirect(
      new URL(`/login?error=authentication_failed&next=${encodeURIComponent(next)}`, url.origin),
    );
  }
}
