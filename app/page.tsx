const services = [
  {
    number: "01",
    title: "AI Portfolio Generator",
    description:
      "Turn your resume and professional information into a modern, personalized portfolio website.",
    action: "Create portfolio",
  },
  {
    number: "02",
    title: "ATS Resume Checker",
    description:
      "Analyze your resume against a job description and discover your ATS score, missing keywords and improvement areas.",
    action: "Check ATS score",
  },
  {
    number: "03",
    title: "AI Resume Builder",
    description:
      "Create a professional, ATS-friendly resume with AI assistance while keeping your information accurate.",
    action: "Build resume",
  },
  {
    number: "04",
    title: "AI Job Matching",
    description:
      "Find opportunities that match your skills, education, experience and career preferences.",
    action: "Find matching jobs",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Sign in securely with Google and build your career profile.",
  },
  {
    number: "02",
    title: "Add your experience",
    description:
      "Upload your resume or enter your education, skills, projects and experience.",
  },
  {
    number: "03",
    title: "Let AI help",
    description:
      "Generate portfolios, analyze resumes, improve ATS compatibility and match jobs.",
  },
  {
    number: "04",
    title: "Build your career",
    description:
      "Publish your portfolio, download your resume and discover relevant opportunities.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#f8fafc]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <a
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Career<span className="text-blue-600">AI</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#services" className="transition hover:text-blue-600">
              Services
            </a>
            <a href="#how-it-works" className="transition hover:text-blue-600">
              How it works
            </a>
            <a href="#about" className="transition hover:text-blue-600">
              About
            </a>
          </nav>

          <a
            href="/login"
            className="rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Sign in
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              AI-powered career platform
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Build your career
              <br />
              <span className="text-blue-600">with AI.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Create a professional portfolio, build and optimize ATS-friendly
              resumes, and discover jobs matched to your skills — all in one
              platform.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/login"
                className="rounded-full bg-[#0f172a] px-7 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600"
              >
                Start building →
              </a>

              <a
                href="/login"
                className="rounded-full border border-slate-300 bg-white px-7 py-3.5 font-semibold transition hover:border-blue-400 hover:text-blue-600"
              >
                Optimize resume
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
          <div className="px-6 py-10 text-center">
            <p className="text-3xl font-bold">AI</p>
            <p className="mt-2 text-sm text-slate-500">
              Powered career tools
            </p>
          </div>

          <div className="px-6 py-10 text-center">
            <p className="text-3xl font-bold">ATS</p>
            <p className="mt-2 text-sm text-slate-500">
              Resume optimization
            </p>
          </div>

          <div className="px-6 py-10 text-center">
            <p className="text-3xl font-bold">24/7</p>
            <p className="mt-2 text-sm text-slate-500">
              Career assistance
            </p>
          </div>

          <div className="px-6 py-10 text-center">
            <p className="text-3xl font-bold">1</p>
            <p className="mt-2 text-sm text-slate-500">
              Career platform
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Everything you need
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            One platform for your career.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            From building your online presence to finding your next
            opportunity, our AI tools work together around your career profile.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <a
              key={service.number}
              href="/login"
              className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-bold text-blue-600">
                  {service.number}
                </span>

                <span className="text-xl transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="mt-12 text-2xl font-bold">
                {service.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                {service.description}
              </p>

              <p className="mt-7 text-sm font-semibold text-blue-600">
                {service.action} →
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-[#0f172a] text-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              How it works
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Your career, organized in one place.
            </h2>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number}>
                <p className="text-sm font-bold text-blue-400">
                  {step.number}
                </p>

                <h3 className="mt-6 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Your career profile
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Build once.
              <br />
              Use everywhere.
            </h2>
          </div>

          <div>
            <p className="text-lg leading-8 text-slate-600">
              Your information becomes the foundation for everything you do on
              the platform. Your skills, education, projects and experience can
              power your portfolio, resume optimization and job matching.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                "Career profile",
                "AI assistance",
                "ATS analysis",
                "Job matching",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold"
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-blue-600 px-8 py-16 text-center text-white sm:px-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to build your career presence?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
            Start with your portfolio, resume or ATS score and let AI help you
            move forward.
          </p>

          <a
            href="/login"
            className="mt-9 inline-block rounded-full bg-white px-8 py-3.5 font-semibold text-blue-600 transition hover:bg-slate-100"
          >
            Get started →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-10 sm:flex-row lg:px-8">
          <div>
            <p className="font-bold">
              Career<span className="text-blue-600">AI</span>
            </p>

            <p className="mt-2 text-sm text-slate-500">
              AI-powered tools for your career.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} CareerAI. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}