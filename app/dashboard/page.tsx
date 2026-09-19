"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HireProLogo from "@/components/brand/hirepro-logo";

type UserInfo = {
  name: string;
  email: string;
  avatar: string | null;
};

type Portfolio = {
  id: string;
  title: string | null;
  slug: string | null;
  updated_at: string;
  is_published: boolean | null;
};

type Resume = {
  id: string;
  title: string | null;
  updated_at: string;
};

type DashboardData = {
  user: UserInfo;
  portfolios: Portfolio[];
  resumes: Resume[];
  stats: {
    portfolios: number;
    resumes: number;
    atsChecks: number;
  };
};

const services = [
  {
    title: "AI Portfolio Generator",
    description:
      "Create a polished personal portfolio from your professional information with AI-assisted design and content.",
    icon: "✦",
    number: "01",
    href: "/dashboard/portfolio",
    gradient: "from-blue-500 to-indigo-600",
    background: "from-blue-50 to-indigo-50",
    border: "border-blue-100",
    text: "text-blue-700",
  },
  {
    title: "AI Resume Builder",
    description:
      "Build a professional resume with structured content, clean layouts and downloadable PDF output.",
    icon: "▤",
    number: "02",
    href: "/dashboard/resume",
    gradient: "from-purple-500 to-fuchsia-600",
    background: "from-purple-50 to-fuchsia-50",
    border: "border-purple-100",
    text: "text-purple-700",
  },
  {
    title: "ATS Score Checker",
    description:
      "Upload any resume and analyze keywords, skills, experience and formatting against ATS requirements.",
    icon: "✓",
    number: "03",
    href: "/dashboard/ats",
    gradient: "from-emerald-500 to-teal-600",
    background: "from-emerald-50 to-teal-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
  },
];

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "";
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.slice(0, 2).toUpperCase() || "HP";
  }

  return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""}`.toUpperCase();
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        /*
         * We use the existing Supabase-authenticated dashboard APIs.
         * If your current project already exposes dashboard data differently,
         * keep your existing fetching logic here.
         */
        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Dashboard request failed");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);
  

  const userName = data?.user?.name || "there";
  const firstName = userName.split(" ")[0] || "there";

  const portfolios = data?.portfolios || [];
  const resumes = data?.resumes || [];

  const latestPortfolio = portfolios[0];
  const latestResume = resumes[0];

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="transition hover:opacity-90">
            <HireProLogo size="sm" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <Link
              href="/dashboard"
              className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/portfolio"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              Portfolio
            </Link>

            <Link
              href="/dashboard/resume"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              Resume
            </Link>

            <Link
              href="/dashboard/ats"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              ATS Checker
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* User */}
            <div className="hidden items-center gap-3 sm:flex">
              {data?.user?.avatar ? (
                <img
                  src={data.user.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-black text-white">
                  {getInitials(userName)}
                </div>
              )}

              <div className="hidden max-w-[170px] lg:block">
                <p className="truncate text-sm font-bold text-slate-900">
                  {userName}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {data?.user?.email || ""}
                </p>
              </div>
            </div>

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/70">
        <div className="pointer-events-none absolute right-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[-200px] left-[30%] h-[400px] w-[400px] rounded-full bg-purple-200/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.75fr] lg:px-10 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.17em] text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Your career workspace
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              Welcome,
              <span className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {loading ? "..." : `${firstName}.`}
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Everything you need to build your professional presence and
              create a stronger, more career-ready profile.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/portfolio"
                className="rounded-full bg-[#07152f] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#102a57]"
              >
                Build your portfolio →
              </Link>

              <Link
                href="/dashboard/ats"
                className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
              >
                Check ATS score
              </Link>
            </div>
          </div>

          {/* Hero Logo */}
          <div className="hidden justify-end lg:flex">
            <div className="rounded-[36px] border border-white/80 bg-white/70 px-10 py-9 shadow-[0_25px_70px_rgba(37,99,235,0.10)] backdrop-blur-xl">
              <HireProLogo size="lg" showTagline />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        {/* =======================================================
            SERVICES
        ======================================================== */}
        <section>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Your tools
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Our AI-powered services
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Choose what you want to work on today.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.number}
                href={service.href}
                className={`group relative overflow-hidden rounded-[28px] border bg-gradient-to-br p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${service.background} ${service.border}`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-black tracking-[0.15em] text-slate-400">
                    {service.number}
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-600 shadow-sm transition-all group-hover:bg-slate-950 group-hover:text-white">
                    →
                  </span>
                </div>

                <div
                  className={`mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black text-white shadow-lg ${service.gradient}`}
                >
                  {service.icon}
                </div>

                <h3 className="mt-6 text-xl font-black tracking-[-0.02em] text-slate-950">
                  {service.title}
                </h3>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                  {service.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-black">
                  <span className={service.text}>Open service</span>
                  <span className="text-slate-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =======================================================
            CAREER OVERVIEW
        ======================================================== */}
        <section className="mt-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Overview
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950">
              Your career overview
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {/* Portfolio */}
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg text-blue-600">
                  ✦
                </div>

                <span className="text-xs font-bold text-slate-400">
                  Portfolio
                </span>
              </div>

              <p className="mt-6 text-4xl font-black text-slate-950">
                {loading ? "—" : data?.stats.portfolios ?? 0}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Portfolios created
              </p>
            </div>

            {/* Resume */}
            <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-lg text-purple-600">
                  ▤
                </div>

                <span className="text-xs font-bold text-slate-400">
                  Resume
                </span>
              </div>

              <p className="mt-6 text-4xl font-black text-slate-950">
                {loading ? "—" : data?.stats.resumes ?? 0}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Resumes created
              </p>
            </div>

            {/* ATS */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg text-emerald-600">
                  ✓
                </div>

                <span className="text-xs font-bold text-slate-400">
                  ATS
                </span>
              </div>

              <p className="mt-6 text-4xl font-black text-slate-950">
                {loading ? "—" : data?.stats.atsChecks ?? 0}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-500">
                ATS checks completed
              </p>
            </div>
          </div>
        </section>

        {/* =======================================================
            CONTINUE WHERE YOU LEFT OFF
        ======================================================== */}
        <section className="mt-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Pick up where you left off
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950">
                Continue where you left off
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* Latest portfolio */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">
                    ✦
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Portfolio
                    </p>

                    <h3 className="mt-1 text-lg font-black text-slate-900">
                      {latestPortfolio?.title || "Create your first portfolio"}
                    </h3>
                  </div>
                </div>

                {latestPortfolio?.is_published && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600">
                    Published
                  </span>
                )}
              </div>

              <p className="mt-5 text-sm text-slate-500">
                {latestPortfolio
                  ? `Last updated ${formatDate(latestPortfolio.updated_at)}`
                  : "Build a professional portfolio from your career information."}
              </p>

              <div className="mt-6">
                <Link
                  href={
                    latestPortfolio
                      ? `/dashboard/portfolio/${latestPortfolio.id}`
                      : "/dashboard/portfolio"
                  }
                  className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  {latestPortfolio ? "Continue editing" : "Create portfolio"}
                </Link>
              </div>
            </div>

            {/* Latest resume */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-xl text-purple-600">
                    ▤
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Resume
                    </p>

                    <h3 className="mt-1 text-lg font-black text-slate-900">
                      {latestResume?.title || "Create your first resume"}
                    </h3>
                  </div>
                </div>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-black text-purple-600">
                  Resume
                </span>
              </div>

              <p className="mt-5 text-sm text-slate-500">
                {latestResume
                  ? `Last updated ${formatDate(latestResume.updated_at)}`
                  : "Create a structured, professional resume with AI assistance."}
              </p>

              <div className="mt-6">
                <Link
                  href="/dashboard/resume"
                  className="inline-flex rounded-full bg-purple-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-purple-700"
                >
                  {latestResume ? "Continue editing" : "Create resume"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            CAREER ASSETS
        ======================================================== */}
        <section className="mt-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Your work
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950">
              Your career assets
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Quickly access the portfolios and resumes you have created.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            {/* Portfolio assets */}
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    ✦
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Portfolios
                    </h3>

                    <p className="text-xs text-slate-400">
                      {portfolios.length} saved
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/portfolio"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View all →
                </Link>
              </div>

              <div className="mt-5">
                {portfolios.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-center">
                    <p className="text-sm font-semibold text-slate-600">
                      No portfolios yet
                    </p>

                    <Link
                      href="/dashboard/portfolio"
                      className="mt-2 inline-block text-xs font-bold text-blue-600"
                    >
                      Create your first portfolio →
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {portfolios.slice(0, 3).map((portfolio) => (
                      <div
                        key={portfolio.id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {portfolio.title || "Untitled portfolio"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Updated {formatDate(portfolio.updated_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {portfolio.slug && portfolio.is_published && (
                            <Link
                              href={`/p/${portfolio.slug}`}
                              target="_blank"
                              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100"
                            >
                              View
                            </Link>
                          )}

                          <Link
                            href={`/dashboard/portfolio/${portfolio.id}`}
                            className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-bold text-white hover:bg-blue-700"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Resume assets */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    ▤
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Resumes
                    </h3>

                    <p className="text-xs text-slate-400">
                      {resumes.length} saved
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/resume"
                  className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  View all →
                </Link>
              </div>

              <div className="mt-5">
                {resumes.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-center">
                    <p className="text-sm font-semibold text-slate-600">
                      No resumes yet
                    </p>

                    <Link
                      href="/dashboard/resume"
                      className="mt-2 inline-block text-xs font-bold text-purple-600"
                    >
                      Create your first resume →
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {resumes.slice(0, 3).map((resume) => (
                      <div
                        key={resume.id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {resume.title || "Untitled resume"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Updated {formatDate(resume.updated_at)}
                          </p>
                        </div>

                        <Link
                          href="/dashboard/resume"
                          className="rounded-full bg-purple-600 px-4 py-2 text-center text-[11px] font-bold text-white hover:bg-purple-700"
                        >
                          Open
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            QUICK ATS CTA
        ======================================================== */}
        <section className="mt-16">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-7 sm:p-9">
            <div className="absolute right-[-60px] top-[-60px] h-48 w-48 rounded-full bg-emerald-100/60 blur-2xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-black text-white shadow-lg">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-600">
                      Resume check
                    </p>

                    <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-950">
                      Is your resume ready for ATS?
                    </h2>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                  Upload any PDF resume and get an independent analysis of
                  keywords, skills, experience and formatting.
                </p>
              </div>

              <Link
                href="/dashboard/ats"
                className="shrink-0 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Check my resume →
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <HireProLogo size="sm" />

            <span className="hidden h-5 w-px bg-slate-200 sm:block" />

            <p className="text-xs text-slate-400">
              Your AI-powered career workspace.
            </p>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} HirePro
          </p>
        </div>
      </footer>
    </main>
  );
}