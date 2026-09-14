"use client";

import type { ReactNode } from "react";
import type { PortfolioData } from "@/lib/ai/portfolio-schema";

type PortfolioRendererProps = {
  data: PortfolioData;
};

function safeUrl(value?: string) {
  if (!value) return null;

  try {
    const normalized = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;

    const url = new URL(normalized);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
        {eyebrow}
      </p>

      <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">
        {title}
      </h2>

      <div className="mt-4 h-1 w-12 rounded-full bg-blue-600" />
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

export default function PortfolioRenderer({
  data,
}: PortfolioRendererProps) {
  const linkedin = safeUrl(data.personal.linkedin);
  const github = safeUrl(data.personal.github);
  const website = safeUrl(data.personal.website);

  const initials =
    data.personal.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "P";

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-800">

      {/* =====================================================
          TOP ACCENT
      ====================================================== */}

      <div className="h-1.5 bg-blue-600" />

      {/* =====================================================
          HERO
      ====================================================== */}

      <header className="relative overflow-hidden bg-slate-950 text-white">

        {/* Decorative background */}

        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">

          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">

            {/* PROFILE */}

            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">

              {/* Avatar */}

              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-extrabold shadow-2xl shadow-blue-900/40">
                {initials}
              </div>

              {/* Name */}

              <div>

                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
                  Professional Portfolio
                </p>

                <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                  {data.personal.name || "Your Name"}
                </h1>

                <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-300">
                  {data.personal.headline || "Professional"}
                </p>

                {/* Contact */}

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">

                  {data.personal.email && (
                    <span>
                      {data.personal.email}
                    </span>
                  )}

                  {data.personal.phone && (
                    <span>
                      {data.personal.phone}
                    </span>
                  )}

                  {data.personal.location && (
                    <span>
                      {data.personal.location}
                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* SOCIAL LINKS */}

            <div className="flex flex-wrap gap-3">

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  LinkedIn
                </a>
              )}

              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  GitHub
                </a>
              )}

              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500"
                >
                  Website
                </a>
              )}

            </div>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-20">

        {/* ===================================================
            ABOUT
        ==================================================== */}

        {data.summary && (
          <section className="mb-20">

            <SectionTitle
              eyebrow="01"
              title="About Me"
            />

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">

              <p className="max-w-5xl whitespace-pre-line text-base leading-8 text-slate-600 md:text-lg md:leading-9">
                {data.summary}
              </p>

            </div>

          </section>
        )}

        {/* ===================================================
            SKILLS
        ==================================================== */}

        {data.skills?.length > 0 && (
          <section className="mb-20">

            <SectionTitle
              eyebrow="02"
              title="Skills & Expertise"
            />

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

              {data.skills.map((skill, index) => (
                <div
                  key={`${skill}-${index}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <span className="font-semibold text-slate-800">
                      {skill}
                    </span>

                  </div>

                </div>
              ))}

            </div>

          </section>
        )}

        {/* ===================================================
            EXPERIENCE
        ==================================================== */}

        {data.experience?.length > 0 && (
          <section className="mb-20">

            <SectionTitle
              eyebrow="03"
              title="Experience"
            />

            <div className="relative space-y-6">

              <div className="absolute bottom-5 left-[11px] top-5 hidden w-px bg-slate-200 md:block" />

              {data.experience.map((item, index) => (
                <div
                  key={`${item.company}-${index}`}
                  className="relative md:pl-10"
                >

                  {/* Timeline dot */}

                  <div className="absolute left-0 top-7 hidden h-6 w-6 items-center justify-center rounded-full border-4 border-slate-50 bg-blue-600 md:flex" />

                  <Card>

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div>

                        <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                          {item.company || "Company"}
                        </p>

                        <h3 className="mt-2 text-xl font-extrabold text-slate-950">
                          {item.role || "Role"}
                        </h3>

                        {item.location && (
                          <p className="mt-1 text-sm text-slate-500">
                            {item.location}
                          </p>
                        )}

                      </div>

                      {(item.startDate ||
                        item.endDate) && (
                        <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
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
                      <p className="mt-6 whitespace-pre-line border-t border-slate-100 pt-6 leading-8 text-slate-600">
                        {item.description}
                      </p>
                    )}

                  </Card>

                </div>
              ))}

            </div>

          </section>
        )}

        {/* ===================================================
            PROJECTS
        ==================================================== */}

        {data.projects?.length > 0 && (
          <section className="mb-20">

            <SectionTitle
              eyebrow="04"
              title="Featured Projects"
            />

            <div className="grid gap-6 md:grid-cols-2">

              {data.projects.map((project, index) => {

                const projectUrl =
                  safeUrl(project.url);

                return (
                  <Card
                    key={`${project.name}-${index}`}
                    className="group relative overflow-hidden"
                  >

                    {/* Number */}

                    <div className="absolute right-6 top-5 text-5xl font-black text-slate-100 transition group-hover:text-blue-50">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="relative">

                      <div className="mb-5 flex items-center justify-between">

                        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                          Project
                        </span>

                        {projectUrl && (
                          <a
                            href={projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-blue-600 hover:underline"
                          >
                            View Project →
                          </a>
                        )}

                      </div>

                      <h3 className="text-xl font-extrabold text-slate-950">
                        {project.name ||
                          "Project"}
                      </h3>

                      {project.description && (
                        <p className="mt-4 leading-7 text-slate-600">
                          {project.description}
                        </p>
                      )}

                      {project.technologies
                        ?.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">

                          {project.technologies.map(
                            (
                              technology,
                              techIndex
                            ) => (
                              <span
                                key={`${technology}-${techIndex}`}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
                              >
                                {technology}
                              </span>
                            )
                          )}

                        </div>
                      )}

                    </div>

                  </Card>
                );
              })}

            </div>

          </section>
        )}

        {/* ===================================================
            EDUCATION
        ==================================================== */}

        {data.education?.length > 0 && (
          <section className="mb-20">

            <SectionTitle
              eyebrow="05"
              title="Education"
            />

            <div className="grid gap-6 md:grid-cols-2">

              {data.education.map(
                (item, index) => (
                  <Card
                    key={`${item.institution}-${index}`}
                  >

                    <div className="flex items-start justify-between gap-5">

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          Education
                        </p>

                        <h3 className="mt-3 text-xl font-extrabold text-slate-950">
                          {item.degree ||
                            "Degree"}
                        </h3>

                        {item.field && (
                          <p className="mt-1 font-medium text-slate-600">
                            {item.field}
                          </p>
                        )}

                        <p className="mt-3 font-semibold text-blue-600">
                          {item.institution}
                        </p>

                      </div>

                      {(item.startDate ||
                        item.endDate) && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
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
                      <p className="mt-5 border-t border-slate-100 pt-5 leading-7 text-slate-600">
                        {item.description}
                      </p>
                    )}

                  </Card>
                )
              )}

            </div>

          </section>
        )}

        {/* ===================================================
            CERTIFICATIONS
        ==================================================== */}

        {data.certifications?.length > 0 && (
          <section className="mb-20">

            <SectionTitle
              eyebrow="06"
              title="Certifications"
            />

            <div className="grid gap-5 md:grid-cols-2">

              {data.certifications.map(
                (item, index) => {

                  const certificationUrl =
                    safeUrl(item.url);

                  return (
                    <Card
                      key={`${item.name}-${index}`}
                    >

                      <div className="flex gap-5">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                          ✓
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                            <h3 className="font-bold text-slate-950">
                              {item.name ||
                                "Certification"}
                            </h3>

                            {item.date && (
                              <span className="text-xs font-semibold text-slate-400">
                                {item.date}
                              </span>
                            )}

                          </div>

                          {item.issuer && (
                            <p className="mt-1 text-sm font-medium text-blue-600">
                              {item.issuer}
                            </p>
                          )}

                          {certificationUrl && (
                            <a
                              href={
                                certificationUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline"
                            >
                              View Certificate →
                            </a>
                          )}

                        </div>

                      </div>

                    </Card>
                  );
                }
              )}

            </div>

          </section>
        )}

        {/* ===================================================
            ACHIEVEMENTS
        ==================================================== */}

        {data.achievements?.length > 0 && (
          <section className="mb-20">

            <SectionTitle
              eyebrow="07"
              title="Achievements"
            />

            <div className="grid gap-4">

              {data.achievements.map(
                (achievement, index) => (
                  <div
                    key={`${achievement}-${index}`}
                    className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                      {index + 1}
                    </div>

                    <p className="leading-7 text-slate-600">
                      {achievement}
                    </p>

                  </div>
                )
              )}

            </div>

          </section>
        )}

        {/* ===================================================
            LANGUAGES
        ==================================================== */}

        {data.languages?.length > 0 && (
          <section className="mb-10">

            <SectionTitle
              eyebrow="08"
              title="Languages"
            />

            <div className="flex flex-wrap gap-3">

              {data.languages.map(
                (language, index) => (
                  <span
                    key={`${language}-${index}`}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    {language}
                  </span>
                )
              )}

            </div>

          </section>
        )}

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-slate-950 text-white">

        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-lg font-bold">
                {data.personal.name ||
                  "Professional Portfolio"}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Built with AI-powered career technology.
              </p>

            </div>

            <div className="text-sm text-slate-500">
              Professional Portfolio
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}