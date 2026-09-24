import type {
  ResumeColorPalette,
  ResumeDesign,
  ResumeFont,
  ResumeSpacing,
  ResumeTemplate,
  ResumeTypography,
} from "./template-types";

export const DEFAULT_COLORS: ResumeColorPalette = {
  primary: "#0F172A",
  secondary: "#FFFFFF",
  accent: "#2563EB",
  text: "#1E293B",
  mutedText: "#64748B",
  background: "#FFFFFF",
  sidebar: "#0F172A",
  sidebarText: "#FFFFFF",
  divider: "#E2E8F0",
  cardBackground: "#FFFFFF",
};

export const DEFAULT_TYPOGRAPHY: ResumeTypography = {
  fontFamily: "Arial",
  bodySize: 9.5,
  nameSize: 24,
  jobTitleSize: 10,
  sectionTitleSize: 9,
  headingSize: 11,
  lineHeight: 1.35,
  letterSpacing: 0,
  wordSpacing: 0,
  nameWeight: 700,
  headingWeight: 700,
  bodyWeight: 400,
  uppercaseSectionTitles: true,
};

export const DEFAULT_SPACING: ResumeSpacing = {
  pageMarginTop: 28,
  pageMarginRight: 30,
  pageMarginBottom: 28,
  pageMarginLeft: 30,
  sectionGap: 14,
  headingGap: 6,
  itemGap: 9,
  bulletGap: 2,
  contentGap: 15,
  columnGap: 20,
};

export function createDesignFromTemplate(
  template: ResumeTemplate,
): ResumeDesign {
  return {
    templateId: template.id,
    colors: { ...template.colors },
    typography: { ...template.typography },
    spacing: { ...template.spacing },
    layout: { ...template.layout },
  };
}

export function mergeDesign(
  template: ResumeTemplate,
  design?: Partial<ResumeDesign> | null,
): ResumeDesign {
  const base = createDesignFromTemplate(template);

  return {
    ...base,
    ...design,

    colors: {
      ...base.colors,
      ...(design?.colors ?? {}),
    },

    typography: {
      ...base.typography,
      ...(design?.typography ?? {}),
    },

    spacing: {
      ...base.spacing,
      ...(design?.spacing ?? {}),
    },

    layout: {
      ...base.layout,
      ...(design?.layout ?? {}),
    },
  };
}

export function fontFamilyCss(font: ResumeFont): string {
  switch (font) {
    case "Times New Roman":
      return '"Times New Roman", Times, serif';

    case "Georgia":
      return 'Georgia, "Times New Roman", serif';

    case "Helvetica":
      return 'Helvetica, Arial, sans-serif';

    case "Roboto":
      return '"Roboto", Arial, sans-serif';

    case "Inter":
      return '"Inter", Arial, sans-serif';

    case "Poppins":
      return '"Poppins", Arial, sans-serif';

    case "Lato":
      return '"Lato", Arial, sans-serif';

    case "Montserrat":
      return '"Montserrat", Arial, sans-serif';

    case "Calibri":
      return 'Calibri, Arial, sans-serif';

    default:
      return "Arial, sans-serif";
  }
}

export function pxToPt(px: number): number {
  return px * 0.75;
}

export function ptToPx(pt: number): number {
  return pt / 0.75;
}

export function inchesToPx(inches: number): number {
  return inches * 96;
}

export function mmToPx(mm: number): number {
  return (mm / 25.4) * 96;
}

export function getPageStyle(design: ResumeDesign): React.CSSProperties {
  const { colors, typography, spacing } = design;

  return {
    width: "210mm",
    minHeight: "297mm",
    boxSizing: "border-box",
    backgroundColor: colors.background,
    color: colors.text,

    fontFamily: fontFamilyCss(typography.fontFamily),
    fontSize: `${typography.bodySize}pt`,
    lineHeight: typography.lineHeight,

    paddingTop: `${spacing.pageMarginTop}px`,
    paddingRight: `${spacing.pageMarginRight}px`,
    paddingBottom: `${spacing.pageMarginBottom}px`,
    paddingLeft: `${spacing.pageMarginLeft}px`,

    letterSpacing: `${typography.letterSpacing}px`,
    wordSpacing: `${typography.wordSpacing}px`,

    position: "relative",
    overflow: "hidden",
  };
}

export function getSectionTitleStyle(
  design: ResumeDesign,
): React.CSSProperties {
  const { colors, typography, spacing } = design;

  return {
    color: colors.primary,
    fontFamily: fontFamilyCss(typography.fontFamily),
    fontSize: `${typography.sectionTitleSize}pt`,
    fontWeight: typography.headingWeight,
    lineHeight: 1.2,

    textTransform: typography.uppercaseSectionTitles
      ? "uppercase"
      : "none",

    letterSpacing: typography.letterSpacing
      ? `${Math.max(0.3, typography.letterSpacing)}px`
      : "0.5px",

    marginBottom: `${spacing.headingGap}px`,
  };
}

export function getBodyStyle(
  design: ResumeDesign,
): React.CSSProperties {
  const { colors, typography } = design;

  return {
    color: colors.text,
    fontFamily: fontFamilyCss(typography.fontFamily),
    fontSize: `${typography.bodySize}pt`,
    lineHeight: typography.lineHeight,
    fontWeight: typography.bodyWeight,
  };
}

export function getSidebarStyle(
  design: ResumeDesign,
): React.CSSProperties {
  const { colors } = design;

  return {
    backgroundColor: colors.sidebar,
    color: colors.sidebarText,
  };
}

export function getDividerStyle(
  design: ResumeDesign,
): React.CSSProperties {
  const { colors } = design;

  return {
    borderColor: colors.divider,
  };
}

export function clampNumber(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(Math.max(value, min), max);
}

export function updateTypography(
  typography: ResumeTypography,
  updates: Partial<ResumeTypography>,
): ResumeTypography {
  return {
    ...typography,
    ...updates,
  };
}

export function updateColors(
  colors: ResumeColorPalette,
  updates: Partial<ResumeColorPalette>,
): ResumeColorPalette {
  return {
    ...colors,
    ...updates,
  };
}

export function updateSpacing(
  spacing: ResumeSpacing,
  updates: Partial<ResumeSpacing>,
): ResumeSpacing {
  return {
    ...spacing,
    ...updates,
  };
}