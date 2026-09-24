export type ResumeTemplateId =
  | "ats"
  | "careerflow"
  | "harvard"
  | "compact"
  | "executive"
  | "no-frills"
  | "custom";

export type ResumeFont =
  | "Arial"
  | "Calibri"
  | "Helvetica"
  | "Georgia"
  | "Times New Roman"
  | "Poppins"
  | "Inter"
  | "Verdana"
  | "Tahoma"
  | "Garamond";

export type ResumeNameCase =
  | "capitalize"
  | "uppercase"
  | "lowercase";

export type ResumeBulletStyle =
  | "bullet"
  | "circle"
  | "square"
  | "dash"
  | "number"
  | "none";

export type ResumeDateFormat =
  | "MMM YYYY"
  | "MM/YYYY"
  | "YYYY"
  | "MMM YY"
  | "Month YYYY";

export type ResumeDesignConfig = {
  template: ResumeTemplateId;

  paperSize: "A4" | "LETTER";

  colors: {
    primary: string;
    heading: string;
    body: string;
    link: string;
    divider: string;
  };

  typography: {
    fontFamily: ResumeFont;

    bodySize: number;
    headingSize: number;
    sectionTitleSize: number;
    nameSize: number;

    lineHeight: number;

    nameCase: ResumeNameCase;

    boldHeadings: boolean;
  };

  spacing: {
    pageTop: number;
    pageBottom: number;
    pageLeft: number;
    pageRight: number;

    sectionGap: number;
    headingGap: number;
    itemGap: number;
    detailGap: number;
    bulletGap: number;
  };

  layout: {
    headerAlignment: "left" | "center";
    headerDelimiter: "|" | "•" | "–" | "◇" | "◆";
    bulletStyle: ResumeBulletStyle;

    showIcons: boolean;
    showDividers: boolean;

    dateFormat: ResumeDateFormat;
  };

  sections: {
    id: string;
    visible: boolean;
  }[];
};

export const DEFAULT_RESUME_DESIGN: ResumeDesignConfig = {
  template: "ats",

  paperSize: "A4",

  colors: {
    primary: "#2563EB",
    heading: "#111827",
    body: "#374151",
    link: "#2563EB",
    divider: "#D1D5DB",
  },

  typography: {
    fontFamily: "Arial",

    bodySize: 10,
    headingSize: 13,
    sectionTitleSize: 11,
    nameSize: 22,

    lineHeight: 1.35,

    nameCase: "uppercase",

    boldHeadings: true,
  },

  spacing: {
    pageTop: 0.45,
    pageBottom: 0.45,
    pageLeft: 0.55,
    pageRight: 0.55,

    sectionGap: 10,
    headingGap: 5,
    itemGap: 7,
    detailGap: 2,
    bulletGap: 2,
  },

  layout: {
    headerAlignment: "center",
    headerDelimiter: "•",
    bulletStyle: "bullet",

    showIcons: false,
    showDividers: true,

    dateFormat: "MMM YYYY",
  },

  sections: [
    { id: "summary", visible: true },
    { id: "experience", visible: true },
    { id: "education", visible: true },
    { id: "skills", visible: true },
    { id: "projects", visible: true },
    { id: "certifications", visible: true },
    { id: "achievements", visible: true },
    { id: "languages", visible: true },
  ],
};

export function mergeResumeDesign(
  value?: Partial<ResumeDesignConfig> | null,
): ResumeDesignConfig {
  if (!value) return DEFAULT_RESUME_DESIGN;

  return {
    ...DEFAULT_RESUME_DESIGN,
    ...value,

    colors: {
      ...DEFAULT_RESUME_DESIGN.colors,
      ...(value.colors || {}),
    },

    typography: {
      ...DEFAULT_RESUME_DESIGN.typography,
      ...(value.typography || {}),
    },

    spacing: {
      ...DEFAULT_RESUME_DESIGN.spacing,
      ...(value.spacing || {}),
    },

    layout: {
      ...DEFAULT_RESUME_DESIGN.layout,
      ...(value.layout || {}),
    },

    sections:
      value.sections || DEFAULT_RESUME_DESIGN.sections,
  };
}