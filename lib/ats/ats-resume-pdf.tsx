import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

import type { ResumeData } from "@/lib/ai/resume-schema";

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 42,
    paddingLeft: 48,
    paddingRight: 48,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.45,
  },

  header: {
    marginBottom: 14,
  },

  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },

  contact: {
    fontSize: 8.5,
    lineHeight: 1.4,
  },

  section: {
    marginTop: 11,
    marginBottom: 3,
  },

  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 0.7,
    borderBottomStyle: "solid",
  },

  summary: {
    marginBottom: 3,
  },

  skillRow: {
    marginBottom: 2,
  },

  skillCategory: {
    fontFamily: "Helvetica-Bold",
  },

  experienceItem: {
    marginBottom: 8,
  },

  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },

  role: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },

  dates: {
    fontSize: 8.5,
  },

  company: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },

  location: {
    fontSize: 8.5,
  },

  bullet: {
    marginLeft: 10,
    marginBottom: 1.5,
  },

  educationItem: {
    marginBottom: 6,
  },

  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  degree: {
    fontFamily: "Helvetica-Bold",
  },

  projectItem: {
    marginBottom: 7,
  },

  projectName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 1,
  },

  technologies: {
    fontSize: 8.5,
    marginTop: 2,
  },

  certificationItem: {
    marginBottom: 4,
  },

  certificationName: {
    fontFamily: "Helvetica-Bold",
  },

  link: {
    textDecoration: "none",
  },

  simpleItem: {
    marginBottom: 2,
  },
});

function clean(value: string | undefined | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function joinNonEmpty(values: string[]): string {
  return values
    .map((value) => clean(value))
    .filter(Boolean)
    .join(" | ");
}

function hasValue(value: string | undefined | null): boolean {
  return Boolean(clean(value));
}

function ContactLink({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  if (!hasValue(value)) return null;

  const href =
    label === "LinkedIn" ||
    label === "GitHub" ||
    label === "Website"
      ? value.startsWith("http")
        ? value
        : `https://${value}`
      : undefined;

  if (href) {
    return (
      <Link src={href} style={styles.link}>
        {value}
      </Link>
    );
  }

  return <Text>{value}</Text>;
}

export function ATSResumePDF({
  resume,
}: {
  resume: ResumeData;
}) {
  const personal = resume.personal;

  const contactParts = [
    clean(personal.email),
    clean(personal.phone),
    clean(personal.location),
  ].filter(Boolean);

  return (
    <Document
      title={`${clean(personal.name) || "Optimized Resume"} - ATS Resume`}
      author={clean(personal.name) || "HirePro"}
      subject="ATS optimized resume"
    >
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER */}
        <View style={styles.header}>
          {hasValue(personal.name) && (
            <Text style={styles.name}>{personal.name}</Text>
          )}

          {contactParts.length > 0 && (
            <Text style={styles.contact}>
              {contactParts.join(" | ")}
            </Text>
          )}

          {(hasValue(personal.linkedin) ||
            hasValue(personal.github) ||
            hasValue(personal.website)) && (
            <Text style={styles.contact}>
              {hasValue(personal.linkedin) && (
                <>
                  <ContactLink
                    label="LinkedIn"
                    value={personal.linkedin}
                  />
                </>
              )}

              {hasValue(personal.linkedin) &&
                (hasValue(personal.github) ||
                  hasValue(personal.website)) && " | "}

              {hasValue(personal.github) && (
                <ContactLink
                  label="GitHub"
                  value={personal.github}
                />
              )}

              {hasValue(personal.github) &&
                hasValue(personal.website) &&
                " | "}

              {hasValue(personal.website) && (
                <ContactLink
                  label="Website"
                  value={personal.website}
                />
              )}
            </Text>
          )}
        </View>

        {/* PROFESSIONAL SUMMARY */}
        {hasValue(resume.professionalSummary) && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Professional Summary
              </Text>
            </View>

            <Text style={styles.summary}>
              {resume.professionalSummary}
            </Text>
          </View>
        )}

        {/* SKILLS */}
        {resume.skills.length > 0 && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
            </View>

            {resume.skills.map((skill, index) => {
              const items = skill.items
                .map((item) => clean(item))
                .filter(Boolean);

              if (!items.length) return null;

              return (
                <Text key={`skill-${index}`} style={styles.skillRow}>
                  <Text style={styles.skillCategory}>
                    {clean(skill.category)}
                    {clean(skill.category) ? ": " : ""}
                  </Text>
                  {items.join(", ")}
                </Text>
              );
            })}
          </View>
        )}

        {/* EXPERIENCE */}
        {resume.experience.length > 0 && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Experience
              </Text>
            </View>

            {resume.experience.map((experience, index) => (
              <View
                key={`experience-${index}`}
                style={styles.experienceItem}
                wrap={false}
              >
                <View style={styles.experienceHeader}>
                  <Text style={styles.role}>
                    {clean(experience.role)}
                  </Text>

                  {hasValue(experience.startDate) ||
                  hasValue(experience.endDate) ? (
                    <Text style={styles.dates}>
                      {joinNonEmpty([
                        experience.startDate,
                        experience.endDate,
                      ])}
                    </Text>
                  ) : null}
                </View>

                {hasValue(experience.company) && (
                  <Text style={styles.company}>
                    {experience.company}
                  </Text>
                )}

                {hasValue(experience.location) && (
                  <Text style={styles.location}>
                    {experience.location}
                  </Text>
                )}

                {experience.responsibilities
                  .map((item) => clean(item))
                  .filter(Boolean)
                  .map((item, bulletIndex) => (
                    <Text
                      key={`experience-${index}-bullet-${bulletIndex}`}
                      style={styles.bullet}
                    >
                      • {item}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        )}

        {/* PROJECTS */}
        {resume.projects.length > 0 && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>

            {resume.projects.map((project, index) => (
              <View
                key={`project-${index}`}
                style={styles.projectItem}
                wrap={false}
              >
                <Text style={styles.projectName}>
                  {clean(project.name)}
                </Text>

                {hasValue(project.description) && (
                  <Text>{project.description}</Text>
                )}

                {project.technologies.filter(Boolean).length > 0 && (
                  <Text style={styles.technologies}>
                    Technologies:{" "}
                    {project.technologies
                      .map((technology) => clean(technology))
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                )}

                {hasValue(project.url) && (
                  <Link
                    src={
                      project.url.startsWith("http")
                        ? project.url
                        : `https://${project.url}`
                    }
                    style={styles.link}
                  >
                    {project.url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* EDUCATION */}
        {resume.education.length > 0 && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
            </View>

            {resume.education.map((education, index) => (
              <View
                key={`education-${index}`}
                style={styles.educationItem}
                wrap={false}
              >
                <View style={styles.educationHeader}>
                  <Text style={styles.degree}>
                    {[
                      clean(education.degree),
                      clean(education.field),
                    ]
                      .filter(Boolean)
                      .join(" in ")}
                  </Text>

                  {(hasValue(education.startDate) ||
                    hasValue(education.endDate)) && (
                    <Text style={styles.dates}>
                      {joinNonEmpty([
                        education.startDate,
                        education.endDate,
                      ])}
                    </Text>
                  )}
                </View>

                {hasValue(education.institution) && (
                  <Text>{education.institution}</Text>
                )}

                {education.details
                  .map((item) => clean(item))
                  .filter(Boolean)
                  .map((item, detailIndex) => (
                    <Text
                      key={`education-${index}-detail-${detailIndex}`}
                      style={styles.bullet}
                    >
                      • {item}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        )}

        {/* CERTIFICATIONS */}
        {resume.certifications.length > 0 && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Certifications
              </Text>
            </View>

            {resume.certifications.map((certification, index) => (
              <View
                key={`certification-${index}`}
                style={styles.certificationItem}
                wrap={false}
              >
                <Text>
                  <Text style={styles.certificationName}>
                    {clean(certification.name)}
                  </Text>

                  {hasValue(certification.issuer) &&
                    ` — ${clean(certification.issuer)}`}

                  {hasValue(certification.date) &&
                    ` (${clean(certification.date)})`}
                </Text>

                {hasValue(certification.url) && (
                  <Link
                    src={
                      certification.url.startsWith("http")
                        ? certification.url
                        : `https://${certification.url}`
                    }
                    style={styles.link}
                  >
                    {certification.url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ACHIEVEMENTS */}
        {resume.achievements.length > 0 && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Achievements
              </Text>
            </View>

            {resume.achievements
              .map((item) => clean(item))
              .filter(Boolean)
              .map((item, index) => (
                <Text
                  key={`achievement-${index}`}
                  style={styles.bullet}
                >
                  • {item}
                </Text>
              ))}
          </View>
        )}

        {/* LANGUAGES */}
        {resume.languages.length > 0 && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Languages
              </Text>
            </View>

            <Text style={styles.simpleItem}>
              {resume.languages
                .map((language) => clean(language))
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>
        )}

        {/* ADDITIONAL SECTIONS */}
        {resume.additionalSections.length > 0 &&
          resume.additionalSections.map((section, index) => {
            const items = section.items
              .map((item) => clean(item))
              .filter(Boolean);

            if (!items.length) return null;

            return (
              <View key={`additional-${index}`}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {clean(section.title)}
                  </Text>
                </View>

                {items.map((item, itemIndex) => (
                  <Text
                    key={`additional-${index}-${itemIndex}`}
                    style={styles.bullet}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            );
          })}
      </Page>
    </Document>
  );
}