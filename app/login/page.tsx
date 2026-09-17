import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HireProLogo from "@/components/brand/hirepro-logo";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const nextPath =
    params.next && params.next.startsWith("/")
      ? params.next
      : "/dashboard";

  const errorMessage = params.error;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      {/* NAVBAR */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-24 max-w-7xl items-center px-6 lg:px-8">
          <a href="/" aria-label="HirePro home">
            <HireProLogo size="md" />
          </a>
        </div>
      </header>

      {/* LOGIN */}
      <section className="relative flex min-h-[calc(100vh-6rem)] items-center justify-center overflow-hidden px-6 py-16">
        {/* Background decoration */}
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-100/60 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
            <div className="text-center">
              <HireProLogo size="md" />

              <h1 className="mt-8 text-3xl font-black tracking-tight">
                Welcome to HirePro
              </h1>

              <p className="mt-3 leading-7 text-slate-500">
                Sign in to access your career workspace.
              </p>
            </div>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                We couldn't sign you in. Please try again.
              </div>
            )}

            {/* GOOGLE ONLY */}
            <form
              action="/auth/signin"
              method="post"
              className="mt-8"
            >
              <input
                type="hidden"
                name="next"
                value={nextPath}
              />

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                {/* Google Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.67c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.67Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.54 13.77a5.85 5.85 0 0 1 0-3.54V7.7H3.3a9.72 9.72 0 0 0 0 8.6l3.24-2.53Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 6.2c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.29 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.37l3.24 2.53C7.31 7.92 9.46 6.2 12 6.2Z"
                  />
                </svg>

                Continue with Google
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs text-slate-400">
                SECURE SIGN IN
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to use HirePro's career workspace
              services.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            <a
              href="/"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              ← Back to HirePro
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}