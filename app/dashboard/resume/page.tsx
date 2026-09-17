"use client";

import {
  useEffect,
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
  ChevronRight,
  Download,
  FileText,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  Languages,
  LayoutTemplate,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
  Wand2,
  X,
  AlignLeft,
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
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

function normalizeResumeData(data: any): ResumeData {
  const empty = createEmptyResume();

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
  /* Load latest resume                                                     */
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

        if (!response.ok) {
          return;
        }

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
        // A missing latest resume is not an error.
      }
    }

    loadLatestResume();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Resume state helpers                                                   */
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
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
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
      if (typeof reader.result === "string") {
        setProfilePhoto(reader.result);
      }
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

  function getObjectPosition() {
    return `${photoSettings.horizontal} ${photoSettings.vertical}`;
  }

  /* ---------------------------------------------------------------------- */
  /* Add / Remove                                                           */
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
  /* Build AI input                                                         */
  /* ---------------------------------------------------------------------- */

  function buildUserInformation() {
    const lines: string[] = [];

    lines.push(`Name: ${resume.personal.name}`);
    lines.push(`Email: ${resume.personal.email}`);
    lines.push(`Phone: ${resume.personal.phone}`);
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

    if (resume.skills.length > 0) {
      lines.push(
        "Skills:",
        JSON.stringify(resume.skills)
      );
    }

    if (resume.experience.length > 0) {
      lines.push(
        "Experience:",
        JSON.stringify(resume.experience)
      );
    }

    if (resume.education.length > 0) {
      lines.push(
        "Education:",
        JSON.stringify(resume.education)
      );
    }

    if (resume.projects.length > 0) {
      lines.push(
        "Projects:",
        JSON.stringify(resume.projects)
      );
    }

    if (resume.certifications.length > 0) {
      lines.push(
        "Certifications:",
        JSON.stringify(
          resume.certifications
        )
      );
    }

    if (resume.achievements.length > 0) {
      lines.push(
        "Achievements:",
        JSON.stringify(
          resume.achievements
        )
      );
    }

    if (resume.languages.length > 0) {
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
          resolve(
            typeof reader.result === "string"
              ? reader.result
              : ""
          );
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
      }
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
      const userInformation =
        buildUserInformation();

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
              ? await fileToBase64(
                  profilePhotoFile
                )
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

      if (data?.resume) {
        setResume(
          normalizeResumeData(data.resume)
        );
      }

      if (data?.design) {
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

  /* ---------------------------------------------------------------------- */
  /* PDF                                                                    */
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

    if (!confirmed) {
      return;
    }

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
  /* Template                                                               */
  /* ---------------------------------------------------------------------- */

  const templateInfo: Record<
    TemplateType,
    {
      name: string;
      description: string;
      accent: string;
    }
  > = {
    ats: {
      name: "ATS Standard",
      description:
        "Optimized for automated resume screening.",
      accent: "slate",
    },
    professional: {
      name: "Professional",
      description:
        "Elegant corporate presentation with refined hierarchy.",
      accent: "purple",
    },
    modern: {
      name: "Modern",
      description:
        "Contemporary layout with a polished visual structure.",
      accent: "blue",
    },
    executive: {
      name: "Executive",
      description:
        "Premium leadership-focused presentation.",
      accent: "amber",
    },
  };

  const currentTemplate =
    templateInfo[template];

  const completionItems = [
    Boolean(resume.personal.name),
    Boolean(resume.personal.email),
    Boolean(
      resume.professionalSummary
    ),
    resume.skills.length > 0,
    resume.education.length > 0,
    resume.projects.length > 0,
  ];

  const completionCount =
    completionItems.filter(Boolean).length;

  const completionPercent = Math.round(
    (completionCount /
      completionItems.length) *
      100
  );

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
              <FileText size={19} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-bold tracking-tight text-slate-950">
                  Resume Builder
                </h1>

                <span className="hidden rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-purple-600 sm:inline-flex">
                  AI Powered
                </span>
              </div>

              <p className="hidden text-xs text-slate-400 sm:block">
                Create a polished professional resume
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetResume}
              className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
            >
              <RotateCcw size={14} />
              Reset
            </button>

            <button
              type="button"
              onClick={downloadPDF}
              disabled={
                isDownloading || !design
              }
              className="flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDownloading ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Download size={15} />
              )}

              <span>
                {isDownloading
                  ? "Preparing..."
                  : "Download PDF"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Page                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Notifications */}

        {message && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <Check size={14} />
              </div>

              <span className="font-medium">
                {message}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setMessage(null)
              }
              className="rounded-lg p-1 hover:bg-emerald-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                <X size={14} />
              </div>

              <span className="font-medium">
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative mb-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-100/60 blur-3xl" />

          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-blue-100/40 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_330px] lg:p-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-purple-700">
                <Sparkles size={13} />
                AI Resume Studio
              </div>

              <h2 className="max-w-3xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Build a resume that
                <span className="text-purple-600">
                  {" "}
                  represents you.
                </span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                Add your professional information,
                describe the visual style you want,
                and let AI transform your content
                into a refined resume.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <StatusPill
                  icon={<Sparkles size={13} />}
                  label="AI content generation"
                />

                <StatusPill
                  icon={<LayoutTemplate size={13} />}
                  label="Custom design"
                />

                <StatusPill
                  icon={<Download size={13} />}
                  label="PDF export"
                />
              </div>
            </div>

            {/* Completion card */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Resume progress
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {completionPercent}%
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Check size={18} />
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all duration-500"
                  style={{
                    width: `${completionPercent}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Complete your key sections before
                generating for the strongest result.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Workspace                                                        */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Sidebar */}

          <aside>
            <div className="sticky top-[92px] space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="px-3 pb-3 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
                    Build your resume
                  </p>
                </div>

                <SectionNavButton
                  icon={<User size={16} />}
                  label="Personal"
                  description="Contact & identity"
                  active={
                    openSection === "personal"
                  }
                  onClick={() =>
                    toggleSection("personal")
                  }
                />

                <SectionNavButton
                  icon={
                    <AlignLeft size={16} />
                  }
                  label="Summary"
                  description="Professional profile"
                  active={
                    openSection === "summary"
                  }
                  onClick={() =>
                    toggleSection("summary")
                  }
                />

                <SectionNavButton
                  icon={<Sparkles size={16} />}
                  label="Skills"
                  description="Core capabilities"
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
                  description="Work history"
                  active={
                    openSection === "experience"
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
                  description="Academic background"
                  active={
                    openSection === "education"
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
                  description="Work you've built"
                  active={
                    openSection === "projects"
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
                  description="Credentials"
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
                  description="Highlights"
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
                    <Languages size={16} />
                  }
                  label="Languages"
                  description="Communication"
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

              {/* Template card */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <LayoutTemplate
                      size={16}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Resume style
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Choose a foundation
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <TemplateButton
                    selected={
                      template === "ats"
                    }
                    title="ATS Standard"
                    description="Screening optimized"
                    onClick={() =>
                      setTemplate("ats")
                    }
                  />

                  <TemplateButton
                    selected={
                      template ===
                      "professional"
                    }
                    title="Professional"
                    description="Elegant corporate"
                    onClick={() =>
                      setTemplate(
                        "professional"
                      )
                    }
                  />

                  <TemplateButton
                    selected={
                      template === "modern"
                    }
                    title="Modern"
                    description="Contemporary"
                    onClick={() =>
                      setTemplate("modern")
                    }
                  />

                  <TemplateButton
                    selected={
                      template === "executive"
                    }
                    title="Executive"
                    description="Premium leadership"
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

          {/* Main editor */}

          <section className="min-w-0 space-y-5">
            {/* AI design panel */}

            <div className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
              <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-600/20">
                      <Wand2 size={18} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-600">
                        AI Design Direction
                      </p>

                      <h3 className="mt-1 text-base font-bold text-slate-950">
                        Describe your ideal resume
                      </h3>

                      <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                        Tell AI about the visual
                        personality you want. Mention
                        colors, typography, spacing,
                        photo placement or overall feel.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-xl border border-purple-100 bg-white px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Current style
                    </p>

                    <p className="mt-0.5 text-xs font-bold text-purple-700">
                      {currentTemplate.name}
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
                  placeholder="Example: Create a sophisticated professional resume with dark navy headings, subtle purple accents, generous spacing, clean typography, strong section hierarchy and a professional profile photo on the right."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-[11px] leading-5 text-slate-400">
                    The AI will use your information
                    and this direction to generate the
                    resume content and visual design.
                  </p>

                  <button
                    type="button"
                    onClick={generateResume}
                    disabled={isGenerating}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:-translate-y-0.5 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Generating resume...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Personal */}

            <EditorSection
              title="Personal Information"
              description="Your contact details and professional identity"
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
                  label="Email address"
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

                <div className="sm:col-span-2">
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
              </div>

              {/* Photo */}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                      <ImageIcon size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Profile photo
                      </p>

                      <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">
                        Optional. Use a professional
                        headshot for templates that
                        support a photo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {profilePhoto && (
                      <div
                        className="h-14 w-14 overflow-hidden border-2 border-white bg-white shadow-md ring-1 ring-slate-200"
                        style={{
                          borderRadius:
                            photoSettings.shape ===
                            "circle"
                              ? "9999px"
                              : photoSettings.shape ===
                                "rounded"
                              ? "14px"
                              : "0px",
                        }}
                      >
                        <img
                          src={profilePhoto}
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
                      ref={photoInputRef}
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
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      {profilePhoto
                        ? "Change photo"
                        : "Upload photo"}
                    </button>

                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="rounded-xl border border-red-200 bg-white p-2.5 text-red-500 transition hover:bg-red-50"
                        aria-label="Remove photo"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {profilePhoto &&
                  template !== "ats" && (
                    <PhotoAdjuster
                      settings={photoSettings}
                      onChange={
                        setPhotoSettings
                      }
                    />
                  )}
              </div>
            </EditorSection>

            {/* Summary */}

            <EditorSection
              title="Professional Summary"
              description="A concise introduction to your professional profile"
              icon={
                <AlignLeft size={17} />
              }
              open={
                openSection === "summary"
              }
              onToggle={() =>
                toggleSection("summary")
              }
            >
              <TextareaField
                label="Professional summary"
                value={
                  resume.professionalSummary
                }
                onChange={(value) =>
                  updateResume(
                    "professionalSummary",
                    value
                  )
                }
                rows={7}
                placeholder="Write a concise summary of your background, strengths, technical expertise and career direction..."
              />
            </EditorSection>

            {/* Skills */}

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
                  title="No skills added yet"
                  description="Create groups such as Programming Languages, Frameworks, Databases or Tools."
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
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-500">
                              Skill group{" "}
                              {index + 1}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Organize related skills
                              together.
                            </p>
                          </div>

                          <IconDeleteButton
                            onClick={() =>
                              removeSkill(
                                index
                              )
                            }
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <InputField
                            label="Category"
                            value={
                              skill.category
                            }
                            onChange={(
                              value
                            ) => {
                              const updated = [
                                ...resume.skills,
                              ];

                              updated[index] = {
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

                          <InputField
                            label="Skills"
                            value={skill.items.join(
                              ", "
                            )}
                            onChange={(
                              value
                            ) => {
                              const updated = [
                                ...resume.skills,
                              ];

                              updated[index] = {
                                ...updated[
                                  index
                                ],
                                items: value
                                  .split(",")
                                  .map(
                                    (item) =>
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

            {/* Experience */}

            <EditorSection
              title="Experience"
              description="Work history, internships and professional responsibilities"
              icon={
                <BriefcaseBusiness
                  size={17}
                />
              }
              open={
                openSection === "experience"
              }
              onToggle={() =>
                toggleSection(
                  "experience"
                )
              }
              action={
                <SmallActionButton
                  onClick={addExperience}
                  label="Add experience"
                />
              }
            >
              {resume.experience.length ===
              0 ? (
                <EmptyState
                  title="No experience added"
                  description="Add internships, employment, training or other relevant professional experience."
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
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-500">
                              Experience{" "}
                              {index + 1}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Add measurable impact
                              where possible.
                            </p>
                          </div>

                          <IconDeleteButton
                            onClick={() =>
                              removeExperience(
                                index
                              )
                            }
                          />
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
                              const updated = [
                                ...resume.experience,
                              ];

                              updated[index] = {
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
                            value={item.role}
                            onChange={(
                              value
                            ) => {
                              const updated = [
                                ...resume.experience,
                              ];

                              updated[index] = {
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
                              const updated = [
                                ...resume.experience,
                              ];

                              updated[index] = {
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

                          <div className="grid grid-cols-2 gap-3">
                            <InputField
                              label="Start date"
                              value={
                                item.startDate
                              }
                              onChange={(
                                value
                              ) => {
                                const updated = [
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
                                const updated = [
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
                        </div>

                        <div className="mt-5">
                          <TextareaField
                            label="Responsibilities & achievements"
                            value={item.responsibilities.join(
                              "\n"
                            )}
                            onChange={(value) => {
                              const updated = [
                                ...resume.experience,
                              ];

                              updated[index] = {
                                ...updated[
                                  index
                                ],
                                responsibilities:
                                  value
                                    .split(
                                      "\n"
                                    )
                                    .filter(
                                      (line) =>
                                        line.trim()
                                    ),
                              };

                              updateResume(
                                "experience",
                                updated
                              );
                            }}
                            rows={6}
                            placeholder="Write one responsibility or achievement per line..."
                            hint="Use action verbs and measurable results where possible."
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </EditorSection>

            {/* Education */}

            <EditorSection
              title="Education"
              description="Academic qualifications and educational background"
              icon={
                <GraduationCap
                  size={17}
                />
              }
              open={
                openSection === "education"
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
                  description="Add your degree, college, dates and relevant academic details."
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
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-500">
                            Education{" "}
                            {index + 1}
                          </p>

                          <IconDeleteButton
                            onClick={() =>
                              removeEducation(
                                index
                              )
                            }
                          />
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
                              const updated = [
                                ...resume.education,
                              ];

                              updated[index] = {
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
                              const updated = [
                                ...resume.education,
                              ];

                              updated[index] = {
                                ...updated[
                                  index
                                ],
                                degree: value,
                              };

                              updateResume(
                                "education",
                                updated
                              );
                            }}
                            placeholder="B.Tech"
                          />

                          <InputField
                            label="Field of study"
                            value={
                              item.field
                            }
                            onChange={(
                              value
                            ) => {
                              const updated = [
                                ...resume.education,
                              ];

                              updated[index] = {
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

                          <div className="grid grid-cols-2 gap-3">
                            <InputField
                              label="Start"
                              value={
                                item.startDate
                              }
                              onChange={(
                                value
                              ) => {
                                const updated = [
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
                              label="End"
                              value={
                                item.endDate
                              }
                              onChange={(
                                value
                              ) => {
                                const updated = [
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
                        </div>

                        <div className="mt-5">
                          <TextareaField
                            label="Details"
                            value={item.details.join(
                              "\n"
                            )}
                            onChange={(value) => {
                              const updated = [
                                ...resume.education,
                              ];

                              updated[index] = {
                                ...updated[
                                  index
                                ],
                                details:
                                  value
                                    .split(
                                      "\n"
                                    )
                                    .filter(
                                      (line) =>
                                        line.trim()
                                    ),
                              };

                              updateResume(
                                "education",
                                updated
                              );
                            }}
                            rows={5}
                            placeholder="Relevant coursework, achievements, activities, GPA or academic highlights..."
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </EditorSection>

            {/* Projects */}

            <EditorSection
              title="Projects"
              description="Personal, academic and professional work that demonstrates your skills"
              icon={
                <FolderKanban
                  size={17}
                />
              }
              open={
                openSection === "projects"
              }
              onToggle={() =>
                toggleSection("projects")
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
                  description="Showcase practical work that demonstrates your technical and problem-solving abilities."
                  button={
                    <SmallActionButton
                      onClick={addProject}
                      label="Add project"
                    />
                  }
                />
              ) : (
                <div className="space-y-5">
                  {resume.projects.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-500">
                            Project{" "}
                            {index + 1}
                          </p>

                          <IconDeleteButton
                            onClick={() =>
                              removeProject(
                                index
                              )
                            }
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <InputField
                            label="Project name"
                            value={item.name}
                            onChange={(
                              value
                            ) => {
                              const updated = [
                                ...resume.projects,
                              ];

                              updated[index] = {
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
                            value={item.url}
                            onChange={(
                              value
                            ) => {
                              const updated = [
                                ...resume.projects,
                              ];

                              updated[index] = {
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

                        <div className="mt-5">
                          <InputField
                            label="Technologies"
                            value={item.technologies.join(
                              ", "
                            )}
                            onChange={(
                              value
                            ) => {
                              const updated = [
                                ...resume.projects,
                              ];

                              updated[index] = {
                                ...updated[
                                  index
                                ],
                                technologies:
                                  value
                                    .split(
                                      ","
                                    )
                                    .map(
                                      (tech) =>
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

                        <div className="mt-5">
                          <TextareaField
                            label="Project description"
                            value={
                              item.description
                            }
                            onChange={(value) => {
                              const updated = [
                                ...resume.projects,
                              ];

                              updated[index] = {
                                ...updated[
                                  index
                                ],
                                description:
                                  value,
                              };

                              updateResume(
                                "projects",
                                updated
                              );
                            }}
                            rows={6}
                            placeholder="Explain what you built, how you built it, the problem it solves and the impact..."
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </EditorSection>

            {/* Certifications */}

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
              {resume.certifications.length ===
              0 ? (
                <EmptyState
                  title="No certifications added"
                  description="Add certifications that are relevant to your target role."
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
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-500">
                            Certification{" "}
                            {index + 1}
                          </p>

                          <IconDeleteButton
                            onClick={() =>
                              removeCertification(
                                index
                              )
                            }
                          />
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
                              const updated = [
                                ...resume.certifications,
                              ];

                              updated[index] = {
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
                              const updated = [
                                ...resume.certifications,
                              ];

                              updated[index] = {
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
                            value={item.date}
                            onChange={(
                              value
                            ) => {
                              const updated = [
                                ...resume.certifications,
                              ];

                              updated[index] = {
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
                            value={item.url}
                            onChange={(
                              value
                            ) => {
                              const updated = [
                                ...resume.certifications,
                              ];

                              updated[index] = {
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

            {/* Achievements */}

            <EditorSection
              title="Achievements"
              description="Awards, accomplishments and notable highlights"
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
                  onClick={addAchievement}
                  label="Add achievement"
                />
              }
            >
              {resume.achievements.length ===
              0 ? (
                <EmptyState
                  title="No achievements added"
                  description="Add awards, rankings, competitions or notable accomplishments."
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
                    (achievement, index) => (
                      <div
                        key={index}
                        className="flex gap-3"
                      >
                        <input
                          value={achievement}
                          onChange={(event) => {
                            const updated = [
                              ...resume.achievements,
                            ];

                            updated[index] =
                              event.target.value;

                            updateResume(
                              "achievements",
                              updated
                            );
                          }}
                          placeholder="Describe an achievement..."
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                        />

                        <IconDeleteButton
                          onClick={() =>
                            removeAchievement(
                              index
                            )
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </EditorSection>

            {/* Languages */}

            <EditorSection
              title="Languages"
              description="Languages you can communicate in"
              icon={
                <Languages size={17} />
              }
              open={
                openSection === "languages"
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
                  description="Add languages and proficiency levels that are relevant to your profile."
                  button={
                    <SmallActionButton
                      onClick={addLanguage}
                      label="Add language"
                    />
                  }
                />
              ) : (
                <div className="space-y-3">
                  {resume.languages.map(
                    (language, index) => (
                      <div
                        key={index}
                        className="flex gap-3"
                      >
                        <input
                          value={language}
                          onChange={(event) => {
                            const updated = [
                              ...resume.languages,
                            ];

                            updated[index] =
                              event.target.value;

                            updateResume(
                              "languages",
                              updated
                            );
                          }}
                          placeholder="English — Professional"
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                        />

                        <IconDeleteButton
                          onClick={() =>
                            removeLanguage(
                              index
                            )
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </EditorSection>

            {/* Final generation CTA */}

            <section className="overflow-hidden rounded-[24px] bg-slate-950 shadow-xl shadow-slate-950/10">
              <div className="relative p-6 sm:p-8">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl" />

                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-purple-300">
                      <Sparkles size={12} />
                      Ready when you are
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-white">
                      Generate your finished resume
                    </h3>

                    <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400">
                      AI will organize your content,
                      improve presentation and apply the
                      selected design direction.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={generateResume}
                    disabled={isGenerating}
                    className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                        <Wand2 size={16} />
                        Generate Resume
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            <div className="pb-8 text-center">
              <p className="text-[11px] text-slate-400">
                Your information is used to create
                your personalized resume.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ========================================================================== */
/* UI Components                                                              */
/* ========================================================================== */

function StatusPill({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm">
      <span className="text-purple-500">
        {icon}
      </span>
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar navigation                                                         */
/* -------------------------------------------------------------------------- */

function SectionNavButton({
  icon,
  label,
  description,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        active
          ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          active
            ? "bg-white/10 text-purple-300"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-xs font-bold ${
            active
              ? "text-white"
              : "text-slate-700"
          }`}
        >
          {label}
        </span>

        <span
          className={`mt-0.5 block truncate text-[10px] ${
            active
              ? "text-slate-400"
              : "text-slate-400"
          }`}
        >
          {description}
        </span>
      </span>

      {active ? (
        <ChevronDown
          size={15}
          className="shrink-0 text-slate-400"
        />
      ) : (
        <ChevronRight
          size={15}
          className="shrink-0 text-slate-300"
        />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Editor section                                                             */
/* -------------------------------------------------------------------------- */

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
  icon: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex items-center gap-3 px-5 py-4 sm:px-6 ${
          open
            ? "border-b border-slate-100"
            : ""
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              open
                ? "bg-purple-50 text-purple-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-950">
              {title}
            </h3>

            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {description}
            </p>
          </div>

          <span className="ml-auto shrink-0 text-slate-300">
            {open ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
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

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

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
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Textarea                                                                   */
/* -------------------------------------------------------------------------- */

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </label>

        {hint && (
          <span className="text-[10px] text-slate-400">
            {hint}
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small action                                                               */
/* -------------------------------------------------------------------------- */

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
      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
    >
      <Plus size={14} />
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete button                                                              */
/* -------------------------------------------------------------------------- */

function IconDeleteButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-red-100 bg-white p-2 text-red-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      aria-label="Delete"
    >
      <Trash2 size={15} />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({
  title,
  description,
  button,
}: {
  title: string;
  description: string;
  button: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <Plus size={18} />
      </div>

      <p className="mt-4 text-sm font-bold text-slate-700">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
        {description}
      </p>

      <div className="mt-4 flex justify-center">
        {button}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Template button                                                            */
/* -------------------------------------------------------------------------- */

function TemplateButton({
  selected,
  title,
  description,
  onClick,
}: {
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
          ? "border-purple-300 bg-purple-50"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-bold ${
            selected
              ? "text-purple-700"
              : "text-slate-700"
          }`}
        >
          {title}
        </span>

        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
            <Check size={11} />
          </span>
        )}
      </div>

      <p className="mt-1 text-[10px] leading-4 text-slate-400">
        {description}
      </p>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Photo adjuster                                                             */
/* -------------------------------------------------------------------------- */

function PhotoAdjuster({
  settings,
  onChange,
}: {
  settings: PhotoSettings;
  onChange: (settings: PhotoSettings) => void;
}) {
  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-700">
          Photo positioning
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          Fine-tune how your photo will be placed in
          the generated resume.
        </p>
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
          value={settings.horizontal}
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

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Zoom
          </label>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
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
          className="w-full accent-purple-600"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Select                                                                      */
/* -------------------------------------------------------------------------- */

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
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
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