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
   * ---------------------------------------------------------
   * AI DESIGN SYSTEM
   * ---------------------------------------------------------
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

  /*
   * ---------------------------------------------------------
   * BASIC DATA
   * ---------------------------------------------------------
   */

  const name =
    data.personal?.name?.trim() ||
    "Your Name";

  const headline =
    data.personal?.headline?.trim() ||
    "Professional Portfolio";

  const summary =
    data.summary?.trim() ||
    "";

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) =>
          word[0]?.toUpperCase() || "",
      )
      .join("") || "P";

  /*
   * ---------------------------------------------------------
   * STYLE HELPERS
   * ---------------------------------------------------------
   */

  function radiusValue() {
    switch (cards.radius) {
      case "none":
        return "0px";

      case "small":
        return "10px";

      case "large":
        return "28px";

      default:
        return "18px";
    }
  }

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
        return "shadow-2xl";

      default:
        return "shadow-lg";
    }
  }

  function photoClass() {
    switch (hero.photoShape) {
      case "circle":
        return "rounded-full";

      case "square":
        return "rounded-none";

      case "rounded":
        return "rounded-3xl";

      default:
        return "rounded-full";
    }
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
        borderColor: `${colors.primary}30`,
        backdropFilter: "blur(18px)",
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

  /*
   * ---------------------------------------------------------
   * HERO LAYOUT
   * ---------------------------------------------------------
   */

  const heroPhoto =
    profileImageUrl &&
    hero.photoShape !== "none";

  const heroContainerClass =
    hero.layout === "center"
      ? "flex flex-col items-center text-center"

      : hero.layout === "right"
        ? "flex flex-col items-end text-right"

        : hero.layout === "split"
          ? "grid grid-cols-1 items-center gap-12 lg:grid-cols-2"

          : "flex flex-col items-start text-left";

  const heroContentClass =
    hero.layout === "center"
      ? "flex w-full flex-col items-center"

      : hero.layout === "right"
        ? "flex w-full flex-col items-end"

        : hero.layout === "split"
          ? "flex flex-col items-start text-left"

          : "flex w-full flex-col items-start";

  const photoOrder =
    hero.photoPosition === "left"
      ? "lg:order-first"

      : hero.photoPosition === "right"
        ? "lg:order-last"

        : "";

  /*
   * ---------------------------------------------------------
   * SOCIAL LINKS
   * ---------------------------------------------------------
   */

  const socialLinks = [
    {
      label: "LinkedIn",
      href: data.personal?.linkedin,
    },
    {
      label: "GitHub",
      href: data.personal?.github,
    },
    {
      label: "Website",
      href: data.personal?.website,
    },
  ].filter(
    (
      item,
    ): item is {
      label: string;
      href: string;
    } =>
      Boolean(item.href?.trim()),
  );

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  const navigationItems = [
    sections.includes("about")
      ? {
          label: "About",
          href: "#about",
        }
      : null,

    sections.includes("skills")
      ? {
          label: "Skills",
          href: "#skills",
        }
      : null,

    sections.includes("experience")
      ? {
          label: "Experience",
          href: "#experience",
        }
      : null,

    sections.includes("projects")
      ? {
          label: "Projects",
          href: "#projects",
        }
      : null,

    sections.includes("contact")
      ? {
          label: "Contact",
          href: "#contact",
        }
      : null,
  ].filter(Boolean) as {
    label: string;
    href: string;
  }[];

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: typography.body,
      }}
    >
      {/* =====================================================
          GLOBAL STYLE
      ====================================================== */}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: ${colors.primary};
          color: ${colors.background};
        }

        a {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-2xl"
        style={{
          backgroundColor: `${colors.background}e8`,
          borderColor: `${colors.primary}20`,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          {/* Brand */}

          <a
            href="#home"
            className="group flex max-w-[55%] items-center gap-3"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black"
              style={{
                backgroundColor: `${colors.primary}18`,
                color: colors.primary,
                border: `1px solid ${colors.primary}30`,
              }}
            >
              {initials.slice(0, 2)}
            </div>

            <div className="min-w-0">
              <p
                className="truncate text-sm font-bold md:text-base"
                style={{
                  color: colors.text,
                  fontFamily: typography.heading,
                }}
              >
                {name}
              </p>

              <p
                className="hidden truncate text-[10px] uppercase tracking-[0.2em] sm:block"
                style={{
                  color: colors.mutedText,
                }}
              >
                Portfolio
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}

          <div className="hidden items-center gap-1 md:flex">
            {navigationItems.map(
              (item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-70"
                  style={{
                    color: colors.mutedText,
                  }}
                >
                  {item.label}
                </a>
              ),
            )}
          </div>

          {/* Desktop CTA */}

          <div className="hidden items-center gap-3 md:flex">
            {resumeButton.enabled &&
              resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="rounded-xl px-4 py-2 text-sm font-bold transition hover:opacity-85"
                  style={{
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
                  {resumeButton.label ||
                    "Download Resume"}
                </a>
              )}
          </div>

          {/* Mobile Navigation */}

          <div className="flex items-center gap-2 md:hidden">
            {navigationItems
              .slice(0, 2)
              .map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-2 py-2 text-xs font-medium"
                  style={{
                    color: colors.mutedText,
                  }}
                >
                  {item.label}
                </a>
              ))}

            {resumeButton.enabled &&
              resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="rounded-lg px-3 py-2 text-xs font-bold"
                  style={{
                    backgroundColor:
                      colors.primary,
                    color:
                      colors.background,
                  }}
                >
                  Resume
                </a>
              )}
          </div>
        </div>
      </nav>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        id="home"
        className="relative overflow-hidden"
      >
        {/* Ambient glow */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor: `${colors.primary}18`,
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor: `${colors.secondary}15`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28 lg:py-36">
          <div className={heroContainerClass}>
            {/* Hero content */}

            <div
              className={`${heroContentClass} ${
                hero.layout === "split"
                  ? ""
                  : "max-w-4xl"
              }`}
            >
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{
                  borderColor: `${colors.primary}35`,
                  backgroundColor: `${colors.primary}10`,
                  color: colors.primary,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      colors.primary,
                  }}
                />

                Professional Portfolio
              </div>

              <h1
                className="max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-8xl"
                style={{
                  color: colors.text,
                  fontFamily: typography.heading,
                }}
              >
                {name}
              </h1>

              <p
                className="mt-7 max-w-3xl text-xl font-semibold leading-relaxed sm:text-2xl md:text-3xl"
                style={{
                  color: colors.primary,
                  fontFamily: typography.heading,
                }}
              >
                {headline}
              </p>

              {summary && (
                <p
                  className="mt-7 max-w-2xl text-base leading-8 md:text-lg"
                  style={{
                    color: colors.mutedText,
                  }}
                >
                  {summary}
                </p>
              )}

              <div className="mt-9 flex flex-wrap items-center gap-3">
                {resumeButton.enabled &&
                  resumeUrl && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className={`inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold ${radiusClass()} ${animationClass()}`}
                      style={{
                        backgroundColor:
                          resumeButton.style ===
                          "filled"
                            ? colors.primary
                            : "transparent",
                        color:
                          resumeButton.style ===
                          "filled"
                            ? colors.background
                            : colors.primary,
                        border:
                          resumeButton.style ===
                          "filled"
                            ? "none"
                            : `1px solid ${colors.primary}`,
                      }}
                    >
                      {resumeButton.label ||
                        "Download Resume"}

                      <span aria-hidden="true">
                        ↓
                      </span>
                    </a>
                  )}

                {sections.includes(
                  "contact",
                ) && (
                  <a
                    href="#contact"
                    className={`inline-flex items-center gap-2 border px-6 py-3.5 text-sm font-bold ${radiusClass()} ${animationClass()}`}
                    style={{
                      borderColor: `${colors.primary}45`,
                      color: colors.text,
                    }}
                  >
                    Let's Connect

                    <span aria-hidden="true">
                      →
                    </span>
                  </a>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  {socialLinks.map(
                    (social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold transition hover:opacity-60"
                        style={{
                          color: colors.mutedText,
                        }}
                      >
                        {social.label}
                      </a>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Hero photo */}

            {hero.photoShape !== "none" && (
              <div
                className={`flex ${
                  hero.photoPosition ===
                  "left"
                    ? "justify-start"
                    : hero.photoPosition ===
                        "right"
                      ? "justify-end"
                      : "justify-center"
                } ${
                  hero.layout === "split"
                    ? ""
                    : "mt-14"
                } ${photoOrder}`}
              >
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-5 rounded-full blur-3xl"
                    style={{
                      backgroundColor: `${colors.primary}16`,
                    }}
                  />

                  {heroPhoto ? (
                    <img
                      src={profileImageUrl}
                      alt={`${name} profile`}
                      className={`relative ${photoSizeClass()} ${photoClass()} object-cover object-center shadow-2xl`}
                      style={{
                        border: `4px solid ${colors.primary}`,
                      }}
                    />
                  ) : (
                    <div
                      className={`relative ${photoSizeClass()} ${photoClass()} flex items-center justify-center text-5xl font-black shadow-2xl`}
                      style={{
                        backgroundColor:
                          colors.surface,
                        color: colors.primary,
                        border: `4px solid ${colors.primary}`,
                      }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ====================================================== */}

      {sections.includes("about") &&
        summary && (
          <section
            id="about"
            className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-24"
          >
            <SectionHeading
              eyebrow="About"
              title="A little about me"
              primary={colors.primary}
              text={colors.mutedText}
              headingFont={
                typography.heading
              }
            />

            <div
              className={`mt-10 border p-7 md:p-10 ${radiusClass()} ${shadowClass()} ${animationClass()}`}
              style={cardStyle()}
            >
              <p
                className="max-w-4xl text-base leading-8 md:text-lg md:leading-9"
                style={{
                  color: colors.mutedText,
                }}
              >
                {summary}
              </p>
            </div>
          </section>
        )}

      {/* =====================================================
          SKILLS
      ====================================================== */}

      {sections.includes("skills") &&
        data.skills?.length > 0 && (
          <section
            id="skills"
            className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-24"
          >
            <SectionHeading
              eyebrow="Skills"
              title="Tools & technologies"
              primary={colors.primary}
              text={colors.mutedText}
              headingFont={
                typography.heading
              }
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.skills.map(
                (skill, index) => (
                  <div
                    key={`${skill}-${index}`}
                    className={`group border p-5 ${radiusClass()} ${animationClass()}`}
                    style={cardStyle()}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                        }}
                      >
                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </div>

                      <span
                        className="font-semibold"
                        style={{
                          color: colors.text,
                        }}
                      >
                        {skill}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

      {/* =====================================================
          EXPERIENCE
      ====================================================== */}

      {sections.includes(
        "experience",
      ) &&
        data.experience?.length > 0 && (
          <section
            id="experience"
            className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-24"
          >
            <SectionHeading
              eyebrow="Experience"
              title="Professional journey"
              primary={colors.primary}
              text={colors.mutedText}
              headingFont={
                typography.heading
              }
            />

            <div className="relative mt-12 space-y-6">
              <div
                aria-hidden="true"
                className="absolute bottom-8 left-[19px] top-8 hidden w-px md:block"
                style={{
                  backgroundColor: `${colors.primary}25`,
                }}
              />

              {data.experience.map(
                (item, index) => (
                  <div
                    key={`${item.company}-${index}`}
                    className="relative grid gap-5 md:grid-cols-[40px_1fr]"
                  >
                    <div
                      className="relative z-10 mt-6 hidden h-10 w-10 items-center justify-center rounded-full text-xs font-black md:flex"
                      style={{
                        backgroundColor:
                          colors.surface,
                        color:
                          colors.primary,
                        border: `2px solid ${colors.primary}`,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div
                      className={`border p-7 md:p-8 ${radiusClass()} ${shadowClass()} ${animationClass()}`}
                      style={cardStyle()}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3
                            className="text-xl font-bold md:text-2xl"
                            style={{
                              color:
                                colors.text,
                              fontFamily:
                                typography.heading,
                            }}
                          >
                            {item.role}
                          </h3>

                          <p
                            className="mt-2 font-semibold"
                            style={{
                              color:
                                colors.primary,
                            }}
                          >
                            {item.company}
                          </p>

                          {item.location && (
                            <p
                              className="mt-1 text-sm"
                              style={{
                                color:
                                  colors.mutedText,
                              }}
                            >
                              {item.location}
                            </p>
                          )}
                        </div>

                        {(item.startDate ||
                          item.endDate) && (
                          <div
                            className="w-fit rounded-full px-3 py-1.5 text-xs font-semibold"
                            style={{
                              backgroundColor: `${colors.primary}12`,
                              color:
                                colors.primary,
                            }}
                          >
                            {item.startDate}
                            {item.startDate ||
                            item.endDate
                              ? " — "
                              : ""}
                            {item.endDate}
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p
                          className="mt-6 whitespace-pre-line text-sm leading-8 md:text-base"
                          style={{
                            color:
                              colors.mutedText,
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

      {/* =====================================================
          PROJECTS
      ====================================================== */}

      {sections.includes(
        "projects",
      ) &&
        data.projects?.length > 0 && (
          <section
            id="projects"
            className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-24"
          >
            <SectionHeading
              eyebrow="Projects"
              title="Selected work"
              primary={colors.primary}
              text={colors.mutedText}
              headingFont={
                typography.heading
              }
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {data.projects.map(
                (project, index) => (
                  <article
                    key={`${project.name}-${index}`}
                    className={`group relative overflow-hidden border p-7 md:p-8 ${radiusClass()} ${shadowClass()} ${animationClass()}`}
                    style={cardStyle()}
                  >
                    {/* Project number */}

                    <div
                      className="absolute right-6 top-6 text-xs font-black tracking-[0.2em]"
                      style={{
                        color: `${colors.primary}70`,
                      }}
                    >
                      {String(
                        index + 1,
                      ).padStart(2, "0")}
                    </div>

                    <h3
                      className="pr-12 text-2xl font-bold"
                      style={{
                        color:
                          colors.text,
                        fontFamily:
                          typography.heading,
                      }}
                    >
                      {project.name}
                    </h3>

                    {project.description && (
                      <p
                        className="mt-5 leading-8"
                        style={{
                          color:
                            colors.mutedText,
                        }}
                      >
                        {
                          project.description
                        }
                      </p>
                    )}

                    {project.technologies
                      ?.length >
                      0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {project.technologies.map(
                          (
                            technology,
                            technologyIndex,
                          ) => (
                            <span
                              key={`${technology}-${technologyIndex}`}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                              style={{
                                backgroundColor: `${colors.primary}12`,
                                color:
                                  colors.primary,
                              }}
                            >
                              {
                                technology
                              }
                            </span>
                          ),
                        )}
                      </div>
                    )}

                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-7 inline-flex items-center gap-2 text-sm font-bold"
                        style={{
                          color:
                            colors.primary,
                        }}
                      >
                        View Project

                        <span
                          aria-hidden="true"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </a>
                    )}
                  </article>
                ),
              )}
            </div>
          </section>
        )}

      {/* =====================================================
          EDUCATION
      ====================================================== */}

      {sections.includes(
        "education",
      ) &&
        data.education?.length > 0 && (
          <section
            id="education"
            className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-24"
          >
            <SectionHeading
              eyebrow="Education"
              title="Academic background"
              primary={colors.primary}
              text={colors.mutedText}
              headingFont={
                typography.heading
              }
            />

            <div className="mt-10 space-y-5">
              {data.education.map(
                (item, index) => (
                  <div
                    key={`${item.institution}-${index}`}
                    className={`border p-7 md:p-8 ${radiusClass()} ${shadowClass()} ${animationClass()}`}
                    style={cardStyle()}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3
                          className="text-xl font-bold md:text-2xl"
                          style={{
                            color:
                              colors.text,
                            fontFamily:
                              typography.heading,
                          }}
                        >
                          {item.degree}
                          {item.field
                            ? ` — ${item.field}`
                            : ""}
                        </h3>

                        <p
                          className="mt-2 font-semibold"
                          style={{
                            color:
                              colors.primary,
                          }}
                        >
                          {item.institution}
                        </p>
                      </div>

                      {(item.startDate ||
                        item.endDate) && (
                        <span
                          className="w-fit rounded-full px-3 py-1.5 text-xs font-semibold"
                          style={{
                            backgroundColor: `${colors.primary}12`,
                            color:
                              colors.primary,
                          }}
                        >
                          {item.startDate}
                          {item.startDate ||
                          item.endDate
                            ? " — "
                            : ""}
                          {item.endDate}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p
                        className="mt-5 leading-8"
                        style={{
                          color:
                            colors.mutedText,
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </section>
        )}

      {/* =====================================================
          CERTIFICATIONS
      ====================================================== */}

      {sections.includes(
        "certifications",
      ) &&
        data.certifications?.length >
          0 && (
          <section
            id="certifications"
            className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-24"
          >
            <SectionHeading
              eyebrow="Certifications"
              title="Credentials"
              primary={colors.primary}
              text={colors.mutedText}
              headingFont={
                typography.heading
              }
            />

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {data.certifications.map(
                (
                  certificate,
                  index,
                ) => (
                  <div
                    key={`${certificate.name}-${index}`}
                    className={`border p-7 ${radiusClass()} ${shadowClass()} ${animationClass()}`}
                    style={cardStyle()}
                  >
                    <div className="flex gap-4">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                        style={{
                          backgroundColor: `${colors.primary}14`,
                          color:
                            colors.primary,
                        }}
                      >
                        ✓
                      </div>

                      <div className="min-w-0">
                        <h3
                          className="text-lg font-bold"
                          style={{
                            color:
                              colors.text,
                            fontFamily:
                              typography.heading,
                          }}
                        >
                          {
                            certificate.name
                          }
                        </h3>

                        {certificate.issuer && (
                          <p
                            className="mt-2 font-medium"
                            style={{
                              color:
                                colors.primary,
                            }}
                          >
                            {
                              certificate.issuer
                            }
                          </p>
                        )}

                        {certificate.date && (
                          <p
                            className="mt-2 text-sm"
                            style={{
                              color:
                                colors.mutedText,
                            }}
                          >
                            {
                              certificate.date
                            }
                          </p>
                        )}

                        {certificate.url && (
                          <a
                            href={
                              certificate.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold"
                            style={{
                              color:
                                colors.primary,
                            }}
                          >
                            Verify Credential
                            <span>
                              →
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

      {/* =====================================================
          ACHIEVEMENTS
      ====================================================== */}

      {sections.includes(
        "achievements",
      ) &&
        data.achievements?.length >
          0 && (
          <section
            id="achievements"
            className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-24"
          >
            <SectionHeading
              eyebrow="Achievements"
              title="Highlights"
              primary={colors.primary}
              text={colors.mutedText}
              headingFont={
                typography.heading
              }
            />

            <div
              className={`mt-10 border p-7 md:p-9 ${radiusClass()} ${shadowClass()}`}
              style={cardStyle()}
            >
              <div className="space-y-5">
                {data.achievements.map(
                  (
                    achievement,
                    index,
                  ) => (
                    <div
                      key={`${achievement}-${index}`}
                      className="flex gap-4"
                    >
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            colors.primary,
                        }}
                      />

                      <p
                        className="leading-8"
                        style={{
                          color:
                            colors.mutedText,
                        }}
                      >
                        {achievement}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

      {/* =====================================================
          LANGUAGES
      ====================================================== */}

      {sections.includes(
        "languages",
      ) &&
        data.languages?.length > 0 && (
          <section
            id="languages"
            className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-24"
          >
            <SectionHeading
              eyebrow="Languages"
              title="Communication"
              primary={colors.primary}
              text={colors.mutedText}
              headingFont={
                typography.heading
              }
            />

            <div className="mt-10 flex flex-wrap gap-3">
              {data.languages.map(
                (
                  language,
                  index,
                ) => (
                  <span
                    key={`${language}-${index}`}
                    className={`border px-5 py-2.5 text-sm font-semibold ${radiusClass()}`}
                    style={{
                      backgroundColor:
                        colors.surface,
                      borderColor: `${colors.primary}35`,
                      color:
                        colors.text,
                    }}
                  >
                    {language}
                  </span>
                ),
              )}
            </div>
          </section>
        )}

      {/* =====================================================
          CONTACT
      ====================================================== */}

      {sections.includes(
        "contact",
      ) && (
        <section
          id="contact"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32"
        >
          <div
            className={`relative overflow-hidden border p-8 md:p-12 lg:p-16 ${radiusClass()} ${shadowClass()}`}
            style={{
              ...cardStyle(),
              borderColor: `${colors.primary}35`,
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
              style={{
                backgroundColor: `${colors.primary}18`,
              }}
            />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p
                  className="text-xs font-black uppercase tracking-[0.28em]"
                  style={{
                    color:
                      colors.primary,
                  }}
                >
                  Contact
                </p>

                <h2
                  className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-[-0.035em] md:text-6xl"
                  style={{
                    color:
                      colors.text,
                    fontFamily:
                      typography.heading,
                  }}
                >
                  Let's build something meaningful.
                </h2>

                <p
                  className="mt-5 max-w-xl leading-8"
                  style={{
                    color:
                      colors.mutedText,
                  }}
                >
                  If you'd like to discuss an opportunity,
                  collaboration, or project, feel free to
                  reach out.
                </p>
              </div>

              <div className="space-y-3">
                {data.personal
                  ?.email && (
                  <a
                    href={`mailto:${data.personal.email}`}
                    className={`block border px-5 py-3.5 text-sm font-bold ${radiusClass()} ${animationClass()}`}
                    style={{
                      borderColor: `${colors.primary}40`,
                      color:
                        colors.primary,
                    }}
                  >
                    {data.personal.email}
                  </a>
                )}

                {data.personal
                  ?.phone && (
                  <a
                    href={`tel:${data.personal.phone}`}
                    className={`block border px-5 py-3.5 text-sm font-bold ${radiusClass()} ${animationClass()}`}
                    style={{
                      borderColor: `${colors.primary}40`,
                      color:
                        colors.text,
                    }}
                  >
                    {data.personal.phone}
                  </a>
                )}

                {data.personal
                  ?.location && (
                  <p
                    className={`border px-5 py-3.5 text-sm font-medium ${radiusClass()}`}
                    style={{
                      borderColor: `${colors.primary}20`,
                      color:
                        colors.mutedText,
                    }}
                  >
                    {data.personal.location}
                  </p>
                )}
              </div>
            </div>

            {socialLinks.length >
              0 && (
              <div
                className="relative mt-10 flex flex-wrap gap-5 border-t pt-7"
                style={{
                  borderColor: `${colors.primary}18`,
                }}
              >
                {socialLinks.map(
                  (social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold transition hover:opacity-60"
                      style={{
                        color:
                          colors.text,
                      }}
                    >
                      {social.label}
                    </a>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        className="border-t px-5 py-10 md:px-8"
        style={{
          borderColor: `${colors.primary}18`,
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p
            className="text-sm"
            style={{
              color:
                colors.mutedText,
            }}
          >
            © {new Date().getFullYear()}{" "}
            {name}. All rights reserved.
          </p>

          <a
            href="#home"
            className="text-sm font-bold"
            style={{
              color:
                colors.primary,
            }}
          >
            Back to top ↑
          </a>
        </div>
      </footer>
    </main>
  );
}

/*
 * ============================================================
 * SECTION HEADING
 * ============================================================
 */

function SectionHeading({
  eyebrow,
  title,
  primary,
  text,
  headingFont,
}: {
  eyebrow: string;
  title: string;
  primary: string;
  text: string;
  headingFont: string;
}) {
  return (
    <div>
      <p
        className="text-xs font-black uppercase tracking-[0.28em]"
        style={{
          color: primary,
        }}
      >
        {eyebrow}
      </p>

      <h2
        className="mt-3 text-3xl font-black tracking-[-0.035em] md:text-5xl"
        style={{
          color: text,
          fontFamily: headingFont,
        }}
      >
        {title}
      </h2>

      <div
        className="mt-5 h-1 w-14 rounded-full"
        style={{
          backgroundColor: primary,
        }}
      />
    </div>
  );
}