import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const formData = await request.formData();

  const nextValue = formData.get("next");

  const next =
    typeof nextValue === "string" && nextValue.startsWith("/")
      ? nextValue
      : "/dashboard";

  const requestUrl = new URL(request.url);

  const callbackUrl = new URL("/auth/callback", requestUrl.origin);

  callbackUrl.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    console.error("Google sign-in error:", error);

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Unable to start Google sign-in"
        )}`,
        requestUrl.origin
      ),
      303
    );
  }

  if (!data.url) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Google sign-in URL was not generated"
        )}`,
        requestUrl.origin
      ),
      303
    );
  }

  // IMPORTANT:
  // Use 303 so the browser changes the POST into a GET
  // when navigating to the Supabase OAuth authorize URL.
  return NextResponse.redirect(data.url, 303);
}