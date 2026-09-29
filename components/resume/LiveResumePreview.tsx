"use client";

import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";
import { getCustomDesign } from "@/lib/resume/design-utils";
import { getTemplateDefinition } from "@/lib/resume/template-library";
import type { ResumeTemplateId } from "@/lib/resume/template-types";

function clean(value?: string | null) {
  return value?.trim() || "";
}

function Section({
  title,
  children,
  accent,
  custom,
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
  custom: ReturnType<typeof getCustomDesign>;
  compact?: boolean;
}) {
  return (
    <section style={{ marginTop: compact ? 12 : custom.sectionGapPx }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 7,
        }}
      >
        <span
          style={{
            width: 22,
            height: 2,
            background: accent,
            display: "block",
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            margin: 0,
            color: accent,
            fontSize: custom.headingSizePx,
            fontWeight: custom.headingWeight,
            letterSpacing: custom.letterSpacingPx,
            textTransform: custom.headingCase,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function BulletList({
  items,
  custom,
}: {
  items: string[];
  custom: ReturnType<typeof getCustomDesign>;
}) {
  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: 17,
        display: "grid",
        gap: custom.itemGapPx / 2,
      }}
    >
      {items.filter(Boolean).map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
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
  const accent = custom.primaryColor || definition.accent;
  const isStudent = template === "student";
  const isInfographic = template.startsWith("infographic");
  const isSidebar =
    definition.layout === "sidebar" ||
    template === "blue-03" ||
    template === "blue-04";

  const textStyle: React.CSSProperties = {
    margin: 0,
    color: custom.textColor,
    fontFamily: custom.bodyFont,
    fontSize: custom.bodySizePx,
    lineHeight: custom.lineHeight,
    letterSpacing: custom.letterSpacingPx,
    wordSpacing: custom.wordSpacingPx,
  };

  const heading =
    clean(resume.experience[0]?.role) ||
    clean(resume.education[0]?.degree) ||
    "Professional";

  const contact = [
    resume.personal.email,
    resume.personal.phone,
    resume.personal.location,
    resume.personal.linkedin,
    resume.personal.github,
    resume.personal.website,
  ].filter(Boolean);

  const sidebar = (
    <div
      style={{
        background: isInfographic ? "#111111" : "#F1F5F9",
        color: isInfographic ? "#FFFFFF" : custom.textColor,
        padding: 22,
        minHeight: "100%",
      }}
    >
      {profilePhoto && !isStudent && (
        <img
          src={profilePhoto}
          alt="Profile"
          style={{
            width: 76,
            height: 76,
            objectFit: "cover",
            borderRadius: isInfographic ? 8 : "50%",
            marginBottom: 15,
            border: `3px solid ${isInfographic ? "#FFFFFF" : accent}`,
          }}
        />
      )}

      {resume.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              margin: "0 0 9px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: isInfographic ? "#FFFFFF" : accent,
            }}
          >
            Skills
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            {resume.skills.flatMap((group) => group.items).filter(Boolean).map((skill, index) => (
              <div
                key={index}
                style={{
                  fontSize: 9,
                  lineHeight: 1.35,
                  color: isInfographic ? "#FFFFFF" : custom.textColor,
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.languages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              margin: "0 0 9px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: isInfographic ? "#FFFFFF" : accent,
            }}
          >
            Languages
          </h3>
          {resume.languages.filter(Boolean).map((language, index) => (
            <div key={index} style={{ fontSize: 9, marginBottom: 5 }}>
              {language}
            </div>
          ))}
        </div>
      )}

      {resume.certifications.length > 0 && (
        <div>
          <h3
            style={{
              margin: "0 0 9px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: isInfographic ? "#FFFFFF" : accent,
            }}
          >
            Certifications
          </h3>
          {resume.certifications.map((item, index) => (
            <div key={index} style={{ fontSize: 8.5, lineHeight: 1.4, marginBottom: 7 }}>
              <strong>{item.name}</strong>
              {item.issuer ? ` · ${item.issuer}` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const main = (
    <div style={{ padding: custom.pageMarginPx }}>
      <header
        style={{
          paddingBottom: 14,
          borderBottom: `1px solid ${custom.borderColor}`,
          marginBottom: 4,
          textAlign: definition.layout === "single" && template !== "blue-03" ? "left" : "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: accent,
                fontFamily: custom.headingFont,
                fontSize: 25,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: -0.4,
                textTransform: isInfographic ? "uppercase" : "none",
              }}
            >
              {clean(resume.personal.name) || "YOUR NAME"}
            </div>
            <div
              style={{
                marginTop: 6,
                color: custom.secondaryColor,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.4,
              }}
            >
              {heading}
            </div>
            {contact.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "3px 8px",
                  marginTop: 9,
                  color: custom.mutedColor,
                  fontSize: 7.8,
                }}
              >
                {contact.map((item, index) => (
                  <span key={index}>{item}</span>
                ))}
              </div>
            )}
          </div>

          {profilePhoto && definition.photo && (
            <img
              src={profilePhoto}
              alt="Profile"
              style={{
                width: 76,
                height: 76,
                objectFit: "cover",
                borderRadius:
                  template === "blue-04" || isStudent ? 6 : "50%",
                border: `2px solid ${accent}`,
              }}
            />
          )}
        </div>
      </header>

      {resume.professionalSummary && (
        <Section title={isStudent ? "Profile" : "Summary"} accent={accent} custom={custom} compact={isStudent}>
          <p style={textStyle}>{resume.professionalSummary}</p>
        </Section>
      )}

      {resume.experience.length > 0 && (
        <Section title="Experience" accent={accent} custom={custom}>
          <div style={{ display: "grid", gap: custom.itemGapPx + 2 }}>
            {resume.experience.map((item, index) => (
              <article key={index}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "baseline",
                  }}
                >
                  <div>
                    <div style={{ ...textStyle, fontWeight: 800, color: custom.textColor }}>
                      {item.role || "Role"}
                    </div>
                    <div style={{ ...textStyle, color: accent, fontWeight: 700 }}>
                      {item.company}
                      {item.location ? ` · ${item.location}` : ""}
                    </div>
                  </div>
                  <div style={{ ...textStyle, fontSize: 8, color: custom.mutedColor, whiteSpace: "nowrap" }}>
                    {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
                  </div>
                </div>
                {item.responsibilities.length > 0 && (
                  <div style={{ marginTop: 5 }}>
                    <BulletList items={item.responsibilities} custom={custom} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}

      {resume.projects.length > 0 && (
        <Section title="Projects" accent={accent} custom={custom}>
          <div style={{ display: "grid", gap: custom.itemGapPx + 2 }}>
            {resume.projects.map((project, index) => (
              <article key={index}>
                <div style={{ ...textStyle, fontWeight: 800 }}>{project.name}</div>
                <p style={{ ...textStyle, marginTop: 3 }}>{project.description}</p>
                {project.technologies.length > 0 && (
                  <div style={{ marginTop: 4, ...textStyle, fontSize: 8.5, color: custom.mutedColor }}>
                    {project.technologies.join(" · ")}
                  </div>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}

      {resume.education.length > 0 && (
        <Section title="Education" accent={accent} custom={custom}>
          <div style={{ display: "grid", gap: custom.itemGapPx }}>
            {resume.education.map((item, index) => (
              <article key={index}>
                <div style={{ ...textStyle, fontWeight: 800 }}>
                  {[item.degree, item.field].filter(Boolean).join(" — ") || "Education"}
                </div>
                <div style={{ ...textStyle, color: accent, fontWeight: 700 }}>{item.institution}</div>
                <div style={{ ...textStyle, color: custom.mutedColor, fontSize: 8.5 }}>
                  {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
                </div>
                {item.details.length > 0 && <BulletList items={item.details} custom={custom} />}
              </article>
            ))}
          </div>
        </Section>
      )}

      {resume.achievements.length > 0 && (
        <Section title="Key Achievements" accent={accent} custom={custom}>
          <BulletList items={resume.achievements} custom={custom} />
        </Section>
      )}
    </div>
  );

  return (
    <div
      className="mx-auto overflow-hidden shadow-2xl"
      style={{
        width: "794px",
        minHeight: "1123px",
        background: custom.backgroundColor,
        color: custom.textColor,
        fontFamily: custom.bodyFont,
        fontSize: custom.bodySizePx,
        lineHeight: custom.lineHeight,
      }}
    >
      {isSidebar ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "185px 1fr",
            minHeight: "1123px",
          }}
        >
          {sidebar}
          {main}
        </div>
      ) : (
        main
      )}
    </div>
  );
}
