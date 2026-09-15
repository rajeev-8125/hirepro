"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HistoryItem = {
  id: string;
  job_description: string | null;
  created_at: string;
  ats_results?: {
    overall_score: number;
    result: unknown;
  }[];
};

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Needs Work";
}

function getScoreClass(score: number) {
  if (score >= 80) {
    return "bg-green-50 text-green-700";
  }

  if (score >= 60) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-red-50 text-red-700";
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ATSHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/ats/history", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.details
              ? `${data.error}: ${data.details}`
              : data.error || "Failed to load ATS history."
          );
        }

        setHistory(data.history ?? []);
      } catch (err) {
        console.error("ATS history page error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load ATS history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              HirePro AI
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              ATS History
            </h1>

            <p className="mt-2 text-base text-slate-500">
              Review your previous resume analyses and track how your ATS
              score improves.
            </p>
          </div>

          <Link
            href="/dashboard/ats"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            New ATS Check →
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-5 w-48 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-72 rounded bg-slate-100" />
                <div className="mt-6 h-3 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-800">
              Failed to load ATS history
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-red-700">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && history.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              📊
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No ATS analyses yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Upload your resume and run your first ATS analysis to start
              building your history.
            </p>

            <Link
              href="/dashboard/ats"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Analyze Resume
            </Link>
          </div>
        )}

        {/* History List */}
        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item) => {
              const result = item.ats_results?.[0];

              const score = result?.overall_score ?? 0;

              const isJobSpecific =
                !!item.job_description &&
                item.job_description.trim().length > 0;

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/ats/history/${item.id}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    {/* Left */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-700">
                          ATS Resume Analysis
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getScoreClass(
                            score
                          )}`}
                        >
                          {getScoreLabel(score)}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {isJobSpecific
                            ? "Job Specific"
                            : "General Analysis"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {formatDate(item.created_at)}
                      </p>

                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                          <span>ATS Score</span>
                          <span>{score}/100</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: `${Math.min(
                                Math.max(score, 0),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Score
                        </p>

                        <p className="mt-1 text-4xl font-bold text-slate-900">
                          {score}
                        </p>
                      </div>

                      <div className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}