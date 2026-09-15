"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

import type { ATSResult } from "@/lib/ai/ats-schema";
import type { ResumeData } from "@/lib/ai/resume-schema";

type Tab =
  | "overview"
  | "keywords"
  | "experience"
  | "formatting";

export default function ATSPage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [jobDescription, setJobDescription] =
    useState("");

  const [result, setResult] =
    useState<ATSResult | null>(null);

  const [optimizedATSResult, setOptimizedATSResult] =
    useState<ATSResult | null>(null);

  const [optimizedResume, setOptimizedResume] =
    useState<ResumeData | null>(null);

  const [optimizedDesign, setOptimizedDesign] =
    useState<unknown | null>(null);

  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const [analyzing, setAnalyzing] =
    useState(false);

  const [optimizing, setOptimizing] =
    useState(false);

  const [downloadLoading, setDownloadLoading] =
    useState(false);

  const [dragActive, setDragActive] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  function resetOptimization() {
    setOptimizedResume(null);
    setOptimizedDesign(null);
    setOptimizedATSResult(null);
  }

  function handleFile(selectedFile: File | null) {
    setError("");
    setMessage("");

    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      setError(
        "Please upload a PDF resume."
      );
      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Resume must be smaller than 5 MB."
      );
      return;
    }

    setFile(selectedFile);
    setResult(null);
    resetOptimization();
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    handleFile(selectedFile);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0] ??
      null;

    handleFile(droppedFile);
  }

  function removeFile() {
    setFile(null);
    setResult(null);
    resetOptimization();
    setError("");
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function analyzeResume() {
    if (!file) {
      setError(
        "Please upload your resume first."
      );
      return;
    }

    setAnalyzing(true);
    setError("");
    setMessage("");
    setResult(null);
    resetOptimization();

    try {
      const formData = new FormData();

      formData.append(
        "resume",
        file
      );

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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to analyze resume."
        );
      }

      if (!data.result) {
        throw new Error(
          "ATS analysis did not return a result."
        );
      }

      setResult(data.result);
      setActiveTab("overview");

      setMessage(
        "Your ATS analysis is ready."
      );
    } catch (error) {
      console.error(
        "ATS analysis error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to analyze your resume."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function improveResume() {
    if (!file || !result) {
      setError(
        "Complete an ATS analysis before improving your resume."
      );
      return;
    }

    setOptimizing(true);
    setError("");
    setMessage("");
    resetOptimization();

    try {
      /*
       * --------------------------------------------------
       * STEP 1
       * Send the original resume + ATS analysis
       * to the AI optimizer.
       * --------------------------------------------------
       */

      const formData =
        new FormData();

      formData.append(
        "resume",
        file
      );

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

      const optimizeResponse =
        await fetch(
          "/api/ats/optimize",
          {
            method: "POST",
            body: formData,
          }
        );

      const optimizeData =
        await optimizeResponse.json();

      if (!optimizeResponse.ok) {
        throw new Error(
          optimizeData.error ||
            "Failed to improve your resume."
        );
      }

      if (
        !optimizeData.optimizedResume
      ) {
        throw new Error(
          "The AI did not return an optimized resume."
        );
      }

      const newResume =
        optimizeData.optimizedResume;

      setOptimizedResume(
        newResume
      );

      setOptimizedDesign(
        optimizeData.optimizedDesign ??
          null
      );

      /*
       * --------------------------------------------------
       * STEP 2
       * Re-check the optimized resume using the
       * same ATS analysis engine.
       * --------------------------------------------------
       */

      setMessage(
        "Resume improved. Re-checking ATS compatibility..."
      );

      const verifyResponse =
        await fetch(
          "/api/ats/verify",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              resume: newResume,
              jobDescription:
                jobDescription.trim(),
            }),
          }
        );

      const verifyData =
        await verifyResponse.json();

      if (!verifyResponse.ok) {
        /*
         * The resume was still optimized.
         * We simply don't show a fake AFTER score.
         */
        setMessage(
          "Your resume was optimized, but the new ATS score could not be calculated."
        );

        return;
      }

      if (!verifyData.result) {
        setMessage(
          "Your resume was optimized, but verification did not return a score."
        );

        return;
      }

      /*
       * --------------------------------------------------
       * STEP 3
       * Store the verified AFTER result.
       * --------------------------------------------------
       */

      setOptimizedATSResult(
        verifyData.result
      );

      setMessage(
        "Optimization complete. Your improved ATS score is ready."
      );
    } catch (error) {
      console.error(
        "Resume optimization error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while improving your resume."
      );
    } finally {
      setOptimizing(false);
    }
  }

  async function downloadOptimizedResume() {
    if (!optimizedResume) {
      setError(
        "There is no optimized resume to download."
      );
      return;
    }

    setDownloadLoading(true);
    setError("");

    try {
      /*
       * The existing Resume Builder PDF endpoint
       * is used so the Resume Builder itself remains
       * untouched.
       */

      const response =
        await fetch(
          "/api/resume/pdf",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              resume:
                optimizedResume,
              design:
                optimizedDesign,
            }),
          }
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.error ||
            "Failed to generate the optimized PDF."
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "hirepro-optimized-resume.pdf";

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to download optimized resume."
      );
    } finally {
      setDownloadLoading(false);
    }
  }

  const score =
    result?.overallScore ?? 0;

  const afterScore =
    optimizedATSResult?.overallScore ??
    null;

  const scoreDifference =
    afterScore !== null
      ? afterScore - score
      : null;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <a
            href="/dashboard"
            className="text-xl font-bold tracking-tight"
          >
            Career
            <span className="text-blue-600">
              AI
            </span>
          </a>

          <a
            href="/dashboard"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        {/* ==================================================
            HERO
        ================================================== */}

        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            AI ATS Analyzer
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            See how ATS-ready
            <br />
            your resume really is.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Upload your resume and optionally add a
            job description. HirePro analyzes
            keywords, skills, experience and formatting
            to show where your resume can improve.
          </p>
        </section>

        {/* ==================================================
            ERROR / SUCCESS MESSAGE
        ================================================== */}

        {(error || message) && (
          <div className="mt-8 max-w-4xl">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
                {message}
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            INPUT AREA
        ================================================== */}

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Resume Upload */}

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  Step 01
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Upload your resume
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  PDF only · Maximum 5 MB
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">
                ↑
              </div>
            </div>

            <div
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className={`mt-7 cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={
                  handleInputChange
                }
              />

              {file ? (
                <div className="mx-auto max-w-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                    PDF
                  </div>

                  <h3 className="mt-4 break-all font-bold text-slate-900">
                    {file.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatFileSize(
                      file.size
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile();
                    }}
                    className="mt-5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    ↑
                  </div>

                  <h3 className="mt-5 font-bold text-slate-900">
                    Drop your resume here
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    or click to browse your computer
                  </p>

                  <p className="mt-5 text-xs text-slate-400">
                    Your resume is used only for analysis.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Job Description */}

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  Step 02
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Add job description
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Optional, but recommended for targeted ATS scoring.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                ≡
              </div>
            </div>

            <textarea
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(
                  event.target.value
                );

                if (result) {
                  setResult(null);
                  resetOptimization();
                }
              }}
              placeholder="Paste the job description here..."
              className="mt-7 min-h-[250px] w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            <p className="mt-3 text-xs text-slate-400">
              Without a job description, HirePro performs
              a general ATS analysis.
            </p>
          </div>
        </section>

        {/* ==================================================
            ANALYZE BUTTON
        ================================================== */}

        <section className="mt-6">
          <button
            type="button"
            onClick={analyzeResume}
            disabled={
              !file || analyzing
            }
            className="w-full rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {analyzing ? (
              <span className="inline-flex items-center gap-3">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing your resume...
              </span>
            ) : (
              "Analyze My Resume →"
            )}
          </button>
        </section>

        {/* ==================================================
            RESULTS
        ================================================== */}

        {result && (
          <section className="mt-14">
            {/* Score Hero */}

            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="grid lg:grid-cols-[320px_1fr]">
                {/* Score */}

                <div className="flex flex-col items-center justify-center border-b border-slate-200 bg-slate-950 p-8 text-white lg:border-b-0 lg:border-r">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                    ATS Score
                  </p>

                  <ScoreCircle
                    score={score}
                  />

                  <p className="mt-4 text-center text-sm text-slate-300">
                    {getScoreLabel(score)}
                  </p>
                </div>

                {/* Summary */}

                <div className="p-7 sm:p-9">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                        Analysis complete
                      </p>

                      <h2 className="mt-2 text-2xl font-bold tracking-tight">
                        Here&apos;s how your resume performs.
                      </h2>
                    </div>

                    {jobDescription.trim() ? (
                      <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        Job-specific analysis
                      </span>
                    ) : (
                      <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        General analysis
                      </span>
                    )}
                  </div>

                  <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
                    {result.summary}
                  </p>

                  {/* Score Cards */}

                  <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ScoreCard
                      label="Keywords"
                      score={
                        result
                          .keywordMatch
                          .score
                      }
                    />

                    <ScoreCard
                      label="Skills"
                      score={
                        result.skills
                          .score
                      }
                    />

                    <ScoreCard
                      label="Experience"
                      score={
                        result
                          .experience
                          .score
                      }
                    />

                    <ScoreCard
                      label="Formatting"
                      score={
                        result
                          .formatting
                          .score
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}

            <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto border-b border-slate-100">
                <div className="flex min-w-max px-4 sm:px-6">
                  <TabButton
                    active={
                      activeTab ===
                      "overview"
                    }
                    onClick={() =>
                      setActiveTab(
                        "overview"
                      )
                    }
                  >
                    Overview
                  </TabButton>

                  <TabButton
                    active={
                      activeTab ===
                      "keywords"
                    }
                    onClick={() =>
                      setActiveTab(
                        "keywords"
                      )
                    }
                  >
                    Keywords
                  </TabButton>

                  <TabButton
                    active={
                      activeTab ===
                      "experience"
                    }
                    onClick={() =>
                      setActiveTab(
                        "experience"
                      )
                    }
                  >
                    Experience
                  </TabButton>

                  <TabButton
                    active={
                      activeTab ===
                      "formatting"
                    }
                    onClick={() =>
                      setActiveTab(
                        "formatting"
                      )
                    }
                  >
                    Formatting
                  </TabButton>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {activeTab ===
                  "overview" && (
                  <OverviewTab
                    result={result}
                  />
                )}

                {activeTab ===
                  "keywords" && (
                  <KeywordsTab
                    result={result}
                  />
                )}

                {activeTab ===
                  "experience" && (
                  <ExperienceTab
                    result={result}
                  />
                )}

                {activeTab ===
                  "formatting" && (
                  <FormattingTab
                    result={result}
                  />
                )}
              </div>
            </div>

            {/* ==================================================
                AI RECOMMENDATIONS
            ================================================== */}

            <section className="mt-8">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  AI recommendations
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  What you should improve
                </h2>
              </div>

              <div className="grid gap-4">
                {result.recommendations.map(
                  (
                    recommendation,
                    index
                  ) => (
                    <RecommendationCard
                      key={`${recommendation.recommendation}-${index}`}
                      recommendation={
                        recommendation
                      }
                      index={
                        index
                      }
                    />
                  )
                )}
              </div>
            </section>

            {/* ==================================================
                AI OPTIMIZATION
            ================================================== */}

            <section className="mt-10">
              <OptimizationPanel
                result={result}
                optimizedATSResult={
                  optimizedATSResult
                }
                optimizing={
                  optimizing
                }
                optimizedResume={
                  optimizedResume
                }
                onImprove={
                  improveResume
                }
                onDownload={
                  downloadOptimizedResume
                }
                downloadLoading={
                  downloadLoading
                }
              />
            </section>

            {/* ==================================================
                BEFORE / AFTER
            ================================================== */}

            {optimizedResume &&
              optimizedATSResult && (
                <section className="mt-10">
                  <BeforeAfterSection
                    before={result}
                    after={
                      optimizedATSResult
                    }
                    difference={
                      scoreDifference ??
                      0
                    }
                  />
                </section>
              )}
          </section>
        )}
      </div>
    </main>
  );
}

/* ==========================================================
   SCORE CIRCLE
========================================================== */

function ScoreCircle({
  score,
}: {
  score: number;
}) {
  const safeScore =
    Math.max(
      0,
      Math.min(100, score)
    );

  const radius = 78;

  const circumference =
    2 * Math.PI * radius;

  const dashOffset =
    circumference -
    (safeScore / 100) *
      circumference;

  return (
    <div className="relative mt-7 h-48 w-48">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 200 200"
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          className="text-white/10"
        />

        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            dashOffset
          }
          className="text-blue-500 transition-all duration-1000"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold">
          {safeScore}
        </span>

        <span className="text-sm text-slate-400">
          / 100
        </span>
      </div>
    </div>
  );
}

/* ==========================================================
   SCORE CARD
========================================================== */

function ScoreCard({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500">
          {label}
        </span>

        <span className="text-sm font-bold text-slate-950">
          {score}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-700"
          style={{
            width: `${Math.max(
              0,
              Math.min(
                100,
                score
              )
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ==========================================================
   TAB BUTTON
========================================================== */

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-4 text-sm font-semibold transition ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

/* ==========================================================
   OVERVIEW TAB
========================================================== */

function OverviewTab({
  result,
}: {
  result: ATSResult;
}) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          title="Experience strengths"
          items={
            result.experience
              .strengths
          }
          positive
        />

        <InfoCard
          title="Experience weaknesses"
          items={
            result.experience
              .weaknesses
          }
        />
      </div>
    </div>
  );
}

/* ==========================================================
   KEYWORDS TAB
========================================================== */

function KeywordsTab({
  result,
}: {
  result: ATSResult;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <KeywordGroup
        title="Matched keywords"
        items={
          result.keywordMatch
            .matchedKeywords
        }
        positive
      />

      <KeywordGroup
        title="Missing keywords"
        items={
          result.keywordMatch
            .missingKeywords
        }
      />

      <KeywordGroup
        title="Matched skills"
        items={
          result.skills
            .matchedSkills
        }
        positive
      />

      <KeywordGroup
        title="Missing skills"
        items={
          result.skills
            .missingSkills
        }
      />
    </div>
  );
}

/* ==========================================================
   EXPERIENCE TAB
========================================================== */

function ExperienceTab({
  result,
}: {
  result: ATSResult;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <InfoCard
        title="Strengths"
        items={
          result.experience
            .strengths
        }
        positive
      />

      <InfoCard
        title="Weaknesses"
        items={
          result.experience
            .weaknesses
        }
      />
    </div>
  );
}

/* ==========================================================
   FORMATTING TAB
========================================================== */

function FormattingTab({
  result,
}: {
  result: ATSResult;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
            Formatting score
          </p>

          <p className="mt-1 text-3xl font-bold">
            {result.formatting.score}
            <span className="text-sm font-medium text-slate-400">
              /100
            </span>
          </p>
        </div>
      </div>

      {result.formatting
        .issues.length > 0 ? (
        <div className="space-y-3">
          {result.formatting.issues.map(
            (issue, index) => (
              <div
                key={`${issue}-${index}`}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  !
                </span>

                <p className="text-sm leading-6 text-slate-600">
                  {issue}
                </p>
              </div>
            )
          )}
        </div>
      ) : (
        <EmptyState text="No major formatting issues were detected." />
      )}
    </div>
  );
}

/* ==========================================================
   INFO CARD
========================================================== */

function InfoCard({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex gap-3"
              >
                <span
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    positive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {positive
                    ? "✓"
                    : "!"}
                </span>

                <p className="text-sm leading-6 text-slate-600">
                  {item}
                </p>
              </div>
            )
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          Nothing detected here.
        </p>
      )}
    </div>
  );
}

/* ==========================================================
   KEYWORD GROUP
========================================================== */

function KeywordGroup({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold">
          {title}
        </h3>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map(
            (item, index) => (
              <span
                key={`${item}-${index}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  positive
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-amber-100 bg-amber-50 text-amber-700"
                }`}
              >
                {item}
              </span>
            )
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          None detected.
        </p>
      )}
    </div>
  );
}

/* ==========================================================
   RECOMMENDATION CARD
========================================================== */

function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: ATSResult["recommendations"][number];
  index: number;
}) {
  const priority =
    recommendation.priority;

  const priorityClasses =
    priority === "high"
      ? "bg-red-50 text-red-700 border-red-100"
      : priority === "medium"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
        {String(index + 1).padStart(
          2,
          "0"
        )}
      </div>

      <div className="min-w-0">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${priorityClasses}`}
        >
          {priority} priority
        </span>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {recommendation.recommendation}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================
   OPTIMIZATION PANEL
========================================================== */

function OptimizationPanel({
  result,
  optimizedATSResult,
  optimizing,
  optimizedResume,
  onImprove,
  onDownload,
  downloadLoading,
}: {
  result: ATSResult;
  optimizedATSResult: ATSResult | null;
  optimizing: boolean;
  optimizedResume: ResumeData | null;
  onImprove: () => void;
  onDownload: () => void;
  downloadLoading: boolean;
}) {
  /*
   * --------------------------------------------------------
   * VERIFIED OPTIMIZATION
   * --------------------------------------------------------
   */

  if (
    optimizedResume &&
    optimizedATSResult
  ) {
    const before =
      result.overallScore;

    const after =
      optimizedATSResult.overallScore;

    const difference =
      after - before;

    return (
      <div className="overflow-hidden rounded-[30px] border border-emerald-200 bg-white shadow-[0_24px_80px_-35px_rgba(16,185,129,0.35)]">
        <div className="bg-emerald-50/70 p-7 sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                Optimization verified
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Your resume is now ATS-optimized.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                HirePro optimized your resume using
                the detected ATS recommendations and
                then independently re-checked the
                improved version.
              </p>
            </div>

            <button
              type="button"
              onClick={onDownload}
              disabled={
                downloadLoading
              }
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  Download Resume
                  <span>↓</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          <ScoreComparisonCard
            label="Before"
            score={before}
          />

          <ScoreComparisonCard
            label="After"
            score={after}
            highlighted
          />

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
              Improvement
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {difference > 0
                ? `+${difference}`
                : difference}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              ATS score points
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 p-6 sm:p-8">
          <div>
            <h3 className="font-bold text-slate-900">
              Verification results
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              The optimized resume was evaluated
              again using the ATS analyzer.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MiniMetric
              label="Keywords"
              before={
                result
                  .keywordMatch
                  .score
              }
              after={
                optimizedATSResult
                  .keywordMatch
                  .score
              }
            />

            <MiniMetric
              label="Skills"
              before={
                result.skills
                  .score
              }
              after={
                optimizedATSResult
                  .skills
                  .score
              }
            />

            <MiniMetric
              label="Experience"
              before={
                result
                  .experience
                  .score
              }
              after={
                optimizedATSResult
                  .experience
                  .score
              }
            />
          </div>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------------
   * OPTIMIZED BUT WAITING FOR VERIFICATION
   * --------------------------------------------------------
   */

  if (optimizedResume) {
    return (
      <div className="rounded-[28px] border border-blue-200 bg-blue-50/50 p-7">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white">
            ✓
          </span>

          <div>
            <h2 className="font-bold text-slate-950">
              Resume optimized
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              The optimized resume is ready. ATS
              verification is being completed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------------
   * INITIAL OPTIMIZATION CTA
   * --------------------------------------------------------
   */

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.45)]">
      <div className="p-7 sm:p-9">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              AI Resume Optimization
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Turn these recommendations into a better resume.
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              HirePro will use your original resume,
              ATS findings and target job description
              to improve wording, structure and keyword
              alignment — without inventing information.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-300">
                Preserve facts
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-300">
                Improve wording
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-300">
                Align keywords
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-300">
                Verify score
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onImprove}
            disabled={optimizing}
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950 shadow-xl transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {optimizing ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
                Optimizing...
              </>
            ) : (
              <>
                Improve My Resume
                <span>✦</span>
              </>
            )}
          </button>
        </div>
      </div>

      {optimizing && (
        <div className="border-t border-white/10 bg-white/[0.03] px-7 py-5 sm:px-9">
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <span className="mr-2 text-blue-400">
                01
              </span>
              Applying ATS recommendations
            </p>

            <p>
              <span className="mr-2 text-blue-400">
                02
              </span>
              Preserving your original information
            </p>

            <p>
              <span className="mr-2 text-blue-400">
                03
              </span>
              Re-checking the optimized resume
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   SCORE COMPARISON CARD
========================================================== */

function ScoreComparisonCard({
  label,
  score,
  highlighted = false,
}: {
  label: string;
  score: number;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlighted
          ? "border-blue-100 bg-blue-50/50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-[0.15em] ${
          highlighted
            ? "text-blue-600"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-4xl font-bold ${
          highlighted
            ? "text-blue-700"
            : "text-slate-950"
        }`}
      >
        {score}
        <span className="text-sm font-medium text-slate-400">
          /100
        </span>
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className={`h-full rounded-full ${
            highlighted
              ? "bg-blue-600"
              : "bg-slate-400"
          }`}
          style={{
            width: `${Math.max(
              0,
              Math.min(
                100,
                score
              )
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ==========================================================
   MINI METRIC
========================================================== */

function MiniMetric({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  const difference =
    after - before;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <span className="text-xs text-slate-400">
            {before}
          </span>

          <span className="mx-2 text-slate-300">
            →
          </span>

          <span className="font-bold text-slate-900">
            {after}
          </span>
        </div>

        <span
          className={`text-xs font-bold ${
            difference > 0
              ? "text-emerald-600"
              : difference < 0
                ? "text-red-600"
                : "text-slate-400"
          }`}
        >
          {difference > 0
            ? `+${difference}`
            : difference}
        </span>
      </div>
    </div>
  );
}

/* ==========================================================
   BEFORE / AFTER SECTION
========================================================== */

function BeforeAfterSection({
  before,
  after,
  difference,
}: {
  before: ATSResult;
  after: ATSResult;
  difference: number;
}) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-7 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
          Resume transformation
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          Before vs. After
        </h2>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          Your optimized resume was scored again to
          measure the actual change.
        </p>
      </div>

      <div className="grid lg:grid-cols-2">
        <BeforeAfterScore
          label="Original resume"
          score={
            before.overallScore
          }
          description="Initial ATS analysis"
        />

        <BeforeAfterScore
          label="Optimized resume"
          score={
            after.overallScore
          }
          description="Verified after AI optimization"
          highlighted
        />
      </div>

      <div className="border-t border-slate-100 bg-slate-50 p-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          Overall change
        </p>

        <p
          className={`mt-2 text-4xl font-bold ${
            difference > 0
              ? "text-emerald-600"
              : difference < 0
                ? "text-red-600"
                : "text-slate-600"
          }`}
        >
          {difference > 0
            ? `+${difference}`
            : difference}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          ATS score points
        </p>
      </div>
    </div>
  );
}

/* ==========================================================
   BEFORE / AFTER SCORE
========================================================== */

function BeforeAfterScore({
  label,
  score,
  description,
  highlighted = false,
}: {
  label: string;
  score: number;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-7 sm:p-9 ${
        highlighted
          ? "bg-blue-50/40"
          : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold">
          {label}
        </h3>

        {highlighted && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Improved
          </span>
        )}
      </div>

      <div className="mt-7 flex items-end gap-2">
        <span className="text-6xl font-bold tracking-tight">
          {score}
        </span>

        <span className="mb-2 text-sm text-slate-400">
          /100
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${
            highlighted
              ? "bg-blue-600"
              : "bg-slate-400"
          }`}
          style={{
            width: `${Math.max(
              0,
              Math.min(
                100,
                score
              )
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ==========================================================
   EMPTY STATE
========================================================== */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
      {text}
    </div>
  );
}

/* ==========================================================
   HELPERS
========================================================== */

function formatFileSize(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function getScoreLabel(
  score: number
) {
  if (score >= 85) {
    return "Excellent ATS compatibility";
  }

  if (score >= 70) {
    return "Good ATS compatibility";
  }

  if (score >= 55) {
    return "Needs some improvement";
  }

  if (score >= 40) {
    return "Needs improvement";
  }

  return "Significant improvement recommended";
}