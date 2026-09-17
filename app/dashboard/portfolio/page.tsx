"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PortfolioGeneratorPage() {
  const router = useRouter();

  const [resume, setResume] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [designDescription, setDesignDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profileImage) {
      setProfilePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(profileImage);
    setProfilePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImage]);

  async function handleGenerate() {
    setError("");

    if (!resume) {
      setError("Please upload your resume PDF.");
      return;
    }

    if (resume.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      return;
    }

    if (resume.size > 10 * 1024 * 1024) {
      setError("Resume must be smaller than 10 MB.");
      return;
    }

    if (profileImage) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(profileImage.type)) {
        setError("Profile photo must be JPG, PNG or WebP.");
        return;
      }

      if (profileImage.size > 5 * 1024 * 1024) {
        setError("Profile photo must be smaller than 5 MB.");
        return;
      }
    }

    if (!designDescription.trim()) {
      setError("Please describe how you want your portfolio to look.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("file", resume);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      formData.append("designDescription", designDescription);

      const response = await fetch("/api/portfolio/generate", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Portfolio generation failed.",
        );
      }

      if (result.portfolio?.id) {
        router.push(`/dashboard/portfolio/${result.portfolio.id}`);
      } else {
        throw new Error(
          "Portfolio was generated but no portfolio ID was returned.",
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleResumeChange(file: File | null) {
    setResume(file);
    setError("");
  }

  function handleProfileChange(file: File | null) {
    setProfileImage(file);
    setError("");
  }

  function removeProfileImage() {
    setProfileImage(null);
    setProfilePreview(null);
    setError("");
  }

  const designIdeas = [
    {
      title: "Modern Developer",
      text: "Modern dark developer portfolio with dark navy and blue colors, clean typography, subtle animations and my photo on the right side.",
    },
    {
      title: "Minimal Professional",
      text: "Minimal white portfolio with clean typography, blue accents, lots of whitespace and a professional corporate feeling.",
    },
    {
      title: "Creative",
      text: "Creative portfolio with purple and blue gradients, modern cards, subtle animations and a visually impressive project section.",
    },
    {
      title: "Elegant",
      text: "Elegant professional portfolio with a sophisticated layout, refined typography, subtle colors and my photo integrated into the hero.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* TOP NAV */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-xl font-black text-white shadow-lg shadow-blue-200">
              H
            </div>

            <div className="text-left">
              <div className="text-lg font-black tracking-tight text-slate-950">
                Hire<span className="text-blue-600">Pro</span>
              </div>

              <div className="hidden text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 sm:block">
                Career Workspace
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* PAGE */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
          {/* PAGE HEADER */}
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                AI
              </span>
              AI Portfolio Generator
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Turn your resume into a{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                professional portfolio.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Upload your resume, optionally add your profile photo, and
              describe the experience you want. HirePro AI creates your
              portfolio around your actual information and your design
              preferences.
            </p>
          </div>

          {/* STEPS */}
          <div className="mx-auto mt-10 flex max-w-3xl items-center justify-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <StepIndicator number="1" label="Resume" active />

              <div className="h-px w-8 bg-slate-200 sm:w-16" />

              <StepIndicator number="2" label="Photo" />

              <div className="h-px w-8 bg-slate-200 sm:w-16" />

              <StepIndicator number="3" label="Design" />
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.85fr]">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* RESUME CARD */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <SectionHeading
                  step="01"
                  eyebrow="YOUR CONTENT"
                  title="Upload your resume"
                  description="Your resume is the source for your portfolio content."
                />

                <label className="group mt-7 block cursor-pointer">
                  <div
                    className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-7 text-center transition sm:p-10 ${
                      resume
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
                    }`}
                  >
                    {resume ? (
                      <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
                          ✓
                        </div>

                        <p className="mt-5 break-all text-sm font-bold text-slate-900 sm:text-base">
                          {resume.name}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          {(resume.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        <div className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100">
                          Change resume
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-slate-200">
                          📄
                        </div>

                        <p className="mt-5 text-base font-bold text-slate-900">
                          Drop your resume here
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          or choose a PDF from your computer
                        </p>

                        <div className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition group-hover:bg-blue-600">
                          Choose PDF
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                          PDF only • Maximum 10 MB
                        </p>
                      </>
                    )}

                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file =
                          event.target.files?.[0] || null;

                        handleResumeChange(file);
                      }}
                    />
                  </div>
                </label>
              </section>

              {/* PROFILE PHOTO */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <SectionHeading
                  step="02"
                  eyebrow="OPTIONAL"
                  title="Add your profile photo"
                  description="Your AI-generated design can position your photo naturally."
                />

                <div className="mt-7 flex flex-col items-center rounded-2xl bg-slate-50 p-7 sm:p-9">
                  {profilePreview ? (
                    <>
                      <div className="relative">
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          className="h-36 w-36 rounded-full object-cover shadow-xl ring-4 ring-white"
                        />

                        <button
                          type="button"
                          onClick={removeProfileImage}
                          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white shadow-lg transition hover:bg-red-600"
                          aria-label="Remove profile photo"
                        >
                          ×
                        </button>
                      </div>

                      <p className="mt-5 max-w-full break-all text-sm font-bold text-slate-800">
                        {profileImage?.name}
                      </p>

                      <label className="mt-4 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                        Change Photo

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(event) => {
                            const file =
                              event.target.files?.[0] || null;

                            handleProfileChange(file);
                          }}
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-5xl shadow-inner">
                        👤
                      </div>

                      <label className="mt-6 cursor-pointer rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700">
                        Upload Photo

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(event) => {
                            const file =
                              event.target.files?.[0] || null;

                            handleProfileChange(file);
                          }}
                        />
                      </label>

                      <p className="mt-3 text-xs text-slate-400">
                        JPG, PNG or WebP • Maximum 5 MB
                      </p>
                    </>
                  )}
                </div>
              </section>

              {/* DESIGN DESCRIPTION */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <SectionHeading
                  step="03"
                  eyebrow="AI DESIGN"
                  title="Describe your ideal portfolio"
                  description="You don't need design or coding knowledge. Just explain what you want."
                />

                <div className="relative mt-7">
                  <textarea
                    value={designDescription}
                    onChange={(event) =>
                      setDesignDescription(event.target.value)
                    }
                    placeholder="Example: I want a modern dark developer portfolio with dark blue and purple colors. Put my photo on the right side of the hero section. Make my projects stand out, use subtle animations, and keep everything professional and clean."
                    rows={8}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 shadow-sm ring-1 ring-slate-100">
                    AI understands natural language
                  </div>
                </div>

                {/* IDEAS */}
                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Design inspiration
                    </p>

                    <span className="text-xs text-slate-400">
                      Click to use
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {designIdeas.map((idea) => (
                      <button
                        key={idea.title}
                        type="button"
                        onClick={() =>
                          setDesignDescription(idea.text)
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                            {idea.title}
                          </span>

                          <span className="text-slate-300 transition group-hover:text-blue-500">
                            →
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {idea.text}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {/* PREVIEW HEADER */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-7 text-white sm:p-8">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl" />
                  <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
                        AI Workspace
                      </span>

                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Ready
                      </span>
                    </div>

                    <h2 className="mt-8 text-2xl font-black tracking-tight sm:text-3xl">
                      Your portfolio,
                      <br />
                      your identity.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-blue-100/75">
                      HirePro uses your real resume information and your
                      design instructions to create your portfolio.
                    </p>
                  </div>
                </div>

                {/* PREVIEW BODY */}
                <div className="p-6 sm:p-7">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Generation includes
                  </p>

                  <div className="mt-5 space-y-3">
                    <FeatureItem
                      icon="✓"
                      title="Your real professional content"
                      description="AI extracts information from your resume."
                    />

                    <FeatureItem
                      icon="✦"
                      title="AI-generated visual design"
                      description="Your description guides the portfolio appearance."
                    />

                    <FeatureItem
                      icon="◎"
                      title="Responsive portfolio"
                      description="Designed for desktop, tablet and mobile."
                    />

                    <FeatureItem
                      icon="↓"
                      title="Resume access"
                      description="Your uploaded resume can be available from the portfolio."
                    />
                  </div>

                  {/* STATUS */}
                  {loading && (
                    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

                        <div>
                          <p className="text-sm font-bold text-blue-900">
                            Creating your portfolio...
                          </p>

                          <p className="mt-1 text-xs leading-5 text-blue-700/70">
                            AI is reading your resume and generating your
                            portfolio design. Please keep this page open.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ERROR */}
                  {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black text-red-600">
                          !
                        </div>

                        <div>
                          <p className="text-sm font-bold text-red-800">
                            Something needs your attention
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-700">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GENERATE BUTTON */}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={
                      !resume ||
                      !designDescription.trim() ||
                      loading
                    }
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating Portfolio...
                      </>
                    ) : (
                      <>
                        <span>✦</span>
                        Generate My Portfolio
                      </>
                    )}
                  </button>

                  {!resume && (
                    <p className="mt-3 text-center text-xs text-slate-400">
                      Upload your resume to continue
                    </p>
                  )}

                  {resume && !designDescription.trim() && (
                    <p className="mt-3 text-center text-xs text-slate-400">
                      Describe your design to continue
                    </p>
                  )}
                </div>
              </div>

              {/* TRUST NOTE */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    🔒
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Your information stays yours
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      HirePro uses the information you provide to generate
                      your portfolio. AI should not invent your experience,
                      education or achievements.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* BOTTOM INFO */}
          <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
            <InfoCard
              number="01"
              title="Real content"
              description="Your portfolio is built from the information in your uploaded resume."
            />

            <InfoCard
              number="02"
              title="Your creative direction"
              description="Tell AI how you want the portfolio to look using normal language."
            />

            <InfoCard
              number="03"
              title="Ready to customize"
              description="After generation, you can review your portfolio and continue improving it."
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function StepIndicator({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
          active
            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
            : "bg-white text-slate-400 ring-1 ring-slate-200"
        }`}
      >
        {number}
      </div>

      <span
        className={`hidden text-xs font-bold sm:block ${
          active ? "text-slate-800" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function SectionHeading({
  step,
  eyebrow,
  title,
  description,
}: {
  step: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[10px] font-black text-blue-600">
          {step}
        </span>

        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
          {eyebrow}
        </span>
      </div>

      <h2 className="mt-4 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-600 shadow-sm ring-1 ring-slate-100">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-800">{title}</p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="text-xs font-black text-blue-600">{number}</span>

      <h3 className="mt-2 text-sm font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}