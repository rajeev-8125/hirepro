"use client";

import Link from "next/link";
import HireProLogo from "@/components/brand/hirepro-logo";

const services = [
  {
    number: "01",
    title: "AI Portfolio Generator",
    description:
      "Turn your resume and career story into a polished personal portfolio designed around your professional identity.",
    icon: "✦",
    color:
      "from-sky-50 via-blue-50 to-indigo-100 border-blue-100",
    iconColor: "from-blue-500 to-indigo-600",
    href: "/dashboard/portfolio",
    features: ["AI-generated design", "Personal branding", "Public portfolio"],
  },
  {
    number: "02",
    title: "AI Resume Builder",
    description:
      "Create a professional, structured resume with AI-assisted content while keeping your experience clear and authentic.",
    icon: "▤",
    color:
      "from-violet-50 via-purple-50 to-fuchsia-100 border-purple-100",
    iconColor: "from-purple-500 to-fuchsia-600",
    href: "/dashboard/resume",
    features: ["AI content", "Professional layouts", "PDF export"],
  },
  {
    number: "03",
    title: "ATS Score Checker",
    description:
      "Upload any resume and understand how well it matches ATS requirements, skills, keywords and formatting.",
    icon: "✓",
    color:
      "from-emerald-50 via-green-50 to-teal-100 border-emerald-100",
    iconColor: "from-emerald-500 to-teal-600",
    href: "/dashboard/ats",
    features: ["ATS score", "Keyword analysis", "Optimization"],
  },
];

const steps = [
  {
    number: "01",
    title: "Choose your career tool",
    description:
      "Start with your portfolio, resume or ATS analysis depending on what you need.",
  },
  {
    number: "02",
    title: "Let AI do the heavy work",
    description:
      "HirePro analyzes your information and helps transform it into career-ready output.",
  },
  {
    number: "03",
    title: "Review and improve",
    description:
      "Make changes, refine your content and download or publish your final result.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      {/* =========================================================
          BACKGROUND GLOW
      ========================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-180px] top-[80px] h-[420px] w-[420px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute right-[-180px] top-[420px] h-[500px] w-[500px] rounded-full bg-purple-100/35 blur-3xl" />
        <div className="absolute bottom-[-200px] left-[35%] h-[400px] w-[400px] rounded-full bg-cyan-100/30 blur-3xl" />
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
          >
            <HireProLogo size="sm" />
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-10 md:flex">
            <a
              href="#services"
              className="relative py-2 text-sm font-semibold text-blue-600"
            >
              Services
              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-blue-600" />
            </a>

            <a
              href="#how-it-works"
              className="py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              How it works
            </a>

            <a
              href="#about"
              className="py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              About
            </a>
          </nav>

          {/* Sign in */}
          <form action="/auth/signin" method="POST">
            <button
              type="submit"
              className="rounded-full bg-[#07152f] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#102a57] hover:shadow-xl"
            >
              Sign in
            </button>
          </form>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-24 lg:pt-20">
          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Your AI career workspace
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[72px]">
              Build.
              <br />
              Improve.
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Get hired.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              HirePro brings your career tools into one intelligent workspace.
              Create your portfolio, build your resume and understand how your
              resume performs against ATS requirements.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#07152f] px-7 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/15 transition-all hover:-translate-y-1 hover:bg-[#102a57]"
              >
                Start building
                <span className="text-lg">→</span>
              </Link>

              <Link
                href="/dashboard/ats"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-800 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"
              >
                Check your ATS score
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                AI-assisted career tools
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Your information stays yours
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Built for job seekers
              </span>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative mx-auto w-full max-w-[560px]">
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-blue-100 bg-blue-50/50" />
            <div className="absolute -bottom-10 -left-8 h-36 w-36 rounded-full border border-purple-100 bg-purple-50/50" />

            <div className="relative rounded-[36px] border border-slate-200 bg-white/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-7">
              {/* Window header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-slate-200" />
                  <span className="h-3 w-3 rounded-full bg-slate-200" />
                  <span className="h-3 w-3 rounded-full bg-slate-200" />
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                  HIREPRO WORKSPACE
                </div>
              </div>

              {/* Mini profile */}
              <div className="rounded-3xl bg-gradient-to-br from-[#eff6ff] via-white to-[#f5f3ff] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-black text-white shadow-lg">
                    HP
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                      Career profile
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-900">
                      Ready to improve
                    </h3>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-7">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">
                      Career readiness
                    </span>
                    <span className="text-blue-600">82%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner">
                    <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Mini service rows */}
              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                      ✦
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        AI Portfolio
                      </p>
                      <p className="text-xs text-slate-500">
                        Build your presence
                      </p>
                    </div>
                  </div>

                  <span className="text-xl text-blue-600">→</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-purple-100 bg-purple-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-sm font-black text-white">
                      ▤
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        AI Resume
                      </p>
                      <p className="text-xs text-slate-500">
                        Create your resume
                      </p>
                    </div>
                  </div>

                  <span className="text-xl text-purple-600">→</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        ATS Checker
                      </p>
                      <p className="text-xs text-slate-500">
                        Improve your resume
                      </p>
                    </div>
                  </div>

                  <span className="text-xl text-emerald-600">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SERVICES
      ========================================================== */}
      <section
        id="services"
        className="border-y border-slate-100 bg-slate-50/60"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              Our AI-powered services
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Everything you need to
              <br />
              present yourself better.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Three focused tools. One career workspace. No unnecessary
              complexity.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.number}
                href={service.href}
                className={`group relative overflow-hidden rounded-[30px] border bg-gradient-to-br p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${service.color}`}
              >
                {/* Number */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-black tracking-[0.14em] text-slate-500">
                    {service.number}
                  </span>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-bold text-slate-700 shadow-sm transition-all duration-300 group-hover:rotate-[-12deg] group-hover:bg-slate-950 group-hover:text-white">
                    →
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-black text-white shadow-lg ${service.iconColor}`}
                >
                  {service.icon}
                </div>

                <h3 className="mt-7 text-2xl font-black tracking-[-0.025em] text-slate-950">
                  {service.title}
                </h3>

                <p className="mt-4 min-h-[84px] text-sm leading-6 text-slate-600">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mt-6 border-t border-white/70 pt-5">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    What you get
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-bold text-slate-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex items-center gap-2 text-sm font-black text-slate-900">
                  Get started
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          BEFORE / AFTER
      ========================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Text */}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-600">
                See the difference
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Turn ordinary resume content into stronger career content.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                HirePro can help identify weak wording, missing keywords and
                opportunities to communicate your experience more clearly.
              </p>

              <Link
                href="/dashboard/ats"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:-translate-y-0.5 hover:bg-purple-700"
              >
                Analyze my resume
                <span>→</span>
              </Link>
            </div>

            {/* Comparison */}
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-7">
              <div className="grid gap-5 md:grid-cols-2">
                {/* Before */}
                <div className="rounded-3xl border border-red-100 bg-white p-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-xs font-black text-red-500">
                      !
                    </span>

                    <span className="text-xs font-black uppercase tracking-[0.15em] text-red-500">
                      Before
                    </span>
                  </div>

                  <p className="mt-6 text-sm leading-7 text-slate-600">
                    Worked on a website project using React and helped improve
                    the application.
                  </p>

                  <div className="mt-6 rounded-2xl bg-red-50 p-4">
                    <p className="text-xs font-bold text-red-600">
                      Could be more specific
                    </p>
                  </div>
                </div>

                {/* After */}
                <div className="rounded-3xl border border-emerald-100 bg-white p-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-600">
                      ✓
                    </span>

                    <span className="text-xs font-black uppercase tracking-[0.15em] text-emerald-600">
                      After
                    </span>
                  </div>

                  <p className="mt-6 text-sm leading-7 text-slate-700">
                    Developed responsive React interfaces and improved the
                    application's usability through reusable components and
                    structured frontend implementation.
                  </p>

                  <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-bold text-emerald-700">
                      Clearer action + technology + impact
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-[11px] font-medium text-slate-400">
                Illustrative example — actual suggestions depend on your
                resume and target job description.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}
      <section
        id="how-it-works"
        className="border-y border-slate-100 bg-[#f8fafc]"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              How it works
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Simple from start to finish.
            </h2>
          </div>

          <div className="relative mt-14 grid gap-8 lg:grid-cols-3">
            {/* Connecting line */}
            <div className="absolute left-[16.66%] right-[16.66%] top-8 hidden h-px bg-slate-200 lg:block" />

            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#07152f] text-sm font-black text-white shadow-xl">
                  {step.number}
                </div>

                <h3 className="mt-7 text-xl font-black text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT
      ========================================================== */}
      <section id="about" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="rounded-[38px] bg-[#07152f] px-7 py-12 text-white shadow-2xl shadow-slate-900/10 sm:px-12 lg:px-16 lg:py-16">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                  Why HirePro
                </p>

                <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                  Your career deserves more than a collection of random
                  tools.
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
                  HirePro is designed as one connected career workspace where
                  your professional presence, resume creation and ATS
                  improvement live under one simple experience.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-slate-200">
                    AI-assisted
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-slate-200">
                    Career focused
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-slate-200">
                    Simple workflow
                  </span>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
                  <HireProLogo size="lg" showTagline />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================== */}
      <section>
        <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
          <div className="relative overflow-hidden rounded-[38px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-purple-50 px-7 py-14 text-center sm:px-12">
            <div className="absolute left-[-50px] top-[-50px] h-40 w-40 rounded-full bg-blue-200/30 blur-2xl" />
            <div className="absolute bottom-[-60px] right-[-40px] h-48 w-48 rounded-full bg-purple-200/30 blur-2xl" />

            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                Ready when you are
              </p>

              <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Start building a stronger professional presence.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
                Create your portfolio, build your resume or check your ATS
                score — all from your HirePro workspace.
              </p>

              <Link
                href="/dashboard"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#07152f] px-8 py-4 text-sm font-bold text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#102a57]"
              >
                Enter HirePro
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <HireProLogo size="sm" />

            <span className="hidden h-5 w-px bg-slate-200 sm:block" />

            <p className="text-xs font-medium text-slate-400">
              Your AI-powered career workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-500">
            <a href="#services" className="hover:text-slate-900">
              Services
            </a>

            <a href="#how-it-works" className="hover:text-slate-900">
              How it works
            </a>

            <a href="#about" className="hover:text-slate-900">
              About
            </a>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} HirePro
          </p>
        </div>
      </footer>
    </main>
  );
}