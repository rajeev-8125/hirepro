import { z } from "zod";

export const PortfolioSchema = z.object({
  personal: z.object({
    name: z.string(),
    headline: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    website: z.string(),
    linkedin: z.string(),
    github: z.string(),
  }),

  summary: z.string(),

  skills: z.array(z.string()),

  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string(),
    })
  ),

  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string(),
    })
  ),

  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      url: z.string(),
    })
  ),

  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string(),
      url: z.string(),
    })
  ),

  achievements: z.array(z.string()),

  languages: z.array(z.string()),
});

export type PortfolioData = z.infer<typeof PortfolioSchema>;