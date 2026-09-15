"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
  Check,
  BriefcaseBusiness,
  GraduationCap,
  FolderKanban,
  Award,
  Languages,
  User,
  AlignLeft,
  Palette,
  LayoutTemplate,
  RotateCcw,
} from "lucide-react";

import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TemplateType =
  | "ats"
  | "professional"
  | "modern"
  | "executive";

type PhotoSize = "small" | "medium" | "large";
type PhotoShape = "circle" | "rounded" | "square";
type PhotoHorizontal = "left" | "center" | "right";
type PhotoVertical = "top" | "center" | "bottom";

type PhotoSettings = {
  size: PhotoSize;
  zoom: number;
  horizontal: PhotoHorizontal;
  vertical: PhotoVertical;
  shape: PhotoShape;
};

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

/* -------------------------------------------------------------------------- */
/* Empty Resume                                                               */
/* -------------------------------------------------------------------------- */

function createEmptyResume(): ResumeData {
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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeResumeData(data: any): ResumeData {
  const empty = createEmptyResume();

  return {
    personal: {
      ...empty.personal,
      ...(data?.personal ?? {}),
    },

    professionalSummary:
      data?.professionalSummary ?? "",

    skills: Array.isArray(data?.skills)
      ? data.skills.map((item: any) => ({
          category: item?.category ?? "",
          items: Array.isArray(item?.items)
            ? item.items
            : [],
        }))
      : [],

    experience: Array.isArray(data?.experience)
      ? data.experience.map((item: any) => ({
          company: item?.company ?? "",
          role: item?.role ?? "",
          location: item?.location ?? "",
          startDate: item?.startDate ?? "",
          endDate: item?.endDate ?? "",
          responsibilities: Array.isArray(
            item?.responsibilities
          )
            ? item.responsibilities
            : [],
        }))
      : [],

    education: Array.isArray(data?.education)
      ? data.education.map((item: any) => ({
          institution: item?.institution ?? "",
          degree: item?.degree ?? "",
          field: item?.field ?? "",
          startDate: item?.startDate ?? "",
          endDate: item?.endDate ?? "",
          details: Array.isArray(item?.details)
            ? item.details
            : [],
        }))
      : [],

    projects: Array.isArray(data?.projects)
      ? data.projects.map((item: any) => ({
          name: item?.name ?? "",
          description: item?.description ?? "",
          technologies: Array.isArray(
            item?.technologies
          )
            ? item.technologies
            : [],
          url: item?.url ?? "",
        }))
      : [],

    certifications: Array.isArray(
      data?.certifications
    )
      ? data.certifications.map((item: any) => ({
          name: item?.name ?? "",
          issuer: item?.issuer ?? "",
          date: item?.date ?? "",
          url: item?.url ?? "",
        }))
      : [],

    achievements: Array.isArray(data?.achievements)
      ? data.achievements
      : [],

    languages: Array.isArray(data?.languages)
      ? data.languages
      : [],

    additionalSections: Array.isArray(
      data?.additionalSections
    )
      ? data.additionalSections
      : [],
  };
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ResumeGeneratorPage() {
  const [resume, setResume] =
    useState<ResumeData>(createEmptyResume());

  const [design, setDesign] =
    useState<ResumeDesign | null>(null);

  const [template, setTemplate] =
    useState<TemplateType>("professional");

  const [resumeDesignDescription, setResumeDesignDescription] =
    useState("");

  const [profilePhoto, setProfilePhoto] =
    useState<string | null>(null);

  const [profilePhotoFile, setProfilePhotoFile] =
    useState<File | null>(null);

  const [photoSettings, setPhotoSettings] =
    useState<PhotoSettings>({
      size: "medium",
      zoom: 100,
      horizontal: "center",
      vertical: "center",
      shape: "circle",
    });

  const [openSection, setOpenSection] =
    useState<SectionName | null>("personal");

  const [mobileView, setMobileView] =
    useState<"editor" | "preview">("editor");

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

  /* ---------------------------------------------------------------------- */
  /* Load latest generated resume                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    async function loadLatestResume() {
      try {
        const response = await fetch(
          "/api/resume/latest",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data?.resume) {
          setResume(
            normalizeResumeData(data.resume)
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
            data.profileImageUrl
          );
        }
      } catch {
        // No latest resume is okay.
      }
    }

    loadLatestResume();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Resume updates                                                         */
  /* ---------------------------------------------------------------------- */

  function updateResume<K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) {
    setResume((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updatePersonal(
    key: keyof ResumeData["personal"],
    value: string
  ) {
    setResume((current) => ({
      ...current,
      personal: {
        ...current.personal,
        [key]: value,
      },
    }));
  }

  function toggleSection(section: SectionName) {
    setOpenSection((current) =>
      current === section ? null : section
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Photo                                                                  */
  /* ---------------------------------------------------------------------- */

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile photo must be smaller than 5 MB."
      );
      return;
    }

    setError(null);

    setProfilePhotoFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setProfilePhoto(
        typeof reader.result === "string"
          ? reader.result
          : null
      );
    };

    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setProfilePhoto(null);
    setProfilePhotoFile(null);

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }

  function getPhotoDimensions() {
    if (photoSettings.size === "small") {
      return 72;
    }

    if (photoSettings.size === "large") {
      return 128;
    }

    return 96;
  }

  function getObjectPosition() {
    return `${photoSettings.horizontal} ${photoSettings.vertical}`;
  }

  /* ---------------------------------------------------------------------- */
  /* Add / remove                                                           */
  /* ---------------------------------------------------------------------- */

  function addSkill() {
    updateResume("skills", [
      ...resume.skills,
      {
        category: "Skills",
        items: [""],
      },
    ]);
  }

  function removeSkill(index: number) {
    updateResume(
      "skills",
      resume.skills.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
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

  function removeExperience(index: number) {
    updateResume(
      "experience",
      resume.experience.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
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

  function removeEducation(index: number) {
    updateResume(
      "education",
      resume.education.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
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

  function removeProject(index: number) {
    updateResume(
      "projects",
      resume.projects.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
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

  function removeCertification(index: number) {
    updateResume(
      "certifications",
      resume.certifications.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function addAchievement() {
    updateResume("achievements", [
      ...resume.achievements,
      "",
    ]);
  }

  function removeAchievement(index: number) {
    updateResume(
      "achievements",
      resume.achievements.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function addLanguage() {
    updateResume("languages", [
      ...resume.languages,
      "",
    ]);
  }

  function removeLanguage(index: number) {
    updateResume(
      "languages",
      resume.languages.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* AI Generation                                                          */
  /* ---------------------------------------------------------------------- */

  async function generateResume() {
    setIsGenerating(true);
    setError(null);
    setMessage(null);

    try {
      const userInformation = buildUserInformation();

      if (
        !userInformation.trim() &&
        !resume.personal.name.trim()
      ) {
        throw new Error(
          "Please enter your basic information before generating your resume."
        );
      }

      const response = await fetch(
        "/api/resume/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userInformation,
            template,
            resumeDesignDescription,
            profilePhoto: profilePhotoFile
              ? await fileToBase64(profilePhotoFile)
              : null,
            profilePhotoName:
              profilePhotoFile?.name ?? null,
            profilePhotoType:
              profilePhotoFile?.type ?? null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to generate resume."
        );
      }

      if (data.resume) {
        setResume(
          normalizeResumeData(data.resume)
        );
      }

      if (data.design) {
        setDesign(data.design);
      }

      setMessage(
        "Your resume has been generated successfully."
      );

      setOpenSection("personal");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function buildUserInformation() {
    const lines: string[] = [];

    lines.push(
      `Name: ${resume.personal.name}`
    );
    lines.push(
      `Email: ${resume.personal.email}`
    );
    lines.push(
      `Phone: ${resume.personal.phone}`
    );
    lines.push(
      `Location: ${resume.personal.location}`
    );
    lines.push(
      `LinkedIn: ${resume.personal.linkedin}`
    );
    lines.push(
      `GitHub: ${resume.personal.github}`
    );
    lines.push(
      `Website: ${resume.personal.website}`
    );

    lines.push(
      `Professional Summary: ${resume.professionalSummary}`
    );

    if (resume.skills.length) {
      lines.push(
        "Skills:",
        JSON.stringify(resume.skills)
      );
    }

    if (resume.experience.length) {
      lines.push(
        "Experience:",
        JSON.stringify(resume.experience)
      );
    }

    if (resume.education.length) {
      lines.push(
        "Education:",
        JSON.stringify(resume.education)
      );
    }

    if (resume.projects.length) {
      lines.push(
        "Projects:",
        JSON.stringify(resume.projects)
      );
    }

    if (resume.certifications.length) {
      lines.push(
        "Certifications:",
        JSON.stringify(
          resume.certifications
        )
      );
    }

    if (resume.achievements.length) {
      lines.push(
        "Achievements:",
        JSON.stringify(
          resume.achievements
        )
      );
    }

    if (resume.languages.length) {
      lines.push(
        "Languages:",
        JSON.stringify(resume.languages)
      );
    }

    return lines.join("\n");
  }

  async function fileToBase64(file: File) {
    return new Promise<string>(
      (resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result =
            typeof reader.result === "string"
              ? reader.result
              : "";

          resolve(result);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
      }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* PDF Download                                                           */
  /* ---------------------------------------------------------------------- */

  async function downloadPDF() {
    setIsDownloading(true);
    setError(null);

    try {
      if (!design) {
        throw new Error(
          "Please generate your resume first."
        );
      }

      const response = await fetch(
        "/api/resume/pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume,
            design,
            profilePhoto,
            photoSettings,
          }),
        }
      );

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => null
          );

        throw new Error(
          data?.error ||
            "Failed to generate PDF."
        );
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;

      const cleanName =
        resume.personal.name
          ?.trim()
          .replace(
            /[^a-zA-Z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          ) || "Resume";

      anchor.download =
        `${cleanName}-Resume.pdf`;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(url);

      setMessage(
        "Resume PDF downloaded successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to download PDF."
      );
    } finally {
      setIsDownloading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Reset                                                                  */
  /* ---------------------------------------------------------------------- */

  function resetResume() {
    const confirmed =
      window.confirm(
        "Are you sure you want to clear the current resume?"
      );

    if (!confirmed) return;

    setResume(createEmptyResume());
    setDesign(null);
    setProfilePhoto(null);
    setProfilePhotoFile(null);
    setResumeDesignDescription("");
    setMessage(null);
    setError(null);
    setOpenSection("personal");

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Template description                                                    */
  /* ---------------------------------------------------------------------- */

  const templateInfo = useMemo(() => {
    const data = {
      ats: {
        name: "ATS Standard",
        description:
          "Clean, highly ATS-friendly layout designed for automated screening.",
      },
      professional: {
        name: "Professional",
        description:
          "Elegant corporate layout with strong hierarchy and optional photo.",
      },
      modern: {
        name: "Modern",
        description:
          "Contemporary design with a refined visual structure.",
      },
      executive: {
        name: "Executive",
        description:
          "Premium leadership-focused resume presentation.",
      },
    };

    return data[template];
  }, [template]);

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* Header */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
              <FileText size={19} />
            </div>

            <div>
              <h1 className="text-base font-semibold tracking-tight">
                Resume Generator
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Build a polished, ATS-ready resume with AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetResume}
              className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <button
              type="button"
              onClick={downloadPDF}
              disabled={
                isDownloading || !design
              }
              className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Download size={15} />
              )}

              <span className="hidden sm:inline">
                Download PDF
              </span>

              <span className="sm:hidden">
                PDF
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile switcher */}

      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() =>
              setMobileView("editor")
            }
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mobileView === "editor"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Editor
          </button>

          <button
            type="button"
            onClick={() =>
              setMobileView("preview")
            }
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mobileView === "preview"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main */}

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Notifications */}

        {message && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="flex items-center gap-2">
              <Check size={16} />
              {message}
            </div>

            <button
              type="button"
              onClick={() =>
                setMessage(null)
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_520px]">
          {/* ---------------------------------------------------------------- */}
          {/* Left Sidebar                                                     */}
          {/* ---------------------------------------------------------------- */}

          <aside
            className={`${
              mobileView === "preview"
                ? "hidden"
                : "block"
            } lg:block`}
          >
            <div className="sticky top-[88px] space-y-5">
              {/* Section navigation */}

              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="px-3 pb-3 pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Resume Sections
                  </p>
                </div>

                <SectionNavButton
                  icon={<User size={16} />}
                  label="Personal Information"
                  active={
                    openSection === "personal"
                  }
                  onClick={() =>
                    toggleSection(
                      "personal"
                    )
                  }
                />

                <SectionNavButton
                  icon={<AlignLeft size={16} />}
                  label="Professional Summary"
                  active={
                    openSection === "summary"
                  }
                  onClick={() =>
                    toggleSection(
                      "summary"
                    )
                  }
                />

                <SectionNavButton
                  icon={<Sparkles size={16} />}
                  label="Skills"
                  active={
                    openSection === "skills"
                  }
                  onClick={() =>
                    toggleSection("skills")
                  }
                />

                <SectionNavButton
                  icon={
                    <BriefcaseBusiness
                      size={16}
                    />
                  }
                  label="Experience"
                  active={
                    openSection ===
                    "experience"
                  }
                  onClick={() =>
                    toggleSection(
                      "experience"
                    )
                  }
                />

                <SectionNavButton
                  icon={
                    <GraduationCap
                      size={16}
                    />
                  }
                  label="Education"
                  active={
                    openSection ===
                    "education"
                  }
                  onClick={() =>
                    toggleSection(
                      "education"
                    )
                  }
                />

                <SectionNavButton
                  icon={
                    <FolderKanban
                      size={16}
                    />
                  }
                  label="Projects"
                  active={
                    openSection ===
                    "projects"
                  }
                  onClick={() =>
                    toggleSection(
                      "projects"
                    )
                  }
                />

                <SectionNavButton
                  icon={<Award size={16} />}
                  label="Certifications"
                  active={
                    openSection ===
                    "certifications"
                  }
                  onClick={() =>
                    toggleSection(
                      "certifications"
                    )
                  }
                />

                <SectionNavButton
                  icon={<Award size={16} />}
                  label="Achievements"
                  active={
                    openSection ===
                    "achievements"
                  }
                  onClick={() =>
                    toggleSection(
                      "achievements"
                    )
                  }
                />

                <SectionNavButton
                  icon={
                    <Languages
                      size={16}
                    />
                  }
                  label="Languages"
                  active={
                    openSection ===
                    "languages"
                  }
                  onClick={() =>
                    toggleSection(
                      "languages"
                    )
                  }
                />
              </div>

              {/* Template */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <LayoutTemplate
                    size={16}
                    className="text-slate-500"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Template
                    </p>

                    <p className="text-xs text-slate-500">
                      Choose your foundation
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <TemplateButton
                    value="ats"
                    selected={
                      template === "ats"
                    }
                    title="ATS Standard"
                    description="Maximum ATS compatibility"
                    onClick={() =>
                      setTemplate("ats")
                    }
                  />

                  <TemplateButton
                    value="professional"
                    selected={
                      template ===
                      "professional"
                    }
                    title="Professional"
                    description="Elegant corporate style"
                    onClick={() =>
                      setTemplate(
                        "professional"
                      )
                    }
                  />

                  <TemplateButton
                    value="modern"
                    selected={
                      template === "modern"
                    }
                    title="Modern"
                    description="Contemporary visual layout"
                    onClick={() =>
                      setTemplate("modern")
                    }
                  />

                  <TemplateButton
                    value="executive"
                    selected={
                      template ===
                      "executive"
                    }
                    title="Executive"
                    description="Premium leadership style"
                    onClick={() =>
                      setTemplate(
                        "executive"
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ---------------------------------------------------------------- */}
          {/* Editor                                                           */}
          {/* ---------------------------------------------------------------- */}

          <section
            className={`${
              mobileView === "preview"
                ? "hidden"
                : "block"
            } lg:block`}
          >
            <div className="space-y-4">
              {/* Page intro */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                      <Sparkles
                        size={13}
                      />
                      AI Resume Studio
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                      Create your professional resume
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      Enter your information, describe the
                      design you want, and let AI transform
                      it into a polished resume.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:min-w-[190px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Selected template
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {templateInfo.name}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {templateInfo.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Design Description - ALWAYS OPEN */}

              <div className="rounded-2xl border border-indigo-200 bg-white shadow-sm">
                <div className="border-b border-indigo-100 bg-indigo-50/60 px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Wand2 size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        AI Design Description
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Describe how you want your resume to
                        look. AI will translate your description
                        into a professional layout.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <textarea
                    value={
                      resumeDesignDescription
                    }
                    onChange={(event) =>
                      setResumeDesignDescription(
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Example: Create a clean professional resume with dark navy headings, subtle blue accents, strong spacing, modern typography, clear section hierarchy, and a professional profile photo on the right."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">
                      You can describe colors, spacing,
                      typography, photo placement and overall
                      style.
                    </p>

                    <button
                      type="button"
                      onClick={generateResume}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles
                            size={16}
                          />
                          Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* PERSONAL */}

              <EditorSection
                title="Personal Information"
                description="Your contact and professional identity"
                icon={<User size={17} />}
                open={
                  openSection === "personal"
                }
                onToggle={() =>
                  toggleSection("personal")
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Full name"
                    value={
                      resume.personal.name
                    }
                    onChange={(value) =>
                      updatePersonal(
                        "name",
                        value
                      )
                    }
                    placeholder="Your full name"
                  />

                  <InputField
                    label="Email"
                    type="email"
                    value={
                      resume.personal.email
                    }
                    onChange={(value) =>
                      updatePersonal(
                        "email",
                        value
                      )
                    }
                    placeholder="you@example.com"
                  />

                  <InputField
                    label="Phone"
                    value={
                      resume.personal.phone
                    }
                    onChange={(value) =>
                      updatePersonal(
                        "phone",
                        value
                      )
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />

                  <InputField
                    label="Location"
                    value={
                      resume.personal.location
                    }
                    onChange={(value) =>
                      updatePersonal(
                        "location",
                        value
                      )
                    }
                    placeholder="City, State, Country"
                  />

                  <InputField
                    label="LinkedIn"
                    value={
                      resume.personal.linkedin
                    }
                    onChange={(value) =>
                      updatePersonal(
                        "linkedin",
                        value
                      )
                    }
                    placeholder="linkedin.com/in/yourname"
                  />

                  <InputField
                    label="GitHub"
                    value={
                      resume.personal.github
                    }
                    onChange={(value) =>
                      updatePersonal(
                        "github",
                        value
                      )
                    }
                    placeholder="github.com/username"
                  />

                  <InputField
                    label="Website / Portfolio"
                    value={
                      resume.personal.website
                    }
                    onChange={(value) =>
                      updatePersonal(
                        "website",
                        value
                      )
                    }
                    placeholder="yourwebsite.com"
                  />
                </div>

                {/* Photo */}

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ImageIcon
                          size={16}
                          className="text-slate-500"
                        />

                        <p className="text-sm font-semibold">
                          Profile Photo
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Optional. Recommended for
                        Professional, Modern and Executive
                        templates.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {profilePhoto && (
                        <div
                          className="overflow-hidden border border-slate-200 bg-white"
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius:
                              photoSettings.shape ===
                              "circle"
                                ? "9999px"
                                : photoSettings.shape ===
                                  "rounded"
                                ? "12px"
                                : "0px",
                          }}
                        >
                          <img
                            src={
                              profilePhoto
                            }
                            alt="Profile"
                            className="h-full w-full object-cover"
                            style={{
                              objectPosition:
                                getObjectPosition(),
                              transform: `scale(${
                                photoSettings.zoom /
                                100
                              })`,
                            }}
                          />
                        </div>
                      )}

                      <input
                        ref={
                          photoInputRef
                        }
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
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
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        {profilePhoto
                          ? "Change photo"
                          : "Upload photo"}
                      </button>

                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={
                            removePhoto
                          }
                          className="rounded-lg border border-red-200 bg-white p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {profilePhoto &&
                    template !== "ats" && (
                      <PhotoAdjuster
                        settings={
                          photoSettings
                        }
                        onChange={
                          setPhotoSettings
                        }
                      />
                    )}
                </div>
              </EditorSection>

              {/* SUMMARY */}

              <EditorSection
                title="Professional Summary"
                description="A concise introduction to your professional profile"
                icon={<AlignLeft size={17} />}
                open={
                  openSection === "summary"
                }
                onToggle={() =>
                  toggleSection("summary")
                }
              >
                <textarea
                  value={
                    resume.professionalSummary
                  }
                  onChange={(event) =>
                    updateResume(
                      "professionalSummary",
                      event.target.value
                    )
                  }
                  rows={6}
                  placeholder="Write a concise professional summary..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </EditorSection>

              {/* SKILLS */}

              <EditorSection
                title="Skills"
                description="Technical and professional capabilities"
                icon={<Sparkles size={17} />}
                open={
                  openSection === "skills"
                }
                onToggle={() =>
                  toggleSection("skills")
                }
                action={
                  <SmallActionButton
                    onClick={addSkill}
                    label="Add skill group"
                  />
                }
              >
                {resume.skills.length === 0 ? (
                  <EmptyState
                    title="No skills added"
                    description="Add a skill group to start."
                    button={
                      <SmallActionButton
                        onClick={addSkill}
                        label="Add skill group"
                      />
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {resume.skills.map(
                      (skill, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Skill group{" "}
                              {index + 1}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeSkill(
                                  index
                                )
                              }
                              className="text-red-400 transition hover:text-red-600"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>

                          <InputField
                            label="Category"
                            value={
                              skill.category
                            }
                            onChange={(
                              value
                            ) => {
                              const updated =
                                [
                                  ...resume.skills,
                                ];

                              updated[
                                index
                              ] = {
                                ...updated[
                                  index
                                ],
                                category:
                                  value,
                              };

                              updateResume(
                                "skills",
                                updated
                              );
                            }}
                            placeholder="Programming Languages"
                          />

                          <div className="mt-4">
                            <InputField
                              label="Skills"
                              value={skill.items.join(
                                ", "
                              )}
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.skills,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  items:
                                    value
                                      .split(
                                        ","
                                      )
                                      .map(
                                        (
                                          item
                                        ) =>
                                          item.trim()
                                      )
                                      .filter(
                                        Boolean
                                      ),
                                };

                                updateResume(
                                  "skills",
                                  updated
                                );
                              }}
                              placeholder="Python, Java, SQL, React"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </EditorSection>

              {/* EXPERIENCE */}

              <EditorSection
                title="Experience"
                description="Work history and professional responsibilities"
                icon={
                  <BriefcaseBusiness
                    size={17}
                  />
                }
                open={
                  openSection ===
                  "experience"
                }
                onToggle={() =>
                  toggleSection(
                    "experience"
                  )
                }
                action={
                  <SmallActionButton
                    onClick={
                      addExperience
                    }
                    label="Add experience"
                  />
                }
              >
                {resume.experience.length ===
                0 ? (
                  <EmptyState
                    title="No experience added"
                    description="Add internships, employment or relevant experience."
                    button={
                      <SmallActionButton
                        onClick={
                          addExperience
                        }
                        label="Add experience"
                      />
                    }
                  />
                ) : (
                  <div className="space-y-5">
                    {resume.experience.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Experience{" "}
                              {index + 1}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeExperience(
                                  index
                                )
                              }
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <InputField
                              label="Company"
                              value={
                                item.company
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.experience,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  company:
                                    value,
                                };

                                updateResume(
                                  "experience",
                                  updated
                                );
                              }}
                              placeholder="Company name"
                            />

                            <InputField
                              label="Role"
                              value={
                                item.role
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.experience,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  role: value,
                                };

                                updateResume(
                                  "experience",
                                  updated
                                );
                              }}
                              placeholder="Software Engineer"
                            />

                            <InputField
                              label="Location"
                              value={
                                item.location
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.experience,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  location:
                                    value,
                                };

                                updateResume(
                                  "experience",
                                  updated
                                );
                              }}
                              placeholder="Hyderabad, India"
                            />

                            <InputField
                              label="Start date"
                              value={
                                item.startDate
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.experience,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  startDate:
                                    value,
                                };

                                updateResume(
                                  "experience",
                                  updated
                                );
                              }}
                              placeholder="Jun 2025"
                            />

                            <InputField
                              label="End date"
                              value={
                                item.endDate
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.experience,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  endDate:
                                    value,
                                };

                                updateResume(
                                  "experience",
                                  updated
                                );
                              }}
                              placeholder="Present"
                            />
                          </div>

                          <div className="mt-4">
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                              Responsibilities
                            </label>

                            <textarea
                              rows={5}
                              value={item.responsibilities.join(
                                "\n"
                              )}
                              onChange={(
                                event
                              ) => {
                                const updated =
                                  [
                                    ...resume.experience,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  responsibilities:
                                    event.target.value
                                      .split(
                                        "\n"
                                      )
                                      .filter(
                                        (
                                          line
                                        ) =>
                                          line.trim()
                                      ),
                                };

                                updateResume(
                                  "experience",
                                  updated
                                );
                              }}
                              placeholder="Enter one responsibility per line..."
                              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </EditorSection>

              {/* EDUCATION */}

              <EditorSection
                title="Education"
                description="Academic qualifications and education"
                icon={
                  <GraduationCap
                    size={17}
                  />
                }
                open={
                  openSection ===
                  "education"
                }
                onToggle={() =>
                  toggleSection(
                    "education"
                  )
                }
                action={
                  <SmallActionButton
                    onClick={addEducation}
                    label="Add education"
                  />
                }
              >
                {resume.education.length ===
                0 ? (
                  <EmptyState
                    title="No education added"
                    description="Add your degree, college or other qualifications."
                    button={
                      <SmallActionButton
                        onClick={
                          addEducation
                        }
                        label="Add education"
                      />
                    }
                  />
                ) : (
                  <div className="space-y-5">
                    {resume.education.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Education{" "}
                              {index + 1}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeEducation(
                                  index
                                )
                              }
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <InputField
                              label="Institution"
                              value={
                                item.institution
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.education,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  institution:
                                    value,
                                };

                                updateResume(
                                  "education",
                                  updated
                                );
                              }}
                              placeholder="University / College"
                            />

                            <InputField
                              label="Degree"
                              value={
                                item.degree
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.education,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  degree:
                                    value,
                                };

                                updateResume(
                                  "education",
                                  updated
                                );
                              }}
                              placeholder="B.Tech"
                            />

                            <InputField
                              label="Field"
                              value={
                                item.field
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.education,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  field: value,
                                };

                                updateResume(
                                  "education",
                                  updated
                                );
                              }}
                              placeholder="Computer Science"
                            />

                            <InputField
                              label="Start date"
                              value={
                                item.startDate
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.education,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  startDate:
                                    value,
                                };

                                updateResume(
                                  "education",
                                  updated
                                );
                              }}
                              placeholder="2021"
                            />

                            <InputField
                              label="End date"
                              value={
                                item.endDate
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.education,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  endDate:
                                    value,
                                };

                                updateResume(
                                  "education",
                                  updated
                                );
                              }}
                              placeholder="2025"
                            />
                          </div>

                          <div className="mt-4">
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                              Details
                            </label>

                            <textarea
                              rows={4}
                              value={item.details.join(
                                "\n"
                              )}
                              onChange={(
                                event
                              ) => {
                                const updated =
                                  [
                                    ...resume.education,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  details:
                                    event.target.value
                                      .split(
                                        "\n"
                                      )
                                      .filter(
                                        (
                                          line
                                        ) =>
                                          line.trim()
                                      ),
                                };

                                updateResume(
                                  "education",
                                  updated
                                );
                              }}
                              placeholder="Relevant coursework, achievements, activities..."
                              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </EditorSection>

              {/* PROJECTS */}

              <EditorSection
                title="Projects"
                description="Important personal, academic and professional projects"
                icon={
                  <FolderKanban
                    size={17}
                  />
                }
                open={
                  openSection ===
                  "projects"
                }
                onToggle={() =>
                  toggleSection(
                    "projects"
                  )
                }
                action={
                  <SmallActionButton
                    onClick={addProject}
                    label="Add project"
                  />
                }
              >
                {resume.projects.length ===
                0 ? (
                  <EmptyState
                    title="No projects added"
                    description="Add projects that demonstrate your practical skills."
                    button={
                      <SmallActionButton
                        onClick={
                          addProject
                        }
                        label="Add project"
                      />
                    }
                  />
                ) : (
                  <div className="space-y-5">
                    {resume.projects.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Project{" "}
                              {index + 1}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeProject(
                                  index
                                )
                              }
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <InputField
                              label="Project name"
                              value={
                                item.name
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.projects,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  name: value,
                                };

                                updateResume(
                                  "projects",
                                  updated
                                );
                              }}
                              placeholder="AI Portfolio Generator"
                            />

                            <InputField
                              label="Project URL"
                              value={
                                item.url
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.projects,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  url: value,
                                };

                                updateResume(
                                  "projects",
                                  updated
                                );
                              }}
                              placeholder="https://..."
                            />
                          </div>

                          <div className="mt-4">
                            <InputField
                              label="Technologies"
                              value={item.technologies.join(
                                ", "
                              )}
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.projects,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  technologies:
                                    value
                                      .split(
                                        ","
                                      )
                                      .map(
                                        (
                                          tech
                                        ) =>
                                          tech.trim()
                                      )
                                      .filter(
                                        Boolean
                                      ),
                                };

                                updateResume(
                                  "projects",
                                  updated
                                );
                              }}
                              placeholder="React, Node.js, Supabase"
                            />
                          </div>

                          <div className="mt-4">
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                              Description
                            </label>

                            <textarea
                              rows={5}
                              value={
                                item.description
                              }
                              onChange={(
                                event
                              ) => {
                                const updated =
                                  [
                                    ...resume.projects,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  description:
                                    event.target.value,
                                };

                                updateResume(
                                  "projects",
                                  updated
                                );
                              }}
                              placeholder="Explain what you built, how you built it and its impact..."
                              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </EditorSection>

              {/* CERTIFICATIONS */}

              <EditorSection
                title="Certifications"
                description="Professional certifications and credentials"
                icon={<Award size={17} />}
                open={
                  openSection ===
                  "certifications"
                }
                onToggle={() =>
                  toggleSection(
                    "certifications"
                  )
                }
                action={
                  <SmallActionButton
                    onClick={
                      addCertification
                    }
                    label="Add certification"
                  />
                }
              >
                {resume.certifications
                  .length === 0 ? (
                  <EmptyState
                    title="No certifications added"
                    description="Add relevant professional certifications."
                    button={
                      <SmallActionButton
                        onClick={
                          addCertification
                        }
                        label="Add certification"
                      />
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {resume.certifications.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Certification{" "}
                              {index + 1}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeCertification(
                                  index
                                )
                              }
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <InputField
                              label="Certification"
                              value={
                                item.name
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.certifications,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  name: value,
                                };

                                updateResume(
                                  "certifications",
                                  updated
                                );
                              }}
                              placeholder="Certification name"
                            />

                            <InputField
                              label="Issuer"
                              value={
                                item.issuer
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.certifications,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  issuer:
                                    value,
                                };

                                updateResume(
                                  "certifications",
                                  updated
                                );
                              }}
                              placeholder="Issuing organization"
                            />

                            <InputField
                              label="Date"
                              value={
                                item.date
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.certifications,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  date: value,
                                };

                                updateResume(
                                  "certifications",
                                  updated
                                );
                              }}
                              placeholder="2026"
                            />

                            <InputField
                              label="Credential URL"
                              value={
                                item.url
                              }
                              onChange={(
                                value
                              ) => {
                                const updated =
                                  [
                                    ...resume.certifications,
                                  ];

                                updated[
                                  index
                                ] = {
                                  ...updated[
                                    index
                                  ],
                                  url: value,
                                };

                                updateResume(
                                  "certifications",
                                  updated
                                );
                              }}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </EditorSection>

              {/* ACHIEVEMENTS */}

              <EditorSection
                title="Achievements"
                description="Awards, accomplishments and notable achievements"
                icon={<Award size={17} />}
                open={
                  openSection ===
                  "achievements"
                }
                onToggle={() =>
                  toggleSection(
                    "achievements"
                  )
                }
                action={
                  <SmallActionButton
                    onClick={
                      addAchievement
                    }
                    label="Add achievement"
                  />
                }
              >
                {resume.achievements
                  .length === 0 ? (
                  <EmptyState
                    title="No achievements added"
                    description="Add awards, rankings or important accomplishments."
                    button={
                      <SmallActionButton
                        onClick={
                          addAchievement
                        }
                        label="Add achievement"
                      />
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {resume.achievements.map(
                      (
                        achievement,
                        index
                      ) => (
                        <div
                          key={index}
                          className="flex gap-3"
                        >
                          <input
                            value={
                              achievement
                            }
                            onChange={(
                              event
                            ) => {
                              const updated =
                                [
                                  ...resume.achievements,
                                ];

                              updated[
                                index
                              ] =
                                event.target.value;

                              updateResume(
                                "achievements",
                                updated
                              );
                            }}
                            placeholder="Describe your achievement..."
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeAchievement(
                                index
                              )
                            }
                            className="rounded-xl border border-red-200 px-3 text-red-400 hover:bg-red-50"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </EditorSection>

              {/* LANGUAGES */}

              <EditorSection
                title="Languages"
                description="Languages you can communicate in"
                icon={
                  <Languages
                    size={17}
                  />
                }
                open={
                  openSection ===
                  "languages"
                }
                onToggle={() =>
                  toggleSection(
                    "languages"
                  )
                }
                action={
                  <SmallActionButton
                    onClick={addLanguage}
                    label="Add language"
                  />
                }
              >
                {resume.languages.length ===
                0 ? (
                  <EmptyState
                    title="No languages added"
                    description="Add languages relevant to your profile."
                    button={
                      <SmallActionButton
                        onClick={
                          addLanguage
                        }
                        label="Add language"
                      />
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {resume.languages.map(
                      (
                        language,
                        index
                      ) => (
                        <div
                          key={index}
                          className="flex gap-3"
                        >
                          <input
                            value={
                              language
                            }
                            onChange={(
                              event
                            ) => {
                              const updated =
                                [
                                  ...resume.languages,
                                ];

                              updated[
                                index
                              ] =
                                event.target.value;

                              updateResume(
                                "languages",
                                updated
                              );
                            }}
                            placeholder="English — Professional"
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeLanguage(
                                index
                              )
                            }
                            className="rounded-xl border border-red-200 px-3 text-red-400 hover:bg-red-50"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </EditorSection>

              {/* Bottom Generate */}

              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold">
                      Ready to build your resume?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      AI will organize your information,
                      improve presentation and apply your
                      selected design.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={generateResume}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Sparkles
                        size={16}
                      />
                    )}

                    {isGenerating
                      ? "Generating..."
                      : "Generate Resume"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Preview                                                          */}
          {/* ---------------------------------------------------------------- */}

          <aside
            className={`${
              mobileView === "editor"
                ? "hidden"
                : "block"
            } lg:block`}
          >
            <div className="sticky top-[88px]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Eye
                      size={16}
                      className="text-slate-500"
                    />

                    <span className="text-sm font-semibold">
                      Live Preview
                    </span>
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {templateInfo.name}
                  </span>
                </div>

                <div className="max-h-[calc(100vh-150px)] overflow-auto bg-slate-100 p-4 sm:p-5">
                  <ResumePreview
                    resume={resume}
                    design={design}
                    profilePhoto={
                      profilePhoto
                    }
                    photoSettings={
                      photoSettings
                    }
                    template={template}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ========================================================================== */
/* Components                                                                 */
/* ========================================================================== */

function SectionNavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <span
        className={
          active
            ? "text-white"
            : "text-slate-400"
        }
      >
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>

      {active ? (
        <ChevronDown size={15} />
      ) : (
        <ChevronRight size={15} />
      )}
    </button>
  );
}

function EditorSection({
  title,
  description,
  icon,
  open,
  onToggle,
  children,
  action,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`flex items-center gap-3 px-5 py-4 sm:px-6 ${
          open
            ? "border-b border-slate-200"
            : ""
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              open
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">
              {title}
            </h3>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {description}
            </p>
          </div>

          <span className="ml-auto text-slate-400">
            {open ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight
                size={18}
              />
            )}
          </span>
        </button>

        {open && action}
      </div>

      {open && (
        <div className="p-5 sm:p-6">
          {children}
        </div>
      )}
    </div>
  );
}

function InputField({
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
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}

function SmallActionButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <Plus size={14} />
      {label}
    </button>
  );
}

function EmptyState({
  title,
  description,
  button,
}: {
  title: string;
  description: string;
  button: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
      <p className="text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex justify-center">
        {button}
      </div>
    </div>
  );
}

function TemplateButton({
  value,
  selected,
  title,
  description,
  onClick,
}: {
  value: string;
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold">
          {title}
        </span>

        {selected && (
          <Check size={14} />
        )}
      </div>

      <p
        className={`mt-1 text-[11px] leading-4 ${
          selected
            ? "text-slate-300"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

/* ========================================================================== */
/* Photo Adjuster                                                             */
/* ========================================================================== */

function PhotoAdjuster({
  settings,
  onChange,
}: {
  settings: PhotoSettings;
  onChange: (
    settings: PhotoSettings
  ) => void;
}) {
  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-700">
            Photo positioning
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Adjust how your photo appears in the resume.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectControl
          label="Size"
          value={settings.size}
          options={[
            ["small", "Small"],
            ["medium", "Medium"],
            ["large", "Large"],
          ]}
          onChange={(value) =>
            onChange({
              ...settings,
              size: value as PhotoSize,
            })
          }
        />

        <SelectControl
          label="Shape"
          value={settings.shape}
          options={[
            ["circle", "Circle"],
            ["rounded", "Rounded"],
            ["square", "Square"],
          ]}
          onChange={(value) =>
            onChange({
              ...settings,
              shape: value as PhotoShape,
            })
          }
        />

        <SelectControl
          label="Horizontal"
          value={
            settings.horizontal
          }
          options={[
            ["left", "Left"],
            ["center", "Center"],
            ["right", "Right"],
          ]}
          onChange={(value) =>
            onChange({
              ...settings,
              horizontal:
                value as PhotoHorizontal,
            })
          }
        />

        <SelectControl
          label="Vertical"
          value={settings.vertical}
          options={[
            ["top", "Top"],
            ["center", "Center"],
            ["bottom", "Bottom"],
          ]}
          onChange={(value) =>
            onChange({
              ...settings,
              vertical:
                value as PhotoVertical,
            })
          }
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-600">
            Zoom
          </label>

          <span className="text-xs font-bold text-slate-500">
            {settings.zoom}%
          </span>
        </div>

        <input
          type="range"
          min="50"
          max="200"
          step="5"
          value={settings.zoom}
          onChange={(event) =>
            onChange({
              ...settings,
              zoom: Number(
                event.target.value
              ),
            })
          }
          className="w-full"
        />
      </div>
    </div>
  );
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      >
        {options.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          )
        )}
      </select>
    </div>
  );
}

/* ========================================================================== */
/* Resume Preview                                                             */
/* ========================================================================== */

function ResumePreview({
  resume,
  design,
  profilePhoto,
  photoSettings,
  template,
}: {
  resume: ResumeData;
  design: ResumeDesign | null;
  profilePhoto: string | null;
  photoSettings: PhotoSettings;
  template: TemplateType;
}) {
  const colors =
    design?.colors ?? {
      primary:
        template === "modern"
          ? "#2563eb"
          : "#0f172a",
      secondary: "#475569",
      text: "#172033",
      mutedText: "#64748b",
      background: "#ffffff",
      border: "#e2e8f0",
    };

  const headingFont =
    design?.typography
      ?.headingFont ?? "Helvetica";

  const bodyFont =
    design?.typography
      ?.bodyFont ?? "Helvetica";

  const photoSize =
    photoSettings.size === "small"
      ? 72
      : photoSettings.size === "large"
      ? 118
      : 94;

  const photoRadius =
    photoSettings.shape ===
    "circle"
      ? "999px"
      : photoSettings.shape ===
        "rounded"
      ? "14px"
      : "0px";

  const sectionOrder =
    design?.sections?.order ?? [
      "summary",
      "skills",
      "experience",
      "education",
      "projects",
      "certifications",
      "achievements",
      "languages",
    ];

  return (
    <div
      className="mx-auto min-h-[1120px] w-full max-w-[794px] overflow-hidden shadow-xl"
      style={{
        backgroundColor:
          colors.background,
        color: colors.text,
        fontFamily: bodyFont,
      }}
    >
      {/* Header */}

      <div
        className="px-8 pb-6 pt-9"
        style={{
          borderBottom:
            `2px solid ${colors.primary}`,
        }}
      >
        <div
          className={`flex gap-6 ${
            design?.header?.alignment ===
            "center"
              ? "flex-col items-center text-center"
              : "items-center"
          }`}
        >
          {profilePhoto &&
            template !== "ats" && (
              <div
                className="shrink-0 overflow-hidden"
                style={{
                  width: photoSize,
                  height: photoSize,
                  borderRadius:
                    photoRadius,
                }}
              >
                <img
                  src={profilePhoto}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: `${photoSettings.horizontal} ${photoSettings.vertical}`,
                    transform: `scale(${
                      photoSettings.zoom /
                      100
                    })`,
                  }}
                />
              </div>
            )}

          <div className="min-w-0 flex-1">
            <h1
              className="break-words text-[29px] font-bold leading-tight"
              style={{
                fontFamily:
                  headingFont,
                color:
                  colors.primary,
              }}
            >
              {resume.personal.name ||
                "Your Name"}
            </h1>

            <p
              className="mt-2 text-[13px] font-medium"
              style={{
                color:
                  colors.secondary,
              }}
            >
              {resume.personal.email ||
                "email@example.com"}

              {resume.personal.phone &&
                `  •  ${resume.personal.phone}`}

              {resume.personal.location &&
                `  •  ${resume.personal.location}`}
            </p>

            <div
              className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px]"
              style={{
                color:
                  colors.mutedText,
              }}
            >
              {resume.personal.linkedin && (
                <span>
                  {resume.personal.linkedin}
                </span>
              )}

              {resume.personal.github && (
                <span>
                  {resume.personal.github}
                </span>
              )}

              {resume.personal.website && (
                <span>
                  {resume.personal.website}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resume body */}

      <div className="px-8 py-7">
        {sectionOrder.map(
          (section) => {
            if (
              section === "summary" &&
              resume.professionalSummary
            ) {
              return (
                <PreviewSection
                  key={section}
                  title="Professional Summary"
                  primary={
                    colors.primary
                  }
                >
                  <p className="text-[10.5px] leading-[1.7]">
                    {
                      resume.professionalSummary
                    }
                  </p>
                </PreviewSection>
              );
            }

            if (
              section === "skills" &&
              resume.skills.length
            ) {
              return (
                <PreviewSection
                  key={section}
                  title="Skills"
                  primary={
                    colors.primary
                  }
                >
                  <div className="space-y-2">
                    {resume.skills.map(
                      (
                        skill,
                        index
                      ) => (
                        <div
                          key={index}
                          className="text-[10.5px] leading-5"
                        >
                          <span className="font-bold">
                            {
                              skill.category
                            }
                            :
                          </span>{" "}
                          {skill.items.join(
                            ", "
                          )}
                        </div>
                      )
                    )}
                  </div>
                </PreviewSection>
              );
            }

            if (
              section ===
                "experience" &&
              resume.experience.length
            ) {
              return (
                <PreviewSection
                  key={section}
                  title="Experience"
                  primary={
                    colors.primary
                  }
                >
                  <div className="space-y-4">
                    {resume.experience.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={index}
                        >
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-bold">
                                {
                                  item.role
                                }
                              </p>

                              <p
                                className="text-[10px] font-semibold"
                                style={{
                                  color:
                                    colors.secondary,
                                }}
                              >
                                {
                                  item.company
                                }
                                {item.location &&
                                  ` • ${item.location}`}
                              </p>
                            </div>

                            <p
                              className="shrink-0 text-[9px]"
                              style={{
                                color:
                                  colors.mutedText,
                              }}
                            >
                              {
                                item.startDate
                              }{" "}
                              —{" "}
                              {
                                item.endDate
                              }
                            </p>
                          </div>

                          <ul className="mt-1.5 space-y-1 pl-4">
                            {item.responsibilities.map(
                              (
                                responsibility,
                                bulletIndex
                              ) => (
                                <li
                                  key={
                                    bulletIndex
                                  }
                                  className="list-disc text-[9.5px] leading-[1.6]"
                                >
                                  {
                                    responsibility
                                  }
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                </PreviewSection>
              );
            }

            if (
              section ===
                "education" &&
              resume.education.length
            ) {
              return (
                <PreviewSection
                  key={section}
                  title="Education"
                  primary={
                    colors.primary
                  }
                >
                  <div className="space-y-3">
                    {resume.education.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={index}
                        >
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-bold">
                                {
                                  item.degree
                                }
                                {item.field &&
                                  ` in ${item.field}`}
                              </p>

                              <p
                                className="text-[10px] font-semibold"
                                style={{
                                  color:
                                    colors.secondary,
                                }}
                              >
                                {
                                  item.institution
                                }
                              </p>
                            </div>

                            <p
                              className="text-[9px]"
                              style={{
                                color:
                                  colors.mutedText,
                              }}
                            >
                              {
                                item.startDate
                              }{" "}
                              —{" "}
                              {
                                item.endDate
                              }
                            </p>
                          </div>

                          {item.details.length >
                            0 && (
                            <ul className="mt-1 pl-4">
                              {item.details.map(
                                (
                                  detail,
                                  detailIndex
                                ) => (
                                  <li
                                    key={
                                      detailIndex
                                    }
                                    className="list-disc text-[9.5px] leading-[1.6]"
                                  >
                                    {
                                      detail
                                    }
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </PreviewSection>
              );
            }

            if (
              section === "projects" &&
              resume.projects.length
            ) {
              return (
                <PreviewSection
                  key={section}
                  title="Projects"
                  primary={
                    colors.primary
                  }
                >
                  <div className="space-y-3">
                    {resume.projects.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={index}
                        >
                          <p className="text-[11px] font-bold">
                            {
                              item.name
                            }
                          </p>

                          {item.technologies.length >
                            0 && (
                            <p
                              className="text-[9px] font-medium"
                              style={{
                                color:
                                  colors.secondary,
                              }}
                            >
                              {item.technologies.join(
                                " • "
                              )}
                            </p>
                          )}

                          <p className="mt-1 text-[9.5px] leading-[1.6]">
                            {
                              item.description
                            }
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </PreviewSection>
              );
            }

            if (
              section ===
                "certifications" &&
              resume.certifications
                .length
            ) {
              return (
                <PreviewSection
                  key={section}
                  title="Certifications"
                  primary={
                    colors.primary
                  }
                >
                  <div className="space-y-2">
                    {resume.certifications.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={index}
                          className="text-[10px]"
                        >
                          <span className="font-bold">
                            {
                              item.name
                            }
                          </span>{" "}
                          —{" "}
                          {
                            item.issuer
                          }
                          {item.date &&
                            ` • ${item.date}`}
                        </div>
                      )
                    )}
                  </div>
                </PreviewSection>
              );
            }

            if (
              section ===
                "achievements" &&
              resume.achievements
                .length
            ) {
              return (
                <PreviewSection
                  key={section}
                  title="Achievements"
                  primary={
                    colors.primary
                  }
                >
                  <ul className="space-y-1 pl-4">
                    {resume.achievements.map(
                      (
                        achievement,
                        index
                      ) => (
                        <li
                          key={index}
                          className="list-disc text-[9.5px] leading-[1.6]"
                        >
                          {
                            achievement
                          }
                        </li>
                      )
                    )}
                  </ul>
                </PreviewSection>
              );
            }

            if (
              section === "languages" &&
              resume.languages.length
            ) {
              return (
                <PreviewSection
                  key={section}
                  title="Languages"
                  primary={
                    colors.primary
                  }
                >
                  <p className="text-[10px]">
                    {resume.languages.join(
                      " • "
                    )}
                  </p>
                </PreviewSection>
              );
            }

            return null;
          }
        )}
      </div>
    </div>
  );
}

function PreviewSection({
  title,
  primary,
  children,
}: {
  title: string;
  primary: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div
        className="mb-2 flex items-center gap-3"
      >
        <h2
          className="text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            color: primary,
          }}
        >
          {title}
        </h2>

        <div
          className="h-px flex-1"
          style={{
            backgroundColor:
              `${primary}30`,
          }}
        />
      </div>

      {children}
    </section>
  );
}