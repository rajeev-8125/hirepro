import GoogleButton from "@/components/auth/GoogleButton";

type Props = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const next =
    params.next && params.next.startsWith("/")
      ? params.next
      : "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <a
          href="/"
          className="text-xl font-bold tracking-tight"
        >
          Career<span className="text-blue-600">AI</span>
        </a>

        <h1 className="mt-10 text-3xl font-bold">
          Welcome back
        </h1>

        <p className="mt-3 text-slate-500">
          Sign in to continue to your career workspace.
        </p>

        <div className="mt-8">
          <GoogleButton next={next} />
        </div>

        <p className="mt-8 text-xs leading-5 text-slate-400">
          By continuing, you agree to use CareerAI responsibly.
        </p>
      </div>
    </main>
  );
}