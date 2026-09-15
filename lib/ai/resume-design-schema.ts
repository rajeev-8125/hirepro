import { z } from "zod";

const ResumeSection = z.enum([
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "certifications",
  "achievements",
  "languages",
]);

export const ResumeDesignSchema = z.object({
  layout: z.enum([
    "single-column",
    "two-column",
  ]),

  density: z.enum([
    "compact",
    "balanced",
    "spacious",
  ]),

  style: z.enum([
    "ats",
    "professional",
    "modern",
    "executive",
    "minimal",
    "creative",
  ]),

  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    text: z.string(),
    mutedText: z.string(),
    background: z.string(),
    border: z.string(),
  }),

  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),

    headingSize: z.enum([
      "small",
      "medium",
      "large",
    ]),

    bodySize: z.enum([
      "small",
      "medium",
      "large",
    ]),
  }),

  header: z.object({
    alignment: z.enum([
      "left",
      "center",
    ]),

    photo: z.object({
      enabled: z.boolean(),

      position: z.enum([
        "left",
        "right",
        "center",
      ]),

      shape: z.enum([
        "circle",
        "square",
        "rounded",
      ]),

      size: z.enum([
        "small",
        "medium",
        "large",
      ]),
    }),
  }),

  sections: z.object({
    order: z.array(ResumeSection),
    emphasis: z.array(ResumeSection),
  }),

  sidebar: z.object({
    enabled: z.boolean(),

    sections: z.array(
      z.enum([
        "skills",
        "education",
        "certifications",
        "languages",
        "achievements",
      ])
    ),
  }),

  visual: z.object({
    borderStyle: z.enum([
      "none",
      "subtle",
      "strong",
    ]),

    cardStyle: z.enum([
      "none",
      "flat",
      "bordered",
      "soft",
    ]),

    accentStyle: z.enum([
      "text",
      "line",
      "background",
      "badge",
    ]),
  }),

  ats: z.object({
    safe: z.boolean(),
    tablesUsed: z.boolean(),
    graphicsUsed: z.boolean(),
    recommendedForATS: z.boolean(),
  }),
});

export type ResumeDesign = z.infer<
  typeof ResumeDesignSchema
>;