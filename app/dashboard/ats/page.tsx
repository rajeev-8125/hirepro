"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

type ATSResult = {
  overallScore: number;
  summary: string;

  keywordMatch: {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  };

  formatting: {
    score: number;
    issues: string[];
  };

  experience: {
    score: number;
    strengths: string[];
    weaknesses: string[];
  };

  skills: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
  };

  recommendations: {
    priority: "high" | "medium" | "low";
    recommendation: string;
  }[];
};

type ResumeData = Record<string, unknown>;

type OptimizedResumeResponse = {
  success: boolean;
  optimizedResume: ResumeData;
  originalScore: number;
};

type Tab = "overview" | "keywords" | "experience" | "formatting";

export default function ATSPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const [optimizedResume, setOptimizedResume] =
    useState<ResumeData | null>(null);

  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  async function analyzeResume() {
    if (!file) {
      setMessage("Please upload your resume PDF.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);
    setOptimizedResume(null);

    try {
      const formData = new FormData();

      formData.append("resume", file);

      if (jobDescription.trim()) {
        formData.append(
          "jobDescription",
          jobDescription.trim()
        );
      }

      const response = await fetch(
        "/api/ats/check",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to analyze resume."
        );
      }

      setResult(data.result);
      setActiveTab("overview");
      setMessage(
        "Your ATS analysis is ready."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function improveResume() {
    if (!file || !result) {
      setMessage(
        "Complete an ATS analysis before improving your resume."
      );
      return;
    }

    setOptimizing(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("resume", file);
      formData.append(
        "atsResult",
        JSON.stringify(result)
      );

      if (jobDescription.trim()) {
        formData.append(
          "jobDescription",
          jobDescription.trim()
        );
      }

      const response = await fetch(
        "/api/ats/optimize",
        {
          method: "POST",
          body: formData,
        }
      );

      const data: OptimizedResumeResponse & {
        error?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to improve resume."
        );
      }

      setOptimizedResume(
        data.optimizedResume
      );

      setMessage(
        "Your resume has been improved using the ATS recommendations."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while improving the resume."
      );
    } finally {
      setOptimizing(false);
    }
  }

  function handleFile(
    selectedFile: File | null
  ) {
    if (!selectedFile) return;

    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      setMessage(
        "Please upload a PDF file."
      );
      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setMessage(
        "Resume must be smaller than 5 MB."
      );
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setResult(null);
    setOptimizedResume(null);
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    handleFile(
      event.target.files?.[0] ?? null
    );
  }

  function handleDrop(
    event: DragEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    setDragging(false);

    handleFile(
      event.dataTransfer.files?.[0] ?? null
    );
  }

  function removeFile() {
    setFile(null);
    setResult(null);
    setOptimizedResume(null);
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function getScoreLabel(score: number) {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Strong";
    if (score >= 55) return "Good";
    if (score >= 40)
      return "Needs improvement";

    return "Needs work";
  }

  function getScoreTone(score: number) {
    if (score >= 85)
      return "text-emerald-600";

    if (score >= 70)
      return "text-blue-600";

    if (score >= 55)
      return "text-amber-600";

    return "text-red-600";
  }

  function getProgressTone(score: number) {
    if (score >= 85)
      return "bg-emerald-500";

    if (score >= 70)
      return "bg-blue-600";

    if (score >= 55)
      return "bg-amber-500";

    return "bg-red-500";
  }

  function getScoreRing(score: number) {
    const radius = 74;
    const circumference =
      2 * Math.PI * radius;

    const progress =
      (Math.max(0, Math.min(100, score)) /
        100) *
      circumference;

    return {
      radius,
      circumference,
      progress,
    };
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-240px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-[-260px] right-[-160px] h-[500px] w-[500px] rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* TOP BAR */}
        <header className="flex items-center justify-between">
          <div>
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <span className="transition group-hover:-translate-x-1">
                ←
              </span>

              Dashboard
            </a>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg text-white shadow-sm">
                ◎
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  HirePro AI
                </p>

                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  ATS Resume Checker
                </h1>
              </div>
            </div>
          </div>

          <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm sm:block">
            AI-powered resume analysis
          </div>
        </header>

        {/* HERO */}
        {!result && (
          <section className="mx-auto max-w-4xl py-16 text-center lg:py-20">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              ATS compatibility analysis
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Make your resume
              <br />
              <span className="text-blue-600">
                easier for ATS to understand.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Upload your resume, add a target job
              description, and get an intelligent analysis
              of your keywords, skills, experience and
              formatting.
            </p>
          </section>
        )}

        {/* INPUT WORKSPACE */}
        {!result && (
          <section className="mx-auto max-w-5xl">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
                {/* RESUME */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                        Step 01
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        Upload your resume
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        PDF · Maximum 5 MB
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                      Required
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleInputChange}
                  />

                  {!file ? (
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() =>
                        setDragging(false)
                      }
                      onDrop={handleDrop}
                      className={`mt-5 flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
                        dragging
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
                      }`}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-2xl shadow-sm">
                        ↑
                      </div>

                      <p className="mt-5 font-semibold text-slate-800">
                        Drop your resume here
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        or{" "}
                        <span className="font-semibold text-blue-600">
                          browse files
                        </span>
                      </p>

                      <p className="mt-4 text-xs text-slate-400">
                        Text-based PDF recommended
                      </p>
                    </button>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-bold text-blue-600 shadow-sm">
                          PDF
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">
                            {file.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(
                              2
                            )}{" "}
                            MB · Ready for analysis
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={removeFile}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/80 px-4 py-3 text-xs text-slate-600">
                        <span className="font-bold text-emerald-600">
                          ✓
                        </span>
                        Resume validated successfully
                      </div>
                    </div>
                  )}
                </div>

                {/* JOB DESCRIPTION */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                        Step 02
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        Target job description
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Get a more precise analysis.
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                      Optional
                    </span>
                  </div>

                  <textarea
                    value={jobDescription}
                    onChange={(event) =>
                      setJobDescription(
                        event.target.value
                      )
                    }
                    placeholder="Paste the job description here..."
                    rows={10}
                    className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <span>◎</span>
                    Recommended for job-specific keyword matching
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div className="mt-8 border-t border-slate-100 pt-7">
                <button
                  type="button"
                  onClick={analyzeResume}
                  disabled={loading || !file}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Analyzing your resume...
                    </>
                  ) : (
                    <>
                      Analyze My Resume
                      <span className="transition group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </button>
              </div>

              {message && (
                <p className="mt-4 text-center text-sm text-slate-500">
                  {message}
                </p>
              )}
            </div>
          </section>
        )}

        {/* RESULTS */}
        {result && (
          <section className="mt-10">
            {/* RESULT HEADER */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  ATS analysis complete
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Your resume health report
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Review your resume's strengths and the
                  improvements that can make it more
                  competitive for your target role.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setOptimizedResume(null);
                  setMessage("");
                }}
                className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                ← New ATS Check
              </button>
            </div>

            {/* SCORE HERO */}
            <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="grid lg:grid-cols-[330px_1fr]">
                {/* SCORE */}
                <div className="flex flex-col items-center justify-center border-b border-slate-100 px-6 py-10 lg:border-b-0 lg:border-r">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Overall ATS score
                  </p>

                  <div className="relative mt-7 h-[190px] w-[190px]">
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 190 190"
                    >
                      <circle
                        cx="95"
                        cy="95"
                        r="74"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="11"
                        className="text-slate-100"
                      />

                      <circle
                        cx="95"
                        cy="95"
                        r={
                          getScoreRing(
                            result.overallScore
                          ).radius
                        }
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeDasharray={
                          getScoreRing(
                            result.overallScore
                          ).circumference
                        }
                        strokeDashoffset={
                          getScoreRing(
                            result.overallScore
                          ).circumference -
                          getScoreRing(
                            result.overallScore
                          ).progress
                        }
                        className={getScoreTone(
                          result.overallScore
                        )}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold tracking-tight text-slate-950">
                        {result.overallScore}
                      </span>

                      <span className="text-xs font-medium text-slate-400">
                        out of 100
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-4 rounded-full px-4 py-1.5 text-sm font-bold ${
                      result.overallScore >= 70
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {getScoreLabel(
                      result.overallScore
                    )}
                  </div>
                </div>

                {/* SUMMARY */}
                <div className="p-7 sm:p-9">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                      AI
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        AI assessment
                      </p>

                      <p className="text-xs text-slate-400">
                        Personalized resume feedback
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                    {result.summary}
                  </p>

                  <div className="mt-8">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>ATS readiness</span>
                      <span>
                        {result.overallScore}%
                      </span>
                    </div>

                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressTone(
                          result.overallScore
                        )}`}
                        style={{
                          width: `${result.overallScore}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SCORE BREAKDOWN */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreCard
                title="Keywords"
                score={
                  result.keywordMatch.score
                }
                icon="⌕"
              />

              <ScoreCard
                title="Skills"
                score={result.skills.score}
                icon="✦"
              />

              <ScoreCard
                title="Experience"
                score={
                  result.experience.score
                }
                icon="◫"
              />

              <ScoreCard
                title="Formatting"
                score={
                  result.formatting.score
                }
                icon="▤"
              />
            </div>

            {/* TABS */}
            <div className="mt-8 overflow-x-auto">
              <div className="inline-flex min-w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:min-w-0">
                <TabButton
                  active={
                    activeTab === "overview"
                  }
                  onClick={() =>
                    setActiveTab("overview")
                  }
                >
                  Overview
                </TabButton>

                <TabButton
                  active={
                    activeTab === "keywords"
                  }
                  onClick={() =>
                    setActiveTab("keywords")
                  }
                >
                  Keywords & Skills
                </TabButton>

                <TabButton
                  active={
                    activeTab === "experience"
                  }
                  onClick={() =>
                    setActiveTab("experience")
                  }
                >
                  Experience
                </TabButton>

                <TabButton
                  active={
                    activeTab === "formatting"
                  }
                  onClick={() =>
                    setActiveTab("formatting")
                  }
                >
                  Formatting
                </TabButton>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="mt-5">
              {activeTab === "overview" && (
                <OverviewTab
                  result={result}
                  onImprove={improveResume}
                  optimizing={optimizing}
                  optimizedResume={
                    optimizedResume
                  }
                />
              )}

              {activeTab === "keywords" && (
                <KeywordsTab
                  result={result}
                />
              )}

              {activeTab === "experience" && (
                <ExperienceTab
                  result={result}
                />
              )}

              {activeTab === "formatting" && (
                <FormattingTab
                  result={result}
                />
              )}
            </div>

            {message && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-600 shadow-sm">
                {message}
              </div>
            )}
          </section>
        )}

        {/* INITIAL FOOTER */}
        {!result && (
          <div className="mx-auto mt-10 max-w-4xl pb-10 text-center">
            <p className="text-xs text-slate-400">
              Your resume is analyzed securely and
              recommendations are generated using AI.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* SCORE CARD                                                                  */
/* -------------------------------------------------------------------------- */

function ScoreCard({
  title,
  score,
  icon,
}: {
  title: string;
  score: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-sm font-bold text-slate-600">
            {icon}
          </div>

          <p className="text-sm font-semibold text-slate-600">
            {title}
          </p>
        </div>

        <span className="text-xl font-bold text-slate-950">
          {score}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${
            score >= 85
              ? "bg-emerald-500"
              : score >= 70
              ? "bg-blue-600"
              : score >= 55
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
          style={{
            width: `${Math.max(
              0,
              Math.min(100, score)
            )}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {score >= 85
          ? "Excellent"
          : score >= 70
          ? "Strong"
          : score >= 55
          ? "Needs attention"
          : "Needs improvement"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TAB BUTTON                                                                  */
/* -------------------------------------------------------------------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* OVERVIEW TAB                                                                */
/* -------------------------------------------------------------------------- */

function OverviewTab({
  result,
  onImprove,
  optimizing,
  optimizedResume,
}: {
  result: ATSResult;
  onImprove: () => void;
  optimizing: boolean;
  optimizedResume: ResumeData | null;
}) {
  return (
    <div className="space-y-5">
      {/* RECOMMENDATIONS */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              What to improve
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              AI recommendations
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Prioritized actions based on your ATS analysis.
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
            {result.recommendations.length} recommendations
          </div>
        </div>

        <div className="mt-7 space-y-3">
          {result.recommendations.map(
            (item, index) => (
              <Recommendation
                key={index}
                priority={item.priority}
                recommendation={
                  item.recommendation
                }
              />
            )
          )}
        </div>

        {/* IMPROVE ACTION */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-slate-950 p-6 text-white sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm">
                  ✦
                </span>

                <p className="text-sm font-bold">
                  Ready to improve your resume?
                </p>
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                HirePro AI can apply the relevant ATS
                recommendations to your existing resume
                while preserving your actual career information.
              </p>
            </div>

            <button
              type="button"
              onClick={onImprove}
              disabled={
                optimizing ||
                Boolean(optimizedResume)
              }
              className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {optimizing
                ? "Improving resume..."
                : optimizedResume
                ? "Resume improved ✓"
                : "Improve My Resume →"}
            </button>
          </div>
        </div>
      </div>

      {/* OPTIMIZATION SUCCESS */}
      {optimizedResume && (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-bold text-emerald-600 shadow-sm">
              ✓
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-900">
                Resume optimization complete
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-800/80">
                Your optimized resume data is ready. The
                next step will connect this result to your
                existing resume PDF generator and provide
                a before-and-after ATS comparison.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STRENGTHS */}
      <div className="grid gap-5 md:grid-cols-2">
        <InsightCard
          title="Experience strengths"
          items={result.experience.strengths}
          empty="No specific strengths were identified."
        />

        <InsightCard
          title="Experience areas to improve"
          items={result.experience.weaknesses}
          empty="No major weaknesses were identified."
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* KEYWORDS TAB                                                                */
/* -------------------------------------------------------------------------- */

function KeywordsTab({
  result,
}: {
  result: ATSResult;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <TagPanel
        title="Matched keywords"
        description="Keywords already detected in your resume."
        items={
          result.keywordMatch
            .matchedKeywords
        }
        type="matched"
      />

      <TagPanel
        title="Missing keywords"
        description="Keywords that could improve alignment."
        items={
          result.keywordMatch
            .missingKeywords
        }
        type="missing"
      />

      <TagPanel
        title="Matched skills"
        description="Relevant skills detected in your resume."
        items={
          result.skills.matchedSkills
        }
        type="matched"
      />

      <TagPanel
        title="Missing skills"
        description="Skills identified as potential gaps."
        items={
          result.skills.missingSkills
        }
        type="missing"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EXPERIENCE TAB                                                              */
/* -------------------------------------------------------------------------- */

function ExperienceTab({
  result,
}: {
  result: ATSResult;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Experience analysis
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            How your experience reads
          </h3>
        </div>

        <div className="hidden rounded-xl bg-slate-50 px-4 py-3 text-center sm:block">
          <p className="text-2xl font-bold text-slate-950">
            {result.experience.score}
          </p>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Score
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <InsightCard
          title="Strengths"
          items={result.experience.strengths}
          empty="No specific strengths were identified."
        />

        <InsightCard
          title="Areas to improve"
          items={result.experience.weaknesses}
          empty="No major weaknesses were identified."
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FORMATTING TAB                                                              */
/* -------------------------------------------------------------------------- */

function FormattingTab({
  result,
}: {
  result: ATSResult;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            ATS formatting
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            Resume parsing readiness
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Potential formatting issues that may affect ATS readability.
          </p>
        </div>

        <div className="hidden rounded-xl bg-slate-50 px-4 py-3 text-center sm:block">
          <p className="text-2xl font-bold text-slate-950">
            {result.formatting.score}
          </p>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Score
          </p>
        </div>
      </div>

      <div className="mt-8">
        {result.formatting.issues.length ===
        0 ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-emerald-600">
                ✓
              </span>

              <div>
                <p className="font-bold text-emerald-900">
                  No major formatting issues detected
                </p>

                <p className="mt-1 text-sm text-emerald-800/70">
                  Your resume appears readable from an ATS formatting perspective.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {result.formatting.issues.map(
              (issue, index) => (
                <li
                  key={index}
                  className="flex gap-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-amber-600">
                    !
                  </span>

                  <p className="pt-1 text-sm leading-6 text-slate-700">
                    {issue}
                  </p>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RECOMMENDATION                                                              */
/* -------------------------------------------------------------------------- */

function Recommendation({
  priority,
  recommendation,
}: {
  priority: "high" | "medium" | "low";
  recommendation: string;
}) {
  const config = {
    high: {
      label: "High priority",
      className:
        "border-red-100 bg-red-50/60 text-red-700",
      icon: "!",
    },
    medium: {
      label: "Medium priority",
      className:
        "border-amber-100 bg-amber-50/60 text-amber-700",
      icon: "•",
    },
    low: {
      label: "Low priority",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
      icon: "↓",
    },
  };

  const item = config[priority];

  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm sm:p-5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${item.className}`}
      >
        {item.icon}
      </div>

      <div className="min-w-0">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.className}`}
        >
          {item.label}
        </span>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {recommendation}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* INSIGHT CARD                                                                */
/* -------------------------------------------------------------------------- */

function InsightCard({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <h4 className="text-sm font-bold text-slate-800">
        {title}
      </h4>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          {empty}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex gap-3 text-sm leading-6 text-slate-600"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TAG PANEL                                                                  */
/* -------------------------------------------------------------------------- */

function TagPanel({
  title,
  description,
  items,
  type,
}: {
  title: string;
  description: string;
  items: string[];
  type: "matched" | "missing";
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
              type === "matched"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {type === "matched"
              ? "✓"
              : "+"}
          </span>

          <h3 className="text-lg font-bold">
            {title}
          </h3>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-7 rounded-2xl bg-slate-50 p-5 text-sm text-slate-400">
          None found.
        </p>
      ) : (
        <div className="mt-7 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                type === "matched"
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-amber-100 bg-amber-50 text-amber-700"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}