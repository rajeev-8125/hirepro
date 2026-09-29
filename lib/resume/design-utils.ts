import type { ResumeDesign } from "@/lib/ai/resume-design-schema";
import type { ResumeTemplateId } from "./template-types";
import { getTemplateDesign } from "./template-library";

export type ResumeDesignCustom = {
  headingFont: string;
  bodyFont: string;
  headingSizePx: number;
  bodySizePx: number;
  lineHeight: number;
  letterSpacingPx: number;
  wordSpacingPx: number;
  sectionGapPx: number;
  itemGapPx: number;
  pageMarginPx: number;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  mutedColor: string;
  backgroundColor: string;
  borderColor: string;
  headingCase: "normal" | "uppercase";
  headingWeight: 500 | 600 | 700 | 800;
};

export const DEFAULT_CUSTOM_DESIGN: ResumeDesignCustom = {
  headingFont: "Arial",
  bodyFont: "Arial",
  headingSizePx: 14,
  bodySizePx: 10,
  lineHeight: 1.45,
  letterSpacingPx: 0,
  wordSpacingPx: 0,
  sectionGapPx: 16,
  itemGapPx: 8,
  pageMarginPx: 38,
  primaryColor: "#2563EB",
  secondaryColor: "#1D4ED8",
  textColor: "#111827",
  mutedColor: "#64748B",
  backgroundColor: "#FFFFFF",
  borderColor: "#CBD5E1",
  headingCase: "uppercase",
  headingWeight: 700,
};

export function getDefaultCustomDesign(
  template: ResumeTemplateId,
): ResumeDesignCustom {
  const base = getTemplateDesign(template);
  return {
    ...DEFAULT_CUSTOM_DESIGN,
    headingFont: base.typography.headingFont,
    bodyFont: base.typography.bodyFont,
    primaryColor: base.colors.primary,
    secondaryColor: base.colors.secondary,
    textColor: base.colors.text,
    mutedColor: base.colors.mutedText,
    backgroundColor: base.colors.background,
    borderColor: base.colors.border,
    headingSizePx:
      base.typography.headingSize === "small"
        ? 12
        : base.typography.headingSize === "large"
          ? 16
          : 14,
    bodySizePx:
      base.typography.bodySize === "small"
        ? 9
        : base.typography.bodySize === "large"
          ? 11
          : 10,
    lineHeight:
      base.density === "compact"
        ? 1.3
        : base.density === "spacious"
          ? 1.55
          : 1.45,
    sectionGapPx:
      base.density === "compact"
        ? 11
        : base.density === "spacious"
          ? 21
          : 16,
    itemGapPx:
      base.density === "compact"
        ? 5
        : base.density === "spacious"
          ? 10
          : 8,
    pageMarginPx:
      base.density === "compact"
        ? 28
        : base.density === "spacious"
          ? 48
          : 38,
  };
}

export function mergeDesign(
  base: ResumeDesign,
  custom: Partial<ResumeDesignCustom>,
): ResumeDesign {
  const current = ((base as ResumeDesign & { custom?: ResumeDesignCustom }).custom ??
    DEFAULT_CUSTOM_DESIGN);

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: custom.primaryColor ?? current.primaryColor,
      secondary: custom.secondaryColor ?? current.secondaryColor,
      text: custom.textColor ?? current.textColor,
      mutedText: custom.mutedColor ?? current.mutedColor,
      background: custom.backgroundColor ?? current.backgroundColor,
      border: custom.borderColor ?? current.borderColor,
    },
    typography: {
      ...base.typography,
      headingFont: custom.headingFont ?? current.headingFont,
      bodyFont: custom.bodyFont ?? current.bodyFont,
      headingSize:
        (custom.headingSizePx ?? current.headingSizePx) <= 12
          ? "small"
          : (custom.headingSizePx ?? current.headingSizePx) >= 16
            ? "large"
            : "medium",
      bodySize:
        (custom.bodySizePx ?? current.bodySizePx) <= 9
          ? "small"
          : (custom.bodySizePx ?? current.bodySizePx) >= 11
            ? "large"
            : "medium",
    },
    custom: {
      ...current,
      ...custom,
    },
  } as ResumeDesign;
}

export function getCustomDesign(
  design: ResumeDesign | null,
): ResumeDesignCustom {
  return {
    ...DEFAULT_CUSTOM_DESIGN,
    ...((design as (ResumeDesign & { custom?: Partial<ResumeDesignCustom> }) | null)
      ?.custom ?? {}),
  };
}
