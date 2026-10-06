"use client";

import { useMemo, useState } from "react";
import { Check, ImageOff, Search, UserRound } from "lucide-react";

import type { ResumeTemplateId } from "@/lib/resume/template-types";

type TemplateItem = {
  id: ResumeTemplateId;
  name: string;
  category?: string;
  preview?: string;
  image?: string;
  thumbnail?: string;
  description?: string;
  supportsPhoto?: boolean;
  photo?: boolean;
};

type TemplateGalleryProps = {
  templates: TemplateItem[];
  selectedId: ResumeTemplateId;
  onSelect: (id: ResumeTemplateId) => void;
};

function PreviewImage({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  const [loading, setLoading] = useState(Boolean(src));
  const [failed, setFailed] = useState(false);

  const normalizedSrc = useMemo(() => {
    if (!src) return "";

    try {
      return encodeURI(src);
    } catch {
      return src;
    }
  }, [src]);

  if (!normalizedSrc || failed) {
    return (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-2 px-4 text-center text-slate-400">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs font-medium">
            Template preview unavailable
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-slate-100">
      {loading && (
        <div className="absolute inset-0 z-10 animate-pulse bg-slate-100" />
      )}

      <img
        src={normalizedSrc}
        alt={alt}
        className={[
          "h-full w-full object-cover object-top transition duration-300",
          loading ? "opacity-0" : "opacity-100",
        ].join(" ")}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
      />
    </div>
  );
}

function normalizeCategory(category?: string) {
  return category?.trim().toLowerCase() || "";
}

function getCategoryLabel(template: TemplateItem) {
  const category = normalizeCategory(template.category);

  if (category.includes("student")) return "Student";
  if (category.includes("creative")) return "Creative";
  if (category.includes("ats")) return "ATS";
  if (category.includes("professional")) return "Professional";

  return template.category || "Professional";
}

function getPreviewSource(template: TemplateItem) {
  return (
    template.preview ||
    template.image ||
    template.thumbnail ||
    `/resume-templates/${template.id}(1).png`
  );
}

function supportsPhoto(template: TemplateItem) {
  return Boolean(template.supportsPhoto ?? template.photo);
}

export default function TemplateGallery({
  templates,
  selectedId,
  onSelect,
}: TemplateGalleryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    const values = new Set<string>();

    templates.forEach((template) => {
      values.add(getCategoryLabel(template));
    });

    return ["All", ...Array.from(values)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesCategory =
        category === "All" || getCategoryLabel(template) === category;

      if (!matchesCategory) return false;

      if (!query) return true;

      const searchableText = [
        template.name,
        template.category,
        template.description,
        template.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [templates, search, category]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Choose a template
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Start with a professional design. You can customize the styling
              after selecting a template.
            </p>
          </div>

          <div className="text-xs font-medium text-slate-400">
            {filteredTemplates.length}{" "}
            {filteredTemplates.length === 1 ? "template" : "templates"}
          </div>
        </div>
      </div>

      {/* Search + categories */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => {
            const active = category === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={[
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Template cards */}
      {filteredTemplates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => {
            const selected = selectedId === template.id;
            const preview = getPreviewSource(template);
            const categoryLabel = getCategoryLabel(template);
            const hasPhoto = supportsPhoto(template);

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template.id)}
                className={[
                  "group relative overflow-hidden rounded-2xl border bg-white text-left transition-all",
                  selected
                    ? "border-slate-900 ring-2 ring-slate-900/10 shadow-lg"
                    : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md",
                ].join(" ")}
                aria-pressed={selected}
              >
                {/* Preview */}
                <div className="relative aspect-[828/1170] overflow-hidden bg-slate-100">
                  <PreviewImage
                    src={preview}
                    alt={`${template.name} resume template`}
                  />

                  {/* Hover overlay */}
                  <div
                    className={[
                      "absolute inset-0 flex items-center justify-center bg-slate-900/0 transition",
                      "group-hover:bg-slate-900/10",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg",
                        "opacity-0 transition group-hover:opacity-100",
                      ].join(" ")}
                    >
                      Use this template
                    </span>
                  </div>

                  {/* Selected badge */}
                  {selected && (
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Information */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-slate-900">
                        {template.name}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        {categoryLabel}
                      </p>
                    </div>

                    {hasPhoto && (
                      <span
                        title="Supports profile photo"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                      >
                        <UserRound className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>

                  {template.description && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                      {template.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={[
                        "text-xs font-semibold",
                        selected ? "text-slate-900" : "text-slate-500",
                      ].join(" ")}
                    >
                      {selected ? "Selected" : "Select template"}
                    </span>

                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {template.id}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <Search className="mx-auto h-7 w-7 text-slate-400" />

          <h4 className="mt-3 text-sm font-semibold text-slate-800">
            No templates found
          </h4>

          <p className="mt-1 text-xs text-slate-500">
            Try another search term or select a different category.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
            className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}