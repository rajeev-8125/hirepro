"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  Award,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  Languages,
  LayoutTemplate,
  Loader2,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  User,
  Wand2,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";

import { createClient } from "@/lib/supabase/client";

/* ============================================================
   TYPES
============================================================ */

type TemplateId =
  | "ats"
  | "professional"
  | "modern"
  | "executive"
  | "shawn"
  | "pedro"
  | "daniel"
  | "adam"
  | "olivia"
  | "francisco";

type EditorTab = "information" | "design";

type SectionName =
  | "personal"
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "achievements"
  | "languages";

type EditorSettings = {
  paper: "A4" | "Letter";

  font: string;

  fontSize: number;

  lineHeight: number;

  marginX: number;

  marginY: number;

  sectionGap: number;

  itemGap: number;

  bulletGap: number;

  nameCase:
    | "normal"
    | "uppercase"
    | "lowercase";

  headingCase:
    | "normal"
    | "uppercase"
    | "capitalize";

  headerDelimiter:
    | "•"
    | "|"
    | "—"
    | "◇"
    | "◆";

  listStyle:
    | "bullet"
    | "circle"
    | "square"
    | "number"
    | "none";

  dateFormat:
    | "MMM YYYY"
    | "MM/YYYY"
    | "YYYY"
    | "MMM YYYY – MMM YYYY";
};

type DraftState = {
  resume: ResumeData;

  design: ResumeDesign;

  template: TemplateId;

  settings: EditorSettings;

  profilePhoto: string | null;

  designDescription: string;

  savedAt: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const DRAFT_KEY =
  "hirepro-resume-builder-draft-v2";

const FONT_OPTIONS = [
  "Arial",
  "Inter",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Verdana",
];

const COLOR_PRESETS = [
  {
    name: "Ink",
    primary: "#111827",
    secondary: "#334155",
  },

  {
    name: "Blue",
    primary: "#2563eb",
    secondary: "#1e40af",
  },

  {
    name: "Navy",
    primary: "#0f172a",
    secondary: "#1d4ed8",
  },

  {
    name: "Purple",
    primary: "#7c3aed",
    secondary: "#5b21b6",
  },

  {
    name: "Teal",
    primary: "#0f766e",
    secondary: "#115e59",
  },

  {
    name: "Red",
    primary: "#dc2626",
    secondary: "#991b1b",
  },

  {
    name: "Orange",
    primary: "#ea580c",
    secondary: "#9a3412",
  },

  {
    name: "Emerald",
    primary: "#059669",
    secondary: "#047857",
  },
];

const TEMPLATE_META: Array<{
  id: TemplateId;

  name: string;

  description: string;

  backend:
    | "ats"
    | "professional"
    | "modern"
    | "executive";

  accent: string;
}> = [
  {
    id: "ats",
    name: "ATS Classic",
    description:
      "Single-column, parsing-first",
    backend: "ats",
    accent: "#111827",
  },

  {
    id: "professional",
    name: "Professional",
    description:
      "Clean corporate hierarchy",
    backend: "professional",
    accent: "#2563eb",
  },

  {
    id: "modern",
    name: "Modern",
    description:
      "Contemporary recruiter layout",
    backend: "modern",
    accent: "#0f766e",
  },

  {
    id: "executive",
    name: "Executive",
    description:
      "Premium leadership style",
    backend: "executive",
    accent: "#7c3aed",
  },

  {
    id: "shawn",
    name: "Shawn",
    description:
      "Blue minimalist corporate",
    backend: "professional",
    accent: "#2563eb",
  },

  {
    id: "pedro",
    name: "Pedro",
    description:
      "Marketing two-column reference",
    backend: "modern",
    accent: "#111827",
  },

  {
    id: "daniel",
    name: "Daniel",
    description:
      "Infographic-inspired",
    backend: "modern",
    accent: "#111827",
  },

  {
    id: "adam",
    name: "Adam",
    description:
      "Marketing ATS-inspired",
    backend: "professional",
    accent: "#111827",
  },

  {
    id: "olivia",
    name: "Olivia",
    description:
      "Student / fresher CV",
    backend: "professional",
    accent: "#111827",
  },

  {
    id: "francisco",
    name: "Francisco",
    description:
      "Classic professional two-column",
    backend: "professional",
    accent: "#0f172a",
  },
];

const DEFAULT_SETTINGS: EditorSettings = {
  paper: "A4",

  font: "Arial",

  fontSize: 10.5,

  lineHeight: 1.22,

  marginX: 0.55,

  marginY: 0.5,

  sectionGap: 0.16,

  itemGap: 0.1,

  bulletGap: 0,

  nameCase: "uppercase",

  headingCase: "uppercase",

  headerDelimiter: "•",

  listStyle: "bullet",

  dateFormat: "MMM YYYY",
};

/* ============================================================
   EMPTY RESUME
============================================================ */

function emptyResume(): ResumeData {
  return {
    personal: {
      name: "",

      email: "",

      phone: "",

      location: "",

      linkedin: "",

      github: "",

      website: "",
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
}

/* ============================================================
   NORMALIZE RESUME
============================================================ */

function normalizeResume(
  data: unknown,
): ResumeData {
  const value = data as any;

  const base = emptyResume();

  return {
    personal: {
      ...base.personal,

      ...(value?.personal ?? {}),
    },

    professionalSummary:
      typeof value?.professionalSummary ===
      "string"
        ? value.professionalSummary
        : "",

    skills: Array.isArray(value?.skills)
      ? value.skills.map(
          (x: any) => ({
            category: String(
              x?.category ?? "",
            ),

            items: Array.isArray(
              x?.items,
            )
              ? x.items.filter(
                  (v: any) =>
                    typeof v ===
                    "string",
                )
              : [],
          }),
        )
      : [],

    experience: Array.isArray(
      value?.experience,
    )
      ? value.experience.map(
          (x: any) => ({
            company: String(
              x?.company ?? "",
            ),

            role: String(
              x?.role ?? "",
            ),

            location: String(
              x?.location ?? "",
            ),

            startDate: String(
              x?.startDate ?? "",
            ),

            endDate: String(
              x?.endDate ?? "",
            ),

            responsibilities:
              Array.isArray(
                x?.responsibilities,
              )
                ? x.responsibilities.filter(
                    (v: any) =>
                      typeof v ===
                      "string",
                  )
                : [],
          }),
        )
      : [],

    education: Array.isArray(
      value?.education,
    )
      ? value.education.map(
          (x: any) => ({
            institution: String(
              x?.institution ?? "",
            ),

            degree: String(
              x?.degree ?? "",
            ),

            field: String(
              x?.field ?? "",
            ),

            startDate: String(
              x?.startDate ?? "",
            ),

            endDate: String(
              x?.endDate ?? "",
            ),

            details:
              Array.isArray(
                x?.details,
              )
                ? x.details.filter(
                    (v: any) =>
                      typeof v ===
                      "string",
                  )
                : [],
          }),
        )
      : [],

    projects: Array.isArray(
      value?.projects,
    )
      ? value.projects.map(
          (x: any) => ({
            name: String(
              x?.name ?? "",
            ),

            description: String(
              x?.description ?? "",
            ),

            technologies:
              Array.isArray(
                x?.technologies,
              )
                ? x.technologies.filter(
                    (v: any) =>
                      typeof v ===
                      "string",
                  )
                : [],

            url: String(
              x?.url ?? "",
            ),
          }),
        )
      : [],

    certifications:
      Array.isArray(
        value?.certifications,
      )
        ? value.certifications.map(
            (x: any) => ({
              name: String(
                x?.name ?? "",
              ),

              issuer: String(
                x?.issuer ?? "",
              ),

              date: String(
                x?.date ?? "",
              ),

              url: String(
                x?.url ?? "",
              ),
            }),
          )
        : [],

    achievements:
      Array.isArray(
        value?.achievements,
      )
        ? value.achievements.filter(
            (v: any) =>
              typeof v ===
              "string",
          )
        : [],

    languages:
      Array.isArray(
        value?.languages,
      )
        ? value.languages.filter(
            (v: any) =>
              typeof v ===
              "string",
          )
        : [],

    additionalSections:
      Array.isArray(
        value?.additionalSections,
      )
        ? value.additionalSections.map(
            (x: any) => ({
              title: String(
                x?.title ?? "",
              ),

              items:
                Array.isArray(
                  x?.items,
                )
                  ? x.items.filter(
                      (v: any) =>
                        typeof v ===
                        "string",
                    )
                  : [],
            }),
          )
        : [],
  };
}

/* ============================================================
   DEFAULT DESIGN
============================================================ */

function defaultDesign(
  template: TemplateId = "professional",
): ResumeDesign {
  const meta =
    TEMPLATE_META.find(
      (x) => x.id === template,
    ) ??
    TEMPLATE_META[1];

  const twoColumn = [
    "pedro",
    "daniel",
    "francisco",
  ].includes(template);

  const style = meta.backend;

  return {
    layout: twoColumn
      ? "two-column"
      : "single-column",

    density:
      template === "ats" ||
      template === "olivia"
        ? "compact"
        : "balanced",

    style,

    colors: {
      primary: meta.accent,

      secondary:
        style === "executive"
          ? "#475569"
          : "#334155",

      text: "#172033",

      mutedText: "#64748b",

      background: "#ffffff",

      border: "#dbe2ea",
    },

    typography: {
      headingFont: "Helvetica",

      bodyFont: "Helvetica",

      headingSize:
        template === "ats"
          ? "small"
          : "medium",

      bodySize: "medium",
    },

    header: {
      alignment: "left",

      photo: {
        enabled: false,

        position: "right",

        shape: "circle",

        size: "medium",
      },
    },

    sections: {
      order: [
        "summary",
        "skills",
        "experience",
        "projects",
        "education",
        "certifications",
        "achievements",
        "languages",
      ],

      emphasis: [
        "experience",
        "skills",
        "projects",
      ],
    },

    sidebar: {
      enabled: twoColumn,

      sections: [
        "skills",
        "education",
        "certifications",
        "languages",
      ],
    },

    visual: {
      borderStyle:
        template === "ats"
          ? "none"
          : "subtle",

      cardStyle: "none",

      accentStyle:
        template === "daniel"
          ? "badge"
          : "line",
    },

    ats: {
      safe: true,

      tablesUsed: false,

      graphicsUsed: false,

      recommendedForATS:
        template === "ats" ||
        template ===
          "professional" ||
        template === "olivia",
    },
  };
}

/* ============================================================
   DESIGN MERGE
============================================================ */

function mergeDesign(
  base: ResumeDesign,
  patch: Partial<ResumeDesign>,
): ResumeDesign {
  return {
    ...base,

    ...patch,

    colors: {
      ...base.colors,

      ...(patch.colors ?? {}),
    },

    typography: {
      ...base.typography,

      ...(patch.typography ?? {}),
    },

    header: {
      ...base.header,

      ...(patch.header ?? {}),

      photo: {
        ...base.header.photo,

        ...(patch.header?.photo ??
          {}),
      },
    },

    sections: {
      ...base.sections,

      ...(patch.sections ?? {}),
    },

    sidebar: {
      ...base.sidebar,

      ...(patch.sidebar ?? {}),
    },

    visual: {
      ...base.visual,

      ...(patch.visual ?? {}),
    },

    ats: {
      ...base.ats,

      ...(patch.ats ?? {}),
    },
  };
}

/* ============================================================
   BACKEND TEMPLATE
============================================================ */

function templateBackend(
  id: TemplateId,
) {
  return (
    TEMPLATE_META.find(
      (x) => x.id === id,
    )?.backend ??
    "professional"
  );
}

/* ============================================================
   INITIALS
============================================================ */

function initials(
  name: string,
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return (
    parts
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase() ||
    "CV"
  );
}

/* ============================================================
   INPUT
============================================================ */

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;

  value: string;

  onChange: (
    value: string,
  ) => void;

  placeholder?: string;

  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <input
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

/* ============================================================
   TEXT AREA
============================================================ */

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;

  value: string;

  onChange: (
    value: string,
  ) => void;

  placeholder?: string;

  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

/* ============================================================
   SECTION CARD
============================================================ */

function SectionCard({
  icon,
  title,
  description,
  open,
  onToggle,
  children,
}: {
  icon: ReactNode;

  title: string;

  description: string;

  open: boolean;

  onToggle: () => void;

  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </div>

          <div>
            <div className="text-sm font-extrabold text-slate-900">
              {title}
            </div>

            <div className="text-[11px] text-slate-500">
              {description}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4">
          {children}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   BUTTON
============================================================ */

function Button({
  children,
  onClick,
  variant = "secondary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;

  onClick?: () => void;

  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "danger";

  disabled?: boolean;

  type?: "button" | "submit";

  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : variant === "danger"
        ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
        : variant === "ghost"
          ? "bg-transparent text-slate-600 hover:bg-slate-100"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   TEMPLATE MINI PREVIEW
============================================================ */

function TemplateMini({
  template,
  selected,
  onClick,
}: {
  template: TemplateId;

  selected: boolean;

  onClick: () => void;
}) {
  const meta =
    TEMPLATE_META.find(
      (x) => x.id === template,
    )!;

  const twoColumn = [
    "pedro",
    "daniel",
    "francisco",
  ].includes(template);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group overflow-hidden rounded-2xl border-2 bg-slate-100 p-2 text-left transition ${
        selected
          ? "border-blue-500 ring-4 ring-blue-50"
          : "border-transparent hover:border-slate-300"
      }`}
    >
      <div className="relative aspect-[0.707] overflow-hidden rounded-lg bg-white shadow-sm">
        <div
          className="h-full p-3"
          style={{
            fontFamily:
              template ===
              "olivia"
                ? "Georgia"
                : "Arial",
          }}
        >
          <div
            className={`mb-2 ${
              twoColumn
                ? "text-center"
                : ""
            }`}
          >
            <div
              className="h-2.5 w-20 rounded"
              style={{
                background:
                  meta.accent,
              }}
            />

            <div className="mt-1 h-1.5 w-12 rounded bg-slate-300" />

            <div className="mt-2 h-px w-full bg-slate-200" />
          </div>

          {twoColumn ? (
            <div className="grid grid-cols-[0.75fr_1.25fr] gap-2">
              <div className="space-y-2">
                <div className="h-16 rounded bg-slate-100" />

                <div className="h-10 rounded bg-slate-100" />
              </div>

              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-slate-200" />

                <div className="h-14 rounded bg-slate-50" />

                <div className="h-3 w-24 rounded bg-slate-200" />

                <div className="h-20 rounded bg-slate-50" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className="h-3 w-24 rounded"
                style={{
                  background:
                    meta.accent,

                  opacity: 0.85,
                }}
              />

              <div className="h-12 rounded bg-slate-50" />

              <div className="h-3 w-20 rounded bg-slate-300" />

              <div className="h-16 rounded bg-slate-50" />

              <div className="h-3 w-16 rounded bg-slate-300" />

              <div className="h-10 rounded bg-slate-50" />
            </div>
          )}
        </div>

        {selected && (
          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="px-1 pb-1 pt-2">
        <div className="text-sm font-extrabold text-slate-900">
          {meta.name}
        </div>

        <div className="mt-0.5 text-[10px] text-slate-500">
          {meta.description}
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   LIVE RESUME CANVAS
============================================================ */

function ResumeCanvas({
  resume,
  design,
  template,
  settings,
  profilePhoto,
  onNameChange,
  onSummaryChange,
}: {
  resume: ResumeData;

  design: ResumeDesign;

  template: TemplateId;

  settings: EditorSettings;

  profilePhoto: string | null;

  onNameChange: (
    value: string,
  ) => void;

  onSummaryChange: (
    value: string,
  ) => void;
}) {
  const primary =
    design.colors.primary;

  const text =
    design.colors.text;

  const muted =
    design.colors.mutedText;

  const twoColumn = [
    "pedro",
    "daniel",
    "francisco",
  ].includes(template);

  const name =
    resume.personal.name ||
    "YOUR NAME";

  const headline =
    resume.experience[0]
      ?.role ||
    "Professional Title";

  const summary =
    resume.professionalSummary ||
    "Add a concise professional summary. Your live preview will update as you type.";

  const bodySize =
    settings.fontSize;

  const sectionGap =
    settings.sectionGap * 16;

  const itemGap =
    settings.itemGap * 16;

  const bulletGap =
    settings.bulletGap * 8;

  const nameTransform =
    settings.nameCase ===
    "uppercase"
      ? "uppercase"
      : settings.nameCase ===
          "lowercase"
        ? "lowercase"
        : "none";

  const headingTransform =
    settings.headingCase ===
    "uppercase"
      ? "uppercase"
      : settings.headingCase ===
          "capitalize"
        ? "capitalize"
        : "none";

  const bullet =
    settings.listStyle ===
    "circle"
      ? "○"
      : settings.listStyle ===
          "square"
        ? "■"
        : settings.listStyle ===
            "number"
          ? "1."
          : settings.listStyle ===
              "none"
            ? ""
            : "•";

  const Inline = ({
    value,
    onChange,
    className = "",
  }: {
    value: string;

    onChange: (
      value: string,
    ) => void;

    className?: string;
  }) => (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) =>
        onChange(
          e.currentTarget
            .textContent || "",
        )
      }
      className={`rounded px-0.5 outline-none hover:bg-blue-50 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 ${className}`}
    >
      {value}
    </span>
  );

  const Section = ({
    title,
    children,
  }: {
    title: string;

    children: ReactNode;
  }) => (
    <section
      style={{
        marginBottom:
          sectionGap,
      }}
    >
      <div
        className="mb-2 flex items-center gap-2"
        style={{
          color: primary,
        }}
      >
        <h3
          className="text-[10px] font-black tracking-[0.14em]"
          style={{
            textTransform:
              headingTransform,
          }}
        >
          {title}
        </h3>

        <div
          className="h-px flex-1"
          style={{
            background:
              design.colors
                .border,
          }}
        />
      </div>

      {children}
    </section>
  );

  const Contact = () => (
    <div
      className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[8px]"
      style={{
        color: muted,
      }}
    >
      {[
        resume.personal.email,

        resume.personal.phone,

        resume.personal.location,
      ]
        .filter(Boolean)
        .map((x, i) => (
          <span
            key={`${x}-${i}`}
          >
            {i
              ? `${settings.headerDelimiter} `
              : ""}
            {x}
          </span>
        ))}
    </div>
  );

  const Links = () => (
    <div
      className="mt-1 flex flex-wrap gap-x-2 text-[7.5px]"
      style={{
        color: primary,
      }}
    >
      {[
        resume.personal
          .linkedin,

        resume.personal.github,

        resume.personal.website,
      ]
        .filter(Boolean)
        .map((x, i) => (
          <span
            key={`${x}-${i}`}
          >
            {i
              ? `${settings.headerDelimiter} `
              : ""}
            {x.replace(
              /^https?:\/\//,
              "",
            )}
          </span>
        ))}
    </div>
  );

  const Experience =
    () =>
      resume.experience
        .length ? (
        <Section title="Experience">
          {resume.experience.map(
            (x, i) => (
              <div
                key={i}
                style={{
                  marginBottom:
                    itemGap,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div
                      className="font-bold"
                      style={{
                        fontSize:
                          bodySize +
                          1,
                        color: text,
                      }}
                    >
                      {x.role ||
                        "Role"}
                    </div>

                    <div
                      className="font-bold"
                      style={{
                        fontSize:
                          bodySize -
                          0.5,
                        color:
                          primary,
                      }}
                    >
                      {x.company ||
                        "Company"}
                    </div>
                  </div>

                  <div
                    className="shrink-0 text-right text-[7.5px]"
                    style={{
                      color: muted,
                    }}
                  >
                    {[
                      x.startDate,

                      x.endDate,
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(
                        " — ",
                      )}
                  </div>
                </div>

                {x.location && (
                  <div
                    className="mt-0.5 text-[7.5px]"
                    style={{
                      color: muted,
                    }}
                  >
                    {x.location}
                  </div>
                )}

                <ul className="mt-1 space-y-0.5">
                  {(x
                    .responsibilities
                    .length
                    ? x.responsibilities
                    : [
                        "Add a measurable accomplishment or responsibility.",
                      ]
                  ).map(
                    (b, bi) => (
                      <li
                        key={bi}
                        className="flex gap-1.5"
                        style={{
                          fontSize:
                            bodySize -
                            1,

                          lineHeight:
                            settings.lineHeight,

                          marginBottom:
                            bulletGap,
                        }}
                      >
                        <span
                          style={{
                            color:
                              primary,

                            minWidth:
                              bullet
                                ? 8
                                : 0,
                          }}
                        >
                          {bullet}
                        </span>

                        <span>
                          {b}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ),
          )}
        </Section>
      ) : null;

  const Education =
    () =>
      resume.education
        .length ? (
        <Section title="Education">
          {resume.education.map(
            (x, i) => (
              <div
                key={i}
                style={{
                  marginBottom:
                    itemGap,
                }}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <div
                      className="font-bold"
                      style={{
                        fontSize:
                          bodySize,

                        color: text,
                      }}
                    >
                      {x.degree ||
                        "Degree"}

                      {x.field
                        ? ` — ${x.field}`
                        : ""}
                    </div>

                    <div
                      className="font-semibold"
                      style={{
                        fontSize:
                          bodySize -
                          0.5,

                        color:
                          primary,
                      }}
                    >
                      {x.institution ||
                        "Institution"}
                    </div>

                    {x.details?.map(
                      (d, j) => (
                        <div
                          key={j}
                          className="mt-0.5 text-[7.5px]"
                          style={{
                            color:
                              muted,
                          }}
                        >
                          {d}
                        </div>
                      ),
                    )}
                  </div>

                  <div
                    className="text-right text-[7.5px]"
                    style={{
                      color: muted,
                    }}
                  >
                    {[
                      x.startDate,

                      x.endDate,
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(
                        " — ",
                      )}
                  </div>
                </div>
              </div>
            ),
          )}
        </Section>
      ) : null;

  const Skills =
    () =>
      resume.skills.length ? (
        <Section title="Skills">
          {resume.skills.map(
            (x, i) => (
              <div
                key={i}
                className="flex gap-2"
                style={{
                  marginBottom: 3,

                  fontSize:
                    bodySize - 1,
                }}
              >
                <strong className="w-24 shrink-0">
                  {x.category}
                </strong>

                <span>
                  {x.items.join(
                    ", ",
                  )}
                </span>
              </div>
            ),
          )}
        </Section>
      ) : null;

  const Projects =
    () =>
      resume.projects.length ? (
        <Section title="Projects">
          {resume.projects.map(
            (x, i) => (
              <div
                key={i}
                style={{
                  marginBottom:
                    itemGap,
                }}
              >
                <div
                  className="font-bold"
                  style={{
                    fontSize:
                      bodySize,
                  }}
                >
                  {x.name ||
                    "Project"}
                </div>

                <div
                  className="mt-1"
                  style={{
                    fontSize:
                      bodySize - 1,

                    lineHeight:
                      settings.lineHeight,
                  }}
                >
                  {x.description}
                </div>

                {x.technologies
                  .length >
                  0 && (
                  <div
                    className="mt-1 text-[7.5px] font-semibold"
                    style={{
                      color:
                        primary,
                    }}
                  >
                    {x.technologies.join(
                      " • ",
                    )}
                  </div>
                )}
              </div>
            ),
          )}
        </Section>
      ) : null;

  const Certifications =
    () =>
      resume.certifications
        .length ? (
        <Section title="Certifications">
          {resume.certifications.map(
            (x, i) => (
              <div
                key={i}
                className="mb-1.5"
                style={{
                  fontSize:
                    bodySize - 0.5,
                }}
              >
                <strong>
                  {x.name}
                </strong>

                {x.issuer
                  ? ` — ${x.issuer}`
                  : ""}

                {x.date
                  ? ` • ${x.date}`
                  : ""}
              </div>
            ),
          )}
        </Section>
      ) : null;

  const Achievements =
    () =>
      resume.achievements
        .length ? (
        <Section title="Achievements">
          <ul className="space-y-1">
            {resume.achievements.map(
              (x, i) => (
                <li
                  key={i}
                  className="flex gap-1.5"
                  style={{
                    fontSize:
                      bodySize - 1,
                  }}
                >
                  <span
                    style={{
                      color:
                        primary,
                    }}
                  >
                    {bullet}
                  </span>

                  <span>{x}</span>
                </li>
              ),
            )}
          </ul>
        </Section>
      ) : null;

  const Languages =
    () =>
      resume.languages.length ? (
        <Section title="Languages">
          <div className="flex flex-wrap gap-1.5">
            {resume.languages.map(
              (x, i) => (
                <span
                  key={i}
                  className="rounded-full px-2 py-1 text-[7.5px] font-semibold"
                  style={{
                    background: `${primary}12`,

                    color: primary,
                  }}
                >
                  {x}
                </span>
              ),
            )}
          </div>
        </Section>
      ) : null;

  const MainSections = () => (
    <>
      <Section title="Professional Summary">
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            onSummaryChange(
              e.currentTarget
                .textContent || "",
            )
          }
          className="rounded px-0.5 outline-none hover:bg-blue-50 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200"
          style={{
            fontSize:
              bodySize - 0.5,

            lineHeight:
              settings.lineHeight,
          }}
        >
          {summary}
        </div>
      </Section>

      <Skills />

      <Experience />

      <Projects />

      <Education />

      <Certifications />

      <Achievements />

      <Languages />
    </>
  );

  return (
    <div
      className="mx-auto w-full max-w-[760px]"
      style={{
        fontFamily:
          settings.font,
      }}
    >
      <div
        className="overflow-hidden rounded-sm bg-white shadow-2xl ring-1 ring-slate-200"
        style={{
          minHeight: 1030,
        }}
      >
        {template ===
        "pedro" ? (
          <div className="grid min-h-[1030px] grid-cols-[0.72fr_1.28fr]">
            <aside
              className="p-7 text-white"
              style={{
                background:
                  primary,
              }}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="mx-auto mb-5 h-24 w-24 object-cover"
                  style={{
                    borderRadius:
                      design
                        .header
                        .photo
                        .shape ===
                      "circle"
                        ? 999
                        : design
                              .header
                              .photo
                              .shape ===
                            "rounded"
                          ? 14
                          : 0,
                  }}
                />
              ) : (
                <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white/15 text-2xl font-black">
                  {initials(
                    name,
                  )}
                </div>
              )}

              <div className="text-center">
                <div
                  className="text-2xl font-black"
                  style={{
                    textTransform:
                      nameTransform,
                  }}
                >
                  <Inline
                    value={name}
                    onChange={
                      onNameChange
                    }
                  />
                </div>

                <div className="mt-1 text-xs opacity-80">
                  {headline}
                </div>
              </div>

              <div className="mt-7 space-y-4 text-[8px] opacity-90">
                <div>
                  <div className="mb-1 font-black uppercase tracking-widest">
                    Contact
                  </div>

                  <div>
                    {
                      resume
                        .personal
                        .email
                    }
                  </div>

                  <div>
                    {
                      resume
                        .personal
                        .phone
                    }
                  </div>

                  <div>
                    {
                      resume
                        .personal
                        .location
                    }
                  </div>
                </div>

                <div>
                  <div className="mb-1 font-black uppercase tracking-widest">
                    Skills
                  </div>

                  {resume.skills
                    .flatMap(
                      (x) =>
                        x.items,
                    )
                    .slice(
                      0,
                      10,
                    )
                    .map(
                      (
                        s,
                        i,
                      ) => (
                        <div
                          key={i}
                        >
                          • {s}
                        </div>
                      ),
                    )}
                </div>

                <div>
                  <div className="mb-1 font-black uppercase tracking-widest">
                    Languages
                  </div>

                  {resume.languages.map(
                    (s, i) => (
                      <div
                        key={i}
                      >
                        {s}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </aside>

            <main
              className="p-8"
              style={{
                color: text,
              }}
            >
              <h2
                className="text-lg font-black uppercase tracking-[0.18em]"
                style={{
                  color: primary,
                }}
              >
                About Me
              </h2>

              <div
                className="mb-5 mt-2 h-0.5 w-14"
                style={{
                  background:
                    primary,
                }}
              />

              <div className="text-[9px] leading-5">
                {summary}
              </div>

              <div className="mt-6">
                <Experience />

                <Projects />

                <Education />
              </div>
            </main>
          </div>
        ) : (
          <div
            className={`${
              twoColumn
                ? "grid grid-cols-[0.72fr_1.28fr]"
                : ""
            } min-h-[1030px]`}
          >
            {twoColumn && (
              <aside
                className="border-r p-6"
                style={{
                  background:
                    template ===
                    "daniel"
                      ? "#f8fafc"
                      : "#ffffff",

                  borderColor:
                    design
                      .colors
                      .border,
                }}
              >
                <div className="mb-5">
                  <div
                    className="text-2xl font-black"
                    style={{
                      color:
                        primary,

                      textTransform:
                        nameTransform,
                    }}
                  >
                    <Inline
                      value={name}
                      onChange={
                        onNameChange
                      }
                    />
                  </div>

                  <div
                    className="mt-1 text-xs font-semibold"
                    style={{
                      color: muted,
                    }}
                  >
                    {headline}
                  </div>
                </div>

                <Contact />

                <Links />

                <div className="mt-6">
                  <Skills />

                  <Education />

                  <Languages />
                </div>
              </aside>
            )}

            <main
              className={`${
                twoColumn
                  ? "p-7"
                  : "p-8"
              }`}
              style={{
                color: text,
              }}
            >
              {!twoColumn && (
                <header
                  className="mb-6 border-b pb-4"
                  style={{
                    borderColor:
                      design
                        .colors
                        .border,
                  }}
                >
                  <div className="flex items-center justify-between gap-5">
                    <div className="min-w-0">
                      <div
                        className="text-[30px] font-black tracking-tight"
                        style={{
                          color:
                            primary,

                          textTransform:
                            nameTransform,
                        }}
                      >
                        <Inline
                          value={name}
                          onChange={
                            onNameChange
                          }
                        />
                      </div>

                      <div
                        className="mt-1 text-sm font-bold"
                        style={{
                          color:
                            muted,
                        }}
                      >
                        {headline}
                      </div>

                      <Contact />

                      <Links />
                    </div>

                    {profilePhoto &&
                      design
                        .header
                        .photo
                        .enabled && (
                        <img
                          src={
                            profilePhoto
                          }
                          alt="Profile"
                          className="h-20 w-20 shrink-0 object-cover"
                          style={{
                            borderRadius:
                              design
                                .header
                                .photo
                                .shape ===
                              "circle"
                                ? 999
                                : design
                                      .header
                                      .photo
                                      .shape ===
                                    "rounded"
                                  ? 14
                                  : 0,
                          }}
                        />
                      )}
                  </div>
                </header>
              )}

              <MainSections />
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function ResumeBuilderPage() {
  const router = useRouter();

  const [resume, setResume] =
    useState<ResumeData>(
      emptyResume(),
    );

  const [design, setDesign] =
    useState<ResumeDesign>(
      defaultDesign(),
    );

  const [template, setTemplate] =
    useState<TemplateId>(
      "professional",
    );

  const [settings, setSettings] =
    useState<EditorSettings>(
      DEFAULT_SETTINGS,
    );

  const [profilePhoto, setProfilePhoto] =
    useState<string | null>(
      null,
    );

  const [profilePhotoFile, setProfilePhotoFile] =
    useState<File | null>(
      null,
    );

  const [
    designDescription,
    setDesignDescription,
  ] = useState("");

  const [tab, setTab] =
    useState<EditorTab>(
      "information",
    );

  const handleOpenSection = (
  section: SectionName,
) => {
  setOpenSection(section);
};

  const [authLoading, setAuthLoading] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [showLinkedIn, setShowLinkedIn] =
    useState(false);

  const [linkedinUrl, setLinkedinUrl] =
    useState("");

  const [linkedinText, setLinkedinText] =
    useState("");

  const [lastSaved, setLastSaved] =
    useState<Date | null>(
      null,
    );

  const [previewZoom, setPreviewZoom] =
    useState(0.82);

  const photoRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const autosaveTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  /* ============================================================
     AUTH
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const supabase =
          createClient();

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          router.replace(
            `/login?next=${encodeURIComponent(
              "/dashboard/resume",
            )}`,
          );

          return;
        }

        if (mounted) {
          setAuthLoading(false);
        }
      } catch {
        router.replace(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume",
          )}`,
        );
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* ============================================================
     SAVE LOCAL DRAFT
  ============================================================ */

  const saveDraft = useCallback(
    (silent = false) => {
      const payload: DraftState =
        {
          resume,

          design,

          template,

          settings,

          profilePhoto,

          designDescription,

          savedAt:
            new Date().toISOString(),
        };

      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify(
            payload,
          ),
        );

        const date =
          new Date(
            payload.savedAt,
          );

        setLastSaved(date);

        if (!silent) {
          setMessage(
            "Draft saved. You can continue editing later.",
          );

          setError("");
        }
      } catch {
        if (!silent) {
          setError(
            "Could not save the local draft in this browser.",
          );
        }
      }
    },
    [
      resume,
      design,
      template,
      settings,
      profilePhoto,
      designDescription,
    ],
  );

  /* ============================================================
     LOAD SERVER + LOCAL DRAFT
  ============================================================ */

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    (async () => {
      try {
        const response =
          await fetch(
            "/api/resume/generate",
            {
              method: "GET",

              cache: "no-store",

              credentials:
                "include",
            },
          );

        const data =
          response.ok
            ? await response.json()
            : null;

        if (
          !cancelled &&
          data?.resume
        ) {
          setResume(
            normalizeResume(
              data.resume,
            ),
          );

          if (data.design) {
            setDesign(
              data.design,
            );
          }

          const serverTemplate =
            data.template as
              | TemplateId
              | null;

          if (
            serverTemplate &&
            TEMPLATE_META.some(
              (x) =>
                x.id ===
                serverTemplate,
            )
          ) {
            setTemplate(
              serverTemplate,
            );
          }

          if (
            data.profileImageUrl
          ) {
            setProfilePhoto(
              data.profileImageUrl,
            );
          }
        }
      } catch {
        // Local draft can still load.
      }

      try {
        const raw =
          localStorage.getItem(
            DRAFT_KEY,
          );

        if (
          !raw ||
          cancelled
        ) {
          return;
        }

        const draft =
          JSON.parse(
            raw,
          ) as DraftState;

        const saved =
          draft.savedAt
            ? new Date(
                draft.savedAt,
              )
            : null;

        if (
          saved &&
          (!lastSaved ||
            saved >
              lastSaved)
        ) {
          setResume(
            normalizeResume(
              draft.resume,
            ),
          );

          if (draft.design) {
            setDesign(
              draft.design,
            );
          }

          if (draft.template) {
            setTemplate(
              draft.template,
            );
          }

          if (draft.settings) {
            setSettings({
              ...DEFAULT_SETTINGS,

              ...draft.settings,
            });
          }

          if (
            draft.profilePhoto
          ) {
            setProfilePhoto(
              draft.profilePhoto,
            );
          }

          if (
            typeof draft.designDescription ===
            "string"
          ) {
            setDesignDescription(
              draft.designDescription,
            );
          }

          setLastSaved(
            saved,
          );
        }
      } catch {
        // Ignore corrupted local drafts.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  /* ============================================================
     AUTO SAVE
  ============================================================ */

  useEffect(() => {
    if (authLoading) return;

    if (autosaveTimer.current) {
      clearTimeout(
        autosaveTimer.current,
      );
    }

    autosaveTimer.current =
      setTimeout(
        () => {
          saveDraft(true);
        },
        900,
      );

    return () => {
      if (
        autosaveTimer.current
      ) {
        clearTimeout(
          autosaveTimer.current,
        );
      }
    };
  }, [
    resume,
    design,
    template,
    settings,
    profilePhoto,
    designDescription,
    authLoading,
    saveDraft,
  ]);

  /* ============================================================
     UPDATE HELPERS
  ============================================================ */

  const updatePersonal = (
    key: keyof ResumeData["personal"],
    value: string,
  ) => {
    setResume((current) => ({
      ...current,

      personal: {
        ...current.personal,

        [key]: value,
      },
    }));
  };

  const updateResume = <
    K extends keyof ResumeData,
  >(
    key: K,
    value: ResumeData[K],
  ) => {
    setResume((current) => ({
      ...current,

      [key]: value,
    }));
  };

  const setSetting = <
    K extends keyof EditorSettings,
  >(
    key: K,
    value: EditorSettings[K],
  ) => {
    setSettings((current) => ({
      ...current,

      [key]: value,
    }));
  };

  /* ============================================================
     PHOTO
  ============================================================ */

  const handlePhoto = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/",
      ) ||
      file.size >
        5 *
          1024 *
          1024
    ) {
      setError(
        "Use an image smaller than 5 MB.",
      );

      return;
    }

    setError("");

    setProfilePhotoFile(
      file,
    );

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setProfilePhoto(
          reader.result,
        );
      }
    };

    reader.readAsDataURL(
      file,
    );
  };

  /* ============================================================
     TEMPLATE
  ============================================================ */

  const changeTemplate = (
    id: TemplateId,
  ) => {
    setTemplate(id);

    const next =
      defaultDesign(id);

    if (
      profilePhoto &&
      id !== "ats"
    ) {
      next.header.photo.enabled =
        true;
    }

    setDesign(next);

    setMessage(
      `${
        TEMPLATE_META.find(
          (x) =>
            x.id === id,
        )?.name
      } template selected.`,
    );

    setError("");
  };

  /* ============================================================
     COLORS
  ============================================================ */

  const applyColor = (
    primary: string,
    secondary: string,
  ) => {
    setDesign((current) =>
      mergeDesign(
        current,
        {
          colors: {
            primary,

            secondary,
          },
        },
      ),
    );
  };

  /* ============================================================
     BUILD AI INPUT
  ============================================================ */

  const buildUserInformation =
    useCallback(() => {
      return JSON.stringify(
        {
          instruction:
            "Improve this resume using only factual information supplied below. Strengthen wording, ATS keywords and clarity. Do not invent facts.",

          resume,

          designPreferences: {
            template,

            settings,

            description:
              designDescription,
          },
        },
        null,
        2,
      );
    }, [
      resume,
      template,
      settings,
      designDescription,
    ]);

  /* ============================================================
     AI GENERATE / ENHANCE
  ============================================================ */

  const generateWithAI =
    async () => {
      if (
        !resume.personal.name.trim()
      ) {
        setError(
          "Enter your name before using AI.",
        );

        setTab(
          "information",
        );

        setOpenSection(
          "personal",
        );

        return;
      }

      setLoading(true);

      setError("");

      setMessage("");

      try {
        const response =
          await fetch(
            "/api/resume/generate",
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                userInformation:
                  buildUserInformation(),

                template:
                  templateBackend(
                    template,
                  ),

                resumeDesignDescription: `Selected template: ${
                  TEMPLATE_META.find(
                    (x) =>
                      x.id ===
                      template,
                  )?.name
                }.

${designDescription}

Font: ${settings.font}

Font size: ${settings.fontSize}pt

Line height: ${settings.lineHeight}

Section gap: ${settings.sectionGap}in

Item gap: ${settings.itemGap}in`,

                profilePhoto,

                profilePhotoName:
                  profilePhotoFile?.name ??
                  null,

                profilePhotoType:
                  profilePhotoFile?.type ??
                  null,
              }),
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "AI resume generation failed.",
          );
        }

        if (data.resume) {
          setResume(
            normalizeResume(
              data.resume,
            ),
          );
        }

        if (data.design) {
          setDesign(
            mergeDesign(
              defaultDesign(
                template,
              ),
              data.design,
            ),
          );
        }

        if (
          data.profileImageUrl
        ) {
          setProfilePhoto(
            data.profileImageUrl,
          );
        }

        saveDraft(true);

        setMessage(
          "AI enhanced your resume and saved a new version.",
        );
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "AI enhancement failed.",
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================================================
     PDF
  ============================================================ */

  const downloadPDF =
    async () => {
      if (
        !resume.personal.name.trim()
      ) {
        setError(
          "Enter your name before downloading.",
        );

        return;
      }

      setDownloading(true);

      setError("");

      setMessage("");

      try {
        const response =
          await fetch(
            "/api/resume/pdf",
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                resume,

                design,

                profilePhoto,
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
              "PDF generation failed.",
          );
        }

        const blob =
          await response.blob();

        const url =
          URL.createObjectURL(
            blob,
          );

        const anchor =
          document.createElement(
            "a",
          );

        anchor.href = url;

        anchor.download = `${
          resume.personal.name
            .trim()
            .replace(
              /[^a-z0-9]+/gi,
              "-",
            ) ||
          "resume"
        }-Resume.pdf`;

        document.body.appendChild(
          anchor,
        );

        anchor.click();

        anchor.remove();

        URL.revokeObjectURL(
          url,
        );

        setMessage(
          "PDF downloaded.",
        );
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Could not download PDF.",
        );
      } finally {
        setDownloading(false);
      }
    };

  /* ============================================================
     RESET
  ============================================================ */

  const resetDraft = () => {
    if (
      !window.confirm(
        "Reset this resume draft? This removes the local saved draft.",
      )
    ) {
      return;
    }

    localStorage.removeItem(
      DRAFT_KEY,
    );

    setResume(
      emptyResume(),
    );

    setDesign(
      defaultDesign(
        "professional",
      ),
    );

    setTemplate(
      "professional",
    );

    setSettings(
      DEFAULT_SETTINGS,
    );

    setProfilePhoto(
      null,
    );

    setProfilePhotoFile(
      null,
    );

    setDesignDescription(
      "",
    );

    setMessage(
      "New blank resume started.",
    );

    setError("");
  };

  /* ============================================================
     LINKEDIN IMPORT
  ============================================================ */

  const importLinkedIn =
    async () => {
      const text =
        linkedinText.trim();

      if (
        !text &&
        !linkedinUrl.trim()
      ) {
        setError(
          "Paste LinkedIn profile text or enter a LinkedIn URL.",
        );

        return;
      }

      setLoading(true);

      setError("");

      try {
        if (
          linkedinUrl.trim()
        ) {
          updatePersonal(
            "linkedin",
            linkedinUrl.trim(),
          );
        }

        if (text) {
          const email =
            text.match(
              /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
            )?.[0];

          const phone =
            text.match(
              /(?:\+?\d[\d\s().-]{7,}\d)/,
            )?.[0];

          if (
            email &&
            !resume.personal
              .email
          ) {
            updatePersonal(
              "email",
              email,
            );
          }

          if (
            phone &&
            !resume.personal
              .phone
          ) {
            updatePersonal(
              "phone",
              phone,
            );
          }

          const lines =
            text
              .split(
                /\r?\n/,
              )
              .map(
                (x) =>
                  x.trim(),
              )
              .filter(Boolean);

          if (
            lines[0] &&
            !resume.personal
              .name
          ) {
            updatePersonal(
              "name",
              lines[0].slice(
                0,
                100,
              ),
            );
          }

          const response =
            await fetch(
              "/api/resume/generate",
              {
                method:
                  "POST",

                credentials:
                  "include",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  userInformation: `LinkedIn profile information pasted by the user:

${text}

Convert this into a factual professional resume.

Do not invent anything.`,

                  template:
                    templateBackend(
                      template,
                    ),

                  resumeDesignDescription:
                    "Import LinkedIn information into the resume and improve wording without inventing facts.",
                }),
              },
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.error ||
                "LinkedIn import failed.",
            );
          }

          if (data.resume) {
            setResume(
              normalizeResume(
                data.resume,
              ),
            );
          }

          if (data.design) {
            setDesign(
              mergeDesign(
                defaultDesign(
                  template,
                ),
                data.design,
              ),
            );
          }

          setMessage(
            "LinkedIn information imported and structured by AI.",
          );
        } else {
          setMessage(
            "LinkedIn URL saved. Direct profile fetching will be connected through LinkedIn OAuth/API in the next integration step.",
          );
        }

        setShowLinkedIn(
          false,
        );

        saveDraft(true);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "LinkedIn import failed.",
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================================================
     SECTION OPEN
  ============================================================ */

  const openSection = (
    section: SectionName,
  ) => {
    setOpenSection(
      (current) =>
        current === section
          ? "personal"
          : section,
    );
  };

  /* ============================================================
     COMPLETENESS
  ============================================================ */

  const completeness =
    useMemo(() => {
      const checks = [
        !!resume.personal.name,

        !!resume.personal.email,

        !!resume.professionalSummary,

        resume.skills.length >
          0,

        resume.experience
          .length > 0,

        resume.education
          .length > 0,
      ];

      return Math.round(
        (checks.filter(Boolean)
          .length /
          checks.length) *
          100,
      );
    }, [resume]);

  /* ============================================================
     LOADING SCREEN
  ============================================================ */

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900">
      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() =>
                router.back()
              }
              className="rounded-xl p-2 hover:bg-slate-100"
            >
              <RotateCcw className="h-5 w-5 rotate-180" />
            </button>

            <div className="min-w-0">
              <div className="truncate text-sm font-black">
                {resume.personal
                  .name ||
                  "Resume Builder"}
              </div>

              <div className="text-[10px] text-slate-500">
                {lastSaved
                  ? `Saved ${lastSaved.toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",

                        minute:
                          "2-digit",
                      },
                    )}`
                  : "Unsaved draft"}
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button
              onClick={() =>
                saveDraft(false)
              }
            >
              <Save className="h-4 w-4" />

              Save
            </Button>

            <Button
              onClick={
                generateWithAI
              }
              variant="primary"
              disabled={loading}
            >
              <Sparkles className="h-4 w-4" />

              {loading
                ? "AI working…"
                : "AI Enhance"}
            </Button>

            <Button
              onClick={
                downloadPDF
              }
              disabled={
                downloading
              }
            >
              <Download className="h-4 w-4" />

              {downloading
                ? "Preparing…"
                : "Download"}
            </Button>
          </div>

          <button
            onClick={
              downloadPDF
            }
            disabled={
              downloading
            }
            className="rounded-xl bg-blue-600 p-2.5 text-white md:hidden"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ======================================================
          INFORMATION / DESIGN TABS
      ====================================================== */}

      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() =>
                setTab(
                  "information",
                )
              }
              className={`rounded-lg px-5 py-2 text-xs font-black ${
                tab ===
                "information"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <FileText className="mr-1.5 inline h-4 w-4" />

              Information
            </button>

            <button
              onClick={() =>
                setTab("design")
              }
              className={`rounded-lg px-5 py-2 text-xs font-black ${
                tab ===
                "design"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Palette className="mr-1.5 inline h-4 w-4" />

              Design
            </button>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${completeness}%`,
                }}
              />
            </div>

            <span className="text-xs font-bold text-slate-500">
              {completeness}%
              complete
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN TWO-COLUMN STUDIO
      ====================================================== */}

      <div className="grid min-h-[calc(100vh-113px)] lg:grid-cols-[minmax(430px,0.85fr)_minmax(520px,1.15fr)]">
        {/* ====================================================
            LEFT EDITOR
        ==================================================== */}

        <aside className="border-r border-slate-200 bg-[#f8fafc] p-4 lg:max-h-[calc(100vh-113px)] lg:overflow-y-auto lg:p-5">
          {tab ===
          "information" ? (
            <div className="space-y-3">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black">
                    Resume
                    information
                  </h1>

                  <p className="text-xs text-slate-500">
                    Enter once. The
                    preview updates
                    instantly.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowLinkedIn(
                      true,
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-[#0A66C2]/20 bg-[#0A66C2]/5 px-3 py-2 text-xs font-bold text-[#0A66C2] hover:bg-[#0A66C2]/10"
                >
                  <ExternalLink className="h-4 w-4" />

                  LinkedIn
                </button>
              </div>

              {/* PERSONAL */}

              <SectionCard
                icon={
                  <User className="h-4 w-4" />
                }
                title="Personal Information"
                description="Contact, links and profile photo"
                open={
                  handleOpenSection ===
                  "personal"
                }
                onToggle={() =>
                  openSection(
                    "personal",
                  )
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Full name"
                    value={
                      resume
                        .personal
                        .name
                    }
                    onChange={(
                      v,
                    ) =>
                      updatePersonal(
                        "name",
                        v,
                      )
                    }
                    placeholder="John Doe"
                  />

                  <Input
                    label="Email"
                    value={
                      resume
                        .personal
                        .email
                    }
                    onChange={(
                      v,
                    ) =>
                      updatePersonal(
                        "email",
                        v,
                      )
                    }
                    placeholder="john@example.com"
                    type="email"
                  />

                  <Input
                    label="Phone"
                    value={
                      resume
                        .personal
                        .phone
                    }
                    onChange={(
                      v,
                    ) =>
                      updatePersonal(
                        "phone",
                        v,
                      )
                    }
                    placeholder="+91 98765 43210"
                  />

                  <Input
                    label="Location"
                    value={
                      resume
                        .personal
                        .location
                    }
                    onChange={(
                      v,
                    ) =>
                      updatePersonal(
                        "location",
                        v,
                      )
                    }
                    placeholder="Hyderabad, India"
                  />

                  <Input
                    label="LinkedIn URL"
                    value={
                      resume
                        .personal
                        .linkedin
                    }
                    onChange={(
                      v,
                    ) =>
                      updatePersonal(
                        "linkedin",
                        v,
                      )
                    }
                    placeholder="linkedin.com/in/username"
                  />

                  <Input
                    label="GitHub URL"
                    value={
                      resume
                        .personal
                        .github
                    }
                    onChange={(
                      v,
                    ) =>
                      updatePersonal(
                        "github",
                        v,
                      )
                    }
                    placeholder="github.com/username"
                  />

                  <Input
                    label="Portfolio URL"
                    value={
                      resume
                        .personal
                        .website
                    }
                    onChange={(
                      v,
                    ) =>
                      updatePersonal(
                        "website",
                        v,
                      )
                    }
                    placeholder="yourportfolio.com"
                  />
                </div>

                <div className="mt-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Profile photo
                  </div>

                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    onChange={
                      handlePhoto
                    }
                    className="hidden"
                  />

                  <div className="flex items-center gap-3">
                    {profilePhoto ? (
                      <img
                        src={
                          profilePhoto
                        }
                        alt="Profile"
                        className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          photoRef.current?.click()
                        }
                      >
                        <ImageIcon className="h-4 w-4" />

                        {profilePhoto
                          ? "Change"
                          : "Upload"}
                      </Button>

                      {profilePhoto && (
                        <Button
                          onClick={() => {
                            setProfilePhoto(
                              null,
                            );

                            setProfilePhotoFile(
                              null,
                            );
                          }}
                          variant="danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* SUMMARY */}

              <SectionCard
                icon={
                  <Sparkles className="h-4 w-4" />
                }
                title="Professional Summary"
                description="Your 3–5 line value proposition"
                open={
                  handleOpenSection ===
                  "summary"
                }
                onToggle={() =>
                  openSection(
                    "summary",
                  )
                }
              >
                <TextArea
                  label="Summary"
                  value={
                    resume.professionalSummary
                  }
                  onChange={(v) =>
                    updateResume(
                      "professionalSummary",
                      v,
                    )
                  }
                  rows={6}
                  placeholder="Results-driven software engineer…"
                />
              </SectionCard>

              {/* EXPERIENCE */}

              <SectionCard
                icon={
                  <BriefcaseBusiness className="h-4 w-4" />
                }
                title="Experience"
                description="Jobs, internships and responsibilities"
                open={
                  handleOpenSection ===
                  "experience"
                }
                onToggle={() =>
                  openSection(
                    "experience",
                  )
                }
              >
                <div className="space-y-4">
                  {resume.experience.map(
                    (item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 p-3"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-xs font-black">
                            Experience{" "}
                            {i + 1}
                          </div>

                          <button
                            onClick={() =>
                              updateResume(
                                "experience",
                                resume.experience.filter(
                                  (
                                    _,
                                    j,
                                  ) =>
                                    j !==
                                    i,
                                ),
                              )
                            }
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Role"
                            value={
                              item.role
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.experience,
                                ];

                              a[i] = {
                                ...a[i],
                                role: v,
                              };

                              updateResume(
                                "experience",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="Company"
                            value={
                              item.company
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.experience,
                                ];

                              a[i] = {
                                ...a[i],
                                company:
                                  v,
                              };

                              updateResume(
                                "experience",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="Location"
                            value={
                              item.location
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.experience,
                                ];

                              a[i] = {
                                ...a[i],
                                location:
                                  v,
                              };

                              updateResume(
                                "experience",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="Start date"
                            value={
                              item.startDate
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.experience,
                                ];

                              a[i] = {
                                ...a[i],
                                startDate:
                                  v,
                              };

                              updateResume(
                                "experience",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="End date"
                            value={
                              item.endDate
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.experience,
                                ];

                              a[i] = {
                                ...a[i],
                                endDate:
                                  v,
                              };

                              updateResume(
                                "experience",
                                a,
                              );
                            }}
                          />
                        </div>

                        <div className="mt-3">
                          <TextArea
                            label="Responsibilities / achievements (one per line)"
                            value={item.responsibilities.join(
                              "\n",
                            )}
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.experience,
                                ];

                              a[i] = {
                                ...a[i],
                                responsibilities:
                                  v.split(
                                    "\n",
                                  ),
                              };

                              updateResume(
                                "experience",
                                a,
                              );
                            }}
                            rows={5}
                          />
                        </div>
                      </div>
                    ),
                  )}

                  <Button
                    onClick={() =>
                      updateResume(
                        "experience",
                        [
                          ...resume.experience,

                          {
                            company:
                              "",

                            role: "",

                            location:
                              "",

                            startDate:
                              "",

                            endDate:
                              "",

                            responsibilities:
                              [""],
                          },
                        ],
                      )
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4" />

                    Add experience
                  </Button>
                </div>
              </SectionCard>

              {/* EDUCATION */}

              <SectionCard
                icon={
                  <GraduationCap className="h-4 w-4" />
                }
                title="Education"
                description="Degrees, colleges and relevant details"
                open={
                 handleOpenSection ===
                  "education"
                }
                onToggle={() =>
                  openSection(
                    "education",
                  )
                }
              >
                <div className="space-y-4">
                  {resume.education.map(
                    (item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 p-3"
                      >
                        <div className="mb-3 flex justify-between">
                          <div className="text-xs font-black">
                            Education{" "}
                            {i + 1}
                          </div>

                          <button
                            onClick={() =>
                              updateResume(
                                "education",
                                resume.education.filter(
                                  (
                                    _,
                                    j,
                                  ) =>
                                    j !==
                                    i,
                                ),
                              )
                            }
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Degree"
                            value={
                              item.degree
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.education,
                                ];

                              a[i] = {
                                ...a[i],
                                degree: v,
                              };

                              updateResume(
                                "education",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="Field"
                            value={
                              item.field
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.education,
                                ];

                              a[i] = {
                                ...a[i],
                                field: v,
                              };

                              updateResume(
                                "education",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="Institution"
                            value={
                              item.institution
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.education,
                                ];

                              a[i] = {
                                ...a[i],
                                institution:
                                  v,
                              };

                              updateResume(
                                "education",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="Start date"
                            value={
                              item.startDate
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.education,
                                ];

                              a[i] = {
                                ...a[i],
                                startDate:
                                  v,
                              };

                              updateResume(
                                "education",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="End date"
                            value={
                              item.endDate
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.education,
                                ];

                              a[i] = {
                                ...a[i],
                                endDate:
                                  v,
                              };

                              updateResume(
                                "education",
                                a,
                              );
                            }}
                          />
                        </div>

                        <div className="mt-3">
                          <TextArea
                            label="Details (one per line)"
                            value={item.details.join(
                              "\n",
                            )}
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.education,
                                ];

                              a[i] = {
                                ...a[i],
                                details:
                                  v.split(
                                    "\n",
                                  ),
                              };

                              updateResume(
                                "education",
                                a,
                              );
                            }}
                            rows={3}
                          />
                        </div>
                      </div>
                    ),
                  )}

                  <Button
                    onClick={() =>
                      updateResume(
                        "education",
                        [
                          ...resume.education,

                          {
                            institution:
                              "",

                            degree: "",

                            field: "",

                            startDate:
                              "",

                            endDate: "",

                            details: [],
                          },
                        ],
                      )
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4" />

                    Add education
                  </Button>
                </div>
              </SectionCard>

              {/* SKILLS */}

              <SectionCard
                icon={
                  <Sparkles className="h-4 w-4" />
                }
                title="Skills"
                description="Group skills by category"
                open={
                  handleOpenSection ===
                  "skills"
                }
                onToggle={() =>
                  openSection(
                    "skills",
                  )
                }
              >
                <div className="space-y-3">
                  {resume.skills.map(
                    (item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 p-3"
                      >
                        <div className="grid gap-3 sm:grid-cols-[0.6fr_1fr]">
                          <Input
                            label="Category"
                            value={
                              item.category
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.skills,
                                ];

                              a[i] = {
                                ...a[i],
                                category:
                                  v,
                              };

                              updateResume(
                                "skills",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="Skills"
                            value={item.items.join(
                              ", ",
                            )}
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.skills,
                                ];

                              a[i] = {
                                ...a[i],
                                items:
                                  v
                                    .split(
                                      ",",
                                    )
                                    .map(
                                      (
                                        s,
                                      ) =>
                                        s.trim(),
                                    )
                                    .filter(
                                      Boolean,
                                    ),
                              };

                              updateResume(
                                "skills",
                                a,
                              );
                            }}
                          />
                        </div>

                        <button
                          onClick={() =>
                            updateResume(
                              "skills",
                              resume.skills.filter(
                                (
                                  _,
                                  j,
                                ) =>
                                  j !==
                                  i,
                              ),
                            )
                          }
                          className="mt-2 text-xs font-bold text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ),
                  )}

                  <Button
                    onClick={() =>
                      updateResume(
                        "skills",
                        [
                          ...resume.skills,

                          {
                            category:
                              "Technical Skills",

                            items: [],
                          },
                        ],
                      )
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4" />

                    Add skill group
                  </Button>
                </div>
              </SectionCard>

              {/* PROJECTS */}

              <SectionCard
                icon={
                  <FolderKanban className="h-4 w-4" />
                }
                title="Projects"
                description="Impact, technologies and links"
                open={
                  handleOpenSection ===
                  "projects"
                }
                onToggle={() =>
                  openSection(
                    "projects",
                  )
                }
              >
                <div className="space-y-4">
                  {resume.projects.map(
                    (item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 p-3"
                      >
                        <div className="mb-3 flex justify-between">
                          <div className="text-xs font-black">
                            Project{" "}
                            {i + 1}
                          </div>

                          <button
                            onClick={() =>
                              updateResume(
                                "projects",
                                resume.projects.filter(
                                  (
                                    _,
                                    j,
                                  ) =>
                                    j !==
                                    i,
                                ),
                              )
                            }
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Project name"
                            value={
                              item.name
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.projects,
                                ];

                              a[i] = {
                                ...a[i],
                                name: v,
                              };

                              updateResume(
                                "projects",
                                a,
                              );
                            }}
                          />

                          <Input
                            label="URL"
                            value={
                              item.url
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.projects,
                                ];

                              a[i] = {
                                ...a[i],
                                url: v,
                              };

                              updateResume(
                                "projects",
                                a,
                              );
                            }}
                          />
                        </div>

                        <div className="mt-3">
                          <TextArea
                            label="Description"
                            value={
                              item.description
                            }
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.projects,
                                ];

                              a[i] = {
                                ...a[i],
                                description:
                                  v,
                              };

                              updateResume(
                                "projects",
                                a,
                              );
                            }}
                            rows={3}
                          />
                        </div>

                        <div className="mt-3">
                          <Input
                            label="Technologies (comma separated)"
                            value={item.technologies.join(
                              ", ",
                            )}
                            onChange={(
                              v,
                            ) => {
                              const a =
                                [
                                  ...resume.projects,
                                ];

                              a[i] = {
                                ...a[i],
                                technologies:
                                  v
                                    .split(
                                      ",",
                                    )
                                    .map(
                                      (
                                        s,
                                      ) =>
                                        s.trim(),
                                    )
                                    .filter(
                                      Boolean,
                                    ),
                              };

                              updateResume(
                                "projects",
                                a,
                              );
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}

                  <Button
                    onClick={() =>
                      updateResume(
                        "projects",
                        [
                          ...resume.projects,

                          {
                            name: "",

                            description:
                              "",

                            technologies:
                              [],

                            url: "",
                          },
                        ],
                      )
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4" />

                    Add project
                  </Button>
                </div>
              </SectionCard>

              {/* CERTIFICATIONS */}

              <SectionCard
                icon={
                  <Award className="h-4 w-4" />
                }
                title="Certifications & Achievements"
                description="Credentials and measurable wins"
                open={
                  handleOpenSection ===
                  "certifications"
                }
                onToggle={() =>
                  openSection(
                    "certifications",
                  )
                }
              >
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-xs font-black">
                      Certifications
                    </div>

                    {resume.certifications.map(
                      (item, i) => (
                        <div
                          key={i}
                          className="mb-2 rounded-xl border p-3"
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                              label="Name"
                              value={
                                item.name
                              }
                              onChange={(
                                v,
                              ) => {
                                const a =
                                  [
                                    ...resume.certifications,
                                  ];

                                a[i] = {
                                  ...a[i],
                                  name: v,
                                };

                                updateResume(
                                  "certifications",
                                  a,
                                );
                              }}
                            />

                            <Input
                              label="Issuer"
                              value={
                                item.issuer
                              }
                              onChange={(
                                v,
                              ) => {
                                const a =
                                  [
                                    ...resume.certifications,
                                  ];

                                a[i] = {
                                  ...a[i],
                                  issuer:
                                    v,
                                };

                                updateResume(
                                  "certifications",
                                  a,
                                );
                              }}
                            />

                            <Input
                              label="Date"
                              value={
                                item.date
                              }
                              onChange={(
                                v,
                              ) => {
                                const a =
                                  [
                                    ...resume.certifications,
                                  ];

                                a[i] = {
                                  ...a[i],
                                  date: v,
                                };

                                updateResume(
                                  "certifications",
                                  a,
                                );
                              }}
                            />

                            <Input
                              label="URL"
                              value={
                                item.url
                              }
                              onChange={(
                                v,
                              ) => {
                                const a =
                                  [
                                    ...resume.certifications,
                                  ];

                                a[i] = {
                                  ...a[i],
                                  url: v,
                                };

                                updateResume(
                                  "certifications",
                                  a,
                                );
                              }}
                            />
                          </div>
                        </div>
                      ),
                    )}

                    <Button
                      onClick={() =>
                        updateResume(
                          "certifications",
                          [
                            ...resume.certifications,

                            {
                              name: "",

                              issuer: "",

                              date: "",

                              url: "",
                            },
                          ],
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />

                      Add certification
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <TextArea
                      label="Achievements (one per line)"
                      value={resume.achievements.join(
                        "\n",
                      )}
                      onChange={(
                        v,
                      ) =>
                        updateResume(
                          "achievements",
                          v.split(
                            "\n",
                          ),
                        )
                      }
                      rows={4}
                    />
                  </div>
                </div>
              </SectionCard>

              {/* LANGUAGES */}

              <SectionCard
                icon={
                  <Languages className="h-4 w-4" />
                }
                title="Languages"
                description="Languages you can use professionally"
                open={
                  handleOpenSection ===
                  "languages"
                }
                onToggle={() =>
                  openSection(
                    "languages",
                  )
                }
              >
                <TextArea
                  label="Languages (one per line)"
                  value={resume.languages.join(
                    "\n",
                  )}
                  onChange={(v) =>
                    updateResume(
                      "languages",
                      v
                        .split(
                          "\n",
                        )
                        .filter(
                          Boolean,
                        ),
                    )
                  }
                  rows={4}
                />
              </SectionCard>

              {/* AI */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-blue-600" />

                  <div>
                    <div className="text-sm font-black text-blue-950">
                      AI enhancement
                    </div>

                    <p className="mt-1 text-xs leading-5 text-blue-800">
                      AI improves wording,
                      ATS keyword
                      alignment and
                      structure while
                      preserving your
                      facts.
                    </p>

                    <Button
                      onClick={
                        generateWithAI
                      }
                      variant="primary"
                      disabled={loading}
                      className="mt-3"
                    >
                      <Wand2 className="h-4 w-4" />

                      {loading
                        ? "Working…"
                        : "Enhance resume"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ==================================================
               DESIGN TAB
            ================================================== */

            <div className="space-y-4">
              <div>
                <h1 className="text-lg font-black">
                  Design your
                  resume
                </h1>

                <p className="text-xs text-slate-500">
                  Choose a template,
                  then tune
                  typography,
                  spacing and
                  colors.
                </p>
              </div>

              {/* TEMPLATES */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-blue-600" />

                  <h2 className="text-sm font-black">
                    Templates
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATE_META.map(
                    (item) => (
                      <TemplateMini
                        key={
                          item.id
                        }
                        template={
                          item.id
                        }
                        selected={
                          template ===
                          item.id
                        }
                        onClick={() =>
                          changeTemplate(
                            item.id,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              </section>

              {/* COLORS */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-blue-600" />

                  <h2 className="text-sm font-black">
                    Colors
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map(
                    (color) => (
                      <button
                        key={
                          color.name
                        }
                        onClick={() =>
                          applyColor(
                            color.primary,
                            color.secondary,
                          )
                        }
                        title={
                          color.name
                        }
                        className="h-9 w-9 rounded-full border-2 border-white shadow ring-1 ring-slate-200"
                        style={{
                          background:
                            color.primary,
                        }}
                      />
                    ),
                  )}

                  <label className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-red-500 via-yellow-400 to-blue-600 shadow ring-1 ring-slate-200">
                    <input
                      type="color"
                      value={
                        design.colors
                          .primary
                      }
                      onChange={(
                        e,
                      ) =>
                        applyColor(
                          e.target
                            .value,

                          e.target
                            .value,
                        )
                      }
                      className="h-0 w-0 opacity-0"
                    />
                  </label>
                </div>
              </section>

              {/* TYPOGRAPHY */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="mb-4 text-sm font-black">
                  Typography
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                      Font
                    </span>

                    <select
                      value={
                        settings.font
                      }
                      onChange={(
                        e,
                      ) =>
                        setSetting(
                          "font",
                          e.target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    >
                      {FONT_OPTIONS.map(
                        (font) => (
                          <option
                            key={
                              font
                            }
                          >
                            {font}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                      Font size
                    </span>

                    <input
                      type="number"
                      min={8}
                      max={13}
                      step={0.25}
                      value={
                        settings.fontSize
                      }
                      onChange={(
                        e,
                      ) =>
                        setSetting(
                          "fontSize",
                          Number(
                            e.target
                              .value,
                          ),
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    />
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                      Line height
                    </span>

                    <input
                      type="number"
                      min={1}
                      max={2}
                      step={0.05}
                      value={
                        settings.lineHeight
                      }
                      onChange={(
                        e,
                      ) =>
                        setSetting(
                          "lineHeight",
                          Number(
                            e.target
                              .value,
                          ),
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    />
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                      Name
                    </span>

                    <select
                      value={
                        settings.nameCase
                      }
                      onChange={(
                        e,
                      ) =>
                        setSetting(
                          "nameCase",
                          e.target
                            .value as EditorSettings["nameCase"],
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    >
                      <option value="normal">
                        Normal
                      </option>

                      <option value="uppercase">
                        Uppercase
                      </option>

                      <option value="lowercase">
                        Lowercase
                      </option>
                    </select>
                  </label>
                </div>
              </section>

              {/* SPACING */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="mb-4 text-sm font-black">
                  Spacing
                </h2>

                <div className="space-y-4">
                  {[
                    [
                      "Section gap",
                      "sectionGap",
                      0.05,
                      0.35,
                    ],

                    [
                      "Item gap",
                      "itemGap",
                      0,
                      0.3,
                    ],

                    [
                      "Bullet gap",
                      "bulletGap",
                      0,
                      0.15,
                    ],

                    [
                      "Left & right margin",
                      "marginX",
                      0.25,
                      1,
                    ],

                    [
                      "Top & bottom margin",
                      "marginY",
                      0.25,
                      1,
                    ],
                  ].map(
                    (item) => {
                      const [
                        label,
                        key,
                        min,
                        max,
                      ] =
                        item as [
                          string,

                          keyof EditorSettings,

                          number,

                          number,
                        ];

                      const value =
                        settings[
                          key
                        ] as number;

                      return (
                        <label
                          key={
                            String(
                              key,
                            )
                          }
                          className="block"
                        >
                          <div className="mb-1 flex justify-between text-xs font-bold">
                            <span>
                              {label}
                            </span>

                            <span className="text-slate-500">
                              {value.toFixed(
                                2,
                              )}{" "}
                              in
                            </span>
                          </div>

                          <input
                            type="range"
                            min={min}
                            max={max}
                            step={0.01}
                            value={
                              value
                            }
                            onChange={(
                              e,
                            ) =>
                              setSetting(
                                key,
                                Number(
                                  e
                                    .target
                                    .value,
                                ) as never,
                              )
                            }
                            className="w-full accent-blue-600"
                          />
                        </label>
                      );
                    },
                  )}
                </div>
              </section>

              {/* TEXT STYLE */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="mb-4 text-sm font-black">
                  Text & list
                  style
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                      Heading case
                    </span>

                    <select
                      value={
                        settings.headingCase
                      }
                      onChange={(
                        e,
                      ) =>
                        setSetting(
                          "headingCase",
                          e.target
                            .value as EditorSettings["headingCase"],
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    >
                      <option value="normal">
                        Normal
                      </option>

                      <option value="capitalize">
                        Capitalize
                      </option>

                      <option value="uppercase">
                        Uppercase
                      </option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                      List style
                    </span>

                    <select
                      value={
                        settings.listStyle
                      }
                      onChange={(
                        e,
                      ) =>
                        setSetting(
                          "listStyle",
                          e.target
                            .value as EditorSettings["listStyle"],
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    >
                      <option value="bullet">
                        Bullet
                      </option>

                      <option value="circle">
                        Circle
                      </option>

                      <option value="square">
                        Square
                      </option>

                      <option value="number">
                        Number
                      </option>

                      <option value="none">
                        None
                      </option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                      Header delimiter
                    </span>

                    <select
                      value={
                        settings.headerDelimiter
                      }
                      onChange={(
                        e,
                      ) =>
                        setSetting(
                          "headerDelimiter",
                          e.target
                            .value as EditorSettings["headerDelimiter"],
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    >
                      <option>
                        •
                      </option>

                      <option>
                        |
                      </option>

                      <option>
                        —
                      </option>

                      <option>
                        ◇
                      </option>

                      <option>
                        ◆
                      </option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                      Date format
                    </span>

                    <select
                      value={
                        settings.dateFormat
                      }
                      onChange={(
                        e,
                      ) =>
                        setSetting(
                          "dateFormat",
                          e.target
                            .value as EditorSettings["dateFormat"],
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    >
                      <option>
                        MMM YYYY
                      </option>

                      <option>
                        MM/YYYY
                      </option>

                      <option>
                        YYYY
                      </option>

                      <option>
                        MMM YYYY –
                        MMM YYYY
                      </option>
                    </select>
                  </label>
                </div>
              </section>

              {/* AI DESIGN */}

              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="text-sm font-black text-blue-950">
                  AI design
                  instructions
                </div>

                <textarea
                  value={
                    designDescription
                  }
                  onChange={(
                    e,
                  ) =>
                    setDesignDescription(
                      e.target
                        .value,
                    )
                  }
                  rows={4}
                  placeholder="Example: Minimal white resume with navy headings, tight spacing, strong ATS readability, no decorative graphics…"
                  className="mt-2 w-full rounded-xl border border-blue-100 bg-white p-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />

                <Button
                  onClick={
                    generateWithAI
                  }
                  variant="primary"
                  disabled={
                    loading
                  }
                  className="mt-3"
                >
                  <Sparkles className="h-4 w-4" />

                  Apply AI design
                </Button>
              </section>

              <Button
                onClick={
                  resetDraft
                }
                variant="danger"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4" />

                Reset builder
              </Button>
            </div>
          )}
        </aside>

        {/* ====================================================
            RIGHT LIVE PREVIEW
        ==================================================== */}

        <main className="min-w-0 bg-[#e9edf2] lg:max-h-[calc(100vh-113px)] lg:overflow-y-auto">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
            <div>
              <div className="text-xs font-black text-slate-800">
                Live preview
              </div>

              <div className="text-[10px] text-slate-500">
                Edit name and
                summary directly
                on the resume
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPreviewZoom(
                    Math.max(
                      0.6,
                      previewZoom -
                        0.05,
                    ),
                  )
                }
                className="rounded-lg border px-2 py-1 text-xs"
              >
                −
              </button>

              <span className="min-w-12 text-center text-[10px] font-bold text-slate-500">
                {Math.round(
                  previewZoom *
                    100,
                )}
                %
              </span>

              <button
                onClick={() =>
                  setPreviewZoom(
                    Math.min(
                      1.05,
                      previewZoom +
                        0.05,
                    ),
                  )
                }
                className="rounded-lg border px-2 py-1 text-xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="min-h-full overflow-auto p-4 sm:p-6 lg:p-10">
            <div
              style={{
                transform: `scale(${previewZoom})`,

                transformOrigin:
                  "top center",

                width: `${
                  100 /
                  previewZoom
                }%`,

                marginLeft: `${
                  (1 -
                    1 /
                      previewZoom) *
                  50
                }%`,
              }}
            >
              <ResumeCanvas
                resume={resume}
                design={design}
                template={template}
                settings={
                  settings
                }
                profilePhoto={
                  profilePhoto
                }
                onNameChange={(
                  value,
                ) =>
                  updatePersonal(
                    "name",
                    value,
                  )
                }
                onSummaryChange={(
                  value,
                ) =>
                  updateResume(
                    "professionalSummary",
                    value,
                  )
                }
              />
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================
          TOAST
      ====================================================== */}

      {(message || error) && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
          <div
            className={`flex max-w-[92vw] items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-bold shadow-xl ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ||
              message}

            <button
              onClick={() => {
                setError("");

                setMessage("");
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          LINKEDIN MODAL
      ====================================================== */}

      {showLinkedIn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black">
                  Import from
                  LinkedIn
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Paste your
                  LinkedIn profile
                  information and
                  AI will structure
                  it into the resume
                  without inventing
                  facts.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowLinkedIn(
                    false,
                  )
                }
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <Input
                label="LinkedIn profile URL"
                value={
                  linkedinUrl
                }
                onChange={
                  setLinkedinUrl
                }
                placeholder="https://www.linkedin.com/in/your-name"
              />

              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#0A66C2]/20 bg-[#0A66C2]/5 px-3 py-2 text-xs font-bold text-[#0A66C2]"
                >
                  Open LinkedIn

                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <span className="text-[11px] text-slate-400">
                  Copy your
                  profile
                  information,
                  then paste it
                  below.
                </span>
              </div>

              <TextArea
                label="LinkedIn profile text"
                value={
                  linkedinText
                }
                onChange={
                  setLinkedinText
                }
                rows={10}
                placeholder="Paste your LinkedIn About, Experience, Education, Skills and other profile text here…"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                onClick={() =>
                  setShowLinkedIn(
                    false,
                  )
                }
              >
                Cancel
              </Button>

              <Button
                onClick={
                  importLinkedIn
                }
                variant="primary"
                disabled={
                  loading
                }
              >
                <Sparkles className="h-4 w-4" />

                {loading
                  ? "Importing…"
                  : "Import & enhance"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}