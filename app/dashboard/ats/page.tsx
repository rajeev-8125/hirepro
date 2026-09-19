"use client";

import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
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

type ResumePageCount = 1 | 2 | 3;

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

function formatFileSize(
  bytes: number,
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function scoreLabel(
  score: number,
) {
  if (score >= 85) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Strong";
  }

  if (score >= 65) {
    return "Good";
  }

  if (score >= 50) {
    return "Needs work";
  }

  return "Needs attention";
}

function scoreColor(
  score: number,
) {
  if (score >= 85) {
    return "text-emerald-600";
  }

  if (score >= 75) {
    return "text-blue-600";
  }

  if (score >= 65) {
    return "text-amber-600";
  }

  return "text-rose-600";
}

function scoreBg(
  score: number,
) {
  if (score >= 85) {
    return "bg-emerald-50 border-emerald-200";
  }

  if (score >= 75) {
    return "bg-blue-50 border-blue-200";
  }

  if (score >= 65) {
    return "bg-amber-50 border-amber-200";
  }

  return "bg-rose-50 border-rose-200";
}

function ScoreRing({
  score,
}: {
  score: number;
}) {
  const safe =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score),
      ),
    );

  const degrees =
    safe * 3.6;

  const color =
    safe >= 85
      ? "#10b981"
      : safe >= 75
        ? "#3b82f6"
        : safe >= 65
          ? "#f59e0b"
          : "#f43f5e";

  return (
    <div
      className="relative h-40 w-40 rounded-full"
      style={{
        background: `conic-gradient(${color} ${degrees}deg, #e2e8f0 ${degrees}deg)`,
      }}
    >
      <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white">
        <div className="text-center">
          <div
            className={`text-4xl font-black ${scoreColor(
              safe,
            )}`}
          >
            {safe}
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            / 100
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
      {children}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <p className="font-bold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function ATSPage() {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const resultsRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    file,
    setFile,
  ] = useState<File | null>(
    null,
  );

  const [
    jobDescription,
    setJobDescription,
  ] = useState("");

  const [
    result,
    setResult,
  ] = useState<ATSResult | null>(
    null,
  );

  const [
    optimizedResume,
    setOptimizedResume,
  ] =
    useState<ResumeData | null>(
      null,
    );

  const [
    optimizedATSResult,
    setOptimizedATSResult,
  ] =
    useState<ATSResult | null>(
      null,
    );

  const [
    optimizedDesign,
    setOptimizedDesign,
  ] = useState<unknown | null>(
    null,
  );

  const [
    pageCount,
    setPageCount,
  ] =
    useState<ResumePageCount>(
      2,
    );

  const [
    activeTab,
    setActiveTab,
  ] = useState<Tab>(
    "overview",
  );

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  const [
    optimizing,
    setOptimizing,
  ] = useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const [
    dragging,
    setDragging,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  function resetOptimization() {
    setOptimizedResume(
      null,
    );

    setOptimizedATSResult(
      null,
    );

    setOptimizedDesign(
      null,
    );
  }

  function handleFile(
    selected: File | null,
  ) {
    setError("");
    setMessage("");

    if (!selected) {
      return;
    }

    const isPDF =
      selected.type ===
        "application/pdf" ||
      selected.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {
      setError(
        "Please upload a PDF resume.",
      );
      return;
    }

    if (
      selected.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "Resume must be smaller than 5 MB.",
      );
      return;
    }

    setFile(selected);
    setResult(null);
    resetOptimization();
  }

  function handleInput(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    handleFile(
      event.target.files?.[0] ??
        null,
    );
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDragging(false);

    handleFile(
      event.dataTransfer.files?.[0] ??
        null,
    );
  }

  function handleUploadKey(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      inputRef.current?.click();
    }
  }

  function removeFile() {
    setFile(null);
    setResult(null);
    resetOptimization();
    setError("");
    setMessage("");

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  }

  async function analyzeResume() {
    if (!file) {
      setError(
        "Please upload your resume first.",
      );
      return;
    }

    setAnalyzing(true);
    setError("");
    setMessage("");
    setResult(null);
    resetOptimization();

    try {
      const form =
        new FormData();

      form.append(
        "resume",
        file,
      );

      if (
        jobDescription.trim()
      ) {
        form.append(
          "jobDescription",
          jobDescription.trim(),
        );
      }

      const response =
        await fetch(
          "/api/ats/check",
          {
            method: "POST",
            body: form,
          },
        );

      const data =
        await response
          .json()
          .catch(
            () => null,
          );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to analyze the resume.",
        );
      }

      if (!data?.result) {
        throw new Error(
          "ATS analysis did not return a result.",
        );
      }

      setResult(
        data.result as ATSResult,
      );

      setActiveTab(
        "overview",
      );

      setMessage(
        "ATS analysis completed successfully.",
      );

      window.setTimeout(
        () => {
          resultsRef.current?.scrollIntoView(
            {
              behavior:
                "smooth",
              block: "start",
            },
          );
        },
        150,
      );
    } catch (err) {
      console.error(
        "ATS analysis error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze the resume.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function improveResume() {
    if (
      !file ||
      !result
    ) {
      setError(
        "Analyze the resume before optimizing it.",
      );
      return;
    }

    setOptimizing(true);
    setError("");
    setMessage("");

    resetOptimization();

    try {
      const form =
        new FormData();

      form.append(
        "resume",
        file,
      );

      form.append(
        "atsResult",
        JSON.stringify(
          result,
        ),
      );

      form.append(
        "pageCount",
        String(pageCount),
      );

      if (
        jobDescription.trim()
      ) {
        form.append(
          "jobDescription",
          jobDescription.trim(),
        );
      }

      setMessage(
        "HirePro is optimizing your resume and verifying every generated version...",
      );

      const response =
        await fetch(
          "/api/ats/optimize",
          {
            method: "POST",
            body: form,
          },
        );

      const data =
        await response
          .json()
          .catch(
            () => null,
          );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to optimize the resume.",
        );
      }

      if (
        !data?.optimizedResume
      ) {
        throw new Error(
          "The optimizer did not return a resume.",
        );
      }

      setOptimizedResume(
        data.optimizedResume as ResumeData,
      );

      setOptimizedATSResult(
        data.optimizedATSResult
          ? (data.optimizedATSResult as ATSResult)
          : null,
      );

      setOptimizedDesign(
        data.optimizedDesign ??
          null,
      );

      const originalScore =
        Number(
          data.originalScore ??
            result.overallScore,
        );

      const newScore =
        Number(
          data.optimizedScore ??
            0,
        );

      const difference =
        newScore -
        originalScore;

      if (
        data.improved
      ) {
        setMessage(
          `Optimization accepted. ATS score increased from ${originalScore} to ${newScore} (+${difference}).`,
        );
      } else if (
        data.accepted
      ) {
        setMessage(
          `Optimization completed. The verified ATS score is ${newScore}.`,
        );
      } else {
        setMessage(
          `The best verified version scored ${newScore}, while the original scored ${originalScore}. HirePro did not falsely mark the lower score as an improvement.`,
        );
      }

      window.setTimeout(
        () => {
          resultsRef.current?.scrollIntoView(
            {
              behavior:
                "smooth",
              block: "start",
            },
          );
        },
        150,
      );
    } catch (err) {
      console.error(
        "Resume optimization error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while optimizing the resume.",
      );
    } finally {
      setOptimizing(false);
    }
  }

  async function downloadOptimizedResume() {
    if (
      !optimizedResume
    ) {
      setError(
        "There is no optimized resume to download.",
      );
      return;
    }

    setDownloading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/ats/pdf",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              resume:
                optimizedResume,
              pageCount,
            }),
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(
              () => null,
            );

        throw new Error(
          data?.error ||
            "Failed to generate the optimized PDF.",
        );
      }

      const blob =
        await response.blob();

      if (!blob.size) {
        throw new Error(
          "The generated PDF is empty.",
        );
      }

      const type =
        response.headers.get(
          "content-type",
        );

      if (
        type &&
        !type.includes(
          "application/pdf",
        )
      ) {
        throw new Error(
          "The server did not return a PDF.",
        );
      }

      const url =
        URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          "a",
        );

      link.href = url;

      link.download =
        "hirepro-optimized-resume.pdf";

      document.body.appendChild(
        link,
      );

      link.click();

      link.remove();

      window.setTimeout(
        () =>
          URL.revokeObjectURL(
            url,
          ),
        1000,
      );

      setMessage(
        "Optimized resume downloaded successfully.",
      );
    } catch (err) {
      console.error(
        "PDF download error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to download the optimized resume.",
      );
    } finally {
      setDownloading(false);
    }
  }

  const originalScore =
    result?.overallScore ??
    0;

  const optimizedScore =
    optimizedATSResult
      ?.overallScore ??
    null;

  const difference =
    optimizedScore !== null
      ? optimizedScore -
        originalScore
      : null;

  const tabs: {
    id: Tab;
    label: string;
  }[] = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "keywords",
      label: "Keywords & skills",
    },
    {
      id: "experience",
      label: "Experience",
    },
    {
      id: "formatting",
      label: "Formatting",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <header className="mb-8">
          <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            ✦ AI-powered ATS optimization
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            ATS Resume Optimizer
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
            Analyze your resume, identify missing ATS
            requirements, optimize the content, verify the
            generated version, and download the final PDF.
          </p>
        </header>

        {/* UPLOAD */}

        <section className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">
              Upload resume
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              PDF only • Maximum 5 MB
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleInput}
              className="hidden"
            />

            {!file ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  inputRef.current?.click()
                }
                onKeyDown={
                  handleUploadKey
                }
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() =>
                  setDragging(false)
                }
                onDrop={handleDrop}
                className={`mt-6 flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
                  dragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  ↑
                </div>

                <p className="mt-5 font-bold">
                  Drop your PDF resume here
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  or click to choose a file
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatFileSize(
                        file.size,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeFile
                    }
                    className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  ✓ Resume ready for analysis
                </div>
              </div>
            )}
          </div>

          {/* JOB DESCRIPTION */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">
              Target job description
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Optional, but highly recommended for accurate
              keyword optimization.
            </p>

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(
                  event.target.value,
                )
              }
              placeholder="Paste the target job description here..."
              className="mt-6 min-h-[250px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-blue-400 focus:bg-white"
            />

            <div className="mt-2 text-right text-xs text-slate-400">
              {jobDescription.length.toLocaleString()} characters
            </div>
          </div>
        </section>

        {/* ANALYZE */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-black">
                Step 1 — Analyze
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Analyze the original resume before changing anything.
              </p>
            </div>

            <button
              type="button"
              onClick={
                analyzeResume
              }
              disabled={
                !file ||
                analyzing ||
                optimizing
              }
              className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing
                ? "Analyzing..."
                : "Analyze resume →"}
            </button>
          </div>
        </section>

        {/* STATUS */}

        {(message || error) && (
          <div
            className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ||
              message}
          </div>
        )}

        {/* RESULTS */}

        {result && (
          <div
            ref={resultsRef}
            className="mt-10 scroll-mt-6"
          >

            {/* SCORE */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <ScoreRing
                    score={
                      optimizedScore ??
                      originalScore
                    }
                  />

                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {optimizedScore !== null
                        ? "Verified optimized ATS score"
                        : "Original ATS score"}
                    </p>

                    <h2
                      className={`mt-2 text-3xl font-black ${scoreColor(
                        optimizedScore ??
                          originalScore,
                      )}`}
                    >
                      {scoreLabel(
                        optimizedScore ??
                          originalScore,
                      )}
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      {optimizedATSResult?.summary ||
                        result.summary}
                    </p>

                    {difference !==
                      null && (
                      <div
                        className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                          difference > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : difference ===
                                0
                              ? "bg-blue-50 text-blue-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {difference > 0
                          ? `+${difference} points`
                          : difference ===
                              0
                            ? "No score loss"
                            : `${difference} points`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[430px]">
                  {[
                    {
                      name: "Keywords",
                      score:
                        result.keywordMatch.score,
                    },
                    {
                      name: "Skills",
                      score:
                        result.skills.score,
                    },
                    {
                      name: "Experience",
                      score:
                        result.experience.score,
                    },
                    {
                      name: "Formatting",
                      score:
                        result.formatting.score,
                    },
                  ].map(
                    (item) => (
                      <div
                        key={
                          item.name
                        }
                        className={`rounded-2xl border p-4 ${scoreBg(
                          item.score,
                        )}`}
                      >
                        <p className="text-xs font-semibold text-slate-500">
                          {item.name}
                        </p>

                        <p
                          className={`mt-1 text-2xl font-black ${scoreColor(
                            item.score,
                          )}`}
                        >
                          {
                            item.score
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>

            {/* TABS */}

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex overflow-x-auto border-b border-slate-200">
                {tabs.map(
                  (tab) => (
                    <button
                      key={
                        tab.id
                      }
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          tab.id,
                        )
                      }
                      className={`shrink-0 border-b-2 px-5 py-4 text-sm font-bold ${
                        activeTab ===
                        tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ),
                )}
              </div>

              <div className="p-6 sm:p-8">

                {/* OVERVIEW */}

                {activeTab ===
                  "overview" && (
                  <div>
                    <h3 className="text-xl font-black">
                      ATS overview
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {
                        result.summary
                      }
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {[
                        {
                          name: "Keyword match",
                          score:
                            result.keywordMatch.score,
                        },
                        {
                          name: "Skills",
                          score:
                            result.skills.score,
                        },
                        {
                          name: "Experience",
                          score:
                            result.experience.score,
                        },
                        {
                          name: "Formatting",
                          score:
                            result.formatting.score,
                        },
                      ].map(
                        (item) => (
                          <div
                            key={
                              item.name
                            }
                            className="rounded-2xl border border-slate-200 p-5"
                          >
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              {item.name}
                            </p>

                            <p
                              className={`mt-2 text-3xl font-black ${scoreColor(
                                item.score,
                              )}`}
                            >
                              {
                                item.score
                              }
                              /100
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* KEYWORDS */}

                {activeTab ===
                  "keywords" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-black">
                        Keywords & skills
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        These are the exact areas the optimizer will target.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold">
                        Matched keywords
                      </h4>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.keywordMatch.matchedKeywords.length ===
                        0 ? (
                          <EmptyState
                            title="No matched keywords"
                            description="No matched keywords were returned."
                          />
                        ) : (
                          result.keywordMatch.matchedKeywords.map(
                            (
                              item,
                              index,
                            ) => (
                              <span
                                key={`${item}-${index}`}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
                              >
                                ✓ {item}
                              </span>
                            ),
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold">
                        Missing keywords
                      </h4>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.keywordMatch.missingKeywords.length ===
                        0 ? (
                          <EmptyState
                            title="No missing keywords"
                            description="No additional missing keywords were detected."
                          />
                        ) : (
                          result.keywordMatch.missingKeywords.map(
                            (
                              item,
                              index,
                            ) => (
                              <span
                                key={`${item}-${index}`}
                                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
                              >
                                {item}
                              </span>
                            ),
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold">
                        Missing skills
                      </h4>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.skills.missingSkills.length ===
                        0 ? (
                          <EmptyState
                            title="No missing skills"
                            description="No additional missing skills were detected."
                          />
                        ) : (
                          result.skills.missingSkills.map(
                            (
                              item,
                              index,
                            ) => (
                              <span
                                key={`${item}-${index}`}
                                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700"
                              >
                                {item}
                              </span>
                            ),
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* EXPERIENCE */}

                {activeTab ===
                  "experience" && (
                  <div>
                    <h3 className="text-xl font-black">
                      Experience analysis
                    </h3>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <h4 className="font-bold text-emerald-800">
                          Strengths
                        </h4>

                        <ul className="mt-4 space-y-3 text-sm leading-6 text-emerald-900">
                          {result.experience.strengths.map(
                            (
                              item,
                              index,
                            ) => (
                              <li
                                key={
                                  index
                                }
                              >
                                ✓ {item}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                        <h4 className="font-bold text-rose-800">
                          Weaknesses
                        </h4>

                        <ul className="mt-4 space-y-3 text-sm leading-6 text-rose-900">
                          {result.experience.weaknesses.map(
                            (
                              item,
                              index,
                            ) => (
                              <li
                                key={
                                  index
                                }
                              >
                                • {item}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* FORMATTING */}

                {activeTab ===
                  "formatting" && (
                  <div>
                    <h3 className="text-xl font-black">
                      Formatting analysis
                    </h3>

                    <div className="mt-6">
                      {result.formatting.issues.length ===
                      0 ? (
                        <EmptyState
                          title="No formatting issues detected"
                          description="The ATS analyzer did not identify formatting problems."
                        />
                      ) : (
                        <div className="space-y-3">
                          {result.formatting.issues.map(
                            (
                              item,
                              index,
                            ) => (
                              <div
                                key={
                                  index
                                }
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6"
                              >
                                {item}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* RECOMMENDATIONS */}

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-xl font-black">
                AI recommendations
              </h3>

              <div className="mt-5 space-y-3">
                {result.recommendations.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {item.priority}
                      </span>

                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {
                          item.recommendation
                        }
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>

            {/* OPTIMIZATION */}

            <section className="mt-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Step 2
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Optimize your resume
                </h3>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  HirePro will generate multiple candidates when
                  necessary and verify each one. A lower-scoring
                  version will not be accepted as an improvement.
                </p>
              </div>

              {/* PAGE SELECTOR */}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold">
                      Resume length
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      This controls the AI content density before PDF generation.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [1, 2, 3] as ResumePageCount[]
                    ).map(
                      (value) => (
                        <button
                          key={
                            value
                          }
                          type="button"
                          onClick={() =>
                            setPageCount(
                              value,
                            )
                          }
                          className={`rounded-xl border px-5 py-3 text-sm font-bold ${
                            pageCount ===
                            value
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                          }`}
                        >
                          {value}{" "}
                          {value ===
                          1
                            ? "page"
                            : "pages"}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-5">
                  <Icon>
                    ✦
                  </Icon>

                  <h4 className="mt-4 font-black">
                    Keyword optimization
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Targets the missing keywords identified by the ATS analysis.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <Icon>
                    ✓
                  </Icon>

                  <h4 className="mt-4 font-black">
                    Fact preservation
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Existing education, experience, projects and skills remain protected.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <Icon>
                    ↻
                  </Icon>

                  <h4 className="mt-4 font-black">
                    Score protection
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Lower-scoring candidates are automatically repaired and rechecked.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Target:{" "}
                  <strong>
                    {pageCount}{" "}
                    {pageCount ===
                    1
                      ? "page"
                      : "pages"}
                  </strong>
                </p>

                <button
                  type="button"
                  onClick={
                    improveResume
                  }
                  disabled={
                    optimizing ||
                    analyzing
                  }
                  className="rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {optimizing
                    ? "Optimizing + verifying..."
                    : "Optimize resume with AI →"}
                </button>
              </div>
            </section>

            {/* OPTIMIZED RESULT */}

            {optimizedResume && (
              <section className="mt-6 rounded-3xl border border-emerald-200 bg-white shadow-sm">

                <div
                  className={`border-b px-6 py-5 sm:px-8 ${
                    optimizedScore !==
                      null &&
                    difference !==
                      null &&
                    difference > 0
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Step 3 — Verified result
                  </p>

                  <h3 className="mt-2 text-2xl font-black">
                    {optimizedScore !==
                      null &&
                    difference !==
                      null &&
                    difference > 0
                      ? "Optimization accepted"
                      : "Optimization completed"}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The displayed optimized score comes from
                    server-side ATS verification.
                  </p>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid gap-4 md:grid-cols-3">

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Original
                      </p>

                      <p className="mt-2 text-3xl font-black">
                        {originalScore}
                        <span className="text-sm text-slate-400">
                          /100
                        </span>
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                        Optimized
                      </p>

                      <p className="mt-2 text-3xl font-black text-blue-700">
                        {optimizedScore ??
                          "—"}
                        {optimizedScore !==
                          null && (
                          <span className="text-sm text-blue-400">
                            /100
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                        Change
                      </p>

                      <p className="mt-2 text-3xl font-black text-emerald-700">
                        {difference !==
                        null
                          ? `${
                              difference >
                              0
                                ? "+"
                                : ""
                            }${difference}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {optimizedScore !==
                    null &&
                    optimizedScore <
                      originalScore && (
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                        The best verified version was lower than
                        the original score. HirePro did not falsely
                        label it as an improvement. You can run
                        optimization again.
                      </div>
                    )}

                  {optimizedScore !==
                    null &&
                    optimizedScore >=
                      originalScore && (
                      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                        ✓ This resume passed the score-protection
                        check and is eligible for download.
                      </div>
                    )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        downloadOptimizedResume
                      }
                      disabled={
                        downloading
                      }
                      className="flex-1 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {downloading
                        ? "Generating PDF..."
                        : "↓ Download optimized resume"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        improveResume
                      }
                      disabled={
                        optimizing
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      ↻ Optimize again
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* RESET */}

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  resetOptimization();
                  setJobDescription("");
                  setMessage("");
                  setError("");
                  setActiveTab(
                    "overview",
                  );

                  if (
                    inputRef.current
                  ) {
                    inputRef.current.value =
                      "";
                  }
                }}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 hover:bg-white"
              >
                ↻ Start with another resume
              </button>
            </div>
          </div>
        )}

        {!result && (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">
              📄
            </div>

            <h2 className="mt-5 text-xl font-black">
              Your ATS analysis will appear here
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Upload your PDF resume and analyze it to see
              keywords, missing skills, experience issues,
              formatting issues and optimization recommendations.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}