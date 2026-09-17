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

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
  if (score >= 80) {
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

function getScoreBackground(score: number) {
  if (score >= 80) {
    return "bg-emerald-50 border-emerald-200";
  }

  if (score >= 65) {
    return "bg-blue-50 border-blue-200";
  }

  if (score >= 50) {
    return "bg-amber-50 border-amber-200";
  }

  return "bg-rose-50 border-rose-200";
}

function getPriorityClass(
  priority: "high" | "medium" | "low",
) {
  if (priority === "high") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  if (priority === "medium") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
}

function ScoreRing({
  score,
  size = "large",
}: {
  score: number;
  size?: "large" | "small";
}) {
  const safeScore = Math.max(
    0,
    Math.min(100, Math.round(score)),
  );

  const dimension =
    size === "large"
      ? "h-40 w-40"
      : "h-28 w-28";

  const inner =
    size === "large"
      ? "h-[126px] w-[126px]"
      : "h-[88px] w-[88px]";

  const number =
    size === "large"
      ? "text-4xl"
      : "text-2xl";

  const degrees = safeScore * 3.6;

  let ringColor = "#f43f5e";

  if (safeScore >= 80) {
    ringColor = "#10b981";
  } else if (safeScore >= 65) {
    ringColor = "#3b82f6";
  } else if (safeScore >= 50) {
    ringColor = "#f59e0b";
  }

  return (
    <div
      className={`relative ${dimension} shrink-0 rounded-full`}
      style={{
        background: `conic-gradient(${ringColor} 0deg, ${ringColor} ${degrees}deg, #e2e8f0 ${degrees}deg 360deg)`,
      }}
    >
      <div
        className={`absolute inset-1/2 flex ${inner} -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm`}
      >
        <div className="text-center">
          <div
            className={`${number} font-black tracking-tight ${getScoreClass(
              safeScore,
            )}`}
          >
            {safeScore}
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            / 100
          </div>
        </div>
      </div>
    </div>
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

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="m5 12 4 4L19 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
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
        d="M10 11v6M14 11v6"
        strokeLinecap="round"
      />
      <path
        d="M6 7l1 13h10l1-13"
        strokeLinejoin="round"
      />
      <path
        d="M9 7V4h6v3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M20 11a8.1 8.1 0 0 0-14.7-4L4 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 4v5h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13a8.1 8.1 0 0 0 14.7 4L20 15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 20v-5h-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="m6 9 6 6 6-6"
        strokeLinecap="round"
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
          d="M20 12a8 8 0 1 1-3.3-6.5"
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
        />
        <path
          d="M3 12h18"
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
          d="M5 4h14M5 20h14M8 4v16M16 4v16"
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
      <circle
        cx="12"
        cy="12"
        r="8"
      />
      <path
        d="M12 8v4l2.5 2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
        <FileIcon />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
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

  const [resumePageCount, setResumePageCount] =
    useState<ResumePageCount>(2);

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
      MAX_FILE_SIZE
    ) {
      setError(
        "Resume must be smaller than 5 MB.",
      );
      return;
    }

    setFile(selectedFile);
    setResult(null);
    resetOptimization();
    setActiveTab("overview");
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
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to analyze your resume.",
        );
      }

      if (!data?.result) {
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
      }, 150);
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
      // ----------------------------------------------------------
      // OPTIMIZE
      // ----------------------------------------------------------

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

      formData.append(
        "pageCount",
        String(resumePageCount),
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
        await optimizeResponse
          .json()
          .catch(() => null);

      if (!optimizeResponse.ok) {
        throw new Error(
          optimizeData?.error ||
            "Failed to improve your resume.",
        );
      }

      if (
        !optimizeData?.optimizedResume
      ) {
        throw new Error(
          "The AI did not return an optimized resume.",
        );
      }

      const newResume =
        optimizeData.optimizedResume as ResumeData;

      setOptimizedResume(
        newResume,
      );

      setOptimizedDesign(
        optimizeData.optimizedDesign ??
          null,
      );

      setMessage(
        "Resume optimized. Re-checking the new ATS score...",
      );

      // ----------------------------------------------------------
      // VERIFY OPTIMIZED RESUME
      // ----------------------------------------------------------

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
        await verifyResponse
          .json()
          .catch(() => null);

      if (!verifyResponse.ok) {
        console.error(
          "ATS verification failed:",
          verifyData,
        );

        setMessage(
          "Your resume was optimized, but the new ATS score could not be calculated. You can still download the optimized resume.",
        );

        return;
      }

      if (
        !verifyData?.result
      ) {
        console.error(
          "ATS verification returned no result:",
          verifyData,
        );

        setMessage(
          "Your resume was optimized, but verification did not return a score. You can still download the optimized resume.",
        );

        return;
      }

      setOptimizedATSResult(
        verifyData.result as ATSResult,
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
      }, 150);
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
        "There is no optimized resume to download yet.",
      );
      return;
    }

    setDownloadLoading(true);
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

              pageCount:
                resumePageCount,
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

      if (!blob.size) {
        throw new Error(
          "The generated PDF is empty.",
        );
      }

      const contentType =
        response.headers.get(
          "content-type",
        );

      if (
        contentType &&
        !contentType.includes(
          "application/pdf",
        )
      ) {
        throw new Error(
          "The server did not return a PDF file.",
        );
      }

      const url =
        window.URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          "a",
        );

      link.href = url;

      link.download =
        "hirepro-ats-optimized-resume.pdf";

      document.body.appendChild(
        link,
      );

      link.click();

      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(
          url,
        );
      }, 1000);

      setMessage(
        "Your optimized resume has been downloaded successfully.",
      );
    } catch (error) {
      console.error(
        "Optimized resume download error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to download the optimized resume.",
      );
    } finally {
      setDownloadLoading(false);
    }
  }

  const originalScore =
    result?.overallScore ?? 0;

  const optimizedScore =
    optimizedATSResult?.overallScore ??
    null;

  const scoreDifference =
    optimizedScore !== null
      ? optimizedScore -
        originalScore
      : null;

  const currentStep =
    optimizedResume
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------- */}
        {/* HEADER */}
        {/* ---------------------------------------------------- */}

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <SparklesIcon />
            AI-powered ATS optimization
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            ATS Resume Optimizer
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Upload your existing resume, analyze its ATS
            compatibility, improve it with AI, verify the
            new score, and download the optimized PDF.
          </p>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PROGRESS */}
        {/* ---------------------------------------------------- */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                number: 1,
                title: "Upload resume",
                description:
                  "Upload your existing PDF",
              },
              {
                number: 2,
                title: "Analyze & optimize",
                description:
                  "Find ATS issues and improve",
              },
              {
                number: 3,
                title: "Verify & download",
                description:
                  "Check score and download PDF",
              },
            ].map((step) => {
              const completed =
                currentStep >=
                step.number;

              const active =
                currentStep ===
                step.number;

              return (
                <div
                  key={step.number}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      completed
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {completed &&
                    step.number <
                      currentStep ? (
                      <CheckIcon />
                    ) : (
                      step.number
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-sm font-bold ${
                        active ||
                        completed
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>

                    <p className="text-xs text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* UPLOAD / JOB DESCRIPTION */}
        {/* ---------------------------------------------------- */}

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Upload your resume
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                PDF only, maximum 5 MB.
              </p>
            </div>

            {!file ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={
                    handleInputChange
                  }
                  className="hidden"
                />

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
                  onDragLeave={() => {
                    setDragActive(false);
                  }}
                  onDrop={
                    handleDrop
                  }
                  className={`flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                    <UploadIcon />
                  </div>

                  <p className="text-base font-bold text-slate-800">
                    Drop your PDF resume here
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    or click to browse from your computer
                  </p>

                  <div className="mt-5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                    PDF • Up to 5 MB
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <FileIcon />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatFileSize(
                          file.size,
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeFile
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove resume"
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckIcon />
                  Resume ready for ATS analysis.
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Job description
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Optional. Add the target job description for
                more relevant keyword matching.
              </p>
            </div>

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(
                  event.target.value,
                )
              }
              placeholder="Paste the job description here..."
              className="min-h-[250px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                {jobDescription.length.toLocaleString()} characters
              </span>

              <span>
                Optional
              </span>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* ACTION BAR */}
        {/* ---------------------------------------------------- */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Ready to analyze?
              </p>

              <p className="mt-1 text-xs text-slate-500">
                We will inspect ATS compatibility before making
                any changes.
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze resume
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* STATUS */}
        {/* ---------------------------------------------------- */}

        {(message || error) && (
          <div
            className={`mt-6 rounded-2xl border px-5 py-4 ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {error ? (
                  <XIcon />
                ) : (
                  <CheckIcon />
                )}
              </div>

              <p className="text-sm font-medium leading-6">
                {error || message}
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* RESULTS */}
        {/* ---------------------------------------------------- */}

        {result && (
          <div
            ref={resultsRef}
            className="mt-10 scroll-mt-6"
          >
            {/* SCORE HEADER */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <ScoreRing
                    score={
                      optimizedScore ??
                      originalScore
                    }
                  />

                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      {optimizedScore !==
                      null
                        ? "Optimized ATS score"
                        : "Current ATS score"}
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-slate-900">
                      {optimizedScore !==
                      null
                        ? getScoreLabel(
                            optimizedScore,
                          )
                        : getScoreLabel(
                            originalScore,
                          )}
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      {optimizedATSResult?.summary ||
                        result.summary}
                    </p>

                    {scoreDifference !==
                      null && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                        <span>
                          {scoreDifference >=
                          0
                            ? "+"
                            : ""}
                          {scoreDifference} points
                        </span>

                        <span className="font-normal text-emerald-600">
                          after optimization
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[430px]">
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
                      className={`rounded-xl border p-4 ${getScoreBackground(
                        item.score,
                      )}`}
                    >
                      <p className="text-xs font-semibold text-slate-500">
                        {item.label}
                      </p>

                      <p
                        className={`mt-1 text-xl font-black ${getScoreClass(
                          item.score,
                        )}`}
                      >
                        {item.score}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ORIGINAL / OPTIMIZED COMPARISON */}

            {optimizedResume && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Optimization result
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Compare the original ATS score with the
                      verified optimized score.
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <DownloadIcon />
                        Download optimized resume
                      </>
                    )}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Original
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          Uploaded resume
                        </p>
                      </div>

                      <span className="text-3xl font-black text-slate-800">
                        {originalScore}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                          Optimized
                        </p>

                        <p className="mt-1 text-sm font-bold text-emerald-800">
                          AI-improved resume
                        </p>
                      </div>

                      <span className="text-3xl font-black text-emerald-700">
                        {optimizedScore ??
                          "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {!optimizedATSResult && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                    The optimized resume is ready, but the
                    verification score was not returned. The
                    download button remains available.
                  </div>
                )}
              </div>
            )}

            {/* TABS */}

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex overflow-x-auto border-b border-slate-200">
                {tabs.map((tab) => {
                  const active =
                    activeTab ===
                    tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          tab.id,
                        )
                      }
                      className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-bold transition ${
                        active
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <TabIcon
                        tab={
                          tab.id
                        }
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-6 sm:p-8">
                {/* OVERVIEW */}

                {activeTab ===
                  "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        ATS overview
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {result.summary}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Keyword match
                            </p>

                            <p className="mt-1 text-2xl font-black text-slate-900">
                              {
                                result
                                  .keywordMatch
                                  .score
                              }
                            </p>
                          </div>

                          <div
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getScoreBackground(
                              result
                                .keywordMatch
                                .score,
                            )}`}
                          >
                            {getScoreLabel(
                              result
                                .keywordMatch
                                .score,
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Skills
                            </p>

                            <p className="mt-1 text-2xl font-black text-slate-900">
                              {
                                result
                                  .skills
                                  .score
                              }
                            </p>
                          </div>

                          <div
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getScoreBackground(
                              result
                                .skills
                                .score,
                            )}`}
                          >
                            {getScoreLabel(
                              result
                                .skills
                                .score,
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Experience
                            </p>

                            <p className="mt-1 text-2xl font-black text-slate-900">
                              {
                                result
                                  .experience
                                  .score
                              }
                            </p>
                          </div>

                          <div
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getScoreBackground(
                              result
                                .experience
                                .score,
                            )}`}
                          >
                            {getScoreLabel(
                              result
                                .experience
                                .score,
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Formatting
                            </p>

                            <p className="mt-1 text-2xl font-black text-slate-900">
                              {
                                result
                                  .formatting
                                  .score
                              }
                            </p>
                          </div>

                          <div
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getScoreBackground(
                              result
                                .formatting
                                .score,
                            )}`}
                          >
                            {getScoreLabel(
                              result
                                .formatting
                                .score,
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KEYWORDS */}

                {activeTab ===
                  "keywords" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Keywords & skills
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Terms detected by the ATS analysis.
                      </p>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800">
                          Matched keywords
                        </h4>

                        <span className="text-xs font-semibold text-emerald-600">
                          {
                            result
                              .keywordMatch
                              .matchedKeywords
                              .length
                          }{" "}
                          matched
                        </span>
                      </div>

                      {result
                        .keywordMatch
                        .matchedKeywords
                        .length ===
                      0 ? (
                        <EmptyState
                          title="No matched keywords detected"
                          description="There are currently no matched keywords in the ATS result."
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {result.keywordMatch.matchedKeywords.map(
                            (
                              keyword,
                              index,
                            ) => (
                              <span
                                key={`${keyword}-${index}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                              >
                                <CheckIcon />
                                {keyword}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800">
                          Missing keywords
                        </h4>

                        <span className="text-xs font-semibold text-rose-600">
                          {
                            result
                              .keywordMatch
                              .missingKeywords
                              .length
                          }{" "}
                          missing
                        </span>
                      </div>

                      {result
                        .keywordMatch
                        .missingKeywords
                        .length ===
                      0 ? (
                        <EmptyState
                          title="No missing keywords detected"
                          description="The analyzer did not identify additional missing keywords."
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {result.keywordMatch.missingKeywords.map(
                            (
                              keyword,
                              index,
                            ) => (
                              <span
                                key={`${keyword}-${index}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                              >
                                <XIcon />
                                {keyword}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800">
                          Missing skills
                        </h4>

                        <span className="text-xs font-semibold text-rose-600">
                          {
                            result.skills
                              .missingSkills
                              .length
                          }{" "}
                          missing
                        </span>
                      </div>

                      {result.skills
                        .missingSkills
                        .length ===
                      0 ? (
                        <EmptyState
                          title="No missing skills detected"
                          description="The analyzer did not identify additional missing skills."
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {result.skills.missingSkills.map(
                            (
                              skill,
                              index,
                            ) => (
                              <span
                                key={`${skill}-${index}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                              >
                                {skill}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* EXPERIENCE */}

                {activeTab ===
                  "experience" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Experience analysis
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Strengths and weaknesses identified in
                        your experience section.
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <CheckIcon />
                          </div>

                          <h4 className="font-bold text-emerald-900">
                            Strengths
                          </h4>
                        </div>

                        {result.experience
                          .strengths
                          .length ===
                        0 ? (
                          <p className="text-sm text-slate-500">
                            No specific strengths were
                            returned.
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            {result.experience.strengths.map(
                              (
                                item,
                                index,
                              ) => (
                                <li
                                  key={
                                    index
                                  }
                                  className="flex gap-3 text-sm leading-6 text-emerald-900"
                                >
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                  <span>
                                    {item}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                      </div>

                      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                            <XIcon />
                          </div>

                          <h4 className="font-bold text-rose-900">
                            Weaknesses
                          </h4>
                        </div>

                        {result.experience
                          .weaknesses
                          .length ===
                        0 ? (
                          <p className="text-sm text-slate-500">
                            No specific weaknesses were
                            returned.
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            {result.experience.weaknesses.map(
                              (
                                item,
                                index,
                              ) => (
                                <li
                                  key={
                                    index
                                  }
                                  className="flex gap-3 text-sm leading-6 text-rose-900"
                                >
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                                  <span>
                                    {item}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* FORMATTING */}

                {activeTab ===
                  "formatting" && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
                      <ScoreRing
                        score={
                          result
                            .formatting
                            .score
                        }
                        size="small"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Formatting score
                        </p>

                        <h3 className="mt-1 text-xl font-black text-slate-900">
                          {
                            result
                              .formatting
                              .score
                          }{" "}
                          / 100
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          ATS compatibility of the resume
                          structure and formatting.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm font-bold text-slate-800">
                        Formatting issues
                      </h4>

                      {result.formatting
                        .issues
                        .length ===
                      0 ? (
                        <EmptyState
                          title="No formatting issues detected"
                          description="The ATS analyzer did not identify formatting issues."
                        />
                      ) : (
                        <div className="space-y-3">
                          {result.formatting.issues.map(
                            (
                              issue,
                              index,
                            ) => (
                              <div
                                key={
                                  index
                                }
                                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
                              >
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                  !
                                </div>

                                <p className="text-sm leading-6 text-slate-700">
                                  {issue}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------ */}
            {/* RECOMMENDATIONS */}
            {/* ------------------------------------------------ */}

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900">
                  AI recommendations
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Areas the optimizer can improve while
                  preserving the factual content of your resume.
                </p>
              </div>

              {result.recommendations
                .length ===
              0 ? (
                <EmptyState
                  title="No recommendations returned"
                  description="The ATS analyzer did not return additional recommendations."
                />
              ) : (
                <div className="space-y-3">
                  {result.recommendations.map(
                    (
                      recommendation,
                      index,
                    ) => (
                      <div
                        key={
                          index
                        }
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-start"
                      >
                        <span
                          className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getPriorityClass(
                            recommendation.priority,
                          )}`}
                        >
                          {
                            recommendation.priority
                          }
                        </span>

                        <p className="text-sm leading-6 text-slate-700">
                          {
                            recommendation.recommendation
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* ------------------------------------------------ */}
            {/* OPTIMIZATION PANEL */}
            {/* ------------------------------------------------ */}

            <div className="mt-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                    <SparklesIcon />
                    AI optimization
                  </div>

                  <h3 className="mt-4 text-2xl font-black text-slate-900">
                    Improve this resume
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    HirePro will use the ATS findings to improve
                    keyword coverage, skills alignment, summary,
                    experience wording, and ATS compatibility
                    without inventing facts.
                  </p>
                </div>

                {/* PAGE COUNT */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Optimized resume length
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Choose the target page density for the
                        generated PDF.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          1,
                          2,
                          3,
                        ] as ResumePageCount[]
                      ).map(
                        (pages) => {
                          const selected =
                            resumePageCount ===
                            pages;

                          return (
                            <button
                              key={
                                pages
                              }
                              type="button"
                              onClick={() =>
                                setResumePageCount(
                                  pages,
                                )
                              }
                              className={`min-w-[70px] rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                selected
                                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              {pages}{" "}
                              {pages ===
                              1
                                ? "page"
                                : "pages"}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white bg-white/80 p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <SparklesIcon />
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      Keyword optimization
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Improves relevant terminology based on the
                      ATS analysis and optional job description.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white bg-white/80 p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <CheckIcon />
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      Fact preservation
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Existing education, experience, projects,
                      skills, and other facts remain protected.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white bg-white/80 p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <RefreshIcon />
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      Score verification
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      The optimized resume is sent through ATS
                      verification again before the result is shown.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Target length:{" "}
                      {resumePageCount}{" "}
                      {resumePageCount ===
                      1
                        ? "page"
                        : "pages"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      You can download the optimized PDF after
                      generation.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      improveResume
                    }
                    disabled={
                      optimizing ||
                      analyzing ||
                      !file ||
                      !result
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {optimizing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Optimizing resume...
                      </>
                    ) : (
                      <>
                        <SparklesIcon />
                        Optimize resume with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------ */}
            {/* FINAL DOWNLOAD */}
            {/* ------------------------------------------------ */}

            {optimizedResume && (
              <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
                <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5 sm:px-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckIcon />
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-emerald-950">
                        Optimized resume ready
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-emerald-800">
                        Your AI-optimized resume has been
                        generated. Download the ATS-friendly PDF
                        below.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Target length
                      </p>

                      <p className="mt-1 text-lg font-black text-slate-900">
                        {resumePageCount}{" "}
                        {resumePageCount ===
                        1
                          ? "page"
                          : "pages"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Original score
                      </p>

                      <p className="mt-1 text-lg font-black text-slate-900">
                        {originalScore}
                        /100
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        New score
                      </p>

                      <p className="mt-1 text-lg font-black text-emerald-700">
                        {optimizedScore ??
                          "Pending"}
                        {optimizedScore !==
                          null &&
                          "/100"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        downloadOptimizedResume
                      }
                      disabled={
                        downloadLoading
                      }
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {downloadLoading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Generating optimized PDF...
                        </>
                      ) : (
                        <>
                          <DownloadIcon />
                          Download optimized resume
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={
                        improveResume
                      }
                      disabled={
                        optimizing ||
                        !file ||
                        !result
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RefreshIcon />
                      Optimize again
                    </button>
                  </div>

                  {!optimizedATSResult && (
                    <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                      The ATS verification score was not
                      available, but the optimized resume can
                      still be downloaded.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* RESET */}
            {/* ------------------------------------------------ */}

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
                    fileInputRef.current
                  ) {
                    fileInputRef.current.value =
                      "";
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800"
              >
                <RefreshIcon />
                Start with another resume
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* EMPTY STATE */}
        {/* ---------------------------------------------------- */}

        {!result && (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FileIcon />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900">
              Your ATS analysis will appear here
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Upload your existing PDF resume above and click
              Analyze resume. HirePro will inspect the resume
              before any optimization is performed.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}