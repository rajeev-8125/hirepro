"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  Award,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Download,
  FileText,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  Languages,
  Loader2,
  Plus,
  RotateCcw,
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

type TemplateType =
  | "ats"
  | "professional"
  | "modern"
  | "executive";

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

function normalizeResume(data: any): ResumeData {
  const empty = emptyResume();

  return {
    personal: {
      ...empty.personal,
      ...(data?.personal ?? {}),
    },

    professionalSummary:
      typeof data?.professionalSummary === "string"
        ? data.professionalSummary
        : "",

    skills: Array.isArray(data?.skills)
      ? data.skills.map((item: any) => ({
          category:
            typeof item?.category === "string"
              ? item.category
              : "",

          items: Array.isArray(item?.items)
            ? item.items.filter(
                (x: any) => typeof x === "string",
              )
            : [],
        }))
      : [],

    experience: Array.isArray(data?.experience)
      ? data.experience.map((item: any) => ({
          company:
            typeof item?.company === "string"
              ? item.company
              : "",

          role:
            typeof item?.role === "string"
              ? item.role
              : "",

          location:
            typeof item?.location === "string"
              ? item.location
              : "",

          startDate:
            typeof item?.startDate === "string"
              ? item.startDate
              : "",

          endDate:
            typeof item?.endDate === "string"
              ? item.endDate
              : "",

          responsibilities:
            Array.isArray(item?.responsibilities)
              ? item.responsibilities.filter(
                  (x: any) =>
                    typeof x === "string",
                )
              : [],
        }))
      : [],

    education: Array.isArray(data?.education)
      ? data.education.map((item: any) => ({
          institution:
            typeof item?.institution === "string"
              ? item.institution
              : "",

          degree:
            typeof item?.degree === "string"
              ? item.degree
              : "",

          field:
            typeof item?.field === "string"
              ? item.field
              : "",

          startDate:
            typeof item?.startDate === "string"
              ? item.startDate
              : "",

          endDate:
            typeof item?.endDate === "string"
              ? item.endDate
              : "",

          details:
            Array.isArray(item?.details)
              ? item.details.filter(
                  (x: any) =>
                    typeof x === "string",
                )
              : [],
        }))
      : [],

    projects: Array.isArray(data?.projects)
      ? data.projects.map((item: any) => ({
          name:
            typeof item?.name === "string"
              ? item.name
              : "",

          description:
            typeof item?.description === "string"
              ? item.description
              : "",

          technologies:
            Array.isArray(item?.technologies)
              ? item.technologies.filter(
                  (x: any) =>
                    typeof x === "string",
                )
              : [],

          url:
            typeof item?.url === "string"
              ? item.url
              : "",
        }))
      : [],

    certifications: Array.isArray(
      data?.certifications,
    )
      ? data.certifications.map((item: any) => ({
          name:
            typeof item?.name === "string"
              ? item.name
              : "",

          issuer:
            typeof item?.issuer === "string"
              ? item.issuer
              : "",

          date:
            typeof item?.date === "string"
              ? item.date
              : "",

          url:
            typeof item?.url === "string"
              ? item.url
              : "",
        }))
      : [],

    achievements: Array.isArray(data?.achievements)
      ? data.achievements.filter(
          (x: any) => typeof x === "string",
        )
      : [],

    languages: Array.isArray(data?.languages)
      ? data.languages.filter(
          (x: any) => typeof x === "string",
        )
      : [],

    additionalSections: Array.isArray(
      data?.additionalSections,
    )
      ? data.additionalSections.map((item: any) => ({
          title:
            typeof item?.title === "string"
              ? item.title
              : "",

          items:
            Array.isArray(item?.items)
              ? item.items.filter(
                  (x: any) =>
                    typeof x === "string",
                )
              : [],
        }))
      : [],
  };
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function SectionCard({
  icon,
  title,
  description,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              {title}
            </h2>

            <p className="text-xs text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 p-5">
          {children}
        </div>
      )}
    </section>
  );
}

export default function ResumeBuilderPage() {
  const router = useRouter();

  const [resume, setResume] =
    useState<ResumeData>(emptyResume());

  const [design, setDesign] =
    useState<ResumeDesign | null>(null);

  const [template, setTemplate] =
    useState<TemplateType>("professional");

  const [designDescription, setDesignDescription] =
    useState("");

  const [profilePhoto, setProfilePhoto] =
    useState<string | null>(null);

  const [profilePhotoFile, setProfilePhotoFile] =
    useState<File | null>(null);

  const [openSection, setOpenSection] =
    useState<SectionName>("personal");

  const [isCheckingAuth, setIsCheckingAuth] =
    useState(true);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const photoInputRef =
    useRef<HTMLInputElement | null>(null);

  /* ============================================================
     AUTH
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace(
            `/login?next=${encodeURIComponent(
              "/dashboard/resume",
            )}`,
          );
          return;
        }

        if (!mounted) return;

        setIsCheckingAuth(false);
      } catch {
        router.replace(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume",
          )}`,
        );
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* ============================================================
     LOAD LATEST SAVED RESUME
  ============================================================ */

  useEffect(() => {
    if (isCheckingAuth) return;

    async function loadLatest() {
      try {
        const response = await fetch(
          "/api/resume/generate",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data?.resume) {
          setResume(
            normalizeResume(data.resume),
          );
        }

        if (data?.design) {
          setDesign(data.design);
        }

        if (data?.template) {
          setTemplate(data.template);
        }

        if (data?.profileImageUrl) {
          setProfilePhoto(
            data.profileImageUrl,
          );
        }
      } catch {
        // No saved resume is fine.
      }
    }

    loadLatest();
  }, [isCheckingAuth]);

  /* ============================================================
     STATE HELPERS
  ============================================================ */

  function updateResume<K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K],
  ) {
    setResume((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updatePersonal(
    key: keyof ResumeData["personal"],
    value: string,
  ) {
    setResume((current) => ({
      ...current,

      personal: {
        ...current.personal,
        [key]: value,
      },
    }));
  }

  function toggleSection(
    section: SectionName,
  ) {
    setOpenSection((current) =>
      current === section
        ? (null as any)
        : section,
    );
  }

  /* ============================================================
     PHOTO
  ============================================================ */

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file.",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile photo must be smaller than 5 MB.",
      );
      return;
    }

    setError(null);
    setProfilePhotoFile(file);

    const reader = new FileReader();

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

    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setProfilePhoto(null);
    setProfilePhotoFile(null);

    if (photoInputRef.current) {
      photoInputRef.current.value =
        "";
    }
  }

  async function fileToBase64(
    file: File,
  ) {
    return new Promise<string>(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () =>
          resolve(
            typeof reader.result ===
              "string"
              ? reader.result
              : "",
          );

        reader.onerror = reject;

        reader.readAsDataURL(file);
      },
    );
  }

  /* ============================================================
     AI INPUT
  ============================================================ */

  function buildUserInformation() {
    const lines: string[] = [];

    lines.push(
      `Name: ${resume.personal.name}`,
    );

    lines.push(
      `Email: ${resume.personal.email}`,
    );

    lines.push(
      `Phone: ${resume.personal.phone}`,
    );

    lines.push(
      `Location: ${resume.personal.location}`,
    );

    lines.push(
      `LinkedIn: ${resume.personal.linkedin}`,
    );

    lines.push(
      `GitHub: ${resume.personal.github}`,
    );

    lines.push(
      `Website: ${resume.personal.website}`,
    );

    lines.push(
      `Professional Summary: ${resume.professionalSummary}`,
    );

    if (resume.skills.length) {
      lines.push(
        "Skills:",
        JSON.stringify(
          resume.skills,
        ),
      );
    }

    if (resume.experience.length) {
      lines.push(
        "Experience:",
        JSON.stringify(
          resume.experience,
        ),
      );
    }

    if (resume.education.length) {
      lines.push(
        "Education:",
        JSON.stringify(
          resume.education,
        ),
      );
    }

    if (resume.projects.length) {
      lines.push(
        "Projects:",
        JSON.stringify(
          resume.projects,
        ),
      );
    }

    if (
      resume.certifications.length
    ) {
      lines.push(
        "Certifications:",
        JSON.stringify(
          resume.certifications,
        ),
      );
    }

    if (resume.achievements.length) {
      lines.push(
        "Achievements:",
        JSON.stringify(
          resume.achievements,
        ),
      );
    }

    if (resume.languages.length) {
      lines.push(
        "Languages:",
        JSON.stringify(
          resume.languages,
        ),
      );
    }

    return lines.join("\n");
  }

  /* ============================================================
     GENERATE
  ============================================================ */

  async function generateResume() {
    setIsGenerating(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume",
          )}`,
        );
        return;
      }

      const userInformation =
        buildUserInformation();

      if (
        !resume.personal.name.trim()
      ) {
        throw new Error(
          "Please enter your name before generating your resume.",
        );
      }

      const response = await fetch(
        "/api/resume/generate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            userInformation,
            template,
            resumeDesignDescription:
              designDescription,

            profilePhoto:
              profilePhotoFile
                ? await fileToBase64(
                    profilePhotoFile,
                  )
                : null,

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
        if (
          response.status === 401
        ) {
          router.push(
            `/login?next=${encodeURIComponent(
              "/dashboard/resume",
            )}`,
          );
          return;
        }

        throw new Error(
          data?.error ||
            "Failed to generate resume.",
        );
      }

      if (!data?.resume) {
        throw new Error(
          "The AI did not return a resume.",
        );
      }

      setResume(
        normalizeResume(
          data.resume,
        ),
      );

      if (data.design) {
        setDesign(data.design);
      }

      if (
        data.profileImageUrl
      ) {
        setProfilePhoto(
          data.profileImageUrl,
        );
      }

      setMessage(
        "Resume generated and saved successfully.",
      );

      setOpenSection(
        "personal",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the resume.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  /* ============================================================
     PDF
  ============================================================ */

  async function downloadPDF() {
    if (!design) {
      setError(
        "Generate the resume before downloading the PDF.",
      );
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume",
          )}`,
        );
        return;
      }

      const response = await fetch(
        "/api/resume/pdf",
        {
          method: "POST",

          credentials: "include",

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
            .catch(() => null);

        if (
          response.status === 401
        ) {
          router.push(
            `/login?next=${encodeURIComponent(
              "/dashboard/resume",
            )}`,
          );
          return;
        }

        throw new Error(
          data?.error ||
            "Failed to generate PDF.",
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          "a",
        );

      anchor.href = url;

      const safeName =
        resume.personal.name
          .trim()
          .replace(
            /[^a-zA-Z0-9]+/g,
            "-",
          )
          .replace(
            /^-+|-+$/g,
            "",
          ) ||
        "Resume";

      anchor.download =
        `${safeName}-Resume.pdf`;

      document.body.appendChild(
        anchor,
      );

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(
        url,
      );

      setMessage(
        "Resume PDF downloaded successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to download PDF.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  /* ============================================================
     RESET
  ============================================================ */

  function resetResume() {
    setResume(emptyResume());
    setDesign(null);
    setProfilePhoto(null);
    setProfilePhotoFile(null);
    setDesignDescription("");
    setMessage(null);
    setError(null);

    if (photoInputRef.current) {
      photoInputRef.current.value =
        "";
    }
  }

  /* ============================================================
     ARRAY HELPERS
  ============================================================ */

  function addSkillGroup() {
    updateResume("skills", [
      ...resume.skills,
      {
        category: "Skills",
        items: [""],
      },
    ]);
  }

  function addExperience() {
    updateResume("experience", [
      ...resume.experience,
      {
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        responsibilities: [""],
      },
    ]);
  }

  function addEducation() {
    updateResume("education", [
      ...resume.education,
      {
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        details: [""],
      },
    ]);
  }

  function addProject() {
    updateResume("projects", [
      ...resume.projects,
      {
        name: "",
        description: "",
        technologies: [],
        url: "",
      },
    ]);
  }

  function addCertification() {
    updateResume("certifications", [
      ...resume.certifications,
      {
        name: "",
        issuer: "",
        date: "",
        url: "",
      },
    ]);
  }

  function addAchievement() {
    updateResume("achievements", [
      ...resume.achievements,
      "",
    ]);
  }

  function addLanguage() {
    updateResume("languages", [
      ...resume.languages,
      "",
    ]);
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="font-semibold text-slate-700">
            Checking your HirePro session...
          </span>
        </div>
      </main>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              HirePro
            </p>

            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              Resume Builder
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetResume}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={downloadPDF}
              disabled={
                isDownloading ||
                !design
              }
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}

              Download PDF
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        {/* EDITOR */}

        <div className="space-y-4">
          {/* HERO */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-powered resume builder
                </div>

                <h2 className="text-2xl font-black tracking-tight">
                  Build a professional resume
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  HirePro generates structured resume content,
                  keeps your facts intact, and produces a
                  clean recruiter-friendly PDF.
                </p>
              </div>

              <button
                type="button"
                onClick={generateResume}
                disabled={isGenerating}
                className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Wand2 className="h-5 w-5" />
                )}

                {isGenerating
                  ? "Generating..."
                  : "Generate with AI"}
              </button>
            </div>
          </div>

          {message && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <Check className="h-5 w-5" />
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* PERSONAL */}

          <SectionCard
            icon={<User className="h-5 w-5" />}
            title="Personal information"
            description="Name, contact details and professional links"
            open={openSection === "personal"}
            onToggle={() =>
              toggleSection("personal")
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={resume.personal.name}
                onChange={(value) =>
                  updatePersonal(
                    "name",
                    value,
                  )
                }
                placeholder="Rajeev Thotakura"
              />

              <Input
                label="Email"
                value={resume.personal.email}
                onChange={(value) =>
                  updatePersonal(
                    "email",
                    value,
                  )
                }
                type="email"
                placeholder="you@example.com"
              />

              <Input
                label="Phone"
                value={resume.personal.phone}
                onChange={(value) =>
                  updatePersonal(
                    "phone",
                    value,
                  )
                }
                placeholder="+91 XXXXX XXXXX"
              />

              <Input
                label="Location"
                value={resume.personal.location}
                onChange={(value) =>
                  updatePersonal(
                    "location",
                    value,
                  )
                }
                placeholder="Hyderabad, India"
              />

              <Input
                label="LinkedIn"
                value={resume.personal.linkedin}
                onChange={(value) =>
                  updatePersonal(
                    "linkedin",
                    value,
                  )
                }
                placeholder="https://linkedin.com/in/..."
              />

              <Input
                label="GitHub"
                value={resume.personal.github}
                onChange={(value) =>
                  updatePersonal(
                    "github",
                    value,
                  )
                }
                placeholder="https://github.com/..."
              />

              <div className="sm:col-span-2">
                <Input
                  label="Website / Portfolio"
                  value={
                    resume.personal.website
                  }
                  onChange={(value) =>
                    updatePersonal(
                      "website",
                      value,
                    )
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold">
                    Profile photo
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Optional for professional,
                    modern and executive resumes.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {profilePhoto && (
                    <img
                      src={profilePhoto}
                      alt="Profile preview"
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  )}

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={
                      handlePhotoChange
                    }
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      photoInputRef.current?.click()
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    <ImageIcon className="mr-2 inline h-4 w-4" />
                    {profilePhoto
                      ? "Change"
                      : "Upload"}
                  </button>

                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SUMMARY */}

          <SectionCard
            icon={
              <FileText className="h-5 w-5" />
            }
            title="Professional summary"
            description="A concise recruiter-facing introduction"
            open={openSection === "summary"}
            onToggle={() =>
              toggleSection("summary")
            }
          >
            <TextArea
              label="Professional summary"
              value={
                resume.professionalSummary
              }
              onChange={(value) =>
                updateResume(
                  "professionalSummary",
                  value,
                )
              }
              rows={7}
              placeholder="Describe your professional background, strongest skills, domain knowledge and career direction."
            />
          </SectionCard>

          {/* SKILLS */}

          <SectionCard
            icon={
              <Sparkles className="h-5 w-5" />
            }
            title="Skills"
            description="Group technical and professional skills clearly"
            open={openSection === "skills"}
            onToggle={() =>
              toggleSection("skills")
            }
          >
            <div className="space-y-4">
              {resume.skills.map(
                (group, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Input
                        label="Category"
                        value={
                          group.category
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.skills];

                          next[index] = {
                            ...next[index],
                            category: value,
                          };

                          updateResume(
                            "skills",
                            next,
                          );
                        }}
                        placeholder="Programming"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          updateResume(
                            "skills",
                            resume.skills.filter(
                              (_, i) =>
                                i !== index,
                            ),
                          )
                        }
                        className="mt-7 rounded-xl p-3 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4">
                      <TextArea
                        label="Skills"
                        value={
                          group.items.join(
                            ", ",
                          )
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.skills];

                          next[index] = {
                            ...next[index],
                            items:
                              value
                                .split(",")
                                .map(
                                  (x) =>
                                    x.trim(),
                                )
                                .filter(
                                  Boolean,
                                ),
                          };

                          updateResume(
                            "skills",
                            next,
                          );
                        }}
                        rows={3}
                        placeholder="Python, Java, JavaScript, React, SQL"
                      />
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addSkillGroup}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add skill category
              </button>
            </div>
          </SectionCard>

          {/* EXPERIENCE */}

          <SectionCard
            icon={
              <BriefcaseBusiness className="h-5 w-5" />
            }
            title="Experience"
            description="Work history and measurable responsibilities"
            open={openSection === "experience"}
            onToggle={() =>
              toggleSection("experience")
            }
          >
            <div className="space-y-5">
              {resume.experience.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold">
                        Experience{" "}
                        {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          updateResume(
                            "experience",
                            resume.experience.filter(
                              (_, i) =>
                                i !==
                                index,
                            ),
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Job title"
                        value={item.role}
                        onChange={(value) => {
                          const next =
                            [...resume.experience];

                          next[index] = {
                            ...next[index],
                            role: value,
                          };

                          updateResume(
                            "experience",
                            next,
                          );
                        }}
                        placeholder="Software Engineer"
                      />

                      <Input
                        label="Company"
                        value={
                          item.company
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.experience];

                          next[index] = {
                            ...next[index],
                            company:
                              value,
                          };

                          updateResume(
                            "experience",
                            next,
                          );
                        }}
                        placeholder="Company name"
                      />

                      <Input
                        label="Location"
                        value={
                          item.location
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.experience];

                          next[index] = {
                            ...next[index],
                            location:
                              value,
                          };

                          updateResume(
                            "experience",
                            next,
                          );
                        }}
                        placeholder="Hyderabad, India"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Start"
                          value={
                            item.startDate
                          }
                          onChange={(value) => {
                            const next =
                              [...resume.experience];

                            next[index] = {
                              ...next[index],
                              startDate:
                                value,
                            };

                            updateResume(
                              "experience",
                              next,
                            );
                          }}
                          placeholder="Jun 2024"
                        />

                        <Input
                          label="End"
                          value={
                            item.endDate
                          }
                          onChange={(value) => {
                            const next =
                              [...resume.experience];

                            next[index] = {
                              ...next[index],
                              endDate:
                                value,
                            };

                            updateResume(
                              "experience",
                              next,
                            );
                          }}
                          placeholder="Present"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <TextArea
                        label="Responsibilities / achievements"
                        value={item.responsibilities.join(
                          "\n",
                        )}
                        onChange={(value) => {
                          const next =
                            [...resume.experience];

                          next[index] = {
                            ...next[index],
                            responsibilities:
                              value
                                .split("\n")
                                .map(
                                  (x) =>
                                    x.trim(),
                                )
                                .filter(
                                  Boolean,
                                ),
                          };

                          updateResume(
                            "experience",
                            next,
                          );
                        }}
                        rows={6}
                        placeholder="One bullet per line."
                      />
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add experience
              </button>
            </div>
          </SectionCard>

          {/* EDUCATION */}

          <SectionCard
            icon={
              <GraduationCap className="h-5 w-5" />
            }
            title="Education"
            description="Degrees, institutions and academic details"
            open={openSection === "education"}
            onToggle={() =>
              toggleSection("education")
            }
          >
            <div className="space-y-5">
              {resume.education.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold">
                        Education{" "}
                        {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          updateResume(
                            "education",
                            resume.education.filter(
                              (_, i) =>
                                i !==
                                index,
                            ),
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Degree"
                        value={
                          item.degree
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.education];

                          next[index] = {
                            ...next[index],
                            degree:
                              value,
                          };

                          updateResume(
                            "education",
                            next,
                          );
                        }}
                        placeholder="B.Tech"
                      />

                      <Input
                        label="Field"
                        value={
                          item.field
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.education];

                          next[index] = {
                            ...next[index],
                            field: value,
                          };

                          updateResume(
                            "education",
                            next,
                          );
                        }}
                        placeholder="Computer Science"
                      />

                      <Input
                        label="Institution"
                        value={
                          item.institution
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.education];

                          next[index] = {
                            ...next[index],
                            institution:
                              value,
                          };

                          updateResume(
                            "education",
                            next,
                          );
                        }}
                        placeholder="University name"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Start"
                          value={
                            item.startDate
                          }
                          onChange={(value) => {
                            const next =
                              [...resume.education];

                            next[index] = {
                              ...next[index],
                              startDate:
                                value,
                            };

                            updateResume(
                              "education",
                              next,
                            );
                          }}
                          placeholder="2021"
                        />

                        <Input
                          label="End"
                          value={
                            item.endDate
                          }
                          onChange={(value) => {
                            const next =
                              [...resume.education];

                            next[index] = {
                              ...next[index],
                              endDate:
                                value,
                            };

                            updateResume(
                              "education",
                              next,
                            );
                          }}
                          placeholder="2025"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <TextArea
                        label="Academic details"
                        value={item.details.join(
                          "\n",
                        )}
                        onChange={(value) => {
                          const next =
                            [...resume.education];

                          next[index] = {
                            ...next[index],
                            details:
                              value
                                .split("\n")
                                .map(
                                  (x) =>
                                    x.trim(),
                                )
                                .filter(
                                  Boolean,
                                ),
                          };

                          updateResume(
                            "education",
                            next,
                          );
                        }}
                        rows={4}
                        placeholder="Relevant coursework, academic achievements, activities..."
                      />
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add education
              </button>
            </div>
          </SectionCard>

          {/* PROJECTS */}

          <SectionCard
            icon={
              <FolderKanban className="h-5 w-5" />
            }
            title="Projects"
            description="Projects that demonstrate practical ability"
            open={openSection === "projects"}
            onToggle={() =>
              toggleSection("projects")
            }
          >
            <div className="space-y-5">
              {resume.projects.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold">
                        Project{" "}
                        {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          updateResume(
                            "projects",
                            resume.projects.filter(
                              (_, i) =>
                                i !==
                                index,
                            ),
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Project name"
                        value={
                          item.name
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.projects];

                          next[index] = {
                            ...next[index],
                            name: value,
                          };

                          updateResume(
                            "projects",
                            next,
                          );
                        }}
                        placeholder="AI Career Platform"
                      />

                      <TextArea
                        label="Description"
                        value={
                          item.description
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.projects];

                          next[index] = {
                            ...next[index],
                            description:
                              value,
                          };

                          updateResume(
                            "projects",
                            next,
                          );
                        }}
                        rows={4}
                        placeholder="Explain what you built and what problem it solves."
                      />

                      <Input
                        label="Technologies"
                        value={
                          item.technologies.join(
                            ", ",
                          )
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.projects];

                          next[index] = {
                            ...next[index],
                            technologies:
                              value
                                .split(",")
                                .map(
                                  (x) =>
                                    x.trim(),
                                )
                                .filter(
                                  Boolean,
                                ),
                          };

                          updateResume(
                            "projects",
                            next,
                          );
                        }}
                        placeholder="Next.js, Supabase, Gemini"
                      />

                      <Input
                        label="Project URL"
                        value={
                          item.url
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.projects];

                          next[index] = {
                            ...next[index],
                            url: value,
                          };

                          updateResume(
                            "projects",
                            next,
                          );
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add project
              </button>
            </div>
          </SectionCard>

          {/* CERTIFICATIONS */}

          <SectionCard
            icon={
              <Award className="h-5 w-5" />
            }
            title="Certifications"
            description="Professional certifications and credentials"
            open={
              openSection ===
              "certifications"
            }
            onToggle={() =>
              toggleSection(
                "certifications",
              )
            }
          >
            <div className="space-y-4">
              {resume.certifications.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Certification"
                        value={
                          item.name
                        }
                        onChange={(value) => {
                          const next =
                            [
                              ...resume.certifications,
                            ];

                          next[index] = {
                            ...next[index],
                            name: value,
                          };

                          updateResume(
                            "certifications",
                            next,
                          );
                        }}
                        placeholder="AWS Certified..."
                      />

                      <Input
                        label="Issuer"
                        value={
                          item.issuer
                        }
                        onChange={(value) => {
                          const next =
                            [
                              ...resume.certifications,
                            ];

                          next[index] = {
                            ...next[index],
                            issuer:
                              value,
                          };

                          updateResume(
                            "certifications",
                            next,
                          );
                        }}
                        placeholder="Amazon Web Services"
                      />

                      <Input
                        label="Date"
                        value={
                          item.date
                        }
                        onChange={(value) => {
                          const next =
                            [
                              ...resume.certifications,
                            ];

                          next[index] = {
                            ...next[index],
                            date: value,
                          };

                          updateResume(
                            "certifications",
                            next,
                          );
                        }}
                        placeholder="2026"
                      />

                      <Input
                        label="URL"
                        value={
                          item.url
                        }
                        onChange={(value) => {
                          const next =
                            [
                              ...resume.certifications,
                            ];

                          next[index] = {
                            ...next[index],
                            url: value,
                          };

                          updateResume(
                            "certifications",
                            next,
                          );
                        }}
                        placeholder="https://..."
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateResume(
                          "certifications",
                          resume.certifications.filter(
                            (_, i) =>
                              i !==
                              index,
                          ),
                        )
                      }
                      className="mt-3 text-sm font-semibold text-red-600"
                    >
                      Remove certification
                    </button>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addCertification}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add certification
              </button>
            </div>
          </SectionCard>

          {/* ACHIEVEMENTS */}

          <SectionCard
            icon={
              <Award className="h-5 w-5" />
            }
            title="Achievements"
            description="Awards and notable accomplishments"
            open={
              openSection ===
              "achievements"
            }
            onToggle={() =>
              toggleSection(
                "achievements",
              )
            }
          >
            <TextArea
              label="Achievements"
              value={resume.achievements.join(
                "\n",
              )}
              onChange={(value) =>
                updateResume(
                  "achievements",
                  value
                    .split("\n")
                    .map((x) =>
                      x.trim(),
                    )
                    .filter(Boolean),
                )
              }
              rows={5}
              placeholder="One achievement per line."
            />
          </SectionCard>

          {/* LANGUAGES */}

          <SectionCard
            icon={
              <Languages className="h-5 w-5" />
            }
            title="Languages"
            description="Languages you can communicate in"
            open={
              openSection === "languages"
            }
            onToggle={() =>
              toggleSection("languages")
            }
          >
            <Input
              label="Languages"
              value={resume.languages.join(
                ", ",
              )}
              onChange={(value) =>
                updateResume(
                  "languages",
                  value
                    .split(",")
                    .map((x) =>
                      x.trim(),
                    )
                    .filter(Boolean),
                )
              }
              placeholder="English, Telugu, Hindi"
            />
          </SectionCard>

          {/* DESIGN */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold">
                  Resume design
                </h2>

                <p className="text-xs text-slate-500">
                  Tell HirePro how you want the final document to feel.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {(
                [
                  [
                    "ats",
                    "ATS",
                  ],
                  [
                    "professional",
                    "Professional",
                  ],
                  [
                    "modern",
                    "Modern",
                  ],
                  [
                    "executive",
                    "Executive",
                  ],
                ] as const
              ).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setTemplate(
                        value,
                      )
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      template ===
                      value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {template ===
                      value && (
                      <Check className="mr-1 inline h-4 w-4" />
                    )}

                    {label}
                  </button>
                ),
              )}
            </div>

            <div className="mt-5">
              <TextArea
                label="Additional design instructions"
                value={
                  designDescription
                }
                onChange={
                  setDesignDescription
                }
                rows={4}
                placeholder="Example: clean corporate resume, dark blue accents, strong section hierarchy, compact but readable spacing, similar to a premium recruiter resume."
              />
            </div>
          </section>

          {/* MOBILE ACTION */}

          <div className="sticky bottom-4 z-30 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur lg:hidden">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={generateResume}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Generate
              </button>

              <button
                type="button"
                onClick={downloadPDF}
                disabled={
                  isDownloading ||
                  !design
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* PREVIEW */}

        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Live preview
                    </p>

                    <h2 className="mt-1 font-black">
                      Resume
                    </h2>
                  </div>

                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {design
                      ? "Generated"
                      : "Draft"}
                  </div>
                </div>
              </div>

              <div className="max-h-[calc(100vh-170px)] overflow-auto bg-slate-100 p-5">
                <div className="mx-auto min-h-[1000px] w-full max-w-[390px] bg-white p-7 shadow-md">
                  <div className="border-b-2 border-slate-800 pb-4 text-center">
                    {profilePhoto &&
                      template !==
                        "ats" && (
                        <img
                          src={
                            profilePhoto
                          }
                          alt=""
                          className="mx-auto mb-3 h-16 w-16 rounded-full object-cover"
                        />
                      )}

                    <h1 className="text-2xl font-black uppercase tracking-tight">
                      {resume
                        .personal
                        .name ||
                        "YOUR NAME"}
                    </h1>

                    {resume
                      .experience[0]
                      ?.role && (
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {
                          resume
                            .experience[0]
                            .role
                        }
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap justify-center gap-x-2 gap-y-1 text-[9px] text-slate-500">
                      {[
                        resume
                          .personal
                          .phone,

                        resume
                          .personal
                          .email,

                        resume
                          .personal
                          .location,
                      ]
                        .filter(
                          Boolean,
                        )
                        .map(
                          (
                            value,
                            index,
                          ) => (
                            <span
                              key={
                                index
                              }
                            >
                              {
                                value
                              }
                              {index <
                                2
                                ? " • "
                                : ""}
                            </span>
                          ),
                        )}
                    </div>
                  </div>

                  {resume.professionalSummary && (
                    <PreviewSection title="SUMMARY">
                      <p>
                        {
                          resume.professionalSummary
                        }
                      </p>
                    </PreviewSection>
                  )}

                  {resume.skills.length > 0 && (
                    <PreviewSection title="SKILLS">
                      {resume.skills.map(
                        (
                          group,
                          index,
                        ) => (
                          <p
                            key={
                              index
                            }
                            className="mb-1"
                          >
                            <strong>
                              {
                                group.category
                              }
                              :
                            </strong>{" "}
                            {group.items.join(
                              ", ",
                            )}
                          </p>
                        ),
                      )}
                    </PreviewSection>
                  )}

                  {resume.experience.length > 0 && (
                    <PreviewSection title="EXPERIENCE">
                      {resume.experience.map(
                        (
                          item,
                          index,
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="mb-3"
                          >
                            <div className="flex justify-between gap-2">
                              <strong>
                                {
                                  item.role
                                }
                              </strong>

                              <span className="text-right text-[8px] text-slate-500">
                                {
                                  item.startDate
                                }{" "}
                                —{" "}
                                {
                                  item.endDate
                                }
                              </span>
                            </div>

                            <p className="text-slate-600">
                              {
                                item.company
                              }
                            </p>

                            {item.responsibilities.map(
                              (
                                bullet,
                                bulletIndex,
                              ) => (
                                <p
                                  key={
                                    bulletIndex
                                  }
                                  className="mt-1"
                                >
                                  •{" "}
                                  {
                                    bullet
                                  }
                                </p>
                              ),
                            )}
                          </div>
                        ),
                      )}
                    </PreviewSection>
                  )}

                  {resume.projects.length > 0 && (
                    <PreviewSection title="PROJECTS">
                      {resume.projects.map(
                        (
                          project,
                          index,
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="mb-3"
                          >
                            <strong>
                              {
                                project.name
                              }
                            </strong>

                            <p className="mt-1">
                              {
                                project.description
                              }
                            </p>

                            {project
                              .technologies
                              .length >
                              0 && (
                              <p className="mt-1 font-semibold text-slate-500">
                                {
                                  project.technologies.join(
                                    ", ",
                                  )
                                }
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </PreviewSection>
                  )}

                  {resume.education.length > 0 && (
                    <PreviewSection title="EDUCATION">
                      {resume.education.map(
                        (
                          item,
                          index,
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="mb-3"
                          >
                            <strong>
                              {
                                item.degree
                              }
                              {item.field
                                ? ` — ${item.field}`
                                : ""}
                            </strong>

                            <p className="text-slate-600">
                              {
                                item.institution
                              }
                            </p>

                            <p className="text-slate-500">
                              {
                                item.startDate
                              }{" "}
                              —{" "}
                              {
                                item.endDate
                              }
                            </p>
                          </div>
                        ),
                      )}
                    </PreviewSection>
                  )}

                  {resume.certifications.length > 0 && (
                    <PreviewSection title="CERTIFICATIONS">
                      {resume.certifications.map(
                        (
                          item,
                          index,
                        ) => (
                          <p
                            key={
                              index
                            }
                            className="mb-1"
                          >
                            <strong>
                              {
                                item.name
                              }
                            </strong>
                            {item.issuer
                              ? ` — ${item.issuer}`
                              : ""}
                          </p>
                        ),
                      )}
                    </PreviewSection>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 text-[9px] leading-[1.45]">
      <h3 className="border-b border-slate-700 pb-1 text-[10px] font-black tracking-wide">
        {title}
      </h3>

      <div className="pt-2">
        {children}
      </div>
    </section>
  );
}