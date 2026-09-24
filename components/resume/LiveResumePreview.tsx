"use client";

import React, { useMemo } from "react";

import {
  getPageStyle,
  getSectionTitleStyle,
  getSidebarStyle,
  getBodyStyle,
  fontFamilyCss,
  mergeDesign,
} from "@/lib/resume/design-utils";

import type {
  ResumeData,
  ResumeDesign,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeLanguage,
  ResumeProject,
  ResumeCertification,
  ResumeAchievement,
  ResumeVolunteer,
  ResumeReference,
  ResumeTemplate,
} from "@/lib/resume/template-types";

interface LiveResumePreviewProps {
  data?: ResumeData | null;
  template: ResumeTemplate;
  design?: ResumeDesign | null;

  zoom?: number;

  className?: string;

  showPageShadow?: boolean;
}

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function getFullName(data: ResumeData): string {
  if (data.fullName?.trim()) {
    return data.fullName.trim();
  }

  return [data.firstName, data.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "Your Name";
}

function getContact(data: ResumeData) {
  return {
    email: data.contact?.email ?? data.email ?? "",
    phone: data.contact?.phone ?? data.phone ?? "",
    address: data.contact?.address ?? data.address ?? "",
    linkedin: data.contact?.linkedin ?? data.linkedin ?? "",
    portfolio: data.contact?.portfolio ?? data.portfolio ?? "",
    github: data.contact?.github ?? data.github ?? "",
    website: data.contact?.website ?? data.website ?? "",
  };
}

function normalizeSkills(
  skills: ResumeData["skills"],
): ResumeSkill[] {
  return safeArray(skills).map((skill, index) => {
    if (typeof skill === "string") {
      return {
        id: `skill-${index}`,
        name: skill,
      };
    }

    return skill;
  });
}

function normalizeLanguages(
  languages: ResumeData["languages"],
): ResumeLanguage[] {
  return safeArray(languages).map((language, index) => {
    if (typeof language === "string") {
      return {
        id: `language-${index}`,
        name: language,
      };
    }

    return language;
  });
}

function SectionTitle({
  children,
  design,
}: {
  children: React.ReactNode;
  design: ResumeDesign;
}) {
  return (
    <div style={getSectionTitleStyle(design)}>
      {children}
    </div>
  );
}

function ContactBlock({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const contact = getContact(data);
  const color = design.colors.sidebarText;

  const items = [
    contact.phone,
    contact.email,
    contact.address,
    contact.linkedin,
    contact.portfolio,
    contact.github,
    contact.website,
  ].filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontSize: `${Math.max(
          design.typography.bodySize - 0.5,
          7.5,
        )}pt`,
        color,
        lineHeight: 1.35,
      }}
    >
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          style={{
            overflowWrap: "anywhere",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function SkillsBlock({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const skills = normalizeSkills(data.skills);

  if (!skills.length) {
    return null;
  }

  const display = design.layout.skillDisplay;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {skills.map((skill, index) => {
        const level = Math.min(
          Math.max(Number(skill.level ?? 5), 1),
          5,
        );

        if (display === "stars") {
          return (
            <div
              key={skill.id ?? `${skill.name}-${index}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                fontSize: `${design.typography.bodySize}pt`,
              }}
            >
              <span>{skill.name}</span>

              <span
                style={{
                  whiteSpace: "nowrap",
                  color: design.colors.accent,
                  letterSpacing: 1,
                }}
              >
                {"★".repeat(level)}
                {"☆".repeat(5 - level)}
              </span>
            </div>
          );
        }

        if (display === "percentage") {
          return (
            <div
              key={skill.id ?? `${skill.name}-${index}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{skill.name}</span>
                <span>{level * 20}%</span>
              </div>

              <div
                style={{
                  height: 3,
                  background: "rgba(255,255,255,.25)",
                  overflow: "hidden",
                  borderRadius: 99,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${level * 20}%`,
                    background: design.colors.accent,
                  }}
                />
              </div>
            </div>
          );
        }

        if (display === "tags") {
          return (
            <span
              key={skill.id ?? `${skill.name}-${index}`}
              style={{
                display: "inline-block",
                marginRight: 4,
                marginBottom: 4,
                padding: "3px 7px",
                border: `1px solid ${design.colors.divider}`,
                borderRadius: 3,
                fontSize: `${Math.max(
                  design.typography.bodySize - 1,
                  7,
                )}pt`,
              }}
            >
              {skill.name}
            </span>
          );
        }

        return (
          <div
            key={skill.id ?? `${skill.name}-${index}`}
            style={{
              fontSize: `${design.typography.bodySize}pt`,
            }}
          >
            {skill.name}
          </div>
        );
      })}
    </div>
  );
}

function LanguagesBlock({
  data,
  design,
  sidebar = false,
}: {
  data: ResumeData;
  design: ResumeDesign;
  sidebar?: boolean;
}) {
  const languages = normalizeLanguages(data.languages);

  if (!languages.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        color: sidebar
          ? design.colors.sidebarText
          : design.colors.text,
      }}
    >
      {languages.map((language, index) => (
        <div
          key={language.id ?? `${language.name}-${index}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span>{language.name}</span>
          {language.level && (
            <span style={{ opacity: 0.75 }}>
              {language.level}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ExperienceBlock({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const items = safeArray(data.experience);

  if (!items.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: design.spacing.itemGap,
      }}
    >
      {items.map((item: ResumeExperience, index) => {
        const title = item.role || item.title || "Position";

        const date =
          item.startDate || item.endDate
            ? `${item.startDate ?? ""}${
                item.startDate && item.endDate ? " – " : ""
              }${item.endDate ?? (item.current ? "Present" : "")}`
            : "";

        const bullets =
          item.bullets?.length
            ? item.bullets
            : item.description
              ? [item.description]
              : [];

        return (
          <div
            key={item.id ?? `${title}-${index}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  design.layout.dates === "right"
                    ? "space-between"
                    : "flex-start",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: `${design.typography.headingSize}pt`,
                  color: design.colors.text,
                }}
              >
                {title}
              </div>

              {date && (
                <div
                  style={{
                    fontSize: `${Math.max(
                      design.typography.bodySize - 1,
                      7.5,
                    )}pt`,
                    color: design.colors.mutedText,
                    whiteSpace: "nowrap",
                  }}
                >
                  {date}
                </div>
              )}
            </div>

            {(item.company || item.location) && (
              <div
                style={{
                  color: design.colors.primary,
                  fontWeight: 600,
                  fontSize: `${Math.max(
                    design.typography.bodySize - 0.2,
                    8,
                  )}pt`,
                }}
              >
                {[item.company, item.location]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}

            {bullets.length > 0 && (
              <ul
                style={{
                  margin: "2px 0 0",
                  paddingLeft: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: design.spacing.bulletGap,
                }}
              >
                {bullets.map((bullet, bulletIndex) => (
                  <li
                    key={`${bulletIndex}-${bullet}`}
                    style={{
                      fontSize: `${design.typography.bodySize}pt`,
                      lineHeight:
                        design.typography.lineHeight,
                    }}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EducationBlock({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const items = safeArray(data.education);

  if (!items.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: design.spacing.itemGap,
      }}
    >
      {items.map((item: ResumeEducation, index) => {
        const school =
          item.institution || item.school || "";

        const date =
          item.startDate || item.endDate
            ? `${item.startDate ?? ""}${
                item.startDate && item.endDate ? " – " : ""
              }${item.endDate ?? ""}`
            : "";

        return (
          <div
            key={item.id ?? `${school}-${index}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  design.layout.dates === "right"
                    ? "space-between"
                    : "flex-start",
                gap: 8,
              }}
            >
              <strong
                style={{
                  fontSize: `${design.typography.headingSize}pt`,
                }}
              >
                {item.degree ||
                  item.field ||
                  "Education"}
              </strong>

              {date && (
                <span
                  style={{
                    fontSize: `${Math.max(
                      design.typography.bodySize - 1,
                      7.5,
                    )}pt`,
                    color: design.colors.mutedText,
                    whiteSpace: "nowrap",
                  }}
                >
                  {date}
                </span>
              )}
            </div>

            {school && (
              <div
                style={{
                  color: design.colors.primary,
                  fontWeight: 600,
                }}
              >
                {school}
              </div>
            )}

            {item.description && (
              <div style={getBodyStyle(design)}>
                {item.description}
              </div>
            )}

            {item.grade && (
              <div
                style={{
                  color: design.colors.mutedText,
                }}
              >
                {item.grade}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjectsBlock({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const projects = safeArray(data.projects);

  if (!projects.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: design.spacing.itemGap,
      }}
    >
      {projects.map(
        (project: ResumeProject, index) => (
          <div
            key={project.id ?? `${project.name}-${index}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <strong
              style={{
                fontSize: `${design.typography.headingSize}pt`,
              }}
            >
              {project.name || "Project"}
            </strong>

            {project.technologies?.length ? (
              <div
                style={{
                  color: design.colors.primary,
                  fontSize: `${Math.max(
                    design.typography.bodySize - 0.3,
                    8,
                  )}pt`,
                }}
              >
                {project.technologies.join(" · ")}
              </div>
            ) : null}

            {project.description && (
              <div style={getBodyStyle(design)}>
                {project.description}
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function CertificationsBlock({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const items = safeArray(data.certifications);

  if (!items.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {items.map(
        (item: ResumeCertification, index) => (
          <div
            key={item.id ?? `${item.name}-${index}`}
          >
            <strong>{item.name}</strong>

            {(item.issuer || item.date) && (
              <div
                style={{
                  color: design.colors.mutedText,
                }}
              >
                {[item.issuer, item.date]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function AchievementsBlock({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const items = safeArray(data.achievements);

  if (!items.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
      }}
    >
      {items.map(
        (item: ResumeAchievement, index) => (
          <div
            key={item.id ?? `${item.title}-${index}`}
          >
            <strong>{item.title}</strong>

            {item.description && (
              <div style={getBodyStyle(design)}>
                {item.description}
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function VolunteerBlock({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const items = safeArray(data.volunteer);

  if (!items.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {items.map(
        (item: ResumeVolunteer, index) => (
          <div
            key={
              item.id ??
              `${item.organization}-${index}`
            }
          >
            <strong>{item.role || "Volunteer"}</strong>

            {item.organization && (
              <div
                style={{
                  color: design.colors.primary,
                  fontWeight: 600,
                }}
              >
                {item.organization}
              </div>
            )}

            {item.description && (
              <div style={getBodyStyle(design)}>
                {item.description}
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function ReferencesBlock({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const items = safeArray(data.references);

  if (!items.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          items.length > 1
            ? "repeat(2, minmax(0, 1fr))"
            : "1fr",
        gap: 10,
      }}
    >
      {items.map(
        (item: ResumeReference, index) => (
          <div
            key={item.id ?? `${item.name}-${index}`}
          >
            <strong>{item.name}</strong>

            {item.role && (
              <div>{item.role}</div>
            )}

            {item.company && (
              <div>{item.company}</div>
            )}

            {item.phone && (
              <div>{item.phone}</div>
            )}

            {item.email && (
              <div
                style={{
                  overflowWrap: "anywhere",
                }}
              >
                {item.email}
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function Photo({
  src,
  design,
}: {
  src?: string | null;
  design: ResumeDesign;
}) {
  if (!src || !design.layout.photo) {
    return null;
  }

  const radius =
    design.layout.photoShape === "circle"
      ? "50%"
      : design.layout.photoShape === "rounded"
        ? "12px"
        : "0";

  return (
    <img
      src={src}
      alt=""
      style={{
        width: design.layout.photoSize ?? 70,
        height: design.layout.photoSize ?? 70,
        objectFit: "cover",
        borderRadius: radius,
        display: "block",
        border:
          design.layout.photoShape === "circle"
            ? `2px solid ${design.colors.accent}`
            : undefined,
      }}
    />
  );
}

function Sidebar({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const contact = getContact(data);

  return (
    <aside
      style={{
        ...getSidebarStyle(design),
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        minHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      {design.layout.photo &&
        design.layout.photoPosition ===
          "sidebar" && (
          <Photo
            src={data.profilePhoto}
            design={design}
          />
        )}

      <div>
        <div
          style={{
            fontSize: `${Math.max(
              design.typography.nameSize - 4,
              17,
            )}pt`,
            fontWeight:
              design.typography.nameWeight,
            lineHeight: 1.05,
            color: design.colors.sidebarText,
          }}
        >
          {getFullName(data)}
        </div>

        {(data.jobTitle || data.headline) && (
          <div
            style={{
              marginTop: 5,
              fontSize: `${design.typography.jobTitleSize}pt`,
              opacity: 0.82,
            }}
          >
            {data.jobTitle || data.headline}
          </div>
        )}
      </div>

      <div>
        <SectionTitle design={design}>
          Contact
        </SectionTitle>

        <ContactBlock
          data={data}
          design={design}
        />
      </div>

      {data.skills?.length ? (
        <div>
          <SectionTitle design={design}>
            Skills
          </SectionTitle>

          <SkillsBlock
            data={data}
            design={design}
          />
        </div>
      ) : null}

      {data.languages?.length ? (
        <div>
          <SectionTitle design={design}>
            Languages
          </SectionTitle>

          <LanguagesBlock
            data={data}
            design={design}
            sidebar
          />
        </div>
      ) : null}
    </aside>
  );
}

function MainContent({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  const sections = [
    {
      id: "summary",
      title: "Summary",
      visible: Boolean(data.summary),
      content: data.summary ? (
        <div style={getBodyStyle(design)}>
          {data.summary}
        </div>
      ) : null,
    },
    {
      id: "experience",
      title: "Professional Experience",
      visible: Boolean(data.experience?.length),
      content: (
        <ExperienceBlock
          data={data}
          design={design}
        />
      ),
    },
    {
      id: "education",
      title: "Education",
      visible: Boolean(data.education?.length),
      content: (
        <EducationBlock
          data={data}
          design={design}
        />
      ),
    },
    {
      id: "projects",
      title: "Projects",
      visible: Boolean(data.projects?.length),
      content: (
        <ProjectsBlock
          data={data}
          design={design}
        />
      ),
    },
    {
      id: "certifications",
      title: "Certifications",
      visible: Boolean(data.certifications?.length),
      content: (
        <CertificationsBlock
          data={data}
          design={design}
        />
      ),
    },
    {
      id: "achievements",
      title: "Achievements",
      visible: Boolean(data.achievements?.length),
      content: (
        <AchievementsBlock
          data={data}
          design={design}
        />
      ),
    },
    {
      id: "volunteer",
      title: "Volunteer Experience",
      visible: Boolean(data.volunteer?.length),
      content: (
        <VolunteerBlock
          data={data}
          design={design}
        />
      ),
    },
    {
      id: "references",
      title: "References",
      visible: Boolean(data.references?.length),
      content: (
        <ReferencesBlock
          data={data}
          design={design}
        />
      ),
    },
  ];

  const orderedIds =
    data.sectionOrder?.length
      ? data.sectionOrder
      : sections.map((section) => section.id);

  const ordered = orderedIds
    .map((id) =>
      sections.find((section) => section.id === id),
    )
    .filter(
      (
        section,
      ): section is (typeof sections)[number] =>
        Boolean(section?.visible),
    );

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        gap: design.spacing.sectionGap,
        minWidth: 0,
      }}
    >
      {ordered.map((section) => (
        <section key={section.id}>
          <SectionTitle design={design}>
            {section.title}
          </SectionTitle>

          {design.layout.sectionDividers &&
            design.layout.sectionDividerStyle ===
              "line" && (
              <div
                style={{
                  borderTop: `1px solid ${design.colors.divider}`,
                  marginBottom: design.spacing.headingGap,
                }}
              />
            )}

          {design.layout.sectionDividers &&
            design.layout.sectionDividerStyle ===
              "bar" && (
              <div
                style={{
                  width: 34,
                  height: 3,
                  background:
                    design.colors.accent,
                  marginBottom:
                    design.spacing.headingGap,
                }}
              />
            )}

          {section.content}
        </section>
      ))}
    </main>
  );
}

function SimpleHeader({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        marginBottom: design.spacing.contentGap,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: fontFamilyCss(
              design.typography.fontFamily,
            ),
            fontSize: `${design.typography.nameSize}pt`,
            fontWeight:
              design.typography.nameWeight,
            lineHeight: 1,
            color: design.colors.primary,
          }}
        >
          {getFullName(data)}
        </div>

        {(data.jobTitle || data.headline) && (
          <div
            style={{
              marginTop: 6,
              fontSize: `${design.typography.jobTitleSize}pt`,
              color: design.colors.mutedText,
              fontWeight: 600,
            }}
          >
            {data.jobTitle || data.headline}
          </div>
        )}
      </div>

      {design.layout.photo &&
        design.layout.photoPosition !==
          "sidebar" && (
          <Photo
            src={data.profilePhoto}
            design={design}
          />
        )}
    </header>
  );
}

function BlueHeader({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  return (
    <header
      style={{
        marginLeft: -design.spacing.pageMarginLeft,
        marginRight: -design.spacing.pageMarginRight,
        marginTop: -design.spacing.pageMarginTop,
        marginBottom: design.spacing.contentGap,
        minHeight:
          design.layout.headerHeight ?? 100,
        background: design.colors.primary,
        color: "#FFFFFF",
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      {design.layout.photo &&
        design.layout.photoPosition ===
          "header" && (
          <Photo
            src={data.profilePhoto}
            design={design}
          />
        )}

      <div>
        <div
          style={{
            fontSize: `${design.typography.nameSize}pt`,
            fontWeight:
              design.typography.nameWeight,
            lineHeight: 1,
            letterSpacing: 1,
          }}
        >
          {getFullName(data)}
        </div>

        {(data.jobTitle || data.headline) && (
          <div
            style={{
              marginTop: 7,
              fontSize: `${design.typography.jobTitleSize}pt`,
              opacity: 0.82,
            }}
          >
            {data.jobTitle || data.headline}
          </div>
        )}
      </div>
    </header>
  );
}

function ColoredStudentHeader({
  data,
  design,
}: {
  data: ResumeData;
  design: ResumeDesign;
}) {
  return (
    <header
      style={{
        marginLeft: -design.spacing.pageMarginLeft,
        marginRight: -design.spacing.pageMarginRight,
        marginTop: -design.spacing.pageMarginTop,
        marginBottom: design.spacing.contentGap,
        background: design.colors.accent,
        minHeight:
          design.layout.headerHeight ?? 100,
        padding: "18px 28px",
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      {design.layout.photo && (
        <Photo
          src={data.profilePhoto}
          design={design}
        />
      )}

      <div>
        <div
          style={{
            fontSize: `${design.typography.nameSize}pt`,
            fontWeight:
              design.typography.nameWeight,
            color: design.colors.primary,
            lineHeight: 1,
          }}
        >
          {getFullName(data)}
        </div>

        {(data.jobTitle || data.headline) && (
          <div
            style={{
              marginTop: 6,
              color: design.colors.primary,
              fontWeight: 600,
            }}
          >
            {data.jobTitle || data.headline}
          </div>
        )}
      </div>
    </header>
  );
}

export default function LiveResumePreview({
  data,
  template,
  design,
  zoom = 0.72,
  className = "",
  showPageShadow = true,
}: LiveResumePreviewProps) {
  const safeData: ResumeData = data ?? {};

  const mergedDesign = useMemo(
    () => mergeDesign(template, design),
    [template, design],
  );

  const isSidebar =
    mergedDesign.layout.columns === 2 &&
    mergedDesign.layout.sidebar !== "none";

  const pageStyle = getPageStyle(mergedDesign);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        background: "#E5E7EB",
        padding: 30,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "210mm",
          margin: "0 auto",
          transformOrigin: "top center",
          transform: `scale(${zoom})`,
          marginBottom: `-${297 * 3.78 * (1 - zoom)}px`,
        }}
      >
        <div
          data-resume-page="1"
          style={{
            ...pageStyle,
            minHeight: "297mm",
            boxShadow: showPageShadow
              ? "0 12px 40px rgba(15,23,42,.18)"
              : undefined,
          }}
        >
          {mergedDesign.layout.header ===
            "blue" && (
            <BlueHeader
              data={safeData}
              design={mergedDesign}
            />
          )}

          {mergedDesign.layout.header ===
            "colored" && (
            <ColoredStudentHeader
              data={safeData}
              design={mergedDesign}
            />
          )}

          {mergedDesign.layout.header ===
            "simple" && (
            <SimpleHeader
              data={safeData}
              design={mergedDesign}
            />
          )}

          {isSidebar ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  mergedDesign.layout.sidebar ===
                  "right"
                    ? `minmax(0, 1fr) ${
                        mergedDesign.layout.sidebarWidth ??
                        30
                      }%`
                    : `${
                        mergedDesign.layout.sidebarWidth ??
                        30
                      }% minmax(0, 1fr)`,
                gap:
                  mergedDesign.spacing.columnGap,
                minHeight: "calc(297mm - 60px)",
              }}
            >
              {mergedDesign.layout.sidebar ===
                "left" && (
                <Sidebar
                  data={safeData}
                  design={mergedDesign}
                />
              )}

              <MainContent
                data={safeData}
                design={mergedDesign}
              />

              {mergedDesign.layout.sidebar ===
                "right" && (
                <Sidebar
                  data={safeData}
                  design={mergedDesign}
                />
              )}
            </div>
          ) : (
            <MainContent
              data={safeData}
              design={mergedDesign}
            />
          )}
        </div>
      </div>
    </div>
  );
}