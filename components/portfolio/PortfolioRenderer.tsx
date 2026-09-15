"use client";

import type { PortfolioData } from "@/lib/ai/portfolio-schema";
import type { PortfolioDesign } from "@/lib/ai/portfolio-design-schema";

type PortfolioRendererProps = {
  data: PortfolioData;
  design?: PortfolioDesign | null;
  profileImageUrl?: string | null;
  resumeUrl?: string | null;
};

export default function PortfolioRenderer({
  data,
  design,
  profileImageUrl,
  resumeUrl,
}: PortfolioRendererProps) {
  /*
   * Safe defaults.
   * These are only used if an older portfolio does not have
   * an AI-generated design configuration.
   */
  const colors = design?.colors ?? {
    background: "#020617",
    surface: "#0f172a",
    text: "#ffffff",
    mutedText: "#94a3b8",
    primary: "#2563eb",
    secondary: "#1d4ed8",
  };

  const typography = design?.typography ?? {
    heading: "Inter",
    body: "Inter",
  };

  const hero = design?.hero ?? {
    layout: "left" as const,
    photoPosition: "right" as const,
    photoShape: "circle" as const,
    photoSize: "medium" as const,
  };

  const navigation = design?.navigation ?? {
    style: "simple" as const,
  };

  const cards = design?.cards ?? {
    style: "soft" as const,
    radius: "medium" as const,
    shadow: "soft" as const,
  };

  const animations = design?.animations ?? {
    enabled: true,
    style: "subtle" as const,
  };

  const resumeButton = design?.resumeButton ?? {
    enabled: true,
    label: "Download Resume",
    style: "filled" as const,
  };

  const sections =
    design?.sections ?? [
      "about",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "achievements",
      "languages",
      "contact",
    ];

  const name =
    data.personal.name?.trim() || "Your Name";

  const headline =
    data.personal.headline?.trim() ||
    "Professional Portfolio";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  function radiusClass() {
    switch (cards.radius) {
      case "none":
        return "rounded-none";
      case "small":
        return "rounded-lg";
      case "large":
        return "rounded-3xl";
      default:
        return "rounded-2xl";
    }
  }

  function shadowClass() {
    switch (cards.shadow) {
      case "none":
        return "";
      case "medium":
        return "shadow-xl";
      default:
        return "shadow-md";
    }
  }

  function photoClass() {
    if (hero.photoShape === "circle") {
      return "rounded-full";
    }

    if (hero.photoShape === "square") {
      return "rounded-none";
    }

    if (hero.photoShape === "rounded") {
      return "rounded-3xl";
    }

    return "rounded-full";
  }

  function photoSizeClass() {
    switch (hero.photoSize) {
      case "small":
        return "h-32 w-32 md:h-40 md:w-40";

      case "large":
        return "h-56 w-56 md:h-72 md:w-72";

      default:
        return "h-44 w-44 md:h-56 md:w-56";
    }
  }

  function animationClass() {
    if (!animations.enabled) {
      return "";
    }

    if (animations.style === "dynamic") {
      return "transition-all duration-500 hover:-translate-y-2";
    }

    if (animations.style === "smooth") {
      return "transition-all duration-500 hover:-translate-y-1";
    }

    return "transition-all duration-300";
  }

  function cardStyle(): React.CSSProperties {
    if (cards.style === "glass") {
      return {
        backgroundColor: `${colors.surface}cc`,
        borderColor: `${colors.primary}33`,
        backdropFilter: "blur(16px)",
      };
    }

    if (cards.style === "bordered") {
      return {
        backgroundColor: colors.surface,
        borderColor: `${colors.primary}55`,
      };
    }

    if (cards.style === "elevated") {
      return {
        backgroundColor: colors.surface,
      };
    }

    if (cards.style === "flat") {
      return {
        backgroundColor: colors.surface,
        borderColor: "transparent",
      };
    }

    return {
      backgroundColor: colors.surface,
      borderColor: `${colors.primary}22`,
    };
  }

  const heroPhoto =
    profileImageUrl && hero.photoShape !== "none";

  const heroContainerClass =
    hero.layout === "center"
      ? "flex flex-col items-center text-center"
      : hero.layout === "right"
        ? "flex flex-col items-end text-right"
        : hero.layout === "split"
          ? "grid grid-cols-1 items-center gap-12 md:grid-cols-2"
          : "flex flex-col items-start text-left";

  const photoOrder =
    hero.photoPosition === "left"
      ? "md:order-first"
      : hero.photoPosition === "right"
        ? "md:order-last"
        : "";

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: typography.body,
      }}
    >
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          backgroundColor: `${colors.background}ee`,
          borderColor: `${colors.primary}22`,
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a
            href="#home"
            className="text-xl font-bold"
            style={{
              color: colors.primary,
              fontFamily: typography.heading,
            }}
          >
            {name}
          </a>

          <div
            className={
              navigation.style === "centered"
                ? "hidden items-center gap-6 md:flex"
                : "hidden items-center gap-6 md:flex"
            }
          >
            <a href="#about" className="text-sm hover:opacity-70">
              About
            </a>

            <a href="#skills" className="text-sm hover:opacity-70">
              Skills
            </a>

            <a href="#experience" className="text-sm hover:opacity-70">
              Experience
            </a>

            <a href="#projects" className="text-sm hover:opacity-70">
              Projects
            </a>

            <a href="#contact" className="text-sm hover:opacity-70">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="home"
        className="mx-auto max-w-6xl px-6 py-20 md:py-28"
      >
        <div className={heroContainerClass}>
          <div
            className={
              hero.layout === "split"
                ? `${photoOrder} flex flex-col items-start text-left`
                : "w-full"
            }
          >
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-[0.25em]"
              style={{ color: colors.primary }}
            >
              Portfolio
            </p>

            <h1
              className="max-w-4xl text-5xl font-black leading-tight md:text-7xl"
              style={{
                color: colors.text,
                fontFamily: typography.heading,
              }}
            >
              {name}
            </h1>

            <p
              className="mt-6 max-w-2xl text-xl md:text-2xl"
              style={{ color: colors.primary }}
            >
              {headline}
            </p>

            {data.summary && (
              <p
                className="mt-6 max-w-2xl text-base leading-8 md:text-lg"
                style={{ color: colors.mutedText }}
              >
                {data.summary}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              {resumeButton.enabled && resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className={`inline-flex items-center justify-center px-6 py-3 font-semibold ${animationClass()}`}
                  style={{
                    borderRadius:
                      cards.radius === "none"
                        ? "0"
                        : cards.radius === "small"
                          ? "8px"
                          : cards.radius === "large"
                            ? "24px"
                            : "14px",
                    backgroundColor:
                      resumeButton.style === "filled"
                        ? colors.primary
                        : "transparent",
                    color:
                      resumeButton.style === "filled"
                        ? colors.background
                        : colors.primary,
                    border:
                      resumeButton.style === "filled"
                        ? "none"
                        : `1px solid ${colors.primary}`,
                  }}
                >
                  {resumeButton.label || "Download Resume"}
                </a>
              )}

              {data.personal.linkedin && (
                <a
                  href={data.personal.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold transition hover:opacity-75"
                  style={{
                    borderColor: `${colors.primary}55`,
                    color: colors.text,
                  }}
                >
                  LinkedIn
                </a>
              )}

              {data.personal.github && (
                <a
                  href={data.personal.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold transition hover:opacity-75"
                  style={{
                    borderColor: `${colors.primary}55`,
                    color: colors.text,
                  }}
                >
                  GitHub
                </a>
              )}
            </div>
          </div>

          {heroPhoto && (
            <div
              className={`flex ${
                hero.photoPosition === "left"
                  ? "justify-start"
                  : hero.photoPosition === "right"
                    ? "justify-end"
                    : "justify-center"
              } ${hero.layout === "split" ? "" : "mt-12"} ${photoOrder}`}
            >
              <img
                src={profileImageUrl}
                alt={`${name} profile`}
                className={`${photoSizeClass()} ${photoClass()} object-cover object-center shadow-2xl`}
                style={{
                  border: `4px solid ${colors.primary}`,
                }}
              />
            </div>
          )}

          {!heroPhoto &&
            hero.photoShape !== "none" && (
              <div
                className={`flex ${
                  hero.photoPosition === "left"
                    ? "justify-start"
                    : hero.photoPosition === "right"
                      ? "justify-end"
                      : "justify-center"
                } ${hero.layout === "split" ? "" : "mt-12"} ${photoOrder}`}
              >
                <div
                  className={`${photoSizeClass()} ${photoClass()} flex items-center justify-center text-5xl font-bold`}
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.primary,
                    border: `4px solid ${colors.primary}`,
                  }}
                >
                  {initials || "P"}
                </div>
              </div>
            )}
        </div>
      </section>

      {/* About */}
      {sections.includes("about") && data.summary && (
        <section
          id="about"
          className="mx-auto max-w-6xl px-6 py-16"
        >
          <SectionTitle
            title="About"
            primary={colors.primary}
            headingFont={typography.heading}
          />

          <div
            className={`mt-8 border p-8 ${radiusClass()} ${shadowClass()} ${animationClass()}`}
            style={cardStyle()}
          >
            <p
              className="leading-8"
              style={{ color: colors.mutedText }}
            >
              {data.summary}
            </p>
          </div>
        </section>
      )}

      {/* Skills */}
      {sections.includes("skills") &&
        data.skills.length > 0 && (
          <section
            id="skills"
            className="mx-auto max-w-6xl px-6 py-16"
          >
            <SectionTitle
              title="Skills"
              primary={colors.primary}
              headingFont={typography.heading}
            />

            <div className="mt-8 flex flex-wrap gap-3">
              {data.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className={`border px-4 py-2 text-sm font-medium ${radiusClass()}`}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: `${colors.primary}44`,
                    color: colors.text,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

      {/* Experience */}
      {sections.includes("experience") &&
        data.experience.length > 0 && (
          <section
            id="experience"
            className="mx-auto max-w-6xl px-6 py-16"
          >
            <SectionTitle
              title="Experience"
              primary={colors.primary}
              headingFont={typography.heading}
            />

            <div className="mt-8 space-y-6">
              {data.experience.map((item, index) => (
                <div
                  key={`${item.company}-${index}`}
                  className={`border p-7 ${radiusClass()} ${shadowClass()} ${animationClass()}`}
                  style={cardStyle()}
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <h3
                        className="text-xl font-bold"
                        style={{
                          color: colors.text,
                          fontFamily: typography.heading,
                        }}
                      >
                        {item.role}
                      </h3>

                      <p
                        className="mt-1 font-semibold"
                        style={{ color: colors.primary }}
                      >
                        {item.company}
                      </p>
                    </div>

                    <p
                      className="text-sm"
                      style={{ color: colors.mutedText }}
                    >
                      {item.startDate}
                      {item.startDate || item.endDate
                        ? " — "
                        : ""}
                      {item.endDate}
                    </p>
                  </div>

                  {item.location && (
                    <p
                      className="mt-3 text-sm"
                      style={{ color: colors.mutedText }}
                    >
                      {item.location}
                    </p>
                  )}

                  {item.description && (
                    <p
                      className="mt-5 whitespace-pre-line leading-7"
                      style={{ color: colors.mutedText }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Projects */}
      {sections.includes("projects") &&
        data.projects.length > 0 && (
          <section
            id="projects"
            className="mx-auto max-w-6xl px-6 py-16"
          >
            <SectionTitle
              title="Projects"
              primary={colors.primary}
              headingFont={typography.heading}
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {data.projects.map((project, index) => (
                <div
                  key={`${project.name}-${index}`}
                  className={`border p-7 ${radiusClass()} ${shadowClass()} ${animationClass()}`}
                  style={cardStyle()}
                >
                  <h3
                    className="text-xl font-bold"
                    style={{
                      color: colors.text,
                      fontFamily: typography.heading,
                    }}
                  >
                    {project.name}
                  </h3>

                  {project.description && (
                    <p
                      className="mt-4 leading-7"
                      style={{ color: colors.mutedText }}
                    >
                      {project.description}
                    </p>
                  )}

                  {project.technologies.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.technologies.map(
                        (technology, technologyIndex) => (
                          <span
                            key={`${technology}-${technologyIndex}`}
                            className="rounded-lg px-3 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: `${colors.primary}18`,
                              color: colors.primary,
                            }}
                          >
                            {technology}
                          </span>
                        )
                      )}
                    </div>
                  )}

                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-block font-semibold hover:underline"
                      style={{ color: colors.primary }}
                    >
                      View Project →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Education */}
      {sections.includes("education") &&
        data.education.length > 0 && (
          <section
            id="education"
            className="mx-auto max-w-6xl px-6 py-16"
          >
            <SectionTitle
              title="Education"
              primary={colors.primary}
              headingFont={typography.heading}
            />

            <div className="mt-8 space-y-6">
              {data.education.map((item, index) => (
                <div
                  key={`${item.institution}-${index}`}
                  className={`border p-7 ${radiusClass()} ${shadowClass()}`}
                  style={cardStyle()}
                >
                  <h3
                    className="text-xl font-bold"
                    style={{
                      color: colors.text,
                      fontFamily: typography.heading,
                    }}
                  >
                    {item.degree}
                    {item.field ? ` — ${item.field}` : ""}
                  </h3>

                  <p
                    className="mt-2 font-semibold"
                    style={{ color: colors.primary }}
                  >
                    {item.institution}
                  </p>

                  <p
                    className="mt-2 text-sm"
                    style={{ color: colors.mutedText }}
                  >
                    {item.startDate}
                    {item.startDate || item.endDate
                      ? " — "
                      : ""}
                    {item.endDate}
                  </p>

                  {item.description && (
                    <p
                      className="mt-4 leading-7"
                      style={{ color: colors.mutedText }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Certifications */}
      {sections.includes("certifications") &&
        data.certifications.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <SectionTitle
              title="Certifications"
              primary={colors.primary}
              headingFont={typography.heading}
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {data.certifications.map(
                (certificate, index) => (
                  <div
                    key={`${certificate.name}-${index}`}
                    className={`border p-7 ${radiusClass()} ${shadowClass()}`}
                    style={cardStyle()}
                  >
                    <h3
                      className="text-lg font-bold"
                      style={{
                        color: colors.text,
                        fontFamily: typography.heading,
                      }}
                    >
                      {certificate.name}
                    </h3>

                    {certificate.issuer && (
                      <p
                        className="mt-2"
                        style={{ color: colors.primary }}
                      >
                        {certificate.issuer}
                      </p>
                    )}

                    {certificate.date && (
                      <p
                        className="mt-2 text-sm"
                        style={{ color: colors.mutedText }}
                      >
                        {certificate.date}
                      </p>
                    )}

                    {certificate.url && (
                      <a
                        href={certificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block font-semibold"
                        style={{ color: colors.primary }}
                      >
                        View Certificate →
                      </a>
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        )}

      {/* Achievements */}
      {sections.includes("achievements") &&
        data.achievements.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <SectionTitle
              title="Achievements"
              primary={colors.primary}
              headingFont={typography.heading}
            />

            <div
              className={`mt-8 border p-7 ${radiusClass()} ${shadowClass()}`}
              style={cardStyle()}
            >
              <ul className="space-y-4">
                {data.achievements.map(
                  (achievement, index) => (
                    <li
                      key={`${achievement}-${index}`}
                      className="flex gap-3 leading-7"
                      style={{ color: colors.mutedText }}
                    >
                      <span style={{ color: colors.primary }}>
                        •
                      </span>

                      <span>{achievement}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </section>
        )}

      {/* Languages */}
      {sections.includes("languages") &&
        data.languages.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <SectionTitle
              title="Languages"
              primary={colors.primary}
              headingFont={typography.heading}
            />

            <div className="mt-8 flex flex-wrap gap-3">
              {data.languages.map(
                (language, index) => (
                  <span
                    key={`${language}-${index}`}
                    className={`border px-4 py-2 ${radiusClass()}`}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: `${colors.primary}44`,
                      color: colors.text,
                    }}
                  >
                    {language}
                  </span>
                )
              )}
            </div>
          </section>
        )}

      {/* Contact */}
      {sections.includes("contact") && (
        <section
          id="contact"
          className="mx-auto max-w-6xl px-6 py-20"
        >
          <SectionTitle
            title="Contact"
            primary={colors.primary}
            headingFont={typography.heading}
          />

          <div
            className={`mt-8 border p-8 ${radiusClass()} ${shadowClass()}`}
            style={cardStyle()}
          >
            <div className="space-y-4">
              {data.personal.email && (
                <a
                  href={`mailto:${data.personal.email}`}
                  className="block font-medium hover:underline"
                  style={{ color: colors.primary }}
                >
                  {data.personal.email}
                </a>
              )}

              {data.personal.phone && (
                <p style={{ color: colors.mutedText }}>
                  {data.personal.phone}
                </p>
              )}

              {data.personal.location && (
                <p style={{ color: colors.mutedText }}>
                  {data.personal.location}
                </p>
              )}

              {data.personal.website && (
                <a
                  href={data.personal.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-medium hover:underline"
                  style={{ color: colors.primary }}
                >
                  Personal Website
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        className="border-t px-6 py-10 text-center"
        style={{
          borderColor: `${colors.primary}22`,
          color: colors.mutedText,
        }}
      >
        <p>
          © {new Date().getFullYear()} {name}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

function SectionTitle({
  title,
  primary,
  headingFont,
}: {
  title: string;
  primary: string;
  headingFont: string;
}) {
  return (
    <div>
      <p
        className="text-sm font-bold uppercase tracking-[0.25em]"
        style={{ color: primary }}
      >
        {title}
      </p>

      <div
        className="mt-3 h-1 w-16 rounded-full"
        style={{ backgroundColor: primary }}
      />
    </div>
  );
}