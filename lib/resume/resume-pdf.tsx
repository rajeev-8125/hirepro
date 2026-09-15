import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";

type ResumePDFProps = {
  resume: ResumeData;
  design: ResumeDesign;
  profilePhoto?: string | null;
};

function getSpacing(
  density: ResumeDesign["density"]
) {
  if (density === "compact") {
    return {
      pagePadding: 34,
      sectionGap: 10,
      itemGap: 7,
    };
  }

  if (density === "spacious") {
    return {
      pagePadding: 48,
      sectionGap: 17,
      itemGap: 11,
    };
  }

  return {
    pagePadding: 42,
    sectionGap: 13,
    itemGap: 9,
  };
}

function getFontSize(
  size: "small" | "medium" | "large"
) {
  if (size === "small") return 8.5;
  if (size === "large") return 10;
  return 9;
}

export function ResumePDF({
  resume,
  design,
  profilePhoto,
}: ResumePDFProps) {
  const spacing = getSpacing(
    design.density
  );

  const bodySize = getFontSize(
    design.typography.bodySize
  );

  const headingSize =
    design.typography.headingSize ===
    "small"
      ? 9
      : design.typography.headingSize ===
        "large"
      ? 13
      : 11;

  const colors = design.colors;

  const styles = StyleSheet.create({
    page: {
      padding: spacing.pagePadding,
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: "Helvetica",
      fontSize: bodySize,
      lineHeight: 1.45,
    },

    header: {
      borderBottomWidth:
        design.visual.borderStyle ===
        "none"
          ? 0
          : design.visual.borderStyle ===
            "strong"
          ? 1.5
          : 0.7,
      borderBottomColor: colors.border,
      paddingBottom: 14,
      marginBottom: 16,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    headerCenter: {
      alignItems: "center",
      textAlign: "center",
    },

    headerInfo: {
      flex: 1,
    },

    name: {
      fontSize: 22,
      fontFamily: "Helvetica-Bold",
      color: colors.primary,
      marginBottom: 5,
    },

    contact: {
      fontSize: 8,
      color: colors.mutedText,
      marginTop: 2,
    },

    links: {
      fontSize: 7.5,
      color: colors.primary,
      marginTop: 3,
    },

    photo: {
      width:
        design.header.photo.size ===
        "small"
          ? 48
          : design.header.photo.size ===
            "large"
          ? 78
          : 62,

      height:
        design.header.photo.size ===
        "small"
          ? 48
          : design.header.photo.size ===
            "large"
          ? 78
          : 62,

      marginRight:
        design.header.photo.position ===
        "left"
          ? 14
          : 0,

      marginLeft:
        design.header.photo.position ===
        "right"
          ? 14
          : 0,

      objectFit: "cover",
    },

    section: {
      marginBottom: spacing.sectionGap,
    },

    sectionTitle: {
      fontSize: headingSize,
      fontFamily: "Helvetica-Bold",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 5,
      paddingBottom:
        design.visual.accentStyle ===
        "line"
          ? 3
          : 0,
      borderBottomWidth:
        design.visual.accentStyle ===
        "line"
          ? 0.7
          : 0,
      borderBottomColor: colors.border,
    },

    summary: {
      fontSize: bodySize,
      color: colors.text,
      lineHeight: 1.5,
    },

    skillCategory: {
      fontFamily: "Helvetica-Bold",
      fontSize: bodySize,
      color: colors.text,
      marginBottom: 1,
    },

    skillItems: {
      fontSize: bodySize,
      color: colors.mutedText,
      marginBottom: 4,
    },

    experienceItem: {
      marginBottom: spacing.itemGap,
    },

    role: {
      fontSize: bodySize + 0.5,
      fontFamily: "Helvetica-Bold",
      color: colors.text,
    },

    company: {
      fontSize: bodySize,
      color: colors.primary,
      marginTop: 1,
    },

    date: {
      fontSize: 7.5,
      color: colors.mutedText,
      marginTop: 2,
    },

    location: {
      fontSize: 7.5,
      color: colors.mutedText,
      marginTop: 1,
    },

    bullet: {
      fontSize: bodySize,
      color: colors.text,
      marginTop: 2,
      paddingLeft: 8,
    },

    educationTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: bodySize + 0.3,
      color: colors.text,
    },

    educationInstitution: {
      fontSize: bodySize,
      color: colors.primary,
      marginTop: 1,
    },

    educationDetails: {
      fontSize: 7.5,
      color: colors.mutedText,
      marginTop: 2,
    },

    projectTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: bodySize + 0.3,
      color: colors.text,
    },

    projectDescription: {
      fontSize: bodySize,
      color: colors.text,
      marginTop: 2,
      lineHeight: 1.4,
    },

    technologies: {
      fontSize: 7.5,
      color: colors.primary,
      marginTop: 3,
    },

    certificationName: {
      fontFamily: "Helvetica-Bold",
      fontSize: bodySize,
      color: colors.text,
    },

    certificationMeta: {
      fontSize: 7.5,
      color: colors.mutedText,
      marginTop: 1,
    },

    bulletList: {
      marginTop: 2,
    },

    bulletListItem: {
      fontSize: bodySize,
      color: colors.text,
      marginBottom: 3,
      paddingLeft: 8,
    },

    twoColumn: {
      flexDirection: "row",
      gap: 18,
    },

    mainColumn: {
      flex: 1,
    },

    sidebar: {
      width: 155,
      borderLeftWidth: 0.7,
      borderLeftColor: colors.border,
      paddingLeft: 14,
    },
  });

  function Section({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <View
        style={styles.section}
        wrap={false}
      >
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {children}
      </View>
    );
  }

  function renderSection(
    section: string
  ): React.ReactNode {
    switch (section) {
      case "summary":
        if (!resume.professionalSummary)
          return null;

        return (
          <Section
            key="summary"
            title="Professional Summary"
          >
            <Text style={styles.summary}>
              {resume.professionalSummary}
            </Text>
          </Section>
        );

      case "skills":
        if (!resume.skills.length)
          return null;

        return (
          <Section
            key="skills"
            title="Skills"
          >
            {resume.skills.map(
              (group, index) => (
                <View key={index}>
                  <Text
                    style={
                      styles.skillCategory
                    }
                  >
                    {group.category}
                  </Text>

                  <Text
                    style={
                      styles.skillItems
                    }
                  >
                    {group.items.join(
                      " • "
                    )}
                  </Text>
                </View>
              )
            )}
          </Section>
        );

      case "experience":
        if (!resume.experience.length)
          return null;

        return (
          <Section
            key="experience"
            title="Experience"
          >
            {resume.experience.map(
              (item, index) => (
                <View
                  key={index}
                  style={
                    styles.experienceItem
                  }
                  wrap={false}
                >
                  <Text
                    style={styles.role}
                  >
                    {item.role}
                  </Text>

                  <Text
                    style={styles.company}
                  >
                    {item.company}
                  </Text>

                  {(item.startDate ||
                    item.endDate) && (
                    <Text
                      style={styles.date}
                    >
                      {item.startDate}
                      {item.startDate ||
                      item.endDate
                        ? " — "
                        : ""}
                      {item.endDate}
                    </Text>
                  )}

                  {item.location && (
                    <Text
                      style={
                        styles.location
                      }
                    >
                      {item.location}
                    </Text>
                  )}

                  {item.responsibilities.map(
                    (
                      responsibility,
                      responsibilityIndex
                    ) => (
                      <Text
                        key={
                          responsibilityIndex
                        }
                        style={
                          styles.bullet
                        }
                      >
                        • {responsibility}
                      </Text>
                    )
                  )}
                </View>
              )
            )}
          </Section>
        );

      case "education":
        if (!resume.education.length)
          return null;

        return (
          <Section
            key="education"
            title="Education"
          >
            {resume.education.map(
              (item, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom:
                      spacing.itemGap,
                  }}
                  wrap={false}
                >
                  <Text
                    style={
                      styles.educationTitle
                    }
                  >
                    {item.degree}
                    {item.field
                      ? ` — ${item.field}`
                      : ""}
                  </Text>

                  <Text
                    style={
                      styles.educationInstitution
                    }
                  >
                    {item.institution}
                  </Text>

                  {(item.startDate ||
                    item.endDate) && (
                    <Text
                      style={
                        styles.educationDetails
                      }
                    >
                      {item.startDate}
                      {item.startDate ||
                      item.endDate
                        ? " — "
                        : ""}
                      {item.endDate}
                    </Text>
                  )}

                  {item.details.map(
                    (detail, i) => (
                      <Text
                        key={i}
                        style={
                          styles.bullet
                        }
                      >
                        • {detail}
                      </Text>
                    )
                  )}
                </View>
              )
            )}
          </Section>
        );

      case "projects":
        if (!resume.projects.length)
          return null;

        return (
          <Section
            key="projects"
            title="Projects"
          >
            {resume.projects.map(
              (item, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom:
                      spacing.itemGap,
                  }}
                  wrap={false}
                >
                  <Text
                    style={
                      styles.projectTitle
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.projectDescription
                    }
                  >
                    {item.description}
                  </Text>

                  {item.technologies
                    .length > 0 && (
                    <Text
                      style={
                        styles.technologies
                      }
                    >
                      {item.technologies.join(
                        " • "
                      )}
                    </Text>
                  )}

                  {item.url && (
                    <Text
                      style={
                        styles.technologies
                      }
                    >
                      {item.url}
                    </Text>
                  )}
                </View>
              )
            )}
          </Section>
        );

      case "certifications":
        if (
          !resume.certifications.length
        )
          return null;

        return (
          <Section
            key="certifications"
            title="Certifications"
          >
            {resume.certifications.map(
              (item, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: 5,
                  }}
                >
                  <Text
                    style={
                      styles.certificationName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.certificationMeta
                    }
                  >
                    {item.issuer}
                    {item.date
                      ? ` • ${item.date}`
                      : ""}
                  </Text>
                </View>
              )
            )}
          </Section>
        );

      case "achievements":
        if (!resume.achievements.length)
          return null;

        return (
          <Section
            key="achievements"
            title="Achievements"
          >
            {resume.achievements.map(
              (achievement, index) => (
                <Text
                  key={index}
                  style={
                    styles.bulletListItem
                  }
                >
                  • {achievement}
                </Text>
              )
            )}
          </Section>
        );

      case "languages":
        if (!resume.languages.length)
          return null;

        return (
          <Section
            key="languages"
            title="Languages"
          >
            <Text
              style={styles.summary}
            >
              {resume.languages.join(
                " • "
              )}
            </Text>
          </Section>
        );

      default:
        return null;
    }
  }

  const sidebarSections =
    design.sidebar.enabled
      ? design.sidebar.sections
      : [];

  const mainSections =
    design.sections.order.filter(
      (section) =>
        !sidebarSections.includes(
          section as never
        )
    );

  const showPhoto =
    design.header.photo.enabled &&
    Boolean(profilePhoto);

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View
            style={[
              styles.headerRow,
              design.header.alignment ===
                "center"
                ? styles.headerCenter
                : {},
            ]}
          >
            {showPhoto &&
              design.header.photo
                .position === "left" && (
                <Image
                  src={profilePhoto!}
                  style={styles.photo}
                />
              )}

            <View
              style={styles.headerInfo}
            >
              <Text style={styles.name}>
                {resume.personal.name ||
                  "Your Name"}
              </Text>

              {resume.personal
                .email && (
                <Text
                  style={styles.contact}
                >
                  {resume.personal.email}
                  {resume.personal.phone
                    ? ` • ${resume.personal.phone}`
                    : ""}
                  {resume.personal.location
                    ? ` • ${resume.personal.location}`
                    : ""}
                </Text>
              )}

              <Text
                style={styles.links}
              >
                {[
                  resume.personal
                    .linkedin,
                  resume.personal.github,
                  resume.personal.website,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>
            </View>

            {showPhoto &&
              design.header.photo
                .position === "right" && (
                <Image
                  src={profilePhoto!}
                  style={styles.photo}
                />
              )}
          </View>

          {showPhoto &&
            design.header.photo
              .position === "center" && (
              <View
                style={{
                  alignItems:
                    "center",
                  marginTop: 8,
                }}
              >
                <Image
                  src={profilePhoto!}
                  style={{
                    ...styles.photo,
                    marginLeft: 0,
                    marginRight: 0,
                  }}
                />
              </View>
            )}
        </View>

        {/* BODY */}
        {design.layout ===
          "two-column" &&
        design.sidebar.enabled ? (
          <View
            style={styles.twoColumn}
          >
            <View
              style={styles.mainColumn}
            >
              {mainSections.map(
                renderSection
              )}
            </View>

            <View
              style={styles.sidebar}
            >
              {sidebarSections.map(
                renderSection
              )}
            </View>
          </View>
        ) : (
          <View>
            {mainSections.map(
              renderSection
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}