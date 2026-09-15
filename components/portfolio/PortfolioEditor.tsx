"use client";

import { useState, type ReactNode } from "react";
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
  const [data, setData] = useState<PortfolioData>(
    portfolio.generated_data
  );

  const [openSection, setOpenSection] = useState<SectionName | null>("personal");

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [published, setPublished] = useState(
    portfolio.is_published ?? false
  );

  const [slug, setSlug] = useState(
    portfolio.slug ?? null
  );

  const [message, setMessage] = useState("");

  function toggleSection(section: SectionName) {
    setOpenSection((current) =>
      current === section ? null : section
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
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to save portfolio"
        );
      }

      setMessage("Portfolio saved successfully.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save portfolio"
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

      // Save latest changes first.
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
        }
      );

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveResult.error ||
            "Failed to save portfolio before publishing"
        );
      }

      const response = await fetch(
        `/api/portfolio/${portfolio.id}/publish`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to publish portfolio"
        );
      }

      setPublished(true);
      setSlug(result.slug);

      setMessage(
        "🎉 Your portfolio is now live!"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to publish portfolio"
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
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to unpublish portfolio"
        );
      }

      setPublished(false);

      setMessage(
        "Portfolio has been unpublished."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to unpublish portfolio"
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
    value: string
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

  function updateSkill(
    index: number,
    value: string
  ) {
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
        (_, i) => i !== index
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
    value: string
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
        (_, i) => i !== index
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
    value: string | string[]
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
        (_, i) => i !== index
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
    value: string
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
        (_, i) => i !== index
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
    value: string
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
          (_, i) => i !== index
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
    value: string
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
          (_, i) => i !== index
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
    value: string
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
          (_, i) => i !== index
        ),
    }));
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Portfolio Editor
            </h1>

            <p className="text-xs text-slate-500">
              {published
                ? "Your portfolio is public"
                : "Your portfolio is private"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={savePortfolio}
              disabled={
                isSaving ||
                isPublishing
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : "Save"}
            </button>

            {published ? (
              <>
                {slug && (
                  <a
                    href={`/p/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    View Live
                  </a>
                )}

                <button
                  type="button"
                  onClick={
                    unpublishPortfolio
                  }
                  disabled={isPublishing}
                  className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPublishing
                    ? "Unpublishing..."
                    : "Unpublish"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={
                  publishPortfolio
                }
                disabled={isPublishing}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPublishing
                  ? "Publishing..."
                  : "🚀 Publish Portfolio"}
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="border-t bg-slate-50 px-4 py-2 text-center text-sm text-slate-700">
            {message}
          </div>
        )}
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-6 p-4 md:p-6 xl:grid-cols-[440px_1fr]">
        {/* ===================================================
            EDITOR
        ==================================================== */}

        <aside className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Edit Portfolio
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Open a section to edit, add or remove content.
            </p>
          </div>

          <div className="divide-y">
            {/* =================================================
                PERSONAL
            ================================================== */}

            <Accordion
              title="Personal Information"
              icon="👤"
              open={
                openSection ===
                "personal"
              }
              onClick={() =>
                toggleSection(
                  "personal"
                )
              }
            >
              <Field
                label="Name"
                value={
                  data.personal.name
                }
                onChange={(value) =>
                  updatePersonal(
                    "name",
                    value
                  )
                }
              />

              <Field
                label="Headline"
                value={
                  data.personal.headline
                }
                onChange={(value) =>
                  updatePersonal(
                    "headline",
                    value
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
                    value
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
                    value
                  )
                }
              />

              <Field
                label="Location"
                value={
                  data.personal.location
                }
                onChange={(value) =>
                  updatePersonal(
                    "location",
                    value
                  )
                }
              />

              <Field
                label="Website"
                value={
                  data.personal.website
                }
                onChange={(value) =>
                  updatePersonal(
                    "website",
                    value
                  )
                }
              />

              <Field
                label="LinkedIn"
                value={
                  data.personal.linkedin
                }
                onChange={(value) =>
                  updatePersonal(
                    "linkedin",
                    value
                  )
                }
              />

              <Field
                label="GitHub"
                value={
                  data.personal.github
                }
                onChange={(value) =>
                  updatePersonal(
                    "github",
                    value
                  )
                }
              />
            </Accordion>

            {/* =================================================
                SUMMARY
            ================================================== */}

            <Accordion
              title="Professional Summary"
              icon="📝"
              open={
                openSection ===
                "summary"
              }
              onClick={() =>
                toggleSection(
                  "summary"
                )
              }
            >
              <Textarea
                label="Summary"
                value={
                  data.summary
                }
                rows={8}
                onChange={(value) =>
                  setData(
                    (current) => ({
                      ...current,
                      summary: value,
                    })
                  )
                }
              />
            </Accordion>

            {/* =================================================
                SKILLS
            ================================================== */}

            <Accordion
              title={`Skills (${data.skills.length})`}
              icon="🛠️"
              open={
                openSection ===
                "skills"
              }
              onClick={() =>
                toggleSection(
                  "skills"
                )
              }
            >
              {data.skills.length ===
                0 && (
                <EmptyState text="No skills added yet." />
              )}

              {data.skills.map(
                (skill, index) => (
                  <div
                    key={index}
                    className="flex gap-2"
                  >
                    <input
                      value={skill}
                      onChange={(event) =>
                        updateSkill(
                          index,
                          event.target
                            .value
                        )
                      }
                      placeholder="Enter skill"
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                    <DeleteButton
                      onClick={() =>
                        deleteSkill(
                          index
                        )
                      }
                    />
                  </div>
                )
              )}

              <AddButton
                label="Add Skill"
                onClick={
                  addSkill
                }
              />
            </Accordion>

            {/* =================================================
                EXPERIENCE
            ================================================== */}

            <Accordion
              title={`Experience (${data.experience.length})`}
              icon="💼"
              open={
                openSection ===
                "experience"
              }
              onClick={() =>
                toggleSection(
                  "experience"
                )
              }
            >
              {data.experience.length ===
                0 && (
                <EmptyState text="No experience added yet." />
              )}

              {data.experience.map(
                (item, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-xl border bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">
                        Experience{" "}
                        {index + 1}
                      </p>

                      <DeleteButton
                        onClick={() =>
                          deleteExperience(
                            index
                          )
                        }
                      />
                    </div>

                    <Field
                      label="Company"
                      value={
                        item.company
                      }
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "company",
                          value
                        )
                      }
                    />

                    <Field
                      label="Role"
                      value={
                        item.role
                      }
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "role",
                          value
                        )
                      }
                    />

                    <Field
                      label="Location"
                      value={
                        item.location
                      }
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "location",
                          value
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
                          value
                        ) =>
                          updateExperience(
                            index,
                            "startDate",
                            value
                          )
                        }
                      />

                      <Field
                        label="End Date"
                        value={
                          item.endDate
                        }
                        onChange={(
                          value
                        ) =>
                          updateExperience(
                            index,
                            "endDate",
                            value
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
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "description",
                          value
                        )
                      }
                    />
                  </div>
                )
              )}

              <AddButton
                label="Add Experience"
                onClick={
                  addExperience
                }
              />
            </Accordion>

            {/* =================================================
                PROJECTS
            ================================================== */}

            <Accordion
              title={`Projects (${data.projects.length})`}
              icon="🚀"
              open={
                openSection ===
                "projects"
              }
              onClick={() =>
                toggleSection(
                  "projects"
                )
              }
            >
              {data.projects.length ===
                0 && (
                <EmptyState text="No projects added yet." />
              )}

              {data.projects.map(
                (item, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-xl border bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">
                        Project{" "}
                        {index + 1}
                      </p>

                      <DeleteButton
                        onClick={() =>
                          deleteProject(
                            index
                          )
                        }
                      />
                    </div>

                    <Field
                      label="Project Name"
                      value={
                        item.name
                      }
                      onChange={(value) =>
                        updateProject(
                          index,
                          "name",
                          value
                        )
                      }
                    />

                    <Textarea
                      label="Description"
                      value={
                        item.description
                      }
                      rows={6}
                      onChange={(value) =>
                        updateProject(
                          index,
                          "description",
                          value
                        )
                      }
                    />

                    <Field
                      label="Technologies"
                      value={item.technologies.join(
                        ", "
                      )}
                      placeholder="React, Node.js, MySQL"
                      onChange={(value) =>
                        updateProject(
                          index,
                          "technologies",
                          value
                            .split(",")
                            .map(
                              (
                                tech
                              ) =>
                                tech.trim()
                            )
                            .filter(
                              Boolean
                            )
                        )
                      }
                    />

                    <Field
                      label="Project URL"
                      value={
                        item.url
                      }
                      onChange={(value) =>
                        updateProject(
                          index,
                          "url",
                          value
                        )
                      }
                    />
                  </div>
                )
              )}

              <AddButton
                label="Add Project"
                onClick={
                  addProject
                }
              />
            </Accordion>

            {/* =================================================
                EDUCATION
            ================================================== */}

            <Accordion
              title={`Education (${data.education.length})`}
              icon="🎓"
              open={
                openSection ===
                "education"
              }
              onClick={() =>
                toggleSection(
                  "education"
                )
              }
            >
              {data.education.length ===
                0 && (
                <EmptyState text="No education added yet." />
              )}

              {data.education.map(
                (item, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-xl border bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">
                        Education{" "}
                        {index + 1}
                      </p>

                      <DeleteButton
                        onClick={() =>
                          deleteEducation(
                            index
                          )
                        }
                      />
                    </div>

                    <Field
                      label="Institution"
                      value={
                        item.institution
                      }
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "institution",
                          value
                        )
                      }
                    />

                    <Field
                      label="Degree"
                      value={
                        item.degree
                      }
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "degree",
                          value
                        )
                      }
                    />

                    <Field
                      label="Field"
                      value={
                        item.field
                      }
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "field",
                          value
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
                          value
                        ) =>
                          updateEducation(
                            index,
                            "startDate",
                            value
                          )
                        }
                      />

                      <Field
                        label="End Date"
                        value={
                          item.endDate
                        }
                        onChange={(
                          value
                        ) =>
                          updateEducation(
                            index,
                            "endDate",
                            value
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
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "description",
                          value
                        )
                      }
                    />
                  </div>
                )
              )}

              <AddButton
                label="Add Education"
                onClick={
                  addEducation
                }
              />
            </Accordion>

            {/* =================================================
                CERTIFICATIONS
            ================================================== */}

            <Accordion
              title={`Certifications (${data.certifications.length})`}
              icon="📜"
              open={
                openSection ===
                "certifications"
              }
              onClick={() =>
                toggleSection(
                  "certifications"
                )
              }
            >
              {data.certifications.length ===
                0 && (
                <EmptyState text="No certifications added yet." />
              )}

              {data.certifications.map(
                (item, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-xl border bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">
                        Certification{" "}
                        {index + 1}
                      </p>

                      <DeleteButton
                        onClick={() =>
                          deleteCertification(
                            index
                          )
                        }
                      />
                    </div>

                    <Field
                      label="Certification Name"
                      value={
                        item.name
                      }
                      onChange={(value) =>
                        updateCertification(
                          index,
                          "name",
                          value
                        )
                      }
                    />

                    <Field
                      label="Issuer"
                      value={
                        item.issuer
                      }
                      onChange={(value) =>
                        updateCertification(
                          index,
                          "issuer",
                          value
                        )
                      }
                    />

                    <Field
                      label="Date"
                      value={
                        item.date
                      }
                      onChange={(value) =>
                        updateCertification(
                          index,
                          "date",
                          value
                        )
                      }
                    />

                    <Field
                      label="URL"
                      value={
                        item.url
                      }
                      onChange={(value) =>
                        updateCertification(
                          index,
                          "url",
                          value
                        )
                      }
                    />
                  </div>
                )
              )}

              <AddButton
                label="Add Certification"
                onClick={
                  addCertification
                }
              />
            </Accordion>

            {/* =================================================
                ACHIEVEMENTS
            ================================================== */}

            <Accordion
              title={`Achievements (${data.achievements.length})`}
              icon="🏆"
              open={
                openSection ===
                "achievements"
              }
              onClick={() =>
                toggleSection(
                  "achievements"
                )
              }
            >
              {data.achievements.length ===
                0 && (
                <EmptyState text="No achievements added yet." />
              )}

              {data.achievements.map(
                (achievement, index) => (
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
                        event
                      ) =>
                        updateAchievement(
                          index,
                          event.target
                            .value
                        )
                      }
                      className="min-w-0 flex-1 resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                    <DeleteButton
                      onClick={() =>
                        deleteAchievement(
                          index
                        )
                      }
                    />
                  </div>
                )
              )}

              <AddButton
                label="Add Achievement"
                onClick={
                  addAchievement
                }
              />
            </Accordion>

            {/* =================================================
                LANGUAGES
            ================================================== */}

            <Accordion
              title={`Languages (${data.languages.length})`}
              icon="🌐"
              open={
                openSection ===
                "languages"
              }
              onClick={() =>
                toggleSection(
                  "languages"
                )
              }
            >
              {data.languages.length ===
                0 && (
                <EmptyState text="No languages added yet." />
              )}

              {data.languages.map(
                (language, index) => (
                  <div
                    key={index}
                    className="flex gap-2"
                  >
                    <input
                      value={language}
                      onChange={(event) =>
                        updateLanguage(
                          index,
                          event.target
                            .value
                        )
                      }
                      placeholder="Enter language"
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                    <DeleteButton
                      onClick={() =>
                        deleteLanguage(
                          index
                        )
                      }
                    />
                  </div>
                )
              )}

              <AddButton
                label="Add Language"
                onClick={
                  addLanguage
                }
              />
            </Accordion>
          </div>

          {/* SAVE */}
          <div className="border-t p-5">
            <button
              type="button"
              onClick={savePortfolio}
              disabled={
                isSaving ||
                isPublishing
              }
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </aside>

        {/* ===================================================
            LIVE PREVIEW
        ==================================================== */}

        <section className="min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b bg-slate-50 px-5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Live Preview
                </h2>

                <p className="text-xs text-slate-500">
                  Changes appear here immediately.
                </p>
              </div>

              {published &&
                slug && (
                  <a
                    href={`/p/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-600 hover:underline"
                  >
                    Open public page →
                  </a>
                )}
            </div>
          </div>

          <div className="min-h-[700px] overflow-auto">
            <PortfolioRenderer
              data={data}
              design={
                portfolio.design_config
              }
              profileImageUrl={
                portfolio.profile_image_url
              }
              resumeUrl={
                portfolio.resume_url
              }
            />
          </div>
        </section>
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
  open,
  onClick,
  children,
}: {
  title: string;
  icon: string;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <span className="flex items-center gap-3">
          <span className="text-lg">
            {icon}
          </span>

          <span className="text-sm font-semibold text-slate-800">
            {title}
          </span>
        </span>

        <span
          className={`text-sm text-slate-400 transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t bg-white px-5 py-5">
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
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-green-400 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
    >
      <span className="text-lg">
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
      className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
    >
      🗑️
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
    <div className="rounded-lg border border-dashed bg-slate-50 p-5 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}