"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, Wand2, X } from "lucide-react";

export type AIResumeCoachMode =
  | "summary"
  | "bullets"
  | "project"
  | "achievement";

export default function AIResumeCoach({
  mode,
  content,
  context,
  onApply,
}: {
  mode: AIResumeCoachMode;
  content: string;
  context?: string;
  onApply: (value: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    improved: string;
    alternatives: string[];
    notes: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title =
    mode === "summary"
      ? "Improve summary"
      : mode === "bullets"
        ? "Improve bullets"
        : mode === "project"
          ? "Improve project"
          : "Improve achievement";

  async function enhance() {
    if (!content.trim()) {
      setError("Add some content first, then let HirePro improve it.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/resume/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mode, content, context }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to enhance this content.");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to enhance this content.");
    } finally {
      setLoading(false);
    }
  }

  function apply(value: string) {
    onApply(value);
    setResult(null);
    setError(null);
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={enhance}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {loading ? "HirePro is improving..." : title}
      </button>

      {error && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold leading-5 text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {result && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-blue-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Wand2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">HirePro suggestion</p>
                <p className="text-[10px] font-semibold text-slate-500">Your facts are preserved. Only wording is improved.</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{result.improved}</p>

            {result.notes && (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-medium leading-5 text-slate-500">
                {result.notes}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => apply(result.improved)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-700"
              >
                <Check className="h-3.5 w-3.5" />
                Apply suggestion
              </button>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-50"
              >
                Keep original
              </button>
            </div>

            {result.alternatives.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-[11px] font-black text-slate-500">View other versions</summary>
                <div className="mt-3 space-y-2">
                  {result.alternatives.map((alternative, index) => (
                    <div key={`${alternative}-${index}`} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs leading-5 text-slate-600">{alternative}</p>
                      <button
                        type="button"
                        onClick={() => apply(alternative)}
                        className="mt-2 text-[11px] font-black text-blue-600 hover:text-blue-700"
                      >
                        Use this version
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
