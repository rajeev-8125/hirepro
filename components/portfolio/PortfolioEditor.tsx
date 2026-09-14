"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioRenderer from "./PortfolioRenderer";
import type { PortfolioData } from "@/lib/ai/portfolio-schema";

type Portfolio = {
  id: string;
  title?: string | null;
  theme?: string | null;
  generated_data: PortfolioData;
};

type Props = {
  portfolio: Portfolio;
};

type Section =
  | "profile"
  | "about"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "achievements"
  | "languages";

export default function PortfolioEditor({ portfolio }: Props) {
  const router = useRouter();

  const [data, setData] = useState<PortfolioData>(
    portfolio.generated_data
  );

  const [activeSection, setActiveSection] =
    useState<Section>("profile");

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --------------------------------------------------
  // PROFILE
  // --------------------------------------------------

  function updatePersonal(
    field: keyof PortfolioData["personal"],
    value: string
  ) {
    setData({
      ...data,
      personal: {
        ...data.personal,
        [field]: value,
      },
    });
  }

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  function updateSummary(value: string) {
    setData({
      ...data,
      summary: value,
    });
  }

  // --------------------------------------------------
  // SKILLS
  // --------------------------------------------------

  function updateSkill(index: number, value: string) {
    const skills = [...data.skills];
    skills[index] = value;

    setData({
      ...data,
      skills,
    });
  }

  function addSkill() {
    setData({
      ...data,
      skills: [...data.skills, ""],
    });
  }

  function removeSkill(index: number) {
    setData({
      ...data,
      skills: data.skills.filter((_, i) => i !== index),
    });
  }

  // --------------------------------------------------
  // EXPERIENCE
  // --------------------------------------------------

  function updateExperience(
    index: number,
    field: keyof PortfolioData["experience"][number],
    value: string
  ) {
    const experience = [...data.experience];

    experience[index] = {
      ...experience[index],
      [field]: value,
    };

    setData({
      ...data,
      experience,
    });
  }

  function addExperience() {
    setData({
      ...data,
      experience: [
        ...data.experience,
        {
          company: "",
          role: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    });
  }

  function removeExperience(index: number) {
    setData({
      ...data,
      experience: data.experience.filter((_, i) => i !== index),
    });
  }

  // --------------------------------------------------
  // PROJECTS
  // --------------------------------------------------

  function updateProject(
    index: number,
    field: keyof PortfolioData["projects"][number],
    value: string
  ) {
    const projects = [...data.projects];

    projects[index] = {
      ...projects[index],
      [field]: value,
    };

    setData({
      ...data,
      projects,
    });
  }

  function updateProjectTechnologies(
    index: number,
    value: string
  ) {
    const projects = [...data.projects];

    projects[index] = {
      ...projects[index],
      technologies: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setData({
      ...data,
      projects,
    });
  }

  function addProject() {
    setData({
      ...data,
      projects: [
        ...data.projects,
        {
          name: "",
          description: "",
          technologies: [],
          url: "",
        },
      ],
    });
  }

  function removeProject(index: number) {
    setData({
      ...data,
      projects: data.projects.filter((_, i) => i !== index),
    });
  }

  // --------------------------------------------------
  // EDUCATION
  // --------------------------------------------------

  function updateEducation(
    index: number,
    field: keyof PortfolioData["education"][number],
    value: string
  ) {
    const education = [...data.education];

    education[index] = {
      ...education[index],
      [field]: value,
    };

    setData({
      ...data,
      education,
    });
  }

  function addEducation() {
    setData({
      ...data,
      education: [
        ...data.education,
        {
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    });
  }

  function removeEducation(index: number) {
    setData({
      ...data,
      education: data.education.filter((_, i) => i !== index),
    });
  }

  // --------------------------------------------------
  // CERTIFICATIONS
  // --------------------------------------------------

  function updateCertification(
    index: number,
    field: keyof PortfolioData["certifications"][number],
    value: string
  ) {
    const certifications = [...data.certifications];

    certifications[index] = {
      ...certifications[index],
      [field]: value,
    };

    setData({
      ...data,
      certifications,
    });
  }

  function addCertification() {
    setData({
      ...data,
      certifications: [
        ...data.certifications,
        {
          name: "",
          issuer: "",
          date: "",
          url: "",
        },
      ],
    });
  }

  function removeCertification(index: number) {
    setData({
      ...data,
      certifications: data.certifications.filter(
        (_, i) => i !== index
      ),
    });
  }

  // --------------------------------------------------
  // ACHIEVEMENTS
  // --------------------------------------------------

  function updateAchievement(
    index: number,
    value: string
  ) {
    const achievements = [...data.achievements];

    achievements[index] = value;

    setData({
      ...data,
      achievements,
    });
  }

  function addAchievement() {
    setData({
      ...data,
      achievements: [
        ...data.achievements,
        "",
      ],
    });
  }

  function removeAchievement(index: number) {
    setData({
      ...data,
      achievements: data.achievements.filter(
        (_, i) => i !== index
      ),
    });
  }

  // --------------------------------------------------
  // LANGUAGES
  // --------------------------------------------------

  function updateLanguage(
    index: number,
    value: string
  ) {
    const languages = [...data.languages];

    languages[index] = value;

    setData({
      ...data,
      languages,
    });
  }

  function addLanguage() {
    setData({
      ...data,
      languages: [
        ...data.languages,
        "",
      ],
    });
  }

  function removeLanguage(index: number) {
    setData({
      ...data,
      languages: data.languages.filter(
        (_, i) => i !== index
      ),
    });
  }

  // --------------------------------------------------
  // SAVE
  // --------------------------------------------------

  async function savePortfolio() {
    try {
      setSaving(true);
      setSaveMessage("");
      setErrorMessage("");

      const response = await fetch(
        `/api/portfolio/${portfolio.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            generated_data: data,
            theme: "professional",
            title:
              portfolio.title ||
              data.personal.name ||
              "My Portfolio",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to save portfolio"
        );
      }

      setSaveMessage("Saved successfully");

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save portfolio"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // SECTION LIST
  // --------------------------------------------------

  const sections: {
    id: Section;
    label: string;
  }[] = [
    {
      id: "profile",
      label: "Profile",
    },
    {
      id: "about",
      label: "About",
    },
    {
      id: "skills",
      label: "Skills",
    },
    {
      id: "experience",
      label: "Experience",
    },
    {
      id: "projects",
      label: "Projects",
    },
    {
      id: "education",
      label: "Education",
    },
    {
      id: "certifications",
      label: "Certifications",
    },
    {
      id: "achievements",
      label: "Achievements",
    },
    {
      id: "languages",
      label: "Languages",
    },
  ];

  // --------------------------------------------------
  // INPUT CLASS
  // --------------------------------------------------

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const textareaClass =
    "mt-1 min-h-[120px] w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "text-sm font-semibold text-slate-700";

  // --------------------------------------------------
  // EDITOR CONTENT
  // --------------------------------------------------

  function renderEditor() {
    // PROFILE
    if (activeSection === "profile") {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your basic professional information.
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Full Name
            </label>

            <input
              className={inputClass}
              value={data.personal.name}
              onChange={(e) =>
                updatePersonal(
                  "name",
                  e.target.value
                )
              }
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className={labelClass}>
              Professional Headline
            </label>

            <input
              className={inputClass}
              value={data.personal.headline}
              onChange={(e) =>
                updatePersonal(
                  "headline",
                  e.target.value
                )
              }
              placeholder="Software Engineer | Full Stack Developer"
            />
          </div>

          <div>
            <label className={labelClass}>
              Email
            </label>

            <input
              type="email"
              className={inputClass}
              value={data.personal.email}
              onChange={(e) =>
                updatePersonal(
                  "email",
                  e.target.value
                )
              }
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className={labelClass}>
              Phone
            </label>

            <input
              className={inputClass}
              value={data.personal.phone}
              onChange={(e) =>
                updatePersonal(
                  "phone",
                  e.target.value
                )
              }
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div>
            <label className={labelClass}>
              Location
            </label>

            <input
              className={inputClass}
              value={data.personal.location}
              onChange={(e) =>
                updatePersonal(
                  "location",
                  e.target.value
                )
              }
              placeholder="Hyderabad, India"
            />
          </div>

          <div>
            <label className={labelClass}>
              Website
            </label>

            <input
              className={inputClass}
              value={data.personal.website}
              onChange={(e) =>
                updatePersonal(
                  "website",
                  e.target.value
                )
              }
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className={labelClass}>
              LinkedIn
            </label>

            <input
              className={inputClass}
              value={data.personal.linkedin}
              onChange={(e) =>
                updatePersonal(
                  "linkedin",
                  e.target.value
                )
              }
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className={labelClass}>
              GitHub
            </label>

            <input
              className={inputClass}
              value={data.personal.github}
              onChange={(e) =>
                updatePersonal(
                  "github",
                  e.target.value
                )
              }
              placeholder="https://github.com/username"
            />
          </div>
        </div>
      );
    }

    // ABOUT
    if (activeSection === "about") {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              About
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Write a professional summary about yourself.
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Professional Summary
            </label>

            <textarea
              className={textareaClass}
              value={data.summary}
              onChange={(e) =>
                updateSummary(e.target.value)
              }
              placeholder="Write your professional summary..."
            />
          </div>
        </div>
      );
    }

    // SKILLS
    if (activeSection === "skills") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Skills
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add your technical and professional skills.
              </p>
            </div>

            <button
              onClick={addSkill}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">
            {data.skills.map(
              (skill, index) => (
                <div
                  key={index}
                  className="flex gap-2"
                >
                  <input
                    className={inputClass}
                    value={skill}
                    onChange={(e) =>
                      updateSkill(
                        index,
                        e.target.value
                      )
                    }
                    placeholder="e.g. Python"
                  />

                  <button
                    onClick={() =>
                      removeSkill(index)
                    }
                    className="mt-1 shrink-0 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )
            )}

            {data.skills.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No skills added yet.
              </p>
            )}
          </div>
        </div>
      );
    }

    // EXPERIENCE
    if (activeSection === "experience") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Experience
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add your professional experience.
              </p>
            </div>

            <button
              onClick={addExperience}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div className="space-y-6">
            {data.experience.map(
              (item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      Experience {index + 1}
                    </h3>

                    <button
                      onClick={() =>
                        removeExperience(index)
                      }
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>
                        Company
                      </label>

                      <input
                        className={inputClass}
                        value={item.company}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "company",
                            e.target.value
                          )
                        }
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Role
                      </label>

                      <input
                        className={inputClass}
                        value={item.role}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "role",
                            e.target.value
                          )
                        }
                        placeholder="Software Engineer"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Location
                      </label>

                      <input
                        className={inputClass}
                        value={item.location}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="Hyderabad, India"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>
                          Start Date
                        </label>

                        <input
                          className={inputClass}
                          value={item.startDate}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "startDate",
                              e.target.value
                            )
                          }
                          placeholder="Jan 2025"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          End Date
                        </label>

                        <input
                          className={inputClass}
                          value={item.endDate}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "endDate",
                              e.target.value
                            )
                          }
                          placeholder="Present"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Description
                      </label>

                      <textarea
                        className={textareaClass}
                        value={item.description}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe your responsibilities and work..."
                      />
                    </div>
                  </div>
                </div>
              )
            )}

            {data.experience.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No experience added yet.
              </p>
            )}
          </div>
        </div>
      );
    }

    // PROJECTS
    if (activeSection === "projects") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Projects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showcase your best projects.
              </p>
            </div>

            <button
              onClick={addProject}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div className="space-y-6">
            {data.projects.map(
              (project, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      Project {index + 1}
                    </h3>

                    <button
                      onClick={() =>
                        removeProject(index)
                      }
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>
                        Project Name
                      </label>

                      <input
                        className={inputClass}
                        value={project.name}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Project name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Description
                      </label>

                      <textarea
                        className={textareaClass}
                        value={project.description}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe your project..."
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Technologies
                      </label>

                      <input
                        className={inputClass}
                        value={project.technologies.join(
                          ", "
                        )}
                        onChange={(e) =>
                          updateProjectTechnologies(
                            index,
                            e.target.value
                          )
                        }
                        placeholder="React, Node.js, PostgreSQL"
                      />

                      <p className="mt-1 text-xs text-slate-400">
                        Separate technologies with commas.
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Project URL
                      </label>

                      <input
                        className={inputClass}
                        value={project.url}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "url",
                            e.target.value
                          )
                        }
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                </div>
              )
            )}

            {data.projects.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No projects added yet.
              </p>
            )}
          </div>
        </div>
      );
    }

    // EDUCATION
    if (activeSection === "education") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Education
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add your academic background.
              </p>
            </div>

            <button
              onClick={addEducation}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div className="space-y-6">
            {data.education.map(
              (item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      Education {index + 1}
                    </h3>

                    <button
                      onClick={() =>
                        removeEducation(index)
                      }
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>
                        Institution
                      </label>

                      <input
                        className={inputClass}
                        value={item.institution}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                        placeholder="University / College"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Degree
                      </label>

                      <input
                        className={inputClass}
                        value={item.degree}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "degree",
                            e.target.value
                          )
                        }
                        placeholder="B.Tech"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Field of Study
                      </label>

                      <input
                        className={inputClass}
                        value={item.field}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "field",
                            e.target.value
                          )
                        }
                        placeholder="Computer Science"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>
                          Start Date
                        </label>

                        <input
                          className={inputClass}
                          value={item.startDate}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "startDate",
                              e.target.value
                            )
                          }
                          placeholder="2021"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          End Date
                        </label>

                        <input
                          className={inputClass}
                          value={item.endDate}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "endDate",
                              e.target.value
                            )
                          }
                          placeholder="2025"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Description
                      </label>

                      <textarea
                        className={textareaClass}
                        value={item.description}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Additional information..."
                      />
                    </div>
                  </div>
                </div>
              )
            )}

            {data.education.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No education added yet.
              </p>
            )}
          </div>
        </div>
      );
    }

    // CERTIFICATIONS
    if (activeSection === "certifications") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Certifications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add professional certifications.
              </p>
            </div>

            <button
              onClick={addCertification}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div className="space-y-6">
            {data.certifications.map(
              (item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      Certification {index + 1}
                    </h3>

                    <button
                      onClick={() =>
                        removeCertification(index)
                      }
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>
                        Certification Name
                      </label>

                      <input
                        className={inputClass}
                        value={item.name}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Certification name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Issuer
                      </label>

                      <input
                        className={inputClass}
                        value={item.issuer}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "issuer",
                            e.target.value
                          )
                        }
                        placeholder="Issuing organization"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Date
                      </label>

                      <input
                        className={inputClass}
                        value={item.date}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "date",
                            e.target.value
                          )
                        }
                        placeholder="2026"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Certificate URL
                      </label>

                      <input
                        className={inputClass}
                        value={item.url}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "url",
                            e.target.value
                          )
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              )
            )}

            {data.certifications.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No certifications added yet.
              </p>
            )}
          </div>
        </div>
      );
    }

    // ACHIEVEMENTS
    if (activeSection === "achievements") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Achievements
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add awards, accomplishments and achievements.
              </p>
            </div>

            <button
              onClick={addAchievement}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">
            {data.achievements.map(
              (achievement, index) => (
                <div
                  key={index}
                  className="flex gap-2"
                >
                  <textarea
                    className="min-h-[90px] flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={achievement}
                    onChange={(e) =>
                      updateAchievement(
                        index,
                        e.target.value
                      )
                    }
                    placeholder="Describe your achievement..."
                  />

                  <button
                    onClick={() =>
                      removeAchievement(index)
                    }
                    className="h-fit rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )
            )}

            {data.achievements.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No achievements added yet.
              </p>
            )}
          </div>
        </div>
      );
    }

    // LANGUAGES
    if (activeSection === "languages") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Languages
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add languages you can communicate in.
              </p>
            </div>

            <button
              onClick={addLanguage}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">
            {data.languages.map(
              (language, index) => (
                <div
                  key={index}
                  className="flex gap-2"
                >
                  <input
                    className={inputClass}
                    value={language}
                    onChange={(e) =>
                      updateLanguage(
                        index,
                        e.target.value
                      )
                    }
                    placeholder="English"
                  />

                  <button
                    onClick={() =>
                      removeLanguage(index)
                    }
                    className="mt-1 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )
            )}

            {data.languages.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No languages added yet.
              </p>
            )}
          </div>
        </div>
      );
    }

    return null;
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* ==========================================
          LEFT SIDEBAR
      ========================================== */}

      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">

        {/* HEADER */}

        <div className="border-b border-slate-200 px-5 py-5">
          <button
            onClick={() =>
              router.push("/dashboard/portfolio")
            }
            className="text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            ← Back
          </button>

          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Portfolio Editor
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Build your professional portfolio
          </p>
        </div>

        {/* SECTIONS */}

        <nav className="flex-1 overflow-y-auto p-3">
          {sections.map((section) => {
            const active =
              activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() =>
                  setActiveSection(section.id)
                }
                className={`mb-1 flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </nav>

        {/* SAVE */}

        <div className="border-t border-slate-200 p-4">

          {saveMessage && (
            <p className="mb-3 text-center text-xs font-medium text-green-600">
              {saveMessage}
            </p>
          )}

          {errorMessage && (
            <p className="mb-3 rounded-lg bg-red-50 p-2 text-center text-xs font-medium text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            onClick={savePortfolio}
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Portfolio"}
          </button>
        </div>
      </aside>

      {/* ==========================================
          EDITOR PANEL
      ========================================== */}

      <section className="w-[420px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white">

        <div className="p-6">
          {renderEditor()}
        </div>

      </section>

      {/* ==========================================
          LIVE PREVIEW
      ========================================== */}

      <main className="min-w-0 flex-1 overflow-y-auto bg-slate-100 p-6">

        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Preview
            </p>

            <h2 className="text-sm font-semibold text-slate-700">
              Your portfolio
            </h2>
          </div>

          <button
            onClick={savePortfolio}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <PortfolioRenderer data={data} />
        </div>

      </main>
    </div>
  );
}