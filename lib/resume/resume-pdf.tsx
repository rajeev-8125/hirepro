import React from "react";

import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";

type ResumePDFProps = {
  resume: ResumeData;
  design: ResumeDesign;
  profilePhoto?: string | null;
};

function clean(value?: string | null) {
  return value?.trim() || "";
}

function spacingFor(
  density: ResumeDesign["density"],
) {
  if (density === "compact") {
    return {
      page: 30,
      section: 9,
      item: 5,
    };
  }

  if (density === "spacious") {
    return {
      page: 46,
      section: 15,
      item: 9,
    };
  }

  return {
    page: 38,
    section: 12,
    item: 7,
  };
}

function bodyFontSize(
  size: ResumeDesign["typography"]["bodySize"],
) {
  if (size === "small") return 8.2;
  if (size === "large") return 9.4;
  return 8.8;
}

function headingFontSize(
  size: ResumeDesign["typography"]["headingSize"],
) {
  if (size === "small") return 9;
  if (size === "large") return 11.5;
  return 10.2;
}

function photoRadius(
  shape: ResumeDesign["header"]["photo"]["shape"],
) {
  if (shape === "circle") {
    return 999;
  }

  if (shape === "rounded") {
    return 10;
  }

  return 0;
}

export function ResumePDF({
  resume,
  design,
  profilePhoto,
}: ResumePDFProps) {
  const spacing =
    spacingFor(design.density);

  const bodySize =
    bodyFontSize(
      design.typography.bodySize,
    );

  const headingSize =
    headingFontSize(
      design.typography.headingSize,
    );

  const colors =
    design.colors;

  const styles =
    StyleSheet.create({
      page: {
        paddingTop:
          spacing.page,

        paddingBottom:
          spacing.page,

        paddingLeft:
          spacing.page,

        paddingRight:
          spacing.page,

        backgroundColor:
          colors.background,

        color:
          colors.text,

        fontFamily:
          "Helvetica",

        fontSize:
          bodySize,

        lineHeight: 1.35,
      },

      header: {
        marginBottom: 15,

        paddingBottom: 12,

        borderBottomWidth:
          1,

        borderBottomColor:
          colors.primary,
      },

      headerRow: {
        flexDirection:
          "row",

        alignItems:
          "center",
      },

      headerContent: {
        flex: 1,
      },

      headerCentered: {
        alignItems:
          "center",

        textAlign:
          "center",
      },

      name: {
        fontFamily:
          "Helvetica-Bold",

        fontSize: 23,

        lineHeight: 1.05,

        color:
          colors.primary,

        letterSpacing:
          0.3,
      },

      headline: {
        marginTop: 4,

        fontSize:
          bodySize + 0.8,

        fontFamily:
          "Helvetica-Bold",

        color:
          colors.text,
      },

      contactRow: {
        marginTop: 7,

        flexDirection:
          "row",

        flexWrap:
          "wrap",

        gap: 4,

        alignItems:
          "center",
      },

      contact: {
        fontSize: 7.4,

        color:
          colors.mutedText,
      },

      contactSeparator: {
        fontSize: 7,

        color:
          colors.border,
      },

      links: {
        marginTop: 4,

        fontSize: 7.2,

        color:
          colors.primary,
      },

      photo: {
        width: 62,

        height: 62,

        marginLeft: 15,

        objectFit:
          "cover",

        borderWidth: 1,

        borderColor:
          colors.border,
      },

      section: {
        marginBottom:
          spacing.section,
      },

      sectionHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",

        marginBottom: 5,
      },

      sectionTitle: {
        fontFamily:
          "Helvetica-Bold",

        fontSize:
          headingSize,

        color:
          colors.primary,

        letterSpacing:
          0.8,

        textTransform:
          "uppercase",
      },

      sectionLine: {
        flex: 1,

        height:
          0.7,

        marginLeft:
          7,

        backgroundColor:
          colors.border,
      },

      summary: {
        fontSize:
          bodySize,

        color:
          colors.text,

        lineHeight:
          1.45,
      },

      skillRow: {
        marginBottom:
          2.5,

        flexDirection:
          "row",
      },

      skillCategory: {
        width:
          95,

        fontFamily:
          "Helvetica-Bold",

        color:
          colors.text,

        fontSize:
          bodySize,
      },

      skillValues: {
        flex: 1,

        color:
          colors.text,

        fontSize:
          bodySize,
      },

      experienceItem: {
        marginBottom:
          spacing.item,
      },

      jobHeader: {
        flexDirection:
          "row",

        justifyContent:
          "space-between",

        alignItems:
          "flex-start",

        gap: 10,
      },

      jobLeft: {
        flex: 1,
      },

      role: {
        fontFamily:
          "Helvetica-Bold",

        fontSize:
          bodySize + 0.7,

        color:
          colors.text,
      },

      company: {
        marginTop: 1,

        fontSize:
          bodySize,

        color:
          colors.primary,

        fontFamily:
          "Helvetica-Bold",
      },

      date: {
        width:
          100,

        textAlign:
          "right",

        fontSize: 7.3,

        color:
          colors.mutedText,
      },

      location: {
        marginTop: 1,

        fontSize:
          7.3,

        color:
          colors.mutedText,
      },

      bullet: {
        marginTop: 2,

        paddingLeft:
          9,

        fontSize:
          bodySize,

        lineHeight:
          1.35,

        color:
          colors.text,
      },

      educationItem: {
        marginBottom:
          spacing.item,
      },

      educationHeader: {
        flexDirection:
          "row",

        justifyContent:
          "space-between",

        gap: 10,
      },

      educationMain: {
        flex: 1,
      },

      degree: {
        fontFamily:
          "Helvetica-Bold",

        fontSize:
          bodySize + 0.4,

        color:
          colors.text,
      },

      institution: {
        marginTop: 1,

        fontSize:
          bodySize,

        color:
          colors.primary,

        fontFamily:
          "Helvetica-Bold",
      },

      educationDate: {
        width:
          95,

        textAlign:
          "right",

        fontSize: 7.3,

        color:
          colors.mutedText,
      },

      detail: {
        marginTop: 2,

        paddingLeft:
          9,

        fontSize:
          bodySize,

        color:
          colors.text,
      },

      projectItem: {
        marginBottom:
          spacing.item,
      },

      projectTitle: {
        fontFamily:
          "Helvetica-Bold",

        fontSize:
          bodySize + 0.5,

        color:
          colors.text,
      },

      projectDescription: {
        marginTop: 2,

        fontSize:
          bodySize,

        color:
          colors.text,

        lineHeight:
          1.4,
      },

      technologies: {
        marginTop: 2,

        fontSize:
          7.3,

        color:
          colors.primary,
      },

      certificationItem: {
        marginBottom: 4,
      },

      certificationName: {
        fontFamily:
          "Helvetica-Bold",

        fontSize:
          bodySize,

        color:
          colors.text,
      },

      certificationMeta: {
        marginTop: 1,

        fontSize: 7.3,

        color:
          colors.mutedText,
      },

      bulletListItem: {
        marginBottom: 2.5,

        paddingLeft: 9,

        fontSize:
          bodySize,

        color:
          colors.text,
      },

      footer: {
        position:
          "absolute",

        bottom: 15,

        left:
          spacing.page,

        right:
          spacing.page,

        textAlign:
          "center",

        fontSize: 6.5,

        color:
          colors.mutedText,
      },
    });

  const firstRole =
    clean(
      resume.experience?.[0]
        ?.role,
    );

  const showPhoto =
    Boolean(
      profilePhoto &&
        design.header.photo
          .enabled &&
        design.style !== "ats",
    );

  const contactParts = [
    clean(
      resume.personal.phone,
    ),

    clean(
      resume.personal.email,
    ),

    clean(
      resume.personal.location,
    ),
  ].filter(Boolean);

  const socialParts = [
    clean(
      resume.personal.linkedin,
    ),

    clean(
      resume.personal.github,
    ),

    clean(
      resume.personal.website,
    ),
  ].filter(Boolean);

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
      >
        <View
          style={styles.sectionHeader}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {title}
          </Text>

          <View
            style={
              styles.sectionLine
            }
          />
        </View>

        {children}
      </View>
    );
  }

  function renderSections() {
    const nodes: React.ReactNode[] =
      [];

    const order = [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "achievements",
      "languages",
    ];

    for (const section of order) {
      switch (section) {
        case "summary":
          if (
            !clean(
              resume.professionalSummary,
            )
          ) {
            continue;
          }

          nodes.push(
            <Section
              key="summary"
              title="Summary"
            >
              <Text
                style={
                  styles.summary
                }
              >
                {
                  resume.professionalSummary
                }
              </Text>
            </Section>,
          );

          break;

        case "skills":
          if (
            resume.skills.length ===
            0
          ) {
            continue;
          }

          nodes.push(
            <Section
              key="skills"
              title="Skills"
            >
              {resume.skills.map(
                (
                  group,
                  index,
                ) => {
                  const category =
                    clean(
                      group.category,
                    );

                  const values =
                    group.items
                      .map(
                        (item) =>
                          clean(item),
                      )
                      .filter(Boolean);

                  if (
                    !category &&
                    values.length ===
                      0
                  ) {
                    return null;
                  }

                  return (
                    <View
                      key={index}
                      style={
                        styles.skillRow
                      }
                    >
                      <Text
                        style={
                          styles.skillCategory
                        }
                      >
                        {category
                          ? `${category}:`
                          : ""}
                      </Text>

                      <Text
                        style={
                          styles.skillValues
                        }
                      >
                        {values.join(
                          ", ",
                        )}
                      </Text>
                    </View>
                  );
                },
              )}
            </Section>,
          );

          break;

        case "experience":
          if (
            resume.experience.length ===
            0
          ) {
            continue;
          }

          nodes.push(
            <Section
              key="experience"
              title="Experience"
            >
              {resume.experience.map(
                (
                  item,
                  index,
                ) => {
                  const role =
                    clean(
                      item.role,
                    );

                  const company =
                    clean(
                      item.company,
                    );

                  const date =
                    [
                      clean(
                        item.startDate,
                      ),
                      clean(
                        item.endDate,
                      ),
                    ]
                      .filter(Boolean)
                      .join(
                        " — ",
                      );

                  const location =
                    clean(
                      item.location,
                    );

                  return (
                    <View
                      key={index}
                      style={
                        styles.experienceItem
                      }
                    >
                      <View
                        style={
                          styles.jobHeader
                        }
                      >
                        <View
                          style={
                            styles.jobLeft
                          }
                        >
                          <Text
                            style={
                              styles.role
                            }
                          >
                            {role}
                          </Text>

                          {company && (
                            <Text
                              style={
                                styles.company
                              }
                            >
                              {company}
                            </Text>
                          )}
                        </View>

                        {date && (
                          <Text
                            style={
                              styles.date
                            }
                          >
                            {date}
                          </Text>
                        )}
                      </View>

                      {location && (
                        <Text
                          style={
                            styles.location
                          }
                        >
                          {location}
                        </Text>
                      )}

                      {item.responsibilities
                        .map(
                          (
                            responsibility,
                            bulletIndex,
                          ) => {
                            const value =
                              clean(
                                responsibility,
                              );

                            if (
                              !value
                            ) {
                              return null;
                            }

                            return (
                              <Text
                                key={
                                  bulletIndex
                                }
                                style={
                                  styles.bullet
                                }
                              >
                                •{" "}
                                {value}
                              </Text>
                            );
                          },
                        )}
                    </View>
                  );
                },
              )}
            </Section>,
          );

          break;

        case "projects":
          if (
            resume.projects.length ===
            0
          ) {
            continue;
          }

          nodes.push(
            <Section
              key="projects"
              title="Projects"
            >
              {resume.projects.map(
                (
                  item,
                  index,
                ) => (
                  <View
                    key={index}
                    style={
                      styles.projectItem
                    }
                  >
                    <Text
                      style={
                        styles.projectTitle
                      }
                    >
                      {
                        item.name
                      }
                    </Text>

                    {clean(
                      item.description,
                    ) && (
                      <Text
                        style={
                          styles.projectDescription
                        }
                      >
                        {
                          item.description
                        }
                      </Text>
                    )}

                    {item.technologies
                      .length >
                      0 && (
                      <Text
                        style={
                          styles.technologies
                        }
                      >
                        Technologies:{" "}
                        {item.technologies
                          .map(
                            (
                              technology,
                            ) =>
                              clean(
                                technology,
                              ),
                          )
                          .filter(
                            Boolean,
                          )
                          .join(
                            ", ",
                          )}
                      </Text>
                    )}

                    {clean(
                      item.url,
                    ) && (
                      <Link
                        src={
                          item.url
                        }
                        style={
                          styles.technologies
                        }
                      >
                        {
                          item.url
                        }
                      </Link>
                    )}
                  </View>
                ),
              )}
            </Section>,
          );

          break;

        case "education":
          if (
            resume.education.length ===
            0
          ) {
            continue;
          }

          nodes.push(
            <Section
              key="education"
              title="Education"
            >
              {resume.education.map(
                (
                  item,
                  index,
                ) => {
                  const degree =
                    [
                      clean(
                        item.degree,
                      ),
                      clean(
                        item.field,
                      ),
                    ]
                      .filter(Boolean)
                      .join(
                        " — ",
                      );

                  const dates =
                    [
                      clean(
                        item.startDate,
                      ),
                      clean(
                        item.endDate,
                      ),
                    ]
                      .filter(Boolean)
                      .join(
                        " — ",
                      );

                  return (
                    <View
                      key={index}
                      style={
                        styles.educationItem
                      }
                    >
                      <View
                        style={
                          styles.educationHeader
                        }
                      >
                        <View
                          style={
                            styles.educationMain
                          }
                        >
                          <Text
                            style={
                              styles.degree
                            }
                          >
                            {degree}
                          </Text>

                          <Text
                            style={
                              styles.institution
                            }
                          >
                            {
                              item.institution
                            }
                          </Text>
                        </View>

                        {dates && (
                          <Text
                            style={
                              styles.educationDate
                            }
                          >
                            {dates}
                          </Text>
                        )}
                      </View>

                      {item.details.map(
                        (
                          detail,
                          detailIndex,
                        ) => {
                          const value =
                            clean(
                              detail,
                            );

                          if (
                            !value
                          ) {
                            return null;
                          }

                          return (
                            <Text
                              key={
                                detailIndex
                              }
                              style={
                                styles.detail
                              }
                            >
                              •{" "}
                              {
                                value
                              }
                            </Text>
                          );
                        },
                      )}
                    </View>
                  );
                },
              )}
            </Section>,
          );

          break;

        case "certifications":
          if (
            resume.certifications
              .length ===
            0
          ) {
            continue;
          }

          nodes.push(
            <Section
              key="certifications"
              title="Certifications"
            >
              {resume.certifications.map(
                (
                  item,
                  index,
                ) => (
                  <View
                    key={index}
                    style={
                      styles.certificationItem
                    }
                  >
                    <Text
                      style={
                        styles.certificationName
                      }
                    >
                      {
                        item.name
                      }
                    </Text>

                    <Text
                      style={
                        styles.certificationMeta
                      }
                    >
                      {clean(
                        item.issuer,
                      )}
                      {clean(
                        item.date,
                      )
                        ? ` • ${item.date}`
                        : ""}
                    </Text>
                  </View>
                ),
              )}
            </Section>,
          );

          break;

        case "achievements":
          if (
            resume.achievements
              .length ===
            0
          ) {
            continue;
          }

          nodes.push(
            <Section
              key="achievements"
              title="Achievements"
            >
              {resume.achievements.map(
                (
                  achievement,
                  index,
                ) => {
                  const value =
                    clean(
                      achievement,
                    );

                  if (!value) {
                    return null;
                  }

                  return (
                    <Text
                      key={index}
                      style={
                        styles.bulletListItem
                      }
                    >
                      • {value}
                    </Text>
                  );
                },
              )}
            </Section>,
          );

          break;

        case "languages":
          if (
            resume.languages
              .length ===
            0
          ) {
            continue;
          }

          nodes.push(
            <Section
              key="languages"
              title="Languages"
            >
              <Text
                style={
                  styles.summary
                }
              >
                {resume.languages
                  .map(
                    (language) =>
                      clean(
                        language,
                      ),
                  )
                  .filter(
                    Boolean,
                  )
                  .join(
                    " • ",
                  )}
              </Text>
            </Section>,
          );

          break;
      }
    }

    return nodes;
  }

  return (
    <Document
      title={
        resume.personal.name
          ? `${resume.personal.name} Resume`
          : "HirePro Resume"
      }
      author="HirePro"
    >
      <Page
        size="A4"
        wrap
        style={
          styles.page
        }
      >
        <View
          style={
            styles.header
          }
        >
          <View
            style={[
              styles.headerRow,
              design.header.alignment ===
                "center"
                ? styles.headerCentered
                : {},
            ]}
          >
            <View
              style={
                styles.headerContent
              }
            >
              <Text
                style={
                  styles.name
                }
              >
                {clean(
                  resume.personal
                    .name,
                ) ||
                  "YOUR NAME"}
              </Text>

              {firstRole && (
                <Text
                  style={
                    styles.headline
                  }
                >
                  {firstRole}
                </Text>
              )}

              {contactParts.length >
                0 && (
                <View
                  style={
                    styles.contactRow
                  }
                >
                  {contactParts.map(
                    (
                      value,
                      index,
                    ) => (
                      <React.Fragment
                        key={
                          index
                        }
                      >
                        <Text
                          style={
                            styles.contact
                          }
                        >
                          {
                            value
                          }
                        </Text>

                        {index <
                          contactParts.length -
                            1 && (
                          <Text
                            style={
                              styles.contactSeparator
                            }
                          >
                            •
                          </Text>
                        )}
                      </React.Fragment>
                    ),
                  )}
                </View>
              )}

              {socialParts.length >
                0 && (
                <Text
                  style={
                    styles.links
                  }
                >
                  {socialParts.join(
                    " • ",
                  )}
                </Text>
              )}
            </View>

            {showPhoto && (
              <Image
                src={
                  profilePhoto!
                }
                style={[
                  styles.photo,
                  {
                    borderRadius:
                      photoRadius(
                        design.header
                          .photo
                          .shape,
                      ),
                  },
                ]}
              />
            )}
          </View>
        </View>

        {renderSections()}

        <Text
          fixed
          style={
            styles.footer
          }
          render={({
            pageNumber,
            totalPages,
          }) =>
            `HirePro • ${pageNumber}/${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}