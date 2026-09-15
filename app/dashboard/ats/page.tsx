"use client";

import { useRef, useState } from "react";

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

export default function ATSPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function analyzeResume() {
    if (!file) {
      setMessage("Please upload your resume PDF.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("resume", file);

      if (jobDescription.trim()) {
        formData.append(
          "jobDescription",
          jobDescription.trim()
        );
      }

      const response = await fetch("/api/ats/check", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to analyze resume."
        );
      }

      setResult(data.result);
      setMessage("Analysis completed successfully.");
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

  function handleFile(file: File | null) {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setMessage("Please upload a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Resume must be smaller than 5 MB.");
      return;
    }

    setFile(file);
    setMessage("");
    setResult(null);
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs improvement";
    return "Needs work";
  }

  function getScoreWidth(score: number) {
    return `${Math.max(0, Math.min(100, score))}%`;
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* HEADER */}
        <header className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            HirePro AI
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Know how ATS-ready
            <br />
            <span className="text-blue-600">
              your resume really is.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Upload your resume and let HirePro AI analyze
            keywords, skills, experience and formatting
            before you apply.
          </p>
        </header>

        {/* INPUT AREA */}
        <section className="mx-auto mt-10 max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] sm:p-7">

            {/* RESUME */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Upload your resume
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    PDF format · Maximum 5 MB
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Required
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(event) =>
                  handleFile(
                    event.target.files?.[0] ?? null
                  )
                }
              />

              {!file ? (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    📄
                  </div>

                  <p className="mt-4 font-semibold text-slate-800">
                    Drop your resume here
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    or{" "}
                    <span className="font-semibold text-blue-600">
                      browse your files
                    </span>
                  </p>
                </button>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                      📄
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      setMessage("");

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="ml-4 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-white hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* JOB DESCRIPTION */}
            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Target job description
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Add one to get a job-specific ATS analysis.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Optional
                </span>
              </div>

              <textarea
                value={jobDescription}
                onChange={(event) =>
                  setJobDescription(event.target.value)
                }
                placeholder="Paste the job description here..."
                rows={7}
                className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* ACTION */}
            <button
              type="button"
              onClick={analyzeResume}
              disabled={loading || !file}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing your resume...
                </>
              ) : (
                <>
                  Analyze My Resume
                  <span>→</span>
                </>
              )}
            </button>

            {message && (
              <p className="mt-4 text-center text-sm text-slate-500">
                {message}
              </p>
            )}
          </div>
        </section>

        {/* RESULTS */}
        {result && (
          <section className="mx-auto mt-10 max-w-5xl space-y-5">

            {/* SCORE */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid md:grid-cols-[260px_1fr]">

                <div className="flex flex-col items-center justify-center border-b border-slate-100 px-6 py-10 text-center md:border-b-0 md:border-r">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Overall ATS Score
                  </p>

                  <div className="mt-5 text-7xl font-bold tracking-tight text-slate-900">
                    {result.overallScore}
                    <span className="text-2xl font-medium text-slate-300">
                      /100
                    </span>
                  </div>

                  <span className="mt-3 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                    {getScoreLabel(result.overallScore)}
                  </span>
                </div>

                <div className="p-6 sm:p-8">
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    AI Summary
                  </p>

                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {result.summary}
                  </p>

                  <div className="mt-7 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: getScoreWidth(
                          result.overallScore
                        ),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SCORE BREAKDOWN */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreCard
                title="Keywords"
                score={result.keywordMatch.score}
              />

              <ScoreCard
                title="Skills"
                score={result.skills.score}
              />

              <ScoreCard
                title="Experience"
                score={result.experience.score}
              />

              <ScoreCard
                title="Formatting"
                score={result.formatting.score}
              />
            </div>

            {/* KEYWORDS */}
            <ResultSection
              title="Keyword match"
              description="See what your resume matches and what may be missing."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <TagList
                  title="Matched keywords"
                  items={
                    result.keywordMatch.matchedKeywords
                  }
                  type="success"
                />

                <TagList
                  title="Missing keywords"
                  items={
                    result.keywordMatch.missingKeywords
                  }
                  type="warning"
                />
              </div>
            </ResultSection>

            {/* SKILLS */}
            <ResultSection
              title="Skills analysis"
              description="Understand how well your technical and professional skills align."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <TagList
                  title="Matched skills"
                  items={result.skills.matchedSkills}
                  type="success"
                />

                <TagList
                  title="Missing skills"
                  items={result.skills.missingSkills}
                  type="warning"
                />
              </div>
            </ResultSection>

            {/* EXPERIENCE */}
            <ResultSection
              title="Experience analysis"
              description="How effectively your experience is presented."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <BulletList
                  title="Strengths"
                  items={result.experience.strengths}
                />

                <BulletList
                  title="Areas to improve"
                  items={result.experience.weaknesses}
                />
              </div>
            </ResultSection>

            {/* FORMATTING */}
            <ResultSection
              title="ATS formatting"
              description="Potential issues that could affect resume parsing."
            >
              {result.formatting.issues.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                  No major formatting issues were detected.
                </div>
              ) : (
                <BulletList
                  title="Issues detected"
                  items={result.formatting.issues}
                />
              )}
            </ResultSection>

            {/* RECOMMENDATIONS */}
            <ResultSection
              title="AI recommendations"
              description="Prioritized actions you can take to improve your resume."
            >
              <div className="space-y-3">
                {result.recommendations.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <PriorityBadge
                        priority={item.priority}
                      />

                      <p className="pt-0.5 text-sm leading-6 text-slate-700">
                        {item.recommendation}
                      </p>
                    </div>
                  )
                )}
              </div>
            </ResultSection>
          </section>
        )}

        {/* EMPTY STATE */}
        {!result && !loading && (
          <div className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-sm text-slate-400">
              Your detailed ATS report will appear here after
              analysis.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function ScoreCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <span className="text-xl font-bold text-slate-900">
          {score}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${score}%`,
          }}
        />
      </div>
    </div>
  );
}

function ResultSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-6">{children}</div>
    </div>
  );
}

function TagList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "success" | "warning";
}) {
  const containerClass =
    type === "success"
      ? "border-slate-100 bg-slate-50"
      : "border-amber-100 bg-amber-50/50";

  return (
    <div
      className={`rounded-2xl border p-5 ${containerClass}`}
    >
      <h3 className="text-sm font-semibold text-slate-700">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          None found.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="rounded-full border border-white bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
            >
              {type === "success" ? "✓ " : "＋ "}
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BulletList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">
          None found.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex gap-3 text-sm leading-6 text-slate-600"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: "high" | "medium" | "low";
}) {
  const classes = {
    high: "bg-red-50 text-red-700",
    medium: "bg-amber-50 text-amber-700",
    low: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`h-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${classes[priority]}`}
    >
      {priority}
    </span>
  );
}