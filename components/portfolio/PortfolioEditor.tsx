"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import PortfolioRenderer from "./PortfolioRenderer";
import type { PortfolioData } from "@/lib/ai/portfolio-schema";
import type { PortfolioDesign } from "@/lib/ai/portfolio-design-schema";

type Portfolio = {
  id: string;
  title?: string | null;
  generated_data: PortfolioData;
  design_config?: PortfolioDesign | null;
  profile_image_url?: string | null;
  resume_url?: string | null;
  slug?: string | null;
  is_published?: boolean | null;
};

type PortfolioEditorProps = {
  portfolio: Portfolio;
};

type SectionName =
  | "personal"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "achievements"
  | "languages";

const emptyExperience: PortfolioData["experience"][number] = {
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptyProject: PortfolioData["projects"][number] = {
  name: "",
  description: "",
  technologies: [],
  url: "",
};

const emptyEducation: PortfolioData["education"][number] = {
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptyCertification: PortfolioData["certifications"][number] = {
  name: "",
  issuer: "",
  date: "",
  url: "",
};

export default function PortfolioEditor({
  portfolio,
}: PortfolioEditorProps) {
  const router = useRouter();

  const [data, setData] = useState<PortfolioData>(
    portfolio.generated_data,
  );

  const [openSection, setOpenSection] =
    useState<SectionName | null>("personal");

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [published, setPublished] = useState(
    portfolio.is_published ?? false,
  );

  const [slug, setSlug] = useState(
    portfolio.slug ?? null,
  );

  const [message, setMessage] = useState("");

  function toggleSection(section: SectionName) {
    setOpenSection((current) =>
      current === section ? null : section,
    );
  }

  /* =========================================================
     SAVE
  ========================================================= */

  async function savePortfolio() {
    try {
      setIsSaving(true);
      setMessage("");

      const response = await fetch(
        `/api/portfolio/${portfolio.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            generated_data: data,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to save portfolio",
        );
      }

      setMessage("Portfolio saved successfully.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save portfolio",
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* =========================================================
     PUBLISH
  ========================================================= */

  async function publishPortfolio() {
    try {
      setIsPublishing(true);
      setMessage("");

      const saveResponse = await fetch(
        `/api/portfolio/${portfolio.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            generated_data: data,
          }),
        },
      );

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveResult.error ||
            "Failed to save portfolio before publishing",
        );
      }

      const response = await fetch(
        `/api/portfolio/${portfolio.id}/publish`,
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to publish portfolio",
        );
      }

      setPublished(true);
      setSlug(result.slug);

      setMessage("Your portfolio is now live!");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to publish portfolio",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  /* =========================================================
     UNPUBLISH
  ========================================================= */

  async function unpublishPortfolio() {
    try {
      setIsPublishing(true);
      setMessage("");

      const response = await fetch(
        `/api/portfolio/${portfolio.id}/publish`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to unpublish portfolio",
        );
      }

      setPublished(false);

      setMessage("Portfolio has been unpublished.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to unpublish portfolio",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  /* =========================================================
     PERSONAL
  ========================================================= */

  function updatePersonal(
    field: keyof PortfolioData["personal"],
    value: string,
  ) {
    setData((current) => ({
      ...current,
      personal: {
        ...current.personal,
        [field]: value,
      },
    }));
  }

  /* =========================================================
     SKILLS
  ========================================================= */

  function addSkill() {
    setData((current) => ({
      ...current,
      skills: [...current.skills, ""],
    }));
  }

  function updateSkill(index: number, value: string) {
    setData((current) => {
      const skills = [...current.skills];
      skills[index] = value;

      return {
        ...current,
        skills,
      };
    });
  }

  function deleteSkill(index: number) {
    setData((current) => ({
      ...current,
      skills: current.skills.filter(
        (_, i) => i !== index,
      ),
    }));
  }

  /* =========================================================
     EXPERIENCE
  ========================================================= */

  function addExperience() {
    setData((current) => ({
      ...current,
      experience: [
        ...current.experience,
        { ...emptyExperience },
      ],
    }));
  }

  function updateExperience(
    index: number,
    field: keyof PortfolioData["experience"][number],
    value: string,
  ) {
    setData((current) => {
      const experience = [...current.experience];

      experience[index] = {
        ...experience[index],
        [field]: value,
      };

      return {
        ...current,
        experience,
      };
    });
  }

  function deleteExperience(index: number) {
    setData((current) => ({
      ...current,
      experience: current.experience.filter(
        (_, i) => i !== index,
      ),
    }));
  }

  /* =========================================================
     PROJECTS
  ========================================================= */

  function addProject() {
    setData((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          ...emptyProject,
          technologies: [],
        },
      ],
    }));
  }

  function updateProject(
    index: number,
    field: keyof PortfolioData["projects"][number],
    value: string | string[],
  ) {
    setData((current) => {
      const projects = [...current.projects];

      projects[index] = {
        ...projects[index],
        [field]: value,
      };

      return {
        ...current,
        projects,
      };
    });
  }

  function deleteProject(index: number) {
    setData((current) => ({
      ...current,
      projects: current.projects.filter(
        (_, i) => i !== index,
      ),
    }));
  }

  /* =========================================================
     EDUCATION
  ========================================================= */

  function addEducation() {
    setData((current) => ({
      ...current,
      education: [
        ...current.education,
        { ...emptyEducation },
      ],
    }));
  }

  function updateEducation(
    index: number,
    field: keyof PortfolioData["education"][number],
    value: string,
  ) {
    setData((current) => {
      const education = [...current.education];

      education[index] = {
        ...education[index],
        [field]: value,
      };

      return {
        ...current,
        education,
      };
    });
  }

  function deleteEducation(index: number) {
    setData((current) => ({
      ...current,
      education: current.education.filter(
        (_, i) => i !== index,
      ),
    }));
  }

  /* =========================================================
     CERTIFICATIONS
  ========================================================= */

  function addCertification() {
    setData((current) => ({
      ...current,
      certifications: [
        ...current.certifications,
        { ...emptyCertification },
      ],
    }));
  }

  function updateCertification(
    index: number,
    field: keyof PortfolioData["certifications"][number],
    value: string,
  ) {
    setData((current) => {
      const certifications = [
        ...current.certifications,
      ];

      certifications[index] = {
        ...certifications[index],
        [field]: value,
      };

      return {
        ...current,
        certifications,
      };
    });
  }

  function deleteCertification(index: number) {
    setData((current) => ({
      ...current,
      certifications:
        current.certifications.filter(
          (_, i) => i !== index,
        ),
    }));
  }

  /* =========================================================
     ACHIEVEMENTS
  ========================================================= */

  function addAchievement() {
    setData((current) => ({
      ...current,
      achievements: [
        ...current.achievements,
        "",
      ],
    }));
  }

  function updateAchievement(
    index: number,
    value: string,
  ) {
    setData((current) => {
      const achievements = [
        ...current.achievements,
      ];

      achievements[index] = value;

      return {
        ...current,
        achievements,
      };
    });
  }

  function deleteAchievement(index: number) {
    setData((current) => ({
      ...current,
      achievements:
        current.achievements.filter(
          (_, i) => i !== index,
        ),
    }));
  }

  /* =========================================================
     LANGUAGES
  ========================================================= */

  function addLanguage() {
    setData((current) => ({
      ...current,
      languages: [
        ...current.languages,
        "",
      ],
    }));
  }

  function updateLanguage(
    index: number,
    value: string,
  ) {
    setData((current) => {
      const languages = [
        ...current.languages,
      ];

      languages[index] = value;

      return {
        ...current,
        languages,
      };
    });
  }

  function deleteLanguage(index: number) {
    setData((current) => ({
      ...current,
      languages:
        current.languages.filter(
          (_, i) => i !== index,
        ),
    }));
  }

  const sectionItems = [
    {
      id: "personal" as SectionName,
      label: "Personal",
      description: "Identity & contact",
      icon: "👤",
    },
    {
      id: "summary" as SectionName,
      label: "Summary",
      description: "Professional introduction",
      icon: "📝",
    },
    {
      id: "skills" as SectionName,
      label: "Skills",
      description: `${data.skills.length} skills`,
      icon: "⚡",
    },
    {
      id: "experience" as SectionName,
      label: "Experience",
      description: `${data.experience.length} entries`,
      icon: "💼",
    },
    {
      id: "projects" as SectionName,
      label: "Projects",
      description: `${data.projects.length} projects`,
      icon: "🚀",
    },
    {
      id: "education" as SectionName,
      label: "Education",
      description: `${data.education.length} entries`,
      icon: "🎓",
    },
    {
      id: "certifications" as SectionName,
      label: "Certifications",
      description: `${data.certifications.length} certificates`,
      icon: "📜",
    },
    {
      id: "achievements" as SectionName,
      label: "Achievements",
      description: `${data.achievements.length} achievements`,
      icon: "🏆",
    },
    {
      id: "languages" as SectionName,
      label: "Languages",
      description: `${data.languages.length} languages`,
      icon: "🌐",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f1f5f9] text-slate-900">
      {/* =====================================================
          TOP NAVIGATION
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[1900px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* BRAND */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-black text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5"
            >
              H
            </button>

            <div className="hidden min-w-0 sm:block">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-black text-slate-950">
                  Portfolio Studio
                </h1>

                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-600">
                  AI
                </span>
              </div>

              <p className="max-w-[240px] truncate text-[11px] text-slate-400">
                {portfolio.title || "Untitled Portfolio"}
              </p>
            </div>
          </div>

          {/* STATUS */}
          <div className="hidden items-center gap-2 md:flex">
            <span
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                published
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  published
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />

              {published ? "Published" : "Private"}
            </span>

            {isSaving ? (
              <span className="text-xs font-medium text-blue-600">
                Saving...
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400">
                Changes are local until saved
              </span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:block"
            >
              ← Dashboard
            </button>

            <button
              type="button"
              onClick={savePortfolio}
              disabled={
                isSaving ||
                isPublishing
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>

            {published ? (
              <>
                {slug && (
                  <a
                    href={`/p/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 sm:px-4"
                  >
                    <span className="hidden sm:inline">
                      View Live
                    </span>
                    <span className="sm:hidden">
                      Live
                    </span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={unpublishPortfolio}
                  disabled={isPublishing}
                  className="hidden rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 lg:block"
                >
                  {isPublishing
                    ? "Unpublishing..."
                    : "Unpublish"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={publishPortfolio}
                disabled={isPublishing}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-2 text-xs font-black text-white shadow-sm shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
              >
                {isPublishing
                  ? "Publishing..."
                  : "Publish"}
              </button>
            )}
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`border-t px-4 py-2 text-center text-xs font-semibold ${
              message.toLowerCase().includes("failed") ||
              message.toLowerCase().includes("error")
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-blue-100 bg-blue-50 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}
      </header>

      {/* =====================================================
          MAIN WORKSPACE
      ====================================================== */}

      <div className="mx-auto max-w-[1900px] p-3 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
          {/* =================================================
              LEFT EDITOR
          ================================================== */}

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:h-[calc(100vh-110px)]">
            {/* EDITOR HEADER */}
            <div className="border-b border-slate-100 bg-white px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                    Portfolio Content
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                    Edit your portfolio
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Select a section to edit your information.
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                  ✦
                </div>
              </div>
            </div>

            {/* SECTION NAV */}
            <div className="border-b border-slate-100 bg-slate-50/70 p-3">
              <div className="grid grid-cols-3 gap-2">
                <MiniStat
                  value={String(data.skills.length)}
                  label="Skills"
                />

                <MiniStat
                  value={String(data.projects.length)}
                  label="Projects"
                />

                <MiniStat
                  value={String(data.experience.length)}
                  label="Experience"
                />
              </div>
            </div>

            {/* ACCORDIONS */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {sectionItems.map((section) => (
                <div
                  key={section.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <Accordion
                    title={section.label}
                    icon={section.icon}
                    description={section.description}
                    open={
                      openSection === section.id
                    }
                    onClick={() =>
                      toggleSection(
                        section.id,
                      )
                    }
                  >
                    {/* PERSONAL */}
                    {section.id ===
                      "personal" && (
                      <div className="space-y-4">
                        <Field
                          label="Name"
                          value={
                            data.personal.name
                          }
                          onChange={(value) =>
                            updatePersonal(
                              "name",
                              value,
                            )
                          }
                        />

                        <Field
                          label="Headline"
                          value={
                            data.personal
                              .headline
                          }
                          onChange={(value) =>
                            updatePersonal(
                              "headline",
                              value,
                            )
                          }
                        />

                        <Field
                          label="Email"
                          value={
                            data.personal.email
                          }
                          onChange={(value) =>
                            updatePersonal(
                              "email",
                              value,
                            )
                          }
                        />

                        <Field
                          label="Phone"
                          value={
                            data.personal.phone
                          }
                          onChange={(value) =>
                            updatePersonal(
                              "phone",
                              value,
                            )
                          }
                        />

                        <Field
                          label="Location"
                          value={
                            data.personal
                              .location
                          }
                          onChange={(value) =>
                            updatePersonal(
                              "location",
                              value,
                            )
                          }
                        />

                        <Field
                          label="Website"
                          value={
                            data.personal
                              .website
                          }
                          onChange={(value) =>
                            updatePersonal(
                              "website",
                              value,
                            )
                          }
                        />

                        <Field
                          label="LinkedIn"
                          value={
                            data.personal
                              .linkedin
                          }
                          onChange={(value) =>
                            updatePersonal(
                              "linkedin",
                              value,
                            )
                          }
                        />

                        <Field
                          label="GitHub"
                          value={
                            data.personal
                              .github
                          }
                          onChange={(value) =>
                            updatePersonal(
                              "github",
                              value,
                            )
                          }
                        />
                      </div>
                    )}

                    {/* SUMMARY */}
                    {section.id ===
                      "summary" && (
                      <Textarea
                        label="Professional Summary"
                        value={data.summary}
                        rows={9}
                        onChange={(value) =>
                          setData(
                            (current) => ({
                              ...current,
                              summary: value,
                            }),
                          )
                        }
                      />
                    )}

                    {/* SKILLS */}
                    {section.id ===
                      "skills" && (
                      <div className="space-y-3">
                        {data.skills.length ===
                          0 && (
                          <EmptyState text="No skills added yet." />
                        )}

                        {data.skills.map(
                          (
                            skill,
                            index,
                          ) => (
                            <div
                              key={index}
                              className="flex gap-2"
                            >
                              <input
                                value={skill}
                                onChange={(
                                  event,
                                ) =>
                                  updateSkill(
                                    index,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                placeholder="e.g. React.js"
                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                              />

                              <DeleteButton
                                onClick={() =>
                                  deleteSkill(
                                    index,
                                  )
                                }
                              />
                            </div>
                          ),
                        )}

                        <AddButton
                          label="Add Skill"
                          onClick={
                            addSkill
                          }
                        />
                      </div>
                    )}

                    {/* EXPERIENCE */}
                    {section.id ===
                      "experience" && (
                      <div className="space-y-4">
                        {data.experience
                          .length === 0 && (
                          <EmptyState text="No experience added yet." />
                        )}

                        {data.experience.map(
                          (
                            item,
                            index,
                          ) => (
                            <div
                              key={index}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                                    Experience{" "}
                                    {index +
                                      1}
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {item.role ||
                                      "New experience"}
                                  </p>
                                </div>

                                <DeleteButton
                                  onClick={() =>
                                    deleteExperience(
                                      index,
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-4">
                                <Field
                                  label="Company"
                                  value={
                                    item.company
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateExperience(
                                      index,
                                      "company",
                                      value,
                                    )
                                  }
                                />

                                <Field
                                  label="Role"
                                  value={
                                    item.role
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateExperience(
                                      index,
                                      "role",
                                      value,
                                    )
                                  }
                                />

                                <Field
                                  label="Location"
                                  value={
                                    item.location
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateExperience(
                                      index,
                                      "location",
                                      value,
                                    )
                                  }
                                />

                                <div className="grid grid-cols-2 gap-3">
                                  <Field
                                    label="Start Date"
                                    value={
                                      item.startDate
                                    }
                                    onChange={(
                                      value,
                                    ) =>
                                      updateExperience(
                                        index,
                                        "startDate",
                                        value,
                                      )
                                    }
                                  />

                                  <Field
                                    label="End Date"
                                    value={
                                      item.endDate
                                    }
                                    onChange={(
                                      value,
                                    ) =>
                                      updateExperience(
                                        index,
                                        "endDate",
                                        value,
                                      )
                                    }
                                  />
                                </div>

                                <Textarea
                                  label="Description"
                                  value={
                                    item.description
                                  }
                                  rows={6}
                                  onChange={(
                                    value,
                                  ) =>
                                    updateExperience(
                                      index,
                                      "description",
                                      value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ),
                        )}

                        <AddButton
                          label="Add Experience"
                          onClick={
                            addExperience
                          }
                        />
                      </div>
                    )}

                    {/* PROJECTS */}
                    {section.id ===
                      "projects" && (
                      <div className="space-y-4">
                        {data.projects
                          .length === 0 && (
                          <EmptyState text="No projects added yet." />
                        )}

                        {data.projects.map(
                          (
                            item,
                            index,
                          ) => (
                            <div
                              key={index}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                                    Project{" "}
                                    {index +
                                      1}
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {item.name ||
                                      "New project"}
                                  </p>
                                </div>

                                <DeleteButton
                                  onClick={() =>
                                    deleteProject(
                                      index,
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-4">
                                <Field
                                  label="Project Name"
                                  value={
                                    item.name
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateProject(
                                      index,
                                      "name",
                                      value,
                                    )
                                  }
                                />

                                <Textarea
                                  label="Description"
                                  value={
                                    item.description
                                  }
                                  rows={6}
                                  onChange={(
                                    value,
                                  ) =>
                                    updateProject(
                                      index,
                                      "description",
                                      value,
                                    )
                                  }
                                />

                                <Field
                                  label="Technologies"
                                  value={item.technologies.join(
                                    ", ",
                                  )}
                                  placeholder="React, Node.js, PostgreSQL"
                                  onChange={(
                                    value,
                                  ) =>
                                    updateProject(
                                      index,
                                      "technologies",
                                      value
                                        .split(
                                          ",",
                                        )
                                        .map(
                                          (
                                            tech,
                                          ) =>
                                            tech.trim(),
                                        )
                                        .filter(
                                          Boolean,
                                        ),
                                    )
                                  }
                                />

                                <Field
                                  label="Project URL"
                                  value={
                                    item.url
                                  }
                                  placeholder="https://..."
                                  onChange={(
                                    value,
                                  ) =>
                                    updateProject(
                                      index,
                                      "url",
                                      value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ),
                        )}

                        <AddButton
                          label="Add Project"
                          onClick={
                            addProject
                          }
                        />
                      </div>
                    )}

                    {/* EDUCATION */}
                    {section.id ===
                      "education" && (
                      <div className="space-y-4">
                        {data.education
                          .length === 0 && (
                          <EmptyState text="No education added yet." />
                        )}

                        {data.education.map(
                          (
                            item,
                            index,
                          ) => (
                            <div
                              key={index}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                                    Education{" "}
                                    {index +
                                      1}
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {item.institution ||
                                      "New education"}
                                  </p>
                                </div>

                                <DeleteButton
                                  onClick={() =>
                                    deleteEducation(
                                      index,
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-4">
                                <Field
                                  label="Institution"
                                  value={
                                    item.institution
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateEducation(
                                      index,
                                      "institution",
                                      value,
                                    )
                                  }
                                />

                                <Field
                                  label="Degree"
                                  value={
                                    item.degree
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateEducation(
                                      index,
                                      "degree",
                                      value,
                                    )
                                  }
                                />

                                <Field
                                  label="Field"
                                  value={
                                    item.field
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateEducation(
                                      index,
                                      "field",
                                      value,
                                    )
                                  }
                                />

                                <div className="grid grid-cols-2 gap-3">
                                  <Field
                                    label="Start Date"
                                    value={
                                      item.startDate
                                    }
                                    onChange={(
                                      value,
                                    ) =>
                                      updateEducation(
                                        index,
                                        "startDate",
                                        value,
                                      )
                                    }
                                  />

                                  <Field
                                    label="End Date"
                                    value={
                                      item.endDate
                                    }
                                    onChange={(
                                      value,
                                    ) =>
                                      updateEducation(
                                        index,
                                        "endDate",
                                        value,
                                      )
                                    }
                                  />
                                </div>

                                <Textarea
                                  label="Description"
                                  value={
                                    item.description
                                  }
                                  rows={5}
                                  onChange={(
                                    value,
                                  ) =>
                                    updateEducation(
                                      index,
                                      "description",
                                      value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ),
                        )}

                        <AddButton
                          label="Add Education"
                          onClick={
                            addEducation
                          }
                        />
                      </div>
                    )}

                    {/* CERTIFICATIONS */}
                    {section.id ===
                      "certifications" && (
                      <div className="space-y-4">
                        {data.certifications
                          .length === 0 && (
                          <EmptyState text="No certifications added yet." />
                        )}

                        {data.certifications.map(
                          (
                            item,
                            index,
                          ) => (
                            <div
                              key={index}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                                    Certification{" "}
                                    {index +
                                      1}
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {item.name ||
                                      "New certification"}
                                  </p>
                                </div>

                                <DeleteButton
                                  onClick={() =>
                                    deleteCertification(
                                      index,
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-4">
                                <Field
                                  label="Certification Name"
                                  value={
                                    item.name
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateCertification(
                                      index,
                                      "name",
                                      value,
                                    )
                                  }
                                />

                                <Field
                                  label="Issuer"
                                  value={
                                    item.issuer
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateCertification(
                                      index,
                                      "issuer",
                                      value,
                                    )
                                  }
                                />

                                <Field
                                  label="Date"
                                  value={
                                    item.date
                                  }
                                  onChange={(
                                    value,
                                  ) =>
                                    updateCertification(
                                      index,
                                      "date",
                                      value,
                                    )
                                  }
                                />

                                <Field
                                  label="URL"
                                  value={
                                    item.url
                                  }
                                  placeholder="https://..."
                                  onChange={(
                                    value,
                                  ) =>
                                    updateCertification(
                                      index,
                                      "url",
                                      value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ),
                        )}

                        <AddButton
                          label="Add Certification"
                          onClick={
                            addCertification
                          }
                        />
                      </div>
                    )}

                    {/* ACHIEVEMENTS */}
                    {section.id ===
                      "achievements" && (
                      <div className="space-y-3">
                        {data.achievements
                          .length === 0 && (
                          <EmptyState text="No achievements added yet." />
                        )}

                        {data.achievements.map(
                          (
                            achievement,
                            index,
                          ) => (
                            <div
                              key={index}
                              className="flex gap-2"
                            >
                              <textarea
                                value={
                                  achievement
                                }
                                rows={3}
                                placeholder="Enter achievement"
                                onChange={(
                                  event,
                                ) =>
                                  updateAchievement(
                                    index,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                className="min-w-0 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                              />

                              <DeleteButton
                                onClick={() =>
                                  deleteAchievement(
                                    index,
                                  )
                                }
                              />
                            </div>
                          ),
                        )}

                        <AddButton
                          label="Add Achievement"
                          onClick={
                            addAchievement
                          }
                        />
                      </div>
                    )}

                    {/* LANGUAGES */}
                    {section.id ===
                      "languages" && (
                      <div className="space-y-3">
                        {data.languages
                          .length === 0 && (
                          <EmptyState text="No languages added yet." />
                        )}

                        {data.languages.map(
                          (
                            language,
                            index,
                          ) => (
                            <div
                              key={index}
                              className="flex gap-2"
                            >
                              <input
                                value={
                                  language
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateLanguage(
                                    index,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                placeholder="e.g. English"
                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                              />

                              <DeleteButton
                                onClick={() =>
                                  deleteLanguage(
                                    index,
                                  )
                                }
                              />
                            </div>
                          ),
                        )}

                        <AddButton
                          label="Add Language"
                          onClick={
                            addLanguage
                          }
                        />
                      </div>
                    )}
                  </Accordion>
                </div>
              ))}
            </div>

            {/* BOTTOM SAVE */}
            <div className="border-t border-slate-100 bg-white p-4">
              <button
                type="button"
                onClick={savePortfolio}
                disabled={
                  isSaving ||
                  isPublishing
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* =================================================
              RIGHT PREVIEW
          ================================================== */}

          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:h-[calc(100vh-110px)]">
            {/* PREVIEW TOOLBAR */}
            <div className="flex min-h-[70px] items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  ◉
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-slate-900">
                    Live Preview
                  </h2>

                  <p className="truncate text-[11px] text-slate-400">
                    Changes appear instantly
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500 sm:block">
                  Desktop Preview
                </span>

                {published &&
                  slug && (
                    <a
                      href={`/p/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Open Public Page →
                    </a>
                  )}
              </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="h-[calc(100%-70px)] overflow-auto bg-slate-100 p-3 sm:p-5">
              <div className="mx-auto min-h-full max-w-[1400px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
                <PortfolioRenderer
                  data={data}
                  design={portfolio.design_config}
                  profileImageUrl={
                    portfolio.profile_image_url
                  }
                  resumeUrl={
                    portfolio.resume_url
                  }
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   MINI STAT
============================================================ */

function MiniStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center">
      <div className="text-sm font-black text-slate-900">
        {value}
      </div>

      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
    </div>
  );
}

/* ============================================================
   ACCORDION
============================================================ */

function Accordion({
  title,
  icon,
  description,
  open,
  onClick,
  children,
}: {
  title: string;
  icon: string;
  description: string;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition ${
          open
            ? "bg-blue-50/60"
            : "hover:bg-slate-50"
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base transition ${
              open
                ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {icon}
          </span>

          <span className="min-w-0">
            <span
              className={`block truncate text-sm font-black ${
                open
                  ? "text-blue-800"
                  : "text-slate-800"
              }`}
            >
              {title}
            </span>

            <span className="mt-0.5 block truncate text-[10px] text-slate-400">
              {description}
            </span>
          </span>
        </span>

        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-slate-400 transition ${
            open
              ? "rotate-180 bg-white text-blue-600"
              : "bg-slate-100"
          }`}
        >
          ↓
        </span>
      </button>

      {open && (
        <div className="border-t border-blue-100 bg-white px-4 py-5">
          {children}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

/* ============================================================
   TEXTAREA
============================================================ */

function Textarea({
  label,
  value,
  rows = 5,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  rows?: number;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

/* ============================================================
   ADD BUTTON
============================================================ */

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-xs font-black text-blue-700 transition hover:border-blue-400 hover:bg-blue-100"
    >
      <span className="text-lg leading-none">
        +
      </span>

      {label}
    </button>
  );
}

/* ============================================================
   DELETE BUTTON
============================================================ */

function DeleteButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Delete"
      aria-label="Delete"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-sm text-red-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      🗑
    </button>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        +
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-500">
        {text}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        Use the button below to add one.
      </p>
    </div>
  );
}