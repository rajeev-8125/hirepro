import { z } from "zod";

export const PortfolioDesignSchema = z.object({
  style: z.enum([
    "modern",
    "minimal",
    "creative",
    "corporate",
    "developer",
    "elegant",
    "custom",
  ]),

  colors: z.object({
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    mutedText: z.string(),
    primary: z.string(),
    secondary: z.string(),
  }),

  typography: z.object({
    heading: z.string(),
    body: z.string(),
  }),

  hero: z.object({
    layout: z.enum([
      "left",
      "center",
      "right",
      "split",
    ]),

    photoPosition: z.enum([
      "left",
      "center",
      "right",
      "none",
    ]),

    photoShape: z.enum([
      "circle",
      "rounded",
      "square",
      "none",
    ]),

    photoSize: z.enum([
      "small",
      "medium",
      "large",
    ]),
  }),

  navigation: z.object({
    style: z.enum([
      "simple",
      "centered",
      "floating",
      "minimal",
    ]),
  }),

  cards: z.object({
    style: z.enum([
      "flat",
      "bordered",
      "soft",
      "glass",
      "elevated",
    ]),

    radius: z.enum([
      "none",
      "small",
      "medium",
      "large",
    ]),

    shadow: z.enum([
      "none",
      "soft",
      "medium",
    ]),
  }),

  sections: z.array(
    z.enum([
      "about",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "achievements",
      "languages",
      "contact",
    ])
  ),

  emphasis: z.enum([
    "about",
    "skills",
    "experience",
    "projects",
    "education",
  ]),

  animations: z.object({
    enabled: z.boolean(),

    style: z.enum([
      "none",
      "subtle",
      "smooth",
      "dynamic",
    ]),
  }),

  resumeButton: z.object({
    enabled: z.boolean(),

    label: z.string(),

    style: z.enum([
      "filled",
      "outline",
      "minimal",
    ]),
  }),
});

export type PortfolioDesign =
  z.infer<typeof PortfolioDesignSchema>;