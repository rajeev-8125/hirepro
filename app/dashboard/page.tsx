import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const services = [
  {
    title: "AI Portfolio Generator",
    description:
      "Create a professional personal portfolio from your career information with AI.",
    icon: "✦",
    href: "/dashboard/portfolio",
  },
  {
    title: "AI Resume Builder",
    description:
      "Build a clean, professional and ATS-friendly resume with AI assistance.",
    icon: "▤",
    href: "/dashboard/resume",
  },
  {
    title: "ATS Score Checker",
    description:
      "Compare your resume against a job description and discover your ATS compatibility.",
    icon: "◎",
    href: "/dashboard/ats",
  },
  {
    title: "AI Job Matching",
    description:
      "Find jobs that match your skills, experience, education and career goals.",
    icon: "⌕",
    href: "/dashboard/jobs",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const name =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "there";

  const avatar =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <a
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Career<span className="text-blue-600">AI</span>
          </a>

          <div className="flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="h-9 w-9 rounded-full border border-slate-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="hidden sm:block">
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium transition hover:border-red-300 hover:text-red-600"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* WELCOME */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Your career workspace
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome, {name.split(" ")[0]}.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Everything you need to build your professional presence,
            optimize your resume and discover your next opportunity.
          </p>
        </section>

        {/* SERVICES */}
        <section className="mt-12">
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <a
                key={service.title}
                href={service.href}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">
                    {service.icon}
                  </div>

                  <span className="text-xl transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <h2 className="mt-7 text-2xl font-bold">
                  {service.title}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {service.description}
                </p>

                <p className="mt-6 text-sm font-semibold text-blue-600">
                  Open service →
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* QUICK OVERVIEW */}
        <section className="mt-12">
          <h2 className="text-xl font-bold">
            Your career overview
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Portfolios</p>
              <p className="mt-2 text-3xl font-bold">0</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Resumes</p>
              <p className="mt-2 text-3xl font-bold">0</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">ATS Checks</p>
              <p className="mt-2 text-3xl font-bold">0</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Job Matches</p>
              <p className="mt-2 text-3xl font-bold">0</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}