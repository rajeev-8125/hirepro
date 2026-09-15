import type { ResumeDesign } from "@/lib/ai/resume-design-schema";

export type ResumeTemplate =
  | "ats"
  | "professional"
  | "modern"
  | "executive";

export const TEMPLATE_DESIGNS: Record<
  ResumeTemplate,
  ResumeDesign
> = {
  ats: {
    layout: "single-column",
    density: "compact",
    style: "ats",

    colors: {
      primary: "#111827",
      secondary: "#374151",
      text: "#111827",
      mutedText: "#6B7280",
      background: "#FFFFFF",
      border: "#D1D5DB",
    },

    typography: {
      headingFont: "Arial",
      bodyFont: "Arial",
      headingSize: "medium",
      bodySize: "small",
    },

    header: {
      alignment: "left",
      photo: {
        enabled: false,
        position: "right",
        shape: "square",
        size: "small",
      },
    },

    sections: {
      order: [
        "summary",
        "skills",
        "experience",
        "education",
        "projects",
        "certifications",
        "achievements",
        "languages",
      ],
      emphasis: [
        "experience",
        "skills",
        "education",
      ],
    },

    sidebar: {
      enabled: false,
      sections: [],
    },

    visual: {
      borderStyle: "subtle",
      cardStyle: "none",
      accentStyle: "line",
    },

    ats: {
      safe: true,
      tablesUsed: false,
      graphicsUsed: false,
      recommendedForATS: true,
    },
  },

  professional: {
    layout: "single-column",
    density: "balanced",
    style: "professional",

    colors: {
      primary: "#1F2937",
      secondary: "#374151",
      text: "#111827",
      mutedText: "#6B7280",
      background: "#FFFFFF",
      border: "#D1D5DB",
    },

    typography: {
      headingFont: "Georgia",
      bodyFont: "Arial",
      headingSize: "medium",
      bodySize: "medium",
    },

    header: {
      alignment: "left",
      photo: {
        enabled: true,
        position: "right",
        shape: "circle",
        size: "medium",
      },
    },

    sections: {
      order: [
        "summary",
        "experience",
        "skills",
        "education",
        "projects",
        "certifications",
        "achievements",
        "languages",
      ],
      emphasis: [
        "experience",
        "summary",
        "skills",
      ],
    },

    sidebar: {
      enabled: false,
      sections: [],
    },

    visual: {
      borderStyle: "subtle",
      cardStyle: "soft",
      accentStyle: "line",
    },

    ats: {
      safe: true,
      tablesUsed: false,
      graphicsUsed: false,
      recommendedForATS: true,
    },
  },

  modern: {
    layout: "two-column",
    density: "balanced",
    style: "modern",

    colors: {
      primary: "#2563EB",
      secondary: "#1D4ED8",
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
      photo: {
        enabled: true,
        position: "left",
        shape: "rounded",
        size: "medium",
      },
    },

    sections: {
      order: [
        "summary",
        "experience",
        "projects",
        "skills",
        "education",
        "certifications",
        "achievements",
        "languages",
      ],
      emphasis: [
        "experience",
        "projects",
        "skills",
      ],
    },

    sidebar: {
      enabled: true,
      sections: [
        "skills",
        "education",
        "certifications",
        "languages",
      ],
    },

    visual: {
      borderStyle: "subtle",
      cardStyle: "soft",
      accentStyle: "background",
    },

    ats: {
      safe: true,
      tablesUsed: false,
      graphicsUsed: false,
      recommendedForATS: true,
    },
  },

  executive: {
    layout: "single-column",
    density: "spacious",
    style: "executive",

    colors: {
      primary: "#111827",
      secondary: "#4B5563",
      text: "#111827",
      mutedText: "#6B7280",
      background: "#FFFFFF",
      border: "#9CA3AF",
    },

    typography: {
      headingFont: "Georgia",
      bodyFont: "Arial",
      headingSize: "large",
      bodySize: "medium",
    },

    header: {
      alignment: "center",
      photo: {
        enabled: true,
        position: "center",
        shape: "circle",
        size: "medium",
      },
    },

    sections: {
      order: [
        "summary",
        "experience",
        "skills",
        "education",
        "projects",
        "certifications",
        "achievements",
        "languages",
      ],
      emphasis: [
        "summary",
        "experience",
        "achievements",
      ],
    },

    sidebar: {
      enabled: false,
      sections: [],
    },

    visual: {
      borderStyle: "strong",
      cardStyle: "none",
      accentStyle: "line",
    },

    ats: {
      safe: true,
      tablesUsed: false,
      graphicsUsed: false,
      recommendedForATS: true,
    },
  },
};