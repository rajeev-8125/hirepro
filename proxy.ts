import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function proxy(
  request: NextRequest,
) {
  let supabaseResponse =
    NextResponse.next({
      request,
    });

  const supabase =
    createServerClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,

      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(
            cookiesToSet,
            headers,
          ) {
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value,
                );
              },
            );

            supabaseResponse =
              NextResponse.next({
                request,
              });

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                supabaseResponse.cookies.set(
                  name,
                  value,
                  options,
                );
              },
            );

            if (headers) {
              Object.entries(
                headers,
              ).forEach(
                ([key, value]) => {
                  supabaseResponse.headers.set(
                    key,
                    value,
                  );
                },
              );
            }
          },
        },
      },
    );

  /*
   * IMPORTANT:
   * Do not use getSession() here for authorization.
   *
   * getUser() revalidates the user against Supabase Auth.
   */
  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  const pathname =
    request.nextUrl.pathname;

  /*
   * Protected dashboard.
   */
  const isDashboard =
    pathname === "/dashboard" ||
    pathname.startsWith(
      "/dashboard/",
    );

  /*
   * Protected resume APIs.
   */
  const isResumeApi =
    pathname.startsWith(
      "/api/resume/",
    );

  /*
   * Protected ATS APIs.
   */
  const isATSApi =
    pathname.startsWith(
      "/api/ats/",
    );

  /*
   * Do not redirect API requests to HTML login pages.
   *
   * The API route itself will return JSON 401.
   *
   * This prevents frontend errors such as:
   *
   * Unexpected token '<'
   */
  if (
    isDashboard &&
    !user
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname =
      "/login";

    loginUrl.search = "";

    loginUrl.searchParams.set(
      "next",
      pathname +
        request.nextUrl.search,
    );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  /*
   * Let API routes handle their own
   * JSON authentication response.
   */
  if (
    (isResumeApi ||
      isATSApi) &&
    !user
  ) {
    return supabaseResponse;
  }

  /*
   * Logged-in users visiting login
   * can remain there unless the login
   * page itself handles redirection.
   */
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run the Proxy on application routes
     * but skip static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};