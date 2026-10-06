"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";
import LiveResumePreview from "@/components/resume/LiveResumePreview";
import { getTemplateDesign } from "@/lib/resume/template-library";
import {
  getDefaultCustomDesign,
  mergeDesign,
} from "@/lib/resume/design-utils";
import type { ResumeTemplateId } from "@/lib/resume/template-types";

type ResumePreviewStudioProps = {
  resume?: ResumeData | null;
  sampleResume?: ResumeData | null;
  design?: ResumeDesign | null;
  template: ResumeTemplateId;
  profilePhoto?: string | null;
  isSamplePreview?: boolean;
  isSaving?: boolean;
};

const EMPTY_RESUME: ResumeData = {
  personal: {
    name: "", email: "", phone: "", location: "",
    linkedin: "", github: "", website: "",
  },
  professionalSummary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  additionalSections: [],
};

function isUsableResume(value?: ResumeData | null): value is ResumeData {
  if (!value) return false;
  return Boolean(
    value.personal?.name?.trim() ||
    value.personal?.email?.trim() ||
    value.professionalSummary?.trim() ||
    value.skills?.some((g) => g.category?.trim() || g.items?.some((x) => x?.trim())) ||
    value.experience?.some((x) => x.company?.trim() || x.role?.trim() || x.responsibilities?.some((y) => y?.trim())) ||
    value.education?.some((x) => x.institution?.trim() || x.degree?.trim() || x.field?.trim()) ||
    value.projects?.some((x) => x.name?.trim() || x.description?.trim()) ||
    value.certifications?.some((x) => x.name?.trim() || x.issuer?.trim()) ||
    value.achievements?.some((x) => x?.trim()) ||
    value.languages?.some((x) => x?.trim()) ||
    value.additionalSections?.some((x) => x.title?.trim() || x.items?.some((y) => y?.trim()))
  );
}

function getEffectiveDesign(template: ResumeTemplateId, design?: ResumeDesign | null): ResumeDesign {
  const base = getTemplateDesign(template);
  const defaults = getDefaultCustomDesign(template);
  if (!design) return mergeDesign(base, defaults);
  const savedCustom = (design as ResumeDesign & { custom?: object }).custom ?? {};
  return mergeDesign(
    { ...base, ...design, colors: { ...base.colors, ...(design.colors ?? {}) }, typography: { ...base.typography, ...(design.typography ?? {}) }, header: { ...base.header, ...(design.header ?? {}) }, sections: { ...base.sections, ...(design.sections ?? {}) }, sidebar: { ...base.sidebar, ...(design.sidebar ?? {}) }, visual: { ...base.visual, ...(design.visual ?? {}) }, ats: { ...base.ats, ...(design.ats ?? {}) } },
    { ...defaults, ...(savedCustom as Partial<ReturnType<typeof getDefaultCustomDesign>>) },
  );
}

const ZOOM_LEVELS = [50, 60, 70, 80, 90, 100, 110, 120];

export default function ResumePreviewStudio({
  resume,
  sampleResume,
  design,
  template,
  profilePhoto,
  isSamplePreview = false,
  isSaving = false,
}: ResumePreviewStudioProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [zoomIndex, setZoomIndex] = useState(4);
  const [fullscreen, setFullscreen] = useState(false);

  const effectiveResume = useMemo(() => {
    if (isUsableResume(resume)) {
      return resume;
    }

    if (isUsableResume(sampleResume)) return sampleResume;
    return EMPTY_RESUME;
  }, [resume, sampleResume]);

  const effectiveDesign = useMemo(
    () => getEffectiveDesign(template, design),
    [template, design],
  );

  const zoom = ZOOM_LEVELS[zoomIndex];

  const previewWidth = device === "mobile" ? 430 : 794;

  const scaledWidth = Math.round((previewWidth * zoom) / 100);

  useEffect(() => {
    if (!fullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  function zoomIn() {
    setZoomIndex((current) =>
      Math.min(current + 1, ZOOM_LEVELS.length - 1),
    );
  }

  function zoomOut() {
    setZoomIndex((current) => Math.max(current - 1, 0));
  }

  function resetZoom() {
    setZoomIndex(4);
  }

  const preview = (
    <div
      className={[
        "relative overflow-auto rounded-2xl border border-slate-200 bg-slate-100",
        fullscreen ? "h-[calc(100vh-130px)]" : "h-[calc(100vh-240px)] min-h-[680px]",
      ].join(" ")}
    >
      <div
        className="flex min-h-full min-w-full items-start justify-center p-6"
        style={{
          width: Math.max(scaledWidth + 48, 100),
        }}
      >
        <div
          className="origin-top shadow-2xl transition-transform duration-200"
          style={{
            width: previewWidth,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            marginBottom: `${Math.round((1123 * zoom) / 100)}px`,
          }}
        >
          <LiveResumePreview
            resume={effectiveResume}
            design={effectiveDesign}
            template={template}
            profilePhoto={profilePhoto}
          />
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950">
        {/* Fullscreen toolbar */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950 px-4 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Monitor className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Resume Preview
              </p>

              <p className="text-xs text-white/50">
                {isSamplePreview ? "Template sample" : "Live preview"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoomIndex === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={resetZoom}
              className="min-w-[52px] rounded-lg px-2 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
              title="Reset zoom"
            >
              {zoom}%
            </button>

            <button
              type="button"
              onClick={zoomIn}
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Minimize2 className="h-4 w-4" />
            Exit
          </button>
        </div>

        <div className="min-h-0 flex-1 p-4">{preview}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Studio header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              Live Preview
            </h3>

            {isSamplePreview && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                Sample
              </span>
            )}

            {isSaving && (
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                Saving
              </span>
            )}
          </div>

          <p className="mt-0.5 text-xs text-slate-400">
            Changes appear here instantly
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={[
              "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition",
              device === "desktop"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50",
            ].join(" ")}
            title="Desktop preview"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={[
              "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition",
              device === "mobile"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50",
            ].join(" ")}
            title="Mobile preview"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Mobile</span>
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200" />

          <button
            type="button"
            onClick={zoomOut}
            disabled={zoomIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={resetZoom}
            className="min-w-[42px] rounded-lg px-1.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
            title="Reset zoom"
          >
            {zoom}%
          </button>

          <button
            type="button"
            onClick={zoomIn}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200" />

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            title="Fullscreen preview"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {preview}
    </div>
  );
}