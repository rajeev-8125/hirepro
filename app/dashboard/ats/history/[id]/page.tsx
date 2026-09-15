"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

type ATSCheck = {
  id: string;
  job_description: string | null;
  created_at: string;
  ats_results:
    | {
        overall_score: number;
        result: ATSResult;
      }[]
    | null;
};

function ScoreCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="text-xl font-bold text-slate-900">{score}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function Tag({
  children,
  type = "normal",
}: {
  children: React.ReactNode;
  type?: "normal" | "missing";
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm ${
        type === "missing"
          ? "bg-red-50 text-red-700"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {children}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export default function ATSHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [check, setCheck] = useState<ATSCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const { id } = await params;

        const response = await fetch(`/api/ats/history/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load analysis.");
        }

        setCheck(data.check);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load analysis."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="mb-6 h-8 w-64 rounded bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (error || !check) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Analysis not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "This ATS analysis could not be loaded."}
          </p>

          <Link
            href="/dashboard/ats/history"
            className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to History
          </Link>
        </div>
      </main>
    );
  }

  const result = check.ats_results?.[0]?.result;

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Result unavailable
          </h1>

          <Link
            href="/dashboard/ats/history"
            className="mt-4 inline-block text-blue-600"
          >
            ← Back to History
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/ats/history"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to ATS History
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                ATS Analysis
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Resume Analysis Report
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {new Date(check.created_at).toLocaleString()}
              </p>
            </div>

            <Link
              href="/dashboard/ats"
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              New ATS Check
            </Link>
          </div>
        </div>

        {/* Overall Score */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 md:grid-cols-[180px_1fr] md:items-center">
            <div className="flex justify-center">
              <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-8 border-blue-100">
                <span className="text-4xl font-bold text-slate-900">
                  {result.overallScore}
                </span>
                <span className="text-sm text-slate-500">/ 100</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Overall ATS Score
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {result.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <ScoreCard
            title="Keyword Match"
            score={result.keywordMatch.score}
          />

          <ScoreCard
            title="Formatting"
            score={result.formatting.score}
          />

          <ScoreCard
            title="Experience"
            score={result.experience.score}
          />

          <ScoreCard
            title="Skills"
            score={result.skills.score}
          />
        </div>

        {/* Keywords */}
        <div className="mb-6">
          <Section title="Keyword Analysis">
            <div>
              <h3 className="mb-3 font-semibold text-slate-800">
                Matched Keywords
              </h3>

              <div className="flex flex-wrap gap-2">
                {result.keywordMatch.matchedKeywords.length > 0 ? (
                  result.keywordMatch.matchedKeywords.map((keyword) => (
                    <Tag key={keyword}>{keyword}</Tag>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No matched keywords found.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 font-semibold text-slate-800">
                Missing Keywords
              </h3>

              <div className="flex flex-wrap gap-2">
                {result.keywordMatch.missingKeywords.length > 0 ? (
                  result.keywordMatch.missingKeywords.map((keyword) => (
                    <Tag key={keyword} type="missing">
                      {keyword}
                    </Tag>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No important keywords appear to be missing.
                  </p>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <Section title="Skills Analysis">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-slate-800">
                  Matched Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {result.skills.matchedSkills.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-slate-800">
                  Missing Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {result.skills.missingSkills.map((skill) => (
                    <Tag key={skill} type="missing">
                      {skill}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <Section title="Experience Analysis">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-green-700">
                  Strengths
                </h3>

                <ul className="space-y-3">
                  {result.experience.strengths.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-xl bg-green-50 p-3 text-sm leading-6 text-slate-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-red-700">
                  Weaknesses
                </h3>

                <ul className="space-y-3">
                  {result.experience.weaknesses.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-slate-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        </div>

        {/* Formatting */}
        <div className="mb-6">
          <Section title="Formatting Analysis">
            {result.formatting.issues.length > 0 ? (
              <ul className="space-y-3">
                {result.formatting.issues.map((issue, index) => (
                  <li
                    key={index}
                    className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-slate-700"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No major formatting issues were detected.
              </p>
            )}
          </Section>
        </div>

        {/* Recommendations */}
        <Section title="AI Recommendations">
          <div className="space-y-4">
            {result.recommendations.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="mb-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      item.priority === "high"
                        ? "bg-red-50 text-red-700"
                        : item.priority === "medium"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.priority} priority
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-700">
                  {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Job Description */}
        {check.job_description && (
          <div className="mt-6">
            <Section title="Job Description Used">
              <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                {check.job_description}
              </div>
            </Section>
          </div>
        )}
      </div>
    </main>
  );
}