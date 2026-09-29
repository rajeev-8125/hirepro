import type { ResumeDesign } from "@/lib/ai/resume-design-schema";
import type {
  ResumeAiTemplate,
  ResumeTemplateDefinition,
  ResumeTemplateId,
} from "./template-types";

/* ============================================================
   BASE AI DESIGNS

   These are the internal design systems used by the resume
   builder. Individual PDF templates override the accent color,
   while the user can further customize typography, spacing,
   colors, etc. from the Styling section.
   ============================================================ */

const TEMPLATE_DESIGNS: Record<ResumeAiTemplate, ResumeDesign> = {
  /* ----------------------------------------------------------
     ATS
     ---------------------------------------------------------- */
  ats: {
    layout: "single-column",

    density: "compact",

    style: "ats",

    colors: {
      primary: "#1D4ED8",
      secondary: "#1E40AF",
      text: "#111827",
      mutedText: "#64748B",
      background: "#FFFFFF",
      border: "#CBD5E1",
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

      sections: [
        "skills",
        "education",
        "certifications",
        "languages",
        "achievements",
      ],
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

  /* ----------------------------------------------------------
     PROFESSIONAL
     ---------------------------------------------------------- */
  professional: {
    layout: "two-column",

    density: "balanced",

    style: "professional",

    colors: {
      primary: "#2563EB",
      secondary: "#1D4ED8",
      text: "#172033",
      mutedText: "#64748B",
      background: "#FFFFFF",
      border: "#D7DEE8",
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
        enabled: false,
        position: "left",
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
        "achievements",
      ],
    },

    visual: {
      borderStyle: "subtle",
      cardStyle: "flat",
      accentStyle: "line",
    },

    ats: {
      safe: true,
      tablesUsed: false,
      graphicsUsed: false,
      recommendedForATS: true,
    },
  },

  /* ----------------------------------------------------------
     MODERN
     ---------------------------------------------------------- */
  modern: {
    layout: "two-column",

    density: "balanced",

    style: "modern",

    colors: {
      primary: "#0F4C81",
      secondary: "#2563EB",
      text: "#172033",
      mutedText: "#64748B",
      background: "#FFFFFF",
      border: "#CBD5E1",
    },

    typography: {
      headingFont: "Arial",
      bodyFont: "Arial",
      headingSize: "large",
      bodySize: "medium",
    },

    header: {
      alignment: "left",

      photo: {
        enabled: false,
        position: "left",
        shape: "rounded",
        size: "medium",
      },
    },

    sections: {
      order: [
        "summary",
        "experience",
        "skills",
        "projects",
        "education",
        "certifications",
        "achievements",
        "languages",
      ],

      emphasis: [
        "summary",
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
        "languages",
        "certifications",
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

  /* ----------------------------------------------------------
     EXECUTIVE
     ---------------------------------------------------------- */
  executive: {
    layout: "single-column",

    density: "balanced",

    style: "executive",

    colors: {
      primary: "#111827",
      secondary: "#374151",
      text: "#111827",
      mutedText: "#6B7280",
      background: "#FFFFFF",
      border: "#D1D5DB",
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
        enabled: false,
        position: "center",
        shape: "circle",
        size: "medium",
      },
    },

    sections: {
      order: [
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "achievements",
        "languages",
      ],

      emphasis: [
        "summary",
        "experience",
        "education",
      ],
    },

    sidebar: {
      enabled: false,

      sections: [
        "skills",
        "education",
        "certifications",
        "languages",
        "achievements",
      ],
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

/* ============================================================
   RESUME PDF TEMPLATES

   These correspond to the PDF templates you placed inside:

   public/resume-templates/

   Each template has:
   - PDF reference
   - preview image
   - category
   - AI design family
   - accent color
   - layout
   - photo support
   ============================================================ */

export const RESUME_TEMPLATES: ResumeTemplateDefinition[] = [
  {
    id: "blue-01",
    name: "Blue Corporate ATS",
    shortName: "Blue ATS 01",
    description:
      "Clean white-and-blue corporate resume designed for strong ATS readability.",
    category: "ats",
    aiTemplate: "ats",
    referencePdf: "/resume-templates/blue-01.pdf",
    previewImage: "/resume-templates/blue-01.png",
    accent: "#1D4ED8",
    background: "#FFFFFF",
    layout: "single",
    photo: false,
  },

  {
    id: "blue-02",
    name: "Blue Corporate Executive",
    shortName: "Blue Executive",
    description:
      "Professional corporate layout with a refined hierarchy and strong visual structure.",
    category: "professional",
    aiTemplate: "professional",
    referencePdf: "/resume-templates/blue-02.pdf",
    previewImage: "/resume-templates/blue-02.png",
    accent: "#2563EB",
    background: "#FFFFFF",
    layout: "split",
    photo: false,
  },

  {
    id: "blue-03",
    name: "Blue Marketing",
    shortName: "Blue Marketing",
    description:
      "Professional blue layout emphasizing skills, experience and education.",
    category: "professional",
    aiTemplate: "professional",
    referencePdf: "/resume-templates/blue-03.pdf",
    previewImage: "/resume-templates/blue-03.png",
    accent: "#2563EB",
    background: "#FFFFFF",
    layout: "sidebar",
    photo: false,
  },

  {
    id: "blue-04",
    name: "Blue Skills Focus",
    shortName: "Blue Skills",
    description:
      "Modern blue resume layout emphasizing technical skills and professional experience.",
    category: "professional",
    aiTemplate: "modern",
    referencePdf: "/resume-templates/blue-04.pdf",
    previewImage: "/resume-templates/blue-04.png",
    accent: "#0F4C81",
    background: "#FFFFFF",
    layout: "sidebar",
    photo: false,
  },

  {
    id: "student",
    name: "Student CV",
    shortName: "Student",
    description:
      "Simple and structured resume template for students and early-career candidates.",
    category: "student",
    aiTemplate: "professional",
    referencePdf: "/resume-templates/student.pdf",
    previewImage: "/resume-templates/student.png",
    accent: "#111827",
    background: "#FFFFFF",
    layout: "sidebar",
    photo: false,
  },

  {
    id: "infographic-01",
    name: "Infographic Black & White",
    shortName: "Infographic 01",
    description:
      "Black-and-white infographic-inspired professional resume.",
    category: "creative",
    aiTemplate: "modern",
    referencePdf: "/resume-templates/infographic-01.pdf",
    previewImage: "/resume-templates/infographic-01.png",
    accent: "#111111",
    background: "#FFFFFF",
    layout: "split",
    photo: false,
  },

  {
    id: "infographic-02",
    name: "Infographic Marketing",
    shortName: "Infographic 02",
    description:
      "Bold monochrome marketing-style infographic resume.",
    category: "creative",
    aiTemplate: "modern",
    referencePdf: "/resume-templates/infographic-02.pdf",
    previewImage: "/resume-templates/infographic-02.png",
    accent: "#000000",
    background: "#FFFFFF",
    layout: "split",
    photo: false,
  },
];

/* ============================================================
   GET TEMPLATE DEFINITION
   ============================================================ */

export function getTemplateDefinition(
  id: ResumeTemplateId | string | null | undefined,
): ResumeTemplateDefinition {
  const found = RESUME_TEMPLATES.find(
    (template) => template.id === id,
  );

  return found ?? RESUME_TEMPLATES[0];
}

/* ============================================================
   GET AI TEMPLATE FAMILY
   ============================================================ */

export function getAiTemplate(
  id: ResumeTemplateId | string | null | undefined,
): ResumeAiTemplate {
  return getTemplateDefinition(id).aiTemplate;
}

/* ============================================================
   GET TEMPLATE DESIGN
   ============================================================ */

export function getTemplateDesign(
  id: ResumeTemplateId | string | null | undefined,
): ResumeDesign {
  const definition = getTemplateDefinition(id);

  /*
   * Important:
   * We always have a valid fallback here.
   *
   * This prevents:
   *
   * Cannot read properties of undefined (reading 'colors')
   */

  const base =
    TEMPLATE_DESIGNS[definition.aiTemplate] ??
    TEMPLATE_DESIGNS.professional;

  return {
    ...base,

    colors: {
      ...base.colors,

      primary: definition.accent,

      secondary: definition.accent,

      background: definition.background,
    },

    custom: {
      ...(base.custom ?? {}),

      templateId: definition.id,

      primaryColor: definition.accent,

      secondaryColor: definition.accent,

      backgroundColor: definition.background,
    },
  };
}

/* ============================================================
   GET ALL TEMPLATES BY CATEGORY
   ============================================================ */

export function getTemplatesByCategory(
  category: ResumeTemplateDefinition["category"],
): ResumeTemplateDefinition[] {
  return RESUME_TEMPLATES.filter(
    (template) => template.category === category,
  );
}

/* ============================================================
   FIND TEMPLATE BY AI FAMILY
   ============================================================ */

export function getTemplatesByAiTemplate(
  aiTemplate: ResumeAiTemplate,
): ResumeTemplateDefinition[] {
  return RESUME_TEMPLATES.filter(
    (template) => template.aiTemplate === aiTemplate,
  );
}

/* ============================================================
   CHECK TEMPLATE EXISTS
   ============================================================ */

export function isValidResumeTemplate(
  id: string | null | undefined,
): id is ResumeTemplateId {
  return RESUME_TEMPLATES.some(
    (template) => template.id === id,
  );
}