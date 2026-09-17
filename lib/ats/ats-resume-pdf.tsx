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

export type ResumePageCount = 1 | 2 | 3;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.45,
  },

  pageOne: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 38,
    paddingRight: 38,
    fontSize: 8.3,
    lineHeight: 1.28,
  },

  pageTwo: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 46,
    paddingRight: 46,
    fontSize: 9.2,
    lineHeight: 1.4,
  },

  pageThree: {
    paddingTop: 44,
    paddingBottom: 44,
    paddingLeft: 52,
    paddingRight: 52,
    fontSize: 10,
    lineHeight: 1.5,
  },

  header: {
    marginBottom: 14,
  },

  headerOne: {
    marginBottom: 9,
  },

  headerTwo: {
    marginBottom: 13,
  },

  headerThree: {
    marginBottom: 17,
  },

  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },

  nameOne: {
    fontSize: 17,
    marginBottom: 3,
  },

  nameTwo: {
    fontSize: 20,
    marginBottom: 5,
  },

  nameThree: {
    fontSize: 22,
    marginBottom: 6,
  },

  contact: {
    fontSize: 8.5,
    lineHeight: 1.4,
  },

  contactOne: {
    fontSize: 7.4,
    lineHeight: 1.25,
  },

  contactTwo: {
    fontSize: 8.3,
    lineHeight: 1.35,
  },

  contactThree: {
    fontSize: 9,
    lineHeight: 1.45,
  },

  section: {
    marginTop: 11,
    marginBottom: 3,
  },

  sectionOne: {
    marginTop: 7,
    marginBottom: 2,
  },

  sectionTwo: {
    marginTop: 10,
    marginBottom: 3,
  },

  sectionThree: {
    marginTop: 13,
    marginBottom: 4,
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

  sectionTitleOne: {
    fontSize: 9,
    marginBottom: 3,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
  },

  sectionTitleTwo: {
    fontSize: 10.2,
    marginBottom: 4,
    paddingBottom: 3,
  },

  sectionTitleThree: {
    fontSize: 11.2,
    marginBottom: 5,
    paddingBottom: 4,
  },

  summary: {
    marginBottom: 3,
  },

  summaryOne: {
    marginBottom: 2,
  },

  summaryTwo: {
    marginBottom: 3,
  },

  summaryThree: {
    marginBottom: 5,
  },

  skillRow: {
    marginBottom: 2,
  },

  skillRowOne: {
    marginBottom: 1,
  },

  skillRowTwo: {
    marginBottom: 2,
  },

  skillRowThree: {
    marginBottom: 3,
  },

  skillCategory: {
    fontFamily: "Helvetica-Bold",
  },

  experienceItem: {
    marginBottom: 8,
  },

  experienceItemOne: {
    marginBottom: 4,
  },

  experienceItemTwo: {
    marginBottom: 7,
  },

  experienceItemThree: {
    marginBottom: 10,
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

  roleOne: {
    fontSize: 8.8,
  },

  roleTwo: {
    fontSize: 9.8,
  },

  roleThree: {
    fontSize: 10.5,
  },

  dates: {
    fontSize: 8.5,
  },

  datesOne: {
    fontSize: 7.4,
  },

  datesTwo: {
    fontSize: 8.3,
  },

  datesThree: {
    fontSize: 9,
  },

  company: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },

  companyOne: {
    marginBottom: 1,
  },

  companyTwo: {
    marginBottom: 2,
  },

  companyThree: {
    marginBottom: 3,
  },

  location: {
    fontSize: 8.5,
  },

  locationOne: {
    fontSize: 7.4,
  },

  locationTwo: {
    fontSize: 8.2,
  },

  locationThree: {
    fontSize: 9,
  },

  bullet: {
    marginLeft: 10,
    marginBottom: 1.5,
  },

  bulletOne: {
    marginLeft: 8,
    marginBottom: 0.8,
  },

  bulletTwo: {
    marginLeft: 10,
    marginBottom: 1.5,
  },

  bulletThree: {
    marginLeft: 11,
    marginBottom: 2,
  },

  educationItem: {
    marginBottom: 6,
  },

  educationItemOne: {
    marginBottom: 3,
  },

  educationItemTwo: {
    marginBottom: 5,
  },

  educationItemThree: {
    marginBottom: 8,
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

  projectItemOne: {
    marginBottom: 4,
  },

  projectItemTwo: {
    marginBottom: 6,
  },

  projectItemThree: {
    marginBottom: 9,
  },

  projectName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 1,
  },

  projectNameOne: {
    fontSize: 8.8,
  },

  projectNameTwo: {
    fontSize: 9.8,
  },

  projectNameThree: {
    fontSize: 10.5,
  },

  technologies: {
    fontSize: 8.5,
    marginTop: 2,
  },

  technologiesOne: {
    fontSize: 7.4,
    marginTop: 1,
  },

  technologiesTwo: {
    fontSize: 8.2,
    marginTop: 2,
  },

  technologiesThree: {
    fontSize: 9,
    marginTop: 3,
  },

  certificationItem: {
    marginBottom: 4,
  },

  certificationItemOne: {
    marginBottom: 2,
  },

  certificationItemTwo: {
    marginBottom: 4,
  },

  certificationItemThree: {
    marginBottom: 6,
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

  simpleItemOne: {
    marginBottom: 1,
  },

  simpleItemTwo: {
    marginBottom: 2,
  },

  simpleItemThree: {
    marginBottom: 3,
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
  if (!hasValue(value)) {
    return null;
  }

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

function getDensityStyles(pageCount: ResumePageCount) {
  if (pageCount === 1) {
    return {
      page: styles.pageOne,
      header: styles.headerOne,
      name: styles.nameOne,
      contact: styles.contactOne,
      section: styles.sectionOne,
      sectionTitle: styles.sectionTitleOne,
      summary: styles.summaryOne,
      skillRow: styles.skillRowOne,
      experienceItem: styles.experienceItemOne,
      role: styles.roleOne,
      dates: styles.datesOne,
      company: styles.companyOne,
      location: styles.locationOne,
      bullet: styles.bulletOne,
      educationItem: styles.educationItemOne,
      projectItem: styles.projectItemOne,
      projectName: styles.projectNameOne,
      technologies: styles.technologiesOne,
      certificationItem: styles.certificationItemOne,
      simpleItem: styles.simpleItemOne,
    };
  }

  if (pageCount === 3) {
    return {
      page: styles.pageThree,
      header: styles.headerThree,
      name: styles.nameThree,
      contact: styles.contactThree,
      section: styles.sectionThree,
      sectionTitle: styles.sectionTitleThree,
      summary: styles.summaryThree,
      skillRow: styles.skillRowThree,
      experienceItem: styles.experienceItemThree,
      role: styles.roleThree,
      dates: styles.datesThree,
      company: styles.companyThree,
      location: styles.locationThree,
      bullet: styles.bulletThree,
      educationItem: styles.educationItemThree,
      projectItem: styles.projectItemThree,
      projectName: styles.projectNameThree,
      technologies: styles.technologiesThree,
      certificationItem: styles.certificationItemThree,
      simpleItem: styles.simpleItemThree,
    };
  }

  return {
    page: styles.pageTwo,
    header: styles.headerTwo,
    name: styles.nameTwo,
    contact: styles.contactTwo,
    section: styles.sectionTwo,
    sectionTitle: styles.sectionTitleTwo,
    summary: styles.summaryTwo,
    skillRow: styles.skillRowTwo,
    experienceItem: styles.experienceItemTwo,
    role: styles.roleTwo,
    dates: styles.datesTwo,
    company: styles.companyTwo,
    location: styles.locationTwo,
    bullet: styles.bulletTwo,
    educationItem: styles.educationItemTwo,
    projectItem: styles.projectItemTwo,
    projectName: styles.projectNameTwo,
    technologies: styles.technologiesTwo,
    certificationItem: styles.certificationItemTwo,
    simpleItem: styles.simpleItemTwo,
  };
}

export function ATSResumePDF({
  resume,
  pageCount = 2,
}: {
  resume: ResumeData;
  pageCount?: ResumePageCount;
}) {
  const personal = resume.personal;

  const density = getDensityStyles(pageCount);

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
      <Page size="A4" style={[styles.page, density.page]} wrap>
        {/* HEADER */}
        <View style={[styles.header, density.header]}>
          {hasValue(personal.name) && (
            <Text style={[styles.name, density.name]}>
              {personal.name}
            </Text>
          )}

          {contactParts.length > 0 && (
            <Text style={[styles.contact, density.contact]}>
              {contactParts.join(" | ")}
            </Text>
          )}

          {(hasValue(personal.linkedin) ||
            hasValue(personal.github) ||
            hasValue(personal.website)) && (
            <Text style={[styles.contact, density.contact]}>
              {hasValue(personal.linkedin) && (
                <ContactLink
                  label="LinkedIn"
                  value={personal.linkedin}
                />
              )}

              {hasValue(personal.linkedin) &&
                (hasValue(personal.github) ||
                  hasValue(personal.website)) &&
                " | "}

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
            <View style={[styles.section, density.section]}>
              <Text
                style={[
                  styles.sectionTitle,
                  density.sectionTitle,
                ]}
              >
                Professional Summary
              </Text>
            </View>

            <Text style={[styles.summary, density.summary]}>
              {resume.professionalSummary}
            </Text>
          </View>
        )}

        {/* SKILLS */}
        {resume.skills.length > 0 && (
          <View>
            <View style={[styles.section, density.section]}>
              <Text
                style={[
                  styles.sectionTitle,
                  density.sectionTitle,
                ]}
              >
                Skills
              </Text>
            </View>

            {resume.skills.map((skill, index) => {
              const items = skill.items
                .map((item) => clean(item))
                .filter(Boolean);

              if (!items.length) {
                return null;
              }

              const category = clean(skill.category);

              return (
                <Text
                  key={`skill-${index}`}
                  style={[styles.skillRow, density.skillRow]}
                >
                  {category && (
                    <Text style={styles.skillCategory}>
                      {category}:{" "}
                    </Text>
                  )}

                  {items.join(", ")}
                </Text>
              );
            })}
          </View>
        )}

        {/* EXPERIENCE */}
        {resume.experience.length > 0 && (
          <View>
            <View style={[styles.section, density.section]}>
              <Text
                style={[
                  styles.sectionTitle,
                  density.sectionTitle,
                ]}
              >
                Experience
              </Text>
            </View>

            {resume.experience.map((experience, index) => (
              <View
                key={`experience-${index}`}
                style={[
                  styles.experienceItem,
                  density.experienceItem,
                ]}
                wrap={false}
              >
                <View style={styles.experienceHeader}>
                  <Text style={[styles.role, density.role]}>
                    {clean(experience.role)}
                  </Text>

                  {(hasValue(experience.startDate) ||
                    hasValue(experience.endDate)) && (
                    <Text
                      style={[
                        styles.dates,
                        density.dates,
                      ]}
                    >
                      {joinNonEmpty([
                        experience.startDate,
                        experience.endDate,
                      ])}
                    </Text>
                  )}
                </View>

                {hasValue(experience.company) && (
                  <Text
                    style={[
                      styles.company,
                      density.company,
                    ]}
                  >
                    {experience.company}
                  </Text>
                )}

                {hasValue(experience.location) && (
                  <Text
                    style={[
                      styles.location,
                      density.location,
                    ]}
                  >
                    {experience.location}
                  </Text>
                )}

                {experience.responsibilities
                  .map((item) => clean(item))
                  .filter(Boolean)
                  .map((item, bulletIndex) => (
                    <Text
                      key={`experience-${index}-bullet-${bulletIndex}`}
                      style={[styles.bullet, density.bullet]}
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
            <View style={[styles.section, density.section]}>
              <Text
                style={[
                  styles.sectionTitle,
                  density.sectionTitle,
                ]}
              >
                Projects
              </Text>
            </View>

            {resume.projects.map((project, index) => (
              <View
                key={`project-${index}`}
                style={[
                  styles.projectItem,
                  density.projectItem,
                ]}
                wrap={false}
              >
                <Text
                  style={[
                    styles.projectName,
                    density.projectName,
                  ]}
                >
                  {clean(project.name)}
                </Text>

                {hasValue(project.description) && (
                  <Text>{project.description}</Text>
                )}

                {project.technologies.filter(Boolean).length > 0 && (
                  <Text
                    style={[
                      styles.technologies,
                      density.technologies,
                    ]}
                  >
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
            <View style={[styles.section, density.section]}>
              <Text
                style={[
                  styles.sectionTitle,
                  density.sectionTitle,
                ]}
              >
                Education
              </Text>
            </View>

            {resume.education.map((education, index) => (
              <View
                key={`education-${index}`}
                style={[
                  styles.educationItem,
                  density.educationItem,
                ]}
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
                    <Text
                      style={[
                        styles.dates,
                        density.dates,
                      ]}
                    >
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
                      style={[styles.bullet, density.bullet]}
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
            <View style={[styles.section, density.section]}>
              <Text
                style={[
                  styles.sectionTitle,
                  density.sectionTitle,
                ]}
              >
                Certifications
              </Text>
            </View>

            {resume.certifications.map((certification, index) => (
              <View
                key={`certification-${index}`}
                style={[
                  styles.certificationItem,
                  density.certificationItem,
                ]}
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
            <View style={[styles.section, density.section]}>
              <Text
                style={[
                  styles.sectionTitle,
                  density.sectionTitle,
                ]}
              >
                Achievements
              </Text>
            </View>

            {resume.achievements
              .map((item) => clean(item))
              .filter(Boolean)
              .map((item, index) => (
                <Text
                  key={`achievement-${index}`}
                  style={[styles.bullet, density.bullet]}
                >
                  • {item}
                </Text>
              ))}
          </View>
        )}

        {/* LANGUAGES */}
        {resume.languages.length > 0 && (
          <View>
            <View style={[styles.section, density.section]}>
              <Text
                style={[
                  styles.sectionTitle,
                  density.sectionTitle,
                ]}
              >
                Languages
              </Text>
            </View>

            <Text
              style={[
                styles.simpleItem,
                density.simpleItem,
              ]}
            >
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

            if (!items.length) {
              return null;
            }

            return (
              <View key={`additional-${index}`}>
                <View style={[styles.section, density.section]}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      density.sectionTitle,
                    ]}
                  >
                    {clean(section.title)}
                  </Text>
                </View>

                {items.map((item, itemIndex) => (
                  <Text
                    key={`additional-${index}-${itemIndex}`}
                    style={[styles.bullet, density.bullet]}
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