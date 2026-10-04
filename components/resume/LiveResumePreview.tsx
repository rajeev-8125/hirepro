"use client";

import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";
import { getCustomDesign } from "@/lib/resume/design-utils";
import { getTemplateDefinition } from "@/lib/resume/template-library";
import type { ResumeTemplateId } from "@/lib/resume/template-types";

function clean(value?: string | null) {
  return value?.trim() || "";
}

function firstNonEmpty(...values: Array<string | undefined | null>) {
  return values.find((value) => Boolean(value?.trim()))?.trim() || "";
}

function SectionTitle({
  title,
  accent,
  custom,
  variant = "line",
}: {
  title: string;
  accent: string;
  custom: ReturnType<typeof getCustomDesign>;
  variant?: "line" | "bar" | "pill";
}) {
  const label = custom.headingCase === "uppercase" ? title.toUpperCase() : title;

  if (variant === "bar") {
    return (
      <div
        style={{
          marginBottom: 9,
          padding: "4px 8px",
          background: accent,
          color: "#FFFFFF",
          fontFamily: custom.headingFont,
          fontSize: Math.max(9, custom.headingSizePx - 2),
          fontWeight: custom.headingWeight,
          letterSpacing: Math.max(0.2, custom.letterSpacingPx),
          textTransform: custom.headingCase,
        }}
      >
        {label}
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <div
        style={{
          display: "inline-flex",
          marginBottom: 9,
          padding: "3px 8px",
          borderRadius: 999,
          background: accent,
          color: "#FFFFFF",
          fontFamily: custom.headingFont,
          fontSize: Math.max(8, custom.headingSizePx - 3),
          fontWeight: 800,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        marginBottom: 8,
      }}
    >
      <span
        style={{
          width: 24,
          height: 2,
          flexShrink: 0,
          background: accent,
        }}
      />
      <h2
        style={{
          margin: 0,
          fontFamily: custom.headingFont,
          fontSize: custom.headingSizePx,
          fontWeight: custom.headingWeight,
          color: custom.primaryColor,
          letterSpacing: custom.letterSpacingPx,
          textTransform: custom.headingCase,
          lineHeight: 1.1,
        }}
      >
        {label}
      </h2>
    </div>
  );
}

function Section({
  title,
  children,
  accent,
  custom,
  variant = "line",
  gap,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
  custom: ReturnType<typeof getCustomDesign>;
  variant?: "line" | "bar" | "pill";
  gap?: number;
}) {
  return (
    <section style={{ marginTop: gap ?? custom.sectionGapPx }}>
      <SectionTitle
        title={title}
        accent={accent}
        custom={custom}
        variant={variant}
      />
      {children}
    </section>
  );
}

function BulletList({
  items,
  custom,
  color,
}: {
  items: string[];
  custom: ReturnType<typeof getCustomDesign>;
  color?: string;
}) {
  const values = items.filter(Boolean);
  if (!values.length) return null;

  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: 15,
        display: "grid",
        gap: Math.max(2, custom.itemGapPx / 2),
        color: color ?? custom.textColor,
      }}
    >
      {values.map((item, index) => (
        <li key={`${item}-${index}`} style={{ paddingLeft: 1 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ContactRow({
  resume,
  custom,
  color,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  color?: string;
}) {
  const items = [
    resume.personal.email,
    resume.personal.phone,
    resume.personal.location,
    resume.personal.linkedin,
    resume.personal.github,
    resume.personal.website,
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "3px 10px",
        marginTop: 7,
        color: color ?? custom.mutedColor,
        fontSize: 7.5,
        lineHeight: 1.35,
      }}
    >
      {items.map((item, index) => (
        <span key={`${item}-${index}`}>{item}</span>
      ))}
    </div>
  );
}

function Photo({
  src,
  size = 70,
  radius = "50%",
  border,
}: {
  src?: string | null;
  size?: number;
  radius?: number | string;
  border?: string;
}) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt="Profile"
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: radius,
        display: "block",
        border,
      }}
    />
  );
}

function Skills({
  resume,
  custom,
  color,
  stars = false,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  color?: string;
  stars?: boolean;
}) {
  const skills = resume.skills.flatMap((group) => group.items).filter(Boolean);
  if (!skills.length) return null;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {skills.map((skill, index) => (
        <div
          key={`${skill}-${index}`}
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: stars ? "space-between" : "flex-start",
            gap: 8,
            fontSize: 8.5,
            lineHeight: 1.35,
            color: color ?? custom.textColor,
          }}
        >
          <span>{skill}</span>
          {stars && (
            <span style={{ color: custom.primaryColor, letterSpacing: 1 }}>
              ★★★★★
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function EducationList({
  resume,
  custom,
  color,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  color?: string;
}) {
  if (!resume.education.length) return null;

  return (
    <div style={{ display: "grid", gap: custom.itemGapPx + 2 }}>
      {resume.education.map((item, index) => (
        <article key={index}>
          <div
            style={{
              fontFamily: custom.bodyFont,
              fontSize: 9,
              lineHeight: 1.35,
              fontWeight: 800,
              color: color ?? custom.textColor,
            }}
          >
            {firstNonEmpty(
              [item.degree, item.field].filter(Boolean).join(" — "),
              "Education",
            )}
          </div>
          {item.institution && (
            <div
              style={{
                marginTop: 2,
                fontSize: 8.5,
                fontWeight: 700,
                color: custom.primaryColor,
              }}
            >
              {item.institution}
            </div>
          )}
          {(item.startDate || item.endDate) && (
            <div
              style={{
                marginTop: 2,
                fontSize: 7.5,
                color: custom.mutedColor,
              }}
            >
              {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
            </div>
          )}
          {item.details.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <BulletList items={item.details} custom={custom} color={color} />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function ExperienceList({
  resume,
  custom,
  accent,
  compact = false,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  accent: string;
  compact?: boolean;
}) {
  if (!resume.experience.length) return null;

  return (
    <div
      style={{
        display: "grid",
        gap: compact ? Math.max(7, custom.itemGapPx) : custom.itemGapPx + 4,
      }}
    >
      {resume.experience.map((item, index) => (
        <article key={index}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: custom.bodyFont,
                  fontSize: compact ? 9 : 10,
                  lineHeight: 1.3,
                  fontWeight: 800,
                  color: custom.textColor,
                }}
              >
                {item.role || "Role"}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: compact ? 8 : 8.5,
                  fontWeight: 700,
                  color: accent,
                }}
              >
                {item.company}
                {item.location ? ` · ${item.location}` : ""}
              </div>
            </div>
            {(item.startDate || item.endDate) && (
              <div
                style={{
                  flexShrink: 0,
                  fontSize: 7,
                  color: custom.mutedColor,
                  whiteSpace: "nowrap",
                }}
              >
                {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
              </div>
            )}
          </div>

          {item.responsibilities.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <BulletList
                items={item.responsibilities}
                custom={custom}
              />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function ProjectsList({
  resume,
  custom,
  accent,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  accent: string;
}) {
  if (!resume.projects.length) return null;

  return (
    <div style={{ display: "grid", gap: custom.itemGapPx + 2 }}>
      {resume.projects.map((project, index) => (
        <article key={index}>
          <div
            style={{
              fontSize: 9,
              lineHeight: 1.3,
              fontWeight: 800,
              color: custom.textColor,
            }}
          >
            {project.name || "Project"}
          </div>
          {project.description && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 8,
                lineHeight: custom.lineHeight,
                color: custom.textColor,
              }}
            >
              {project.description}
            </p>
          )}
          {project.technologies.length > 0 && (
            <div
              style={{
                marginTop: 3,
                fontSize: 7.2,
                lineHeight: 1.35,
                color: accent,
                fontWeight: 700,
              }}
            >
              {project.technologies.join(" · ")}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function CertificationsList({
  resume,
  custom,
  color,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  color?: string;
}) {
  if (!resume.certifications.length) return null;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {resume.certifications.map((item, index) => (
        <div
          key={index}
          style={{
            fontSize: 7.8,
            lineHeight: 1.4,
            color: color ?? custom.textColor,
          }}
        >
          <strong>{item.name}</strong>
          {item.issuer ? ` · ${item.issuer}` : ""}
          {item.date ? ` · ${item.date}` : ""}
        </div>
      ))}
    </div>
  );
}

function LanguagesList({
  resume,
  custom,
  color,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  color?: string;
}) {
  if (!resume.languages.length) return null;

  return (
    <div style={{ display: "grid", gap: 4 }}>
      {resume.languages.filter(Boolean).map((language, index) => (
        <div
          key={`${language}-${index}`}
          style={{
            fontSize: 8,
            lineHeight: 1.35,
            color: color ?? custom.textColor,
          }}
        >
          {language}
        </div>
      ))}
    </div>
  );
}

function MainContent({
  resume,
  custom,
  accent,
  variant = "line",
  compact = false,
  includeSkills = true,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  accent: string;
  variant?: "line" | "bar" | "pill";
  compact?: boolean;
  includeSkills?: boolean;
}) {
  const bodyStyle: React.CSSProperties = {
    margin: 0,
    color: custom.textColor,
    fontFamily: custom.bodyFont,
    fontSize: custom.bodySizePx,
    lineHeight: custom.lineHeight,
    letterSpacing: custom.letterSpacingPx,
    wordSpacing: custom.wordSpacingPx,
  };

  return (
    <>
      {resume.professionalSummary && (
        <Section
          title="Professional Summary"
          accent={accent}
          custom={custom}
          variant={variant}
          gap={compact ? 11 : undefined}
        >
          <p style={bodyStyle}>{resume.professionalSummary}</p>
        </Section>
      )}

      {includeSkills && resume.skills.length > 0 && (
        <Section title="Skills" accent={accent} custom={custom} variant={variant}>
          <Skills resume={resume} custom={custom} color={custom.textColor} />
        </Section>
      )}

      {resume.experience.length > 0 && (
        <Section title="Experience" accent={accent} custom={custom} variant={variant}>
          <ExperienceList
            resume={resume}
            custom={custom}
            accent={accent}
            compact={compact}
          />
        </Section>
      )}

      {resume.projects.length > 0 && (
        <Section title="Projects" accent={accent} custom={custom} variant={variant}>
          <ProjectsList resume={resume} custom={custom} accent={accent} />
        </Section>
      )}

      {resume.education.length > 0 && (
        <Section title="Education" accent={accent} custom={custom} variant={variant}>
          <EducationList resume={resume} custom={custom} />
        </Section>
      )}

      {resume.certifications.length > 0 && (
        <Section
          title="Certifications"
          accent={accent}
          custom={custom}
          variant={variant}
        >
          <CertificationsList resume={resume} custom={custom} />
        </Section>
      )}

      {resume.achievements.length > 0 && (
        <Section
          title="Achievements"
          accent={accent}
          custom={custom}
          variant={variant}
        >
          <BulletList items={resume.achievements} custom={custom} />
        </Section>
      )}

      {resume.languages.length > 0 && (
        <Section title="Languages" accent={accent} custom={custom} variant={variant}>
          <LanguagesList resume={resume} custom={custom} />
        </Section>
      )}
    </>
  );
}

function TemplateHeader({
  resume,
  custom,
  accent,
  profilePhoto,
  photoSide = "right",
  dark = false,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  accent: string;
  profilePhoto?: string | null;
  photoSide?: "left" | "right";
  dark?: boolean;
}) {
  const name = clean(resume.personal.name) || "YOUR NAME";
  const role = firstNonEmpty(
    resume.experience[0]?.role,
    "Professional",
  );
  const text = dark ? "#FFFFFF" : custom.textColor;
  const muted = dark ? "#CBD5E1" : custom.mutedColor;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div
        style={{
          order: photoSide === "left" ? 2 : 1,
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            color: dark ? accent : accent,
            fontFamily: custom.headingFont,
            fontSize: 25,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: -0.3,
            textTransform: dark ? "none" : custom.headingCase,
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 6,
            color: text,
            fontFamily: custom.bodyFont,
            fontSize: 10.5,
            lineHeight: 1.3,
            fontWeight: 700,
          }}
        >
          {role}
        </div>
        <ContactRow resume={resume} custom={custom} color={muted} />
      </div>

      {profilePhoto && (
        <div style={{ order: photoSide === "left" ? 1 : 2 }}>
          <Photo
            src={profilePhoto}
            size={76}
            radius={"50%"}
            border={`2px solid ${accent}`}
          />
        </div>
      )}
    </header>
  );
}

function NavySidebar({
  resume,
  custom,
  accent,
  profilePhoto,
  width = 226,
  gold = false,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  accent: string;
  profilePhoto?: string | null;
  width?: number;
  gold?: boolean;
}) {
  const fg = "#FFFFFF";
  const muted = "#CBD5E1";
  const sidebarAccent = gold ? "#D4A017" : accent;

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        background: "#0F172A",
        color: fg,
        padding: "28px 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {profilePhoto && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Photo
              src={profilePhoto}
              size={74}
              radius={"50%"}
              border={`3px solid ${sidebarAccent}`}
            />
          </div>
        )}
        <div
          style={{
            color: sidebarAccent,
            fontFamily: custom.headingFont,
            fontSize: 19,
            lineHeight: 1.05,
            fontWeight: 800,
          }}
        >
          {clean(resume.personal.name) || "YOUR NAME"}
        </div>
        <div
          style={{
            marginTop: 6,
            color: muted,
            fontSize: 9,
            fontWeight: 700,
          }}
        >
          {firstNonEmpty(resume.experience[0]?.role, "Professional")}
        </div>
      </div>

      <div style={{ marginTop: 21 }}>
        <SidebarHeading title="Contact" color={sidebarAccent} />
        <div style={{ display: "grid", gap: 6, fontSize: 7.7, lineHeight: 1.4 }}>
          {[
            resume.personal.email,
            resume.personal.phone,
            resume.personal.location,
            resume.personal.linkedin,
            resume.personal.github,
            resume.personal.website,
          ]
            .filter(Boolean)
            .map((item, index) => (
              <div key={`${item}-${index}`} style={{ color: muted }}>
                {item}
              </div>
            ))}
        </div>
      </div>

      {resume.skills.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SidebarHeading title="Skills" color={sidebarAccent} />
          <Skills
            resume={resume}
            custom={custom}
            color={fg}
            stars={gold}
          />
        </div>
      )}

      {resume.languages.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SidebarHeading title="Languages" color={sidebarAccent} />
          <LanguagesList resume={resume} custom={custom} color={muted} />
        </div>
      )}

      {resume.education.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SidebarHeading title="Education" color={sidebarAccent} />
          <EducationList resume={resume} custom={custom} color={muted} />
        </div>
      )}

      {resume.certifications.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SidebarHeading title="Certifications" color={sidebarAccent} />
          <CertificationsList resume={resume} custom={custom} color={muted} />
        </div>
      )}
    </aside>
  );
}

function SidebarHeading({
  title,
  color,
}: {
  title: string;
  color: string;
}) {
  return (
    <div
      style={{
        marginBottom: 8,
        color,
        fontSize: 9,
        lineHeight: 1.1,
        fontWeight: 900,
        letterSpacing: 1.1,
        textTransform: "uppercase",
      }}
    >
      {title}
    </div>
  );
}

function Blue01({
  resume,
  custom,
  profilePhoto,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  profilePhoto?: string | null;
}) {
  const accent = custom.primaryColor || "#2F9DDA";

  return (
    <div style={{ minHeight: 1123, background: "#FFFFFF" }}>
      <div style={{ height: 7, background: accent }} />
      <div style={{ padding: "24px 35px 30px" }}>
        <TemplateHeader
          resume={resume}
          custom={custom}
          accent={accent}
          profilePhoto={profilePhoto}
        />

        <div
          style={{
            marginTop: 17,
            display: "grid",
            gridTemplateColumns: "1.45fr 0.75fr",
            gap: 25,
            alignItems: "start",
          }}
        >
          <div>
            <MainContent
              resume={resume}
              custom={custom}
              accent={accent}
              compact
              includeSkills={false}
            />
          </div>
          <aside
            style={{
              borderLeft: `1px solid ${custom.borderColor}`,
              paddingLeft: 18,
            }}
          >
            {resume.skills.length > 0 && (
              <SectionTitle
                title="Skills"
                accent={accent}
                custom={custom}
              />
            )}
            <Skills resume={resume} custom={custom} />
            {resume.languages.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <SectionTitle
                  title="Language"
                  accent={accent}
                  custom={custom}
                />
                <LanguagesList resume={resume} custom={custom} />
              </div>
            )}
            {resume.certifications.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <SectionTitle
                  title="References"
                  accent={accent}
                  custom={custom}
                />
                <CertificationsList resume={resume} custom={custom} />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function Blue02({
  resume,
  custom,
  profilePhoto,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  profilePhoto?: string | null;
}) {
  const accent = custom.primaryColor || "#D4A017";

  return (
    <div style={{ display: "flex", minHeight: 1123, background: "#FFFFFF" }}>
      <NavySidebar
        resume={resume}
        custom={custom}
        accent={accent}
        profilePhoto={profilePhoto}
        gold
      />
      <main style={{ flex: 1, padding: "34px 29px 35px" }}>
        <SectionTitle title="About Me" accent={accent} custom={custom} />
        <p
          style={{
            margin: 0,
            fontSize: 8.5,
            lineHeight: custom.lineHeight,
            color: custom.textColor,
          }}
        >
          {resume.professionalSummary ||
            "Add a concise professional summary describing your background, strengths and career direction."}
        </p>

        <MainContent
          resume={{ ...resume, professionalSummary: "" }}
          custom={custom}
          accent={accent}
          compact
          includeSkills={false}
        />
      </main>
    </div>
  );
}

function Blue03({
  resume,
  custom,
  profilePhoto,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  profilePhoto?: string | null;
}) {
  const accent = custom.primaryColor || "#2F5B9E";

  return (
    <div style={{ display: "flex", minHeight: 1123, background: "#FFFFFF" }}>
      <aside
        style={{
          width: 218,
          flexShrink: 0,
          padding: "27px 18px",
          background: "#355B8F",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 11 }}>
          {profilePhoto ? (
            <Photo
              src={profilePhoto}
              size={68}
              radius="50%"
              border="3px solid #FFFFFF"
            />
          ) : (
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                border: "3px solid #FFFFFF",
                background: "rgba(255,255,255,.15)",
              }}
            />
          )}
        </div>
        <div style={{ textAlign: "center", fontSize: 16, fontWeight: 900 }}>
          {clean(resume.personal.name) || "YOUR NAME"}
        </div>
        <div style={{ textAlign: "center", marginTop: 5, fontSize: 8.5, color: "#DCE8F7" }}>
          {firstNonEmpty(resume.experience[0]?.role, "Marketing Manager")}
        </div>
        <div style={{ marginTop: 20 }}>
          <SidebarHeading title="Contact Me" color="#FFFFFF" />
          <div style={{ display: "grid", gap: 6, fontSize: 7.5, color: "#DCE8F7" }}>
            {[resume.personal.email, resume.personal.phone, resume.personal.location]
              .filter(Boolean)
              .map((item, index) => <div key={index}>{item}</div>)}
          </div>
        </div>
        {resume.skills.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <SidebarHeading title="Skills" color="#FFFFFF" />
            <Skills resume={resume} custom={custom} color="#FFFFFF" />
          </div>
        )}
        {resume.languages.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <SidebarHeading title="Language" color="#FFFFFF" />
            <LanguagesList resume={resume} custom={custom} color="#DCE8F7" />
          </div>
        )}
      </aside>

      <main style={{ flex: 1, padding: "27px 27px 35px" }}>
        <MainContent
          resume={resume}
          custom={custom}
          accent={accent}
          compact
          includeSkills={false}
        />
      </main>
    </div>
  );
}

function Blue04({
  resume,
  custom,
  profilePhoto,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  profilePhoto?: string | null;
}) {
  const accent = custom.primaryColor || "#315A9B";

  return (
    <div style={{ display: "flex", minHeight: 1123, background: "#FFFFFF" }}>
      <aside
        style={{
          width: 210,
          flexShrink: 0,
          background: "#315A9B",
          color: "#FFFFFF",
          padding: "24px 18px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 11 }}>
          {profilePhoto ? (
            <Photo src={profilePhoto} size={70} radius="50%" border="4px solid #8EB7E8" />
          ) : (
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                border: "4px solid #8EB7E8",
                background: "rgba(255,255,255,.12)",
              }}
            />
          )}
        </div>
        <div style={{ textAlign: "center", fontSize: 16, fontWeight: 900 }}>
          {clean(resume.personal.name) || "YOUR NAME"}
        </div>
        <div style={{ textAlign: "center", marginTop: 5, fontSize: 8.5, color: "#DCE8F7" }}>
          {firstNonEmpty(resume.experience[0]?.role, "Professional")}
        </div>
        <div style={{ marginTop: 20 }}>
          <SidebarHeading title="Contact" color="#FFFFFF" />
          <div style={{ display: "grid", gap: 6, fontSize: 7.5, color: "#DCE8F7" }}>
            {[resume.personal.email, resume.personal.phone, resume.personal.location]
              .filter(Boolean)
              .map((item, index) => <div key={index}>{item}</div>)}
          </div>
        </div>
        {resume.skills.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <SidebarHeading title="Skills Summary" color="#FFFFFF" />
            <Skills resume={resume} custom={custom} color="#FFFFFF" />
          </div>
        )}
      </aside>
      <main style={{ flex: 1, padding: "30px 28px 34px" }}>
        <MainContent
          resume={resume}
          custom={custom}
          accent={accent}
          compact
          includeSkills={false}
        />
      </main>
    </div>
  );
}

function StudentTemplate({
  resume,
  custom,
  profilePhoto,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
  profilePhoto?: string | null;
}) {
  const teal = custom.primaryColor || "#6E9E9C";
  const peach = "#E8C7B7";

  return (
    <div style={{ display: "flex", minHeight: 1123, background: "#FFFFFF" }}>
      <aside
        style={{
          width: 230,
          flexShrink: 0,
          background: teal,
          color: "#FFFFFF",
          padding: "30px 19px",
        }}
      >
        {profilePhoto && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Photo src={profilePhoto} size={88} radius="50%" border="4px solid #FFFFFF" />
          </div>
        )}
        <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.05 }}>
          {clean(resume.personal.name) || "YOUR NAME"}
        </div>
        <div style={{ marginTop: 6, fontSize: 9, color: "#EAF6F5" }}>
          {firstNonEmpty(resume.experience[0]?.role, "Student")}
        </div>
        {resume.professionalSummary && (
          <div style={{ marginTop: 23 }}>
            <SidebarHeading title="Profile" color="#FFFFFF" />
            <p style={{ margin: 0, fontSize: 7.8, lineHeight: 1.55, color: "#F0FAF9" }}>
              {resume.professionalSummary}
            </p>
          </div>
        )}
        <div style={{ marginTop: 23 }}>
          <SidebarHeading title="Contact Me" color="#FFFFFF" />
          <div style={{ display: "grid", gap: 6, fontSize: 7.5, color: "#F0FAF9" }}>
            {[resume.personal.email, resume.personal.phone, resume.personal.location]
              .filter(Boolean)
              .map((item, index) => <div key={index}>{item}</div>)}
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: peach, padding: "31px 28px 25px" }}>
          <div style={{ fontSize: 19, fontWeight: 900, color: "#374151" }}>
            {clean(resume.personal.name) || "YOUR NAME"}
          </div>
          <div style={{ marginTop: 5, fontSize: 10, fontWeight: 700, color: "#475569" }}>
            {firstNonEmpty(resume.experience[0]?.role, "Student")}
          </div>
        </div>
        <div style={{ padding: "23px 28px 34px" }}>
          <MainContent
            resume={{ ...resume, professionalSummary: "" }}
            custom={custom}
            accent={teal}
            compact
            includeSkills={true}
          />
        </div>
      </main>
    </div>
  );
}

function InfographicTemplate({
  resume,
  custom,
}: {
  resume: ResumeData;
  custom: ReturnType<typeof getCustomDesign>;
}) {
  const accent = custom.primaryColor || "#3F4852";

  return (
    <div style={{ minHeight: 1123, background: "#FFFFFF", padding: "25px 34px 32px" }}>
      <header style={{ paddingBottom: 13, borderBottom: "1px solid #B8C0C8" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#20252B" }}>
          {clean(resume.personal.name) || "YOUR NAME"}
        </div>
        <div style={{ marginTop: 3, fontSize: 9, fontWeight: 800, color: accent }}>
          {firstNonEmpty(resume.experience[0]?.role, "Professional")}
        </div>
        <ContactRow resume={resume} custom={custom} color="#59636E" />
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 14,
        }}
      >
        <div>
          <MainContent
            resume={resume}
            custom={custom}
            accent={accent}
            variant="bar"
            compact
            includeSkills={false}
          />
        </div>
        <aside>
          {resume.skills.length > 0 && (
            <Section title="Technical Skills" accent={accent} custom={custom} variant="bar" gap={11}>
              <Skills resume={resume} custom={custom} />
            </Section>
          )}
          {resume.languages.length > 0 && (
            <Section title="Languages" accent={accent} custom={custom} variant="bar" gap={13}>
              <LanguagesList resume={resume} custom={custom} />
            </Section>
          )}
          {resume.certifications.length > 0 && (
            <Section title="Additional Information" accent={accent} custom={custom} variant="bar" gap={13}>
              <CertificationsList resume={resume} custom={custom} />
            </Section>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function LiveResumePreview({
  resume,
  design,
  template,
  profilePhoto,
}: {
  resume: ResumeData;
  design: ResumeDesign;
  template: ResumeTemplateId;
  profilePhoto?: string | null;
}) {
  const definition = getTemplateDefinition(template);
  const custom = getCustomDesign(design);

  const effectiveCustom = {
    ...custom,
    primaryColor: custom.primaryColor || definition.accent,
    secondaryColor: custom.secondaryColor || definition.accent,
  };

  let content: React.ReactNode;

  switch (template) {
    case "blue-01":
      content = (
        <Blue01
          resume={resume}
          custom={effectiveCustom}
          profilePhoto={profilePhoto}
        />
      );
      break;

    case "blue-02":
      content = (
        <Blue02
          resume={resume}
          custom={effectiveCustom}
          profilePhoto={profilePhoto}
        />
      );
      break;

    case "blue-03":
      content = (
        <Blue03
          resume={resume}
          custom={effectiveCustom}
          profilePhoto={profilePhoto}
        />
      );
      break;

    case "blue-04":
      content = (
        <Blue04
          resume={resume}
          custom={effectiveCustom}
          profilePhoto={profilePhoto}
        />
      );
      break;

    case "student":
      content = (
        <StudentTemplate
          resume={resume}
          custom={effectiveCustom}
          profilePhoto={profilePhoto}
        />
      );
      break;

    case "infographic-01":
    case "infographic-02":
      content = (
        <InfographicTemplate
          resume={resume}
          custom={effectiveCustom}
        />
      );
      break;

    default:
      content = (
        <Blue02
          resume={resume}
          custom={effectiveCustom}
          profilePhoto={profilePhoto}
        />
      );
  }

  return (
    <div
      className="mx-auto overflow-hidden bg-white shadow-2xl"
      data-resume-template={template}
      style={{
        width: 794,
        minHeight: 1123,
        background: effectiveCustom.backgroundColor,
        color: effectiveCustom.textColor,
        fontFamily: effectiveCustom.bodyFont,
        fontSize: effectiveCustom.bodySizePx,
        lineHeight: effectiveCustom.lineHeight,
      }}
    >
      {content}
    </div>
  );
}
