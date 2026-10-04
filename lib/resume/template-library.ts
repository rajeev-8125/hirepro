import type { ResumeDesign } from "@/lib/ai/resume-design-schema";
import type {
  ResumeAiTemplate,
  ResumeTemplateDefinition,
  ResumeTemplateId,
} from "./template-types";

/**
 * HirePro template registry.
 *
 * The supplied PDF files are the structural references.
 * The PNG files are the selector thumbnails.
 * The React renderer reproduces the editable version of each template.
 */

const TEMPLATE_DESIGNS: Record<ResumeAiTemplate, ResumeDesign> = {
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
        "projects",
        "education",
        "certifications",
        "achievements",
        "languages",
      ],
      emphasis: ["experience", "skills", "education"],
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
      emphasis: ["summary", "experience", "skills"],
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
      emphasis: ["summary", "experience", "projects", "skills"],
    },
    sidebar: {
      enabled: true,
      sections: ["skills", "education", "languages", "certifications"],
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
      emphasis: ["summary", "experience", "education"],
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

export const RESUME_TEMPLATES: ResumeTemplateDefinition[] = [
  {
    id: "blue-01",
    name: "Blue Corporate ATS",
    shortName: "Blue ATS 01",
    description:
      "Clean white-and-blue corporate resume with strong ATS readability and compact content density.",
    category: "ats",
    aiTemplate: "ats",
    referencePdf: "/resume-templates/blue-01.pdf",
    previewImage: "/resume-templates/blue-01(1).png",
    accent: "#2F9DDA",
    background: "#FFFFFF",
    layout: "single",
    photo: true,
  },
  {
    id: "blue-02",
    name: "Blue Corporate Executive",
    shortName: "Blue Executive",
    description:
      "Navy-sidebar executive resume with a strong identity area, contact details and clear hierarchy.",
    category: "professional",
    aiTemplate: "professional",
    referencePdf: "/resume-templates/blue-02.pdf",
    previewImage: "/resume-templates/blue-02(1).png",
    accent: "#D4A017",
    background: "#FFFFFF",
    layout: "split",
    photo: true,
  },
  {
    id: "blue-03",
    name: "Blue Marketing",
    shortName: "Blue Marketing",
    description:
      "Blue two-column professional layout designed for marketing, business and communication profiles.",
    category: "professional",
    aiTemplate: "professional",
    referencePdf: "/resume-templates/blue-03.pdf",
    previewImage: "/resume-templates/blue-03(1).png",
    accent: "#2F5B9E",
    background: "#FFFFFF",
    layout: "sidebar",
    photo: true,
  },
  {
    id: "blue-04",
    name: "Blue Skills Focus",
    shortName: "Blue Skills",
    description:
      "Blue visual resume with a strong sidebar, skill presentation and professional experience hierarchy.",
    category: "professional",
    aiTemplate: "modern",
    referencePdf: "/resume-templates/blue-04.pdf",
    previewImage: "/resume-templates/blue-04(1).png",
    accent: "#315A9B",
    background: "#FFFFFF",
    layout: "sidebar",
    photo: true,
  },
  {
    id: "student",
    name: "Student CV",
    shortName: "Student",
    description:
      "Friendly student and early-career layout with a colored identity panel and structured sections.",
    category: "student",
    aiTemplate: "professional",
    referencePdf: "/resume-templates/student.pdf",
    previewImage: "/resume-templates/student(1).png",
    accent: "#6E9E9C",
    background: "#FFFFFF",
    layout: "sidebar",
    photo: true,
  },
  {
    id: "infographic-01",
    name: "Infographic Black & White",
    shortName: "Infographic 01",
    description:
      "Editorial black-and-white layout with structured section bands and a strong professional hierarchy.",
    category: "creative",
    aiTemplate: "modern",
    referencePdf: "/resume-templates/infographic-01.pdf",
    previewImage: "/resume-templates/infographic-01(1).png",
    accent: "#3F4852",
    background: "#FFFFFF",
    layout: "split",
    photo: false,
  },
  {
    id: "infographic-02",
    name: "Infographic Marketing",
    shortName: "Infographic 02",
    description:
      "Clean infographic marketing resume with section bars, dense information blocks and strong typography.",
    category: "creative",
    aiTemplate: "modern",
    referencePdf: "/resume-templates/infographic-02.pdf",
    previewImage: "/resume-templates/infographic-02(1).png",
    accent: "#64748B",
    background: "#FFFFFF",
    layout: "split",
    photo: false,
  },
];

export function getTemplateDefinition(
  id: ResumeTemplateId | string | null | undefined,
): ResumeTemplateDefinition {
  return (
    RESUME_TEMPLATES.find((template) => template.id === id) ??
    RESUME_TEMPLATES[0]
  );
}

export function getAiTemplate(
  id: ResumeTemplateId | string | null | undefined,
): ResumeAiTemplate {
  return getTemplateDefinition(id).aiTemplate;
}

export function getTemplateDesign(
  id: ResumeTemplateId | string | null | undefined,
): ResumeDesign {
  const definition = getTemplateDefinition(id);
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

export function getTemplatesByCategory(
  category: ResumeTemplateDefinition["category"],
) {
  return RESUME_TEMPLATES.filter((template) => template.category === category);
}

export function getTemplatesByAiTemplate(aiTemplate: ResumeAiTemplate) {
  return RESUME_TEMPLATES.filter(
    (template) => template.aiTemplate === aiTemplate,
  );
}

export function isValidResumeTemplate(
  id: string | null | undefined,
): id is ResumeTemplateId {
  return RESUME_TEMPLATES.some((template) => template.id === id);
}
