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

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Needs work";
  return "Needs attention";
}

function getScoreClass(score: number) {
  if (score >= 80) {
    return "text-emerald-600";
  }

  if (score >= 65) {
    return "text-blue-600";
  }

  if (score >= 50) {
    return "text-amber-600";
  }

  return "text-rose-600";
}

function getScoreRing(score: number) {
  if (score >= 80) {
    return "conic-gradient(#10b981 0deg, #10b981 " +
      `${score * 3.6}deg, #e5e7eb ${score * 3.6}deg 360deg)`;
  }

  if (score >= 65) {
    return "conic-gradient(#3b82f6 0deg, #3b82f6 " +
      `${score * 3.6}deg, #e5e7eb ${score * 3.6}deg 360deg)`;
  }

  if (score >= 50) {
    return "conic-gradient(#f59e0b 0deg, #f59e0b " +
      `${score * 3.6}deg, #e5e7eb ${score * 3.6}deg 360deg)`;
  }

  return "conic-gradient(#f43f5e 0deg, #f43f5e " +
    `${score * 3.6}deg, #e5e7eb ${score * 3.6}deg 360deg)`;
}

function ScoreRing({
  score,
  size = "large",
}: {
  score: number;
  size?: "large" | "small";
}) {
  const dimension =
    size === "large"
      ? "h-40 w-40"
      : "h-24 w-24";

  const inner =
    size === "large"
      ? "h-[124px] w-[124px]"
      : "h-[74px] w-[74px]";

  const number =
    size === "large"
      ? "text-4xl"
      : "text-2xl";

  return (
    <div
      className={`relative ${dimension} shrink-0 rounded-full`}
      style={{
        background: getScoreRing(score),
      }}
    >
      <div
        className={`absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 ${inner} flex items-center justify-center rounded-full bg-white shadow-sm`}
      >
        <div className="text-center">
          <div
            className={`${number} font-black tracking-tight ${getScoreClass(
              score,
            )}`}
          >
            {score}
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            / 100
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({
  type,
}: {
  type: "success" | "error" | "info";
}) {
  if (type === "success") {
    return (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M20 6 9 17l-5-5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "error") {
    return (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path
          d="M12 8v5M12 16h.01"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M12 8v5"
        strokeLinecap="round"
      />
      <path
        d="M12 16h.01"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M12 16V4"
        strokeLinecap="round"
      />
      <path
        d="m7 9 5-5 5 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6"
        strokeLinejoin="round"
      />
      <path
        d="M8 13h8M8 17h5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="m12 3-1.2 4.1L7 8.5l3.8 1.4L12 14l1.2-4.1L17 8.5l-3.8-1.4z"
        strokeLinejoin="round"
      />
      <path
        d="m19 13-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7z"
        strokeLinejoin="round"
      />
      <path
        d="m5 14-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="m8 12 2.5 2.5L16 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M5 12h14"
        strokeLinecap="round"
      />
      <path
        d="m13 6 6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 4v11"
        strokeLinecap="round"
      />
      <path
        d="m7 11 5 5 5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M4 7h16"
        strokeLinecap="round"
      />
      <path
        d="M10 11v5M14 11v5"
        strokeLinecap="round"
      />
      <path
        d="M6 7l1 14h10l1-14"
        strokeLinejoin="round"
      />
      <path
        d="M9 7V4h6v3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TabIcon({
  tab,
}: {
  tab: Tab;
}) {
  if (tab === "keywords") {
    return (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M20 12a8 8 0 1 1-8-8"
          strokeLinecap="round"
        />
        <path
          d="M20 4v6h-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (tab === "experience") {
    return (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect
          x="3"
          y="7"
          width="18"
          height="13"
          rx="2"
        />
        <path
          d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          strokeLinecap="round"
        />
        <path
          d="M3 12h18"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (tab === "formatting") {
    return (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M5 4h14M5 20h14"
          strokeLinecap="round"
        />
        <path
          d="M8 4v16M16 4v16"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="8" />
      <path
        d="M12 8v8M8 12h8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ATSPage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const resultsRef =
    useRef<HTMLDivElement | null>(null);

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

  function handleFile(
    selectedFile: File | null,
  ) {
    setError("");
    setMessage("");

    if (!selectedFile) {
      return;
    }

    const isPdf =
      selectedFile.type ===
        "application/pdf" ||
      selectedFile.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      setError(
        "Please upload a PDF resume.",
      );
      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Resume must be smaller than 5 MB.",
      );
      return;
    }

    setFile(selectedFile);
    setResult(null);
    resetOptimization();
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    handleFile(selectedFile);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0] ??
      null;

    handleFile(droppedFile);
  }

  function handleUploadKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      fileInputRef.current?.click();
    }
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
      const formData =
        new FormData();

      formData.append(
        "resume",
        file,
      );

      if (
        jobDescription.trim()
      ) {
        formData.append(
          "jobDescription",
          jobDescription.trim(),
        );
      }

      const response =
        await fetch(
          "/api/ats/check",
          {
            method: "POST",
            body: formData,
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to analyze resume.",
        );
      }

      if (!data.result) {
        throw new Error(
          "ATS analysis did not return a result.",
        );
      }

      setResult(data.result);
      setActiveTab("overview");

      setMessage(
        "Your ATS analysis is ready.",
      );

      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          },
        );
      }, 100);
    } catch (error) {
      console.error(
        "ATS analysis error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to analyze your resume.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function improveResume() {
    if (!file || !result) {
      setError(
        "Complete an ATS analysis before improving your resume.",
      );
      return;
    }

    setOptimizing(true);
    setError("");
    setMessage("");
    resetOptimization();

    try {
      const formData =
        new FormData();

      formData.append(
        "resume",
        file,
      );

      formData.append(
        "atsResult",
        JSON.stringify(result),
      );

      if (
        jobDescription.trim()
      ) {
        formData.append(
          "jobDescription",
          jobDescription.trim(),
        );
      }

      const optimizeResponse =
        await fetch(
          "/api/ats/optimize",
          {
            method: "POST",
            body: formData,
          },
        );

      const optimizeData =
        await optimizeResponse.json();

      if (!optimizeResponse.ok) {
        throw new Error(
          optimizeData.error ||
            "Failed to improve your resume.",
        );
      }

      if (
        !optimizeData.optimizedResume
      ) {
        throw new Error(
          "The AI did not return an optimized resume.",
        );
      }

      const newResume =
        optimizeData.optimizedResume;

      setOptimizedResume(
        newResume,
      );

      setOptimizedDesign(
        optimizeData.optimizedDesign ??
          null,
      );

      setMessage(
        "Resume improved. Re-checking ATS compatibility...",
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
          },
        );

      const verifyData =
        await verifyResponse.json();

      if (!verifyResponse.ok) {
        setMessage(
          "Your resume was optimized, but the new ATS score could not be calculated.",
        );

        return;
      }

      if (!verifyData.result) {
        setMessage(
          "Your resume was optimized, but verification did not return a score.",
        );

        return;
      }

      setOptimizedATSResult(
        verifyData.result,
      );

      setMessage(
        "Optimization complete. Your improved ATS score is ready.",
      );

      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          },
        );
      }, 100);
    } catch (error) {
      console.error(
        "Resume optimization error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while improving your resume.",
      );
    } finally {
      setOptimizing(false);
    }
  }

  async function downloadOptimizedResume() {
    if (!optimizedResume) {
      setError(
        "There is no optimized resume to download.",
      );
      return;
    }

    setDownloadLoading(true);
    setError("");

    try {
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
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.error ||
            "Failed to generate the optimized PDF.",
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
        link,
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      setMessage(
        "Your optimized resume has been downloaded.",
      );
    } catch (error) {
      console.error(
        "PDF download error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to download optimized resume.",
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

  const currentStep =
    optimizedATSResult
      ? 3
      : result
        ? 2
        : file
          ? 1
          : 0;

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
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-200/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
              <span className="text-sm font-black">
                H
              </span>
            </div>

            <div>
              <div className="text-base font-black tracking-tight">
                HirePro
              </div>

              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:block">
                Career intelligence
              </div>
            </div>
          </div>

          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="m15 18-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Dashboard
          </a>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        {/* Hero */}
        <section className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700">
            <SparklesIcon />
            AI ATS Analyzer
          </div>

          <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
            Make your resume{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
              ATS-ready.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Upload your resume, understand what an Applicant
            Tracking System sees, and use AI to improve the
            areas that matter.
          </p>

          {/* Progress */}
          <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center">
            {[
              {
                number: 1,
                label: "Upload",
              },
              {
                number: 2,
                label: "Analyze",
              },
              {
                number: 3,
                label: "Optimize",
              },
            ].map((step, index) => {
              const completed =
                currentStep >=
                step.number;

              const active =
                currentStep ===
                step.number;

              return (
                <div
                  key={step.number}
                  className="flex flex-1 items-center"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black transition ${
                        completed
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : active
                            ? "border-indigo-600 bg-white text-indigo-600"
                            : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {completed &&
                      currentStep >
                        step.number ? (
                        <CheckCircleIcon />
                      ) : (
                        step.number
                      )}
                    </div>

                    <span
                      className={`mt-2 text-xs font-bold ${
                        active ||
                        completed
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < 2 && (
                    <div
                      className={`h-0.5 flex-1 transition ${
                        currentStep >
                        step.number
                          ? "bg-indigo-500"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Status */}
        {(message || error) && (
          <div className="mx-auto mt-8 max-w-5xl">
            {message && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 shadow-sm">
                <div className="mt-0.5 shrink-0">
                  <StatusIcon type="success" />
                </div>

                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-medium text-rose-800 shadow-sm">
                <div className="mt-0.5 shrink-0">
                  <StatusIcon type="error" />
                </div>

                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Input section */}
        <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Resume upload */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FileIcon />
                  </span>

                  <h2 className="font-black text-slate-900">
                    Your resume
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Upload a PDF resume up to 5 MB.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
                PDF only
              </span>
            </div>

            {!file ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onKeyDown={
                  handleUploadKeyDown
                }
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                className={`group flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={
                    handleInputChange
                  }
                  className="hidden"
                />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-lg shadow-indigo-100 transition group-hover:-translate-y-1">
                  <UploadIcon />
                </div>

                <h3 className="mt-5 text-base font-black text-slate-800">
                  Drop your resume here
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Drag and drop your PDF, or click to
                  browse your computer.
                </p>

                <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition group-hover:bg-indigo-600">
                  Choose PDF
                  <ArrowRightIcon />
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <FileIcon />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-800">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {formatFileSize(
                          file.size,
                        )}{" "}
                        · PDF resume
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <TrashIcon />
                    Remove
                  </button>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-xs font-semibold text-emerald-700">
                  <CheckCircleIcon />
                  Resume ready for ATS analysis
                </div>
              </div>
            )}
          </div>

          {/* Job description */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 9h8M8 13h8M8 17h5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <h2 className="font-black text-slate-900">
                    Job description
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Optional, but useful for keyword matching.
                </p>
              </div>

              <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-600">
                Optional
              </span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(
                  event.target.value.slice(
                    0,
                    12000,
                  ),
                )
              }
              placeholder="Paste the job description here..."
              className="min-h-[220px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />

            <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>
                More context helps identify relevant keywords.
              </span>

              <span className="shrink-0">
                {jobDescription.length.toLocaleString()}
                /12,000
              </span>
            </div>
          </div>
        </section>

        {/* Analyze CTA */}
        <section className="mx-auto mt-6 max-w-6xl">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.65)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
                    <SparklesIcon />
                  </span>

                  <h2 className="font-black">
                    Ready to see your ATS score?
                  </h2>
                </div>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  HirePro will analyze your resume structure,
                  keywords, skills, experience and formatting.
                </p>
              </div>

              <button
                type="button"
                onClick={analyzeResume}
                disabled={
                  !file ||
                  analyzing ||
                  optimizing
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-slate-950 shadow-lg transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
                    Analyzing resume...
                  </>
                ) : (
                  <>
                    Analyze my resume
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Results */}
        {result && (
          <section
            ref={resultsRef}
            className="mx-auto mt-12 max-w-6xl scroll-mt-24"
          >
            {/* Results heading */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircleIcon />
                  Analysis complete
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Your ATS compatibility report
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Here is what your resume currently communicates
                  to an ATS.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  resetOptimization();
                  setMessage("");
                  setError("");
                }}
                className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 sm:self-auto"
              >
                Run a new analysis
              </button>
            </div>

            {/* Score overview */}
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-8">
                <div className="flex flex-col items-center gap-7 sm:flex-row">
                  <ScoreRing score={score} />

                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Overall ATS score
                    </div>

                    <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                      <span
                        className={`text-xl font-black ${getScoreClass(
                          score,
                        )}`}
                      >
                        {getScoreLabel(score)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {result.summary}
                    </p>
                  </div>
                </div>

                {/* Score categories */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "Keywords",
                      score:
                        result.keywordMatch
                          .score,
                    },
                    {
                      label: "Skills",
                      score:
                        result.skills.score,
                    },
                    {
                      label: "Experience",
                      score:
                        result.experience
                          .score,
                    },
                    {
                      label: "Formatting",
                      score:
                        result.formatting
                          .score,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        {item.label}
                      </div>

                      <div
                        className={`mt-1 text-xl font-black ${getScoreClass(
                          item.score,
                        )}`}
                      >
                        {item.score}
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-current"
                          style={{
                            width: `${item.score}%`,
                            color:
                              item.score >=
                              80
                                ? "#10b981"
                                : item.score >=
                                    65
                                  ? "#3b82f6"
                                  : item.score >=
                                      50
                                    ? "#f59e0b"
                                    : "#f43f5e",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization card */}
              <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-[0_25px_80px_-35px_rgba(79,70,229,0.8)] sm:p-8">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <SparklesIcon />
                  </div>

                  <h3 className="mt-6 text-xl font-black">
                    Improve your resume with AI
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-indigo-100">
                    HirePro can improve wording, keyword relevance
                    and ATS compatibility while preserving the facts
                    in your original resume.
                  </p>

                  {!optimizedATSResult ? (
                    <button
                      type="button"
                      onClick={improveResume}
                      disabled={
                        optimizing ||
                        analyzing
                      }
                      className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {optimizing ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-700" />
                          Improving resume...
                        </>
                      ) : (
                        <>
                          Improve with AI
                          <SparklesIcon />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="mt-7 rounded-2xl bg-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                          Verified improvement
                        </span>

                        {scoreDifference !==
                          null && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-black ${
                              scoreDifference >
                              0
                                ? "bg-emerald-400/20 text-emerald-100"
                                : "bg-white/10 text-white"
                            }`}
                          >
                            {scoreDifference >
                            0
                              ? `+${scoreDifference}`
                              : scoreDifference}{" "}
                            points
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <div className="text-3xl font-black">
                            {afterScore}
                          </div>

                          <div className="text-xs text-indigo-100">
                            New ATS score
                          </div>
                        </div>

                        <CheckCircleIcon />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Before / after */}
            {optimizedATSResult && (
              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Before & after
                    </div>

                    <h3 className="mt-2 text-xl font-black">
                      Your optimized resume
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      The new score below was calculated after
                      optimization.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      downloadOptimizedResume
                    }
                    disabled={
                      downloadLoading ||
                      !optimizedResume
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {downloadLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <DownloadIcon />
                        Download optimized PDF
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Original score
                    </div>

                    <div
                      className={`mt-2 text-3xl font-black ${getScoreClass(
                        score,
                      )}`}
                    >
                      {score}
                    </div>
                  </div>

                  <div className="flex items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                    <ArrowRightIcon />
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <div className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                      Verified score
                    </div>

                    <div className="mt-2 text-3xl font-black text-emerald-600">
                      {afterScore}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
              <div className="overflow-x-auto border-b border-slate-200">
                <div className="flex min-w-max px-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          tab.id,
                        )
                      }
                      className={`relative flex items-center gap-2 px-4 py-4 text-sm font-bold transition ${
                        activeTab ===
                        tab.id
                          ? "text-indigo-600"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <TabIcon tab={tab.id} />
                      {tab.label}

                      {activeTab ===
                        tab.id && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {/* Overview */}
                {activeTab ===
                  "overview" && (
                  <div className="space-y-8">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Analysis summary
                      </div>

                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                        {result.summary}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Recommendations
                          </div>

                          <h3 className="mt-2 text-xl font-black">
                            What you can improve
                          </h3>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3">
                        {result.recommendations
                          .length > 0 ? (
                          result.recommendations.map(
                            (
                              recommendation,
                              index,
                            ) => (
                              <div
                                key={`${recommendation.recommendation}-${index}`}
                                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                              >
                                <div
                                  className={`mt-0.5 shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                                    recommendation.priority ===
                                    "high"
                                      ? "bg-rose-100 text-rose-700"
                                      : recommendation.priority ===
                                          "medium"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  {
                                    recommendation.priority
                                  }
                                </div>

                                <p className="text-sm leading-6 text-slate-600">
                                  {
                                    recommendation.recommendation
                                  }
                                </p>
                              </div>
                            ),
                          )
                        ) : (
                          <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-medium text-emerald-700">
                            No major recommendations were returned
                            for this analysis.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {activeTab ===
                  "keywords" && (
                  <div className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                          Keyword match
                        </div>

                        <div className="mt-2 text-3xl font-black text-emerald-600">
                          {
                            result.keywordMatch
                              .score
                          }
                        </div>

                        <p className="mt-2 text-xs leading-5 text-emerald-700">
                          Based on relevant terms detected in your
                          resume.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
                        <div className="text-xs font-bold uppercase tracking-wide text-violet-600">
                          Skills match
                        </div>

                        <div className="mt-2 text-3xl font-black text-violet-600">
                          {
                            result.skills
                              .score
                          }
                        </div>

                        <p className="mt-2 text-xs leading-5 text-violet-700">
                          Skills relevant to the analysis context.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="text-base font-black">
                          Matched keywords
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {result.keywordMatch
                            .matchedKeywords
                            .length > 0 ? (
                            result.keywordMatch.matchedKeywords.map(
                              (
                                keyword,
                              ) => (
                                <span
                                  key={keyword}
                                  className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                                >
                                  {keyword}
                                </span>
                              ),
                            )
                          ) : (
                            <p className="text-sm text-slate-400">
                              No matched keywords were returned.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-black">
                          Missing keywords
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {result.keywordMatch
                            .missingKeywords
                            .length > 0 ? (
                            result.keywordMatch.missingKeywords.map(
                              (
                                keyword,
                              ) => (
                                <span
                                  key={keyword}
                                  className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
                                >
                                  {keyword}
                                </span>
                              ),
                            )
                          ) : (
                            <p className="text-sm text-emerald-600">
                              No important missing keywords were
                              detected.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <h3 className="text-base font-black">
                        Matched skills
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.skills
                          .matchedSkills
                          .length > 0 ? (
                          result.skills.matchedSkills.map(
                            (skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                              >
                                {skill}
                              </span>
                            ),
                          )
                        ) : (
                          <p className="text-sm text-slate-400">
                            No matched skills were returned.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black">
                        Missing skills
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.skills
                          .missingSkills
                          .length > 0 ? (
                          result.skills.missingSkills.map(
                            (skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
                              >
                                {skill}
                              </span>
                            ),
                          )
                        ) : (
                          <p className="text-sm text-emerald-600">
                            No important missing skills were detected.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Experience */}
                {activeTab ===
                  "experience" && (
                  <div className="space-y-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <ScoreRing
                        score={
                          result.experience
                            .score
                        }
                        size="small"
                      />

                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Experience score
                        </div>

                        <h3 className="mt-1 text-xl font-black">
                          How your experience reads
                        </h3>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                        <div className="flex items-center gap-2 text-sm font-black text-emerald-700">
                          <CheckCircleIcon />
                          Strengths
                        </div>

                        <ul className="mt-4 space-y-3">
                          {result.experience
                            .strengths
                            .length > 0 ? (
                            result.experience.strengths.map(
                              (
                                strength,
                                index,
                              ) => (
                                <li
                                  key={`${strength}-${index}`}
                                  className="flex gap-3 text-sm leading-6 text-emerald-900/75"
                                >
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                  {strength}
                                </li>
                              ),
                            )
                          ) : (
                            <li className="text-sm text-emerald-700">
                              No specific strengths were returned.
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                        <div className="flex items-center gap-2 text-sm font-black text-amber-700">
                          <StatusIcon type="info" />
                          Areas to improve
                        </div>

                        <ul className="mt-4 space-y-3">
                          {result.experience
                            .weaknesses
                            .length > 0 ? (
                            result.experience.weaknesses.map(
                              (
                                weakness,
                                index,
                              ) => (
                                <li
                                  key={`${weakness}-${index}`}
                                  className="flex gap-3 text-sm leading-6 text-amber-900/75"
                                >
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                  {weakness}
                                </li>
                              ),
                            )
                          ) : (
                            <li className="text-sm text-emerald-700">
                              No major weaknesses were returned.
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Formatting */}
                {activeTab ===
                  "formatting" && (
                  <div className="space-y-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <ScoreRing
                        score={
                          result.formatting
                            .score
                        }
                        size="small"
                      />

                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Formatting score
                        </div>

                        <h3 className="mt-1 text-xl font-black">
                          ATS readability
                        </h3>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                          Formatting issues can affect how automated
                          systems extract information from your resume.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black">
                        Detected formatting issues
                      </h3>

                      <div className="mt-4 space-y-3">
                        {result.formatting
                          .issues
                          .length > 0 ? (
                          result.formatting.issues.map(
                            (
                              issue,
                              index,
                            ) => (
                              <div
                                key={`${issue}-${index}`}
                                className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                              >
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                  <StatusIcon type="info" />
                                </div>

                                <p className="text-sm leading-6 text-slate-600">
                                  {issue}
                                </p>
                              </div>
                            ),
                          )
                        ) : (
                          <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                            <div className="text-emerald-600">
                              <CheckCircleIcon />
                            </div>

                            <div>
                              <p className="font-bold text-emerald-800">
                                No major formatting issues detected.
                              </p>

                              <p className="mt-1 text-sm text-emerald-700">
                                Your resume structure appears readable
                                for automated screening.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Optimization result */}
            {optimizedResume && (
              <div className="mt-6 rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                      <SparklesIcon />
                      AI optimization complete
                    </div>

                    <h3 className="mt-3 text-xl font-black">
                      Your optimized resume is ready
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      HirePro preserved the information from your
                      uploaded resume while improving ATS-oriented
                      wording and structure.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      downloadOptimizedResume
                    }
                    disabled={
                      downloadLoading
                    }
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {downloadLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <DownloadIcon />
                        Download optimized resume
                      </>
                    )}
                  </button>
                </div>

                {optimizedATSResult && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Before
                      </div>

                      <div className="mt-1 text-2xl font-black text-slate-800">
                        {score}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-indigo-50 p-5">
                      <div className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                        After
                      </div>

                      <div className="mt-1 text-2xl font-black text-indigo-600">
                        {
                          optimizedATSResult.overallScore
                        }
                      </div>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-5">
                      <div className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                        Change
                      </div>

                      <div className="mt-1 text-2xl font-black text-emerald-600">
                        {scoreDifference !==
                        null
                          ? scoreDifference >
                            0
                            ? `+${scoreDifference}`
                            : scoreDifference
                          : "—"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-7 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <div className="text-sm font-bold text-slate-700">
            HirePro
          </div>

          <p className="text-xs text-slate-400">
            AI-powered career tools built to help you present your
            skills clearly.
          </p>
        </div>
      </footer>
    </main>
  );
}