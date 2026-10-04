import React from "react";
import { Document, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";

export type ResumePDFProps = {
  resume: ResumeData;
  design: ResumeDesign;
  profilePhoto?: string | null;
};

function clean(value?: string | null) { return value?.trim() || ""; }
function pdfFont(font: string, bold = false) {
  const f = font.toLowerCase();
  if (f.includes("times") || f.includes("georgia")) return bold ? "Times-Bold" : "Times-Roman";
  if (f.includes("courier")) return bold ? "Courier-Bold" : "Courier";
  return bold ? "Helvetica-Bold" : "Helvetica";
}

export function ResumePDF({ resume, design, profilePhoto }: ResumePDFProps) {
  const custom = design.custom ?? {};
  const templateId = custom.templateId ?? "blue-01";
  const infographic = templateId === "infographic-01" || templateId === "infographic-02";
  const sidebar = design.sidebar.enabled || templateId === "student" || templateId === "blue-03" || templateId === "blue-04" || infographic;
  const darkSidebar = infographic;
  const sidebarBg = darkSidebar ? "#111111" : templateId === "student" ? "#F3F4F6" : "#0F4C81";
  const sidebarText = darkSidebar || templateId.startsWith("blue-") ? "#FFFFFF" : "#111827";
  const accent = custom.primaryColor ?? design.colors.primary;
  const text = custom.textColor ?? design.colors.text;
  const muted = custom.mutedColor ?? design.colors.mutedText;
  const pageBg = custom.backgroundColor ?? "#FFFFFF";
  const bodySize = custom.bodySizePx ?? 9;
  const headingSize = custom.headingSizePx ?? 11;
  const lineHeight = custom.lineHeight ?? 1.4;
  const sectionGap = custom.sectionGapPx ?? 13;
  const itemGap = custom.itemGapPx ?? 7;
  const margin = custom.pageMarginPx ?? 36;
  const bodyFont = pdfFont(custom.bodyFont ?? design.typography.bodyFont);
  const bodyBold = pdfFont(custom.bodyFont ?? design.typography.bodyFont, true);
  const headingFont = pdfFont(custom.headingFont ?? design.typography.headingFont);
  const headingBold = pdfFont(custom.headingFont ?? design.typography.headingFont, true);

  const styles = StyleSheet.create({
    page: { padding: 0, backgroundColor: pageBg, color: text, fontFamily: bodyFont, fontSize: bodySize, lineHeight },
    outer: { flexDirection: "row", minHeight: 841.89 },
    sidebar: { width: 160, paddingTop: margin, paddingBottom: margin, paddingLeft: 22, paddingRight: 18, backgroundColor: sidebarBg, color: sidebarText },
    content: { flex: 1, paddingTop: margin, paddingBottom: margin, paddingLeft: sidebar ? margin - 6 : margin, paddingRight: margin },
    header: { paddingBottom: 12, marginBottom: 2, borderBottomWidth: 0.8, borderBottomColor: accent },
    name: { fontFamily: headingBold, fontSize: 24, lineHeight: 1, color: accent, letterSpacing: custom.letterSpacingPx ?? 0 },
    headline: { marginTop: 5, fontFamily: bodyBold, fontSize: bodySize + 1, color: text },
    contact: { marginTop: 6, fontSize: Math.max(7, bodySize - 1), color: muted },
    section: { marginBottom: sectionGap },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
    sectionTitle: { fontFamily: headingBold, fontSize: headingSize, color: accent, textTransform: custom.headingCase === "normal" ? "none" : "uppercase", letterSpacing: custom.letterSpacingPx ?? 0.5 },
    sectionLine: { flex: 1, height: 0.7, marginLeft: 7, backgroundColor: custom.borderColor ?? design.colors.border },
    body: { fontFamily: bodyFont, fontSize: bodySize, lineHeight, color: text },
    role: { fontFamily: bodyBold, fontSize: bodySize + 0.6, color: text },
    company: { marginTop: 1, fontFamily: bodyBold, color: accent, fontSize: bodySize },
    date: { width: 88, textAlign: "right", color: muted, fontSize: Math.max(6.5, bodySize - 1.5) },
    bullet: { marginTop: 2, paddingLeft: 9, fontSize: bodySize, lineHeight, color: text },
    sidebarName: { fontFamily: headingBold, fontSize: 16, color: sidebarText, textTransform: infographic ? "uppercase" : "none" },
    sidebarRole: { marginTop: 5, fontSize: 8.5, color: darkSidebar ? "#FFFFFF" : "#E2E8F0" },
    sidebarTitle: { marginTop: 18, marginBottom: 6, fontFamily: bodyBold, fontSize: 9, color: darkSidebar ? "#FFFFFF" : "#FFFFFF", textTransform: "uppercase", letterSpacing: 0.8 },
    sidebarText: { fontSize: 7.8, lineHeight: 1.4, color: sidebarText },
    sidebarItem: { marginBottom: 5, fontSize: 7.8, lineHeight: 1.35, color: sidebarText },
    photo: { width: 68, height: 68, objectFit: "cover", marginBottom: 10, borderWidth: 1.5, borderColor: accent },
  });

  const contact = [resume.personal.email, resume.personal.phone, resume.personal.location].filter(Boolean);
  const links = [resume.personal.linkedin, resume.personal.github, resume.personal.website].filter(Boolean);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section} wrap>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionLine} /></View>
      {children}
    </View>
  );

  const BulletList = ({ items, dark = false }: { items: string[]; dark?: boolean }) => (
    <View>{items.filter(Boolean).map((item, i) => <Text key={i} style={{ ...styles.bullet, color: dark ? sidebarText : text }}>• {item}</Text>)}</View>
  );

  const Sidebar = () => (
    <View style={styles.sidebar}>
      {profilePhoto && design.header.photo.enabled && <Image src={profilePhoto} style={{ ...styles.photo, borderRadius: design.header.photo.shape === "circle" ? 34 : design.header.photo.shape === "rounded" ? 8 : 0 }} />}
      <Text style={styles.sidebarName}>{clean(resume.personal.name) || "YOUR NAME"}</Text>
      <Text style={styles.sidebarRole}>{clean(resume.experience[0]?.role) || clean(resume.education[0]?.degree) || "Professional"}</Text>

      {contact.length > 0 && <><Text style={styles.sidebarTitle}>Contact</Text>{contact.map((x, i) => <Text key={i} style={styles.sidebarItem}>{x}</Text>)}</>}
      {links.length > 0 && <><Text style={styles.sidebarTitle}>Links</Text>{links.map((x, i) => <Link key={i} src={x.startsWith("http") ? x : `https://${x}`} style={styles.sidebarItem}>{x}</Link>)}</>}
      {resume.skills.length > 0 && <><Text style={styles.sidebarTitle}>Skills</Text>{resume.skills.flatMap((g) => g.items).filter(Boolean).map((x, i) => <Text key={i} style={styles.sidebarItem}>• {x}</Text>)}</>}
      {resume.languages.length > 0 && <><Text style={styles.sidebarTitle}>Languages</Text>{resume.languages.map((x, i) => <Text key={i} style={styles.sidebarItem}>{x}</Text>)}</>}
      {resume.certifications.length > 0 && <><Text style={styles.sidebarTitle}>Certifications</Text>{resume.certifications.map((x, i) => <Text key={i} style={styles.sidebarItem}>{x.name}{x.issuer ? ` — ${x.issuer}` : ""}</Text>)}</>}
      {resume.achievements.length > 0 && <><Text style={styles.sidebarTitle}>Achievements</Text>{resume.achievements.map((x, i) => <Text key={i} style={styles.sidebarItem}>• {x}</Text>)}</>}
    </View>
  );

  const MainContent = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{clean(resume.personal.name) || "YOUR NAME"}</Text>
            <Text style={styles.headline}>{clean(resume.experience[0]?.role) || clean(resume.education[0]?.degree) || "Professional"}</Text>
            {!sidebar && contact.length > 0 && <Text style={styles.contact}>{contact.join("  •  ")}</Text>}
            {!sidebar && links.length > 0 && <Text style={{ ...styles.contact, color: accent }}>{links.join("  •  ")}</Text>}
          </View>
          {profilePhoto && !sidebar && design.header.photo.enabled && <Image src={profilePhoto} style={{ ...styles.photo, borderRadius: design.header.photo.shape === "circle" ? 34 : design.header.photo.shape === "rounded" ? 8 : 0 }} />}
        </View>
      </View>

      {clean(resume.professionalSummary) && <Section title={templateId === "student" ? "Profile" : templateId.startsWith("infographic") ? "Summary" : "Professional Summary"}><Text style={styles.body}>{resume.professionalSummary}</Text></Section>}

      {!sidebar && resume.skills.length > 0 && <Section title="Skills"><View>{resume.skills.map((g, i) => <View key={i} style={{ flexDirection: "row", marginBottom: 2 }}><Text style={{ width: 90, ...styles.body, fontFamily: bodyBold }}>{g.category}</Text><Text style={{ flex: 1, ...styles.body }}>{g.items.join(", ")}</Text></View>)}</View></Section>}

      {resume.experience.length > 0 && <Section title={templateId.startsWith("infographic") ? "Professional Experience" : "Experience"}>{resume.experience.map((item, i) => <View key={i} style={{ marginBottom: itemGap }} wrap><View style={{ flexDirection: "row", gap: 8 }}><View style={{ flex: 1 }}><Text style={styles.role}>{item.role}</Text><Text style={styles.company}>{item.company}{item.location ? ` · ${item.location}` : ""}</Text></View><Text style={styles.date}>{[item.startDate, item.endDate].filter(Boolean).join(" — ")}</Text></View><BulletList items={item.responsibilities} /></View>)}</Section>}

      {resume.projects.length > 0 && <Section title="Projects">{resume.projects.map((item, i) => <View key={i} style={{ marginBottom: itemGap }}><Text style={styles.role}>{item.name}</Text><Text style={{ ...styles.body, marginTop: 2 }}>{item.description}</Text>{item.technologies.length > 0 && <Text style={{ ...styles.body, marginTop: 2, color: accent }}>{item.technologies.join(" · ")}</Text>}</View>)}</Section>}

      {resume.education.length > 0 && <Section title="Education">{resume.education.map((item, i) => <View key={i} style={{ marginBottom: itemGap }}><View style={{ flexDirection: "row" }}><View style={{ flex: 1 }}><Text style={styles.role}>{[item.degree, item.field].filter(Boolean).join(" — ")}</Text><Text style={styles.company}>{item.institution}</Text></View><Text style={styles.date}>{[item.startDate, item.endDate].filter(Boolean).join(" — ")}</Text></View>{item.details.length > 0 && <BulletList items={item.details} />}</View>)}</Section>}

      {resume.certifications.length > 0 && !sidebar && <Section title="Certifications">{resume.certifications.map((item, i) => <Text key={i} style={{ ...styles.body, marginBottom: 3 }}><Text style={{ fontFamily: bodyBold }}>{item.name}</Text>{item.issuer ? ` — ${item.issuer}` : ""}{item.date ? ` (${item.date})` : ""}</Text>)}</Section>}
      {resume.achievements.length > 0 && !sidebar && <Section title="Key Achievements"><BulletList items={resume.achievements} /></Section>}
      {resume.languages.length > 0 && !sidebar && <Section title="Languages"><Text style={styles.body}>{resume.languages.join(", ")}</Text></Section>}
      {resume.additionalSections.map((section, i) => section.items.length > 0 && <Section key={i} title={section.title}><BulletList items={section.items} /></Section>)}
    </View>
  );

  return <Document><Page size="A4" style={styles.page}>{sidebar ? <View style={styles.outer}><Sidebar /><MainContent /></View> : <MainContent />}</Page></Document>;
}
