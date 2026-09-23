import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNext(
  value: unknown,
) {
  if (
    typeof value !== "string"
  ) {
    return "/dashboard";
  }

  if (
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/dashboard";
  }

  return value;
}

export async function POST(
  request: Request,
) {
  try {
    const supabase =
      await createClient();

    const formData =
      await request.formData();

    const next =
      safeNext(
        formData.get("next"),
      );

    const requestUrl =
      new URL(request.url);

    const callbackUrl =
      new URL(
        "/auth/callback",
        requestUrl.origin,
      );

    callbackUrl.searchParams.set(
      "next",
      next,
    );

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithOAuth(
        {
          provider: "google",

          options: {
            redirectTo:
              callbackUrl.toString(),
          },
        },
      );

    if (error) {
      console.error(
        "[Auth] Google OAuth error:",
        error,
      );

      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            "Unable to start Google sign-in.",
          )}`,
          requestUrl.origin,
        ),
        303,
      );
    }

    if (!data.url) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            "Google sign-in URL was not generated.",
          )}`,
          requestUrl.origin,
        ),
        303,
      );
    }

    /*
     * 303 is intentional.
     *
     * Browser changes POST -> GET.
     */
    return NextResponse.redirect(
      data.url,
      303,
    );
  } catch (error) {
    console.error(
      "[Auth] Sign-in route error:",
      error,
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=authentication_failed",
        request.url,
      ),
      303,
    );
  }
}