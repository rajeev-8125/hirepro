import type { ResumeDesign } from "@/lib/ai/resume-design-schema";
import type { ResumeTemplateId } from "./template-types";

const sections = ["summary", "skills", "experience", "projects", "education", "certifications", "achievements", "languages"] as const;

const base = (overrides: Partial<ResumeDesign>): ResumeDesign => ({
  layout: "single-column",
  density: "balanced",
  style: "professional",
  colors: {
    primary: "#1D4ED8",
    secondary: "#2563EB",
    text: "#111827",
    mutedText: "#64748B",
    background: "#FFFFFF",
    border: "#CBD5E1",
  },
  typography: {
    headingFont: "Arial",
    bodyFont: "Arial",
    headingSize: "medium",
    bodySize: "medium",
  },
  header: {
    alignment: "left",
    photo: { enabled: false, position: "right", shape: "circle", size: "small" },
  },
  sections: {
    order: [...sections],
    emphasis: ["experience", "skills", "education"],
  },
  sidebar: { enabled: false, sections: [] },
  visual: { borderStyle: "subtle", cardStyle: "none", accentStyle: "line" },
  ats: { safe: true, tablesUsed: false, graphicsUsed: false, recommendedForATS: true },
  ...overrides,
});

export const TEMPLATE_DESIGNS: Record<ResumeTemplateId, ResumeDesign> = {
  "blue-01": base({
    style: "ats",
    density: "compact",
    colors: { primary: "#1D4ED8", secondary: "#2563EB", text: "#0F172A", mutedText: "#64748B", background: "#FFFFFF", border: "#CBD5E1" },
    typography: { headingFont: "Arial", bodyFont: "Arial", headingSize: "medium", bodySize: "small" },
    header: { alignment: "left", photo: { enabled: false, position: "right", shape: "square", size: "small" } },
  }),
  "blue-02": base({
    style: "professional",
    colors: { primary: "#1E40AF", secondary: "#2563EB", text: "#172033", mutedText: "#64748B", background: "#FFFFFF", border: "#CBD5E1" },
    typography: { headingFont: "Georgia", bodyFont: "Arial", headingSize: "medium", bodySize: "medium" },
  }),
  "blue-03": base({
    style: "professional",
    layout: "two-column",
    colors: { primary: "#2563EB", secondary: "#1D4ED8", text: "#172033", mutedText: "#64748B", background: "#FFFFFF", border: "#CBD5E1" },
    sidebar: { enabled: true, sections: ["skills", "languages", "education", "certifications"] },
    header: { alignment: "left", photo: { enabled: false, position: "left", shape: "square", size: "small" } },
  }),
  "blue-04": base({
    style: "modern",
    layout: "two-column",
    colors: { primary: "#0F4C81", secondary: "#2563EB", text: "#172033", mutedText: "#64748B", background: "#FFFFFF", border: "#D8DEE8" },
    sidebar: { enabled: true, sections: ["skills", "languages", "certifications"] },
    typography: { headingFont: "Arial", bodyFont: "Arial", headingSize: "medium", bodySize: "medium" },
  }),
  student: base({
    style: "minimal",
    density: "balanced",
    colors: { primary: "#111827", secondary: "#374151", text: "#1F2937", mutedText: "#6B7280", background: "#FFFFFF", border: "#D1D5DB" },
    typography: { headingFont: "Arial", bodyFont: "Arial", headingSize: "medium", bodySize: "medium" },
    sidebar: { enabled: true, sections: ["education", "languages", "skills"] },
  }),
  "infographic-01": base({
    style: "creative",
    layout: "two-column",
    colors: { primary: "#111111", secondary: "#333333", text: "#111111", mutedText: "#555555", background: "#FFFFFF", border: "#222222" },
    typography: { headingFont: "Arial", bodyFont: "Arial", headingSize: "medium", bodySize: "small" },
    sidebar: { enabled: true, sections: ["skills", "languages", "certifications"] },
    visual: { borderStyle: "strong", cardStyle: "none", accentStyle: "line" },
    ats: { safe: false, tablesUsed: false, graphicsUsed: true, recommendedForATS: false },
  }),
  "infographic-02": base({
    style: "creative",
    layout: "two-column",
    colors: { primary: "#111111", secondary: "#000000", text: "#111111", mutedText: "#555555", background: "#FFFFFF", border: "#111111" },
    typography: { headingFont: "Arial", bodyFont: "Arial", headingSize: "large", bodySize: "small" },
    sidebar: { enabled: true, sections: ["skills", "languages", "achievements"] },
    visual: { borderStyle: "strong", cardStyle: "none", accentStyle: "text" },
    ats: { safe: false, tablesUsed: false, graphicsUsed: true, recommendedForATS: false },
  }),
};
