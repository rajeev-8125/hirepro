import { z } from "zod";

export const ATSResultSchema = z.object({
  overallScore: z.number().min(0).max(100),

  summary: z.string(),

  keywordMatch: z.object({
    score: z.number().min(0).max(100),
    matchedKeywords: z.array(z.string()),
    missingKeywords: z.array(z.string()),
  }),

  formatting: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(z.string()),
  }),

  experience: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }),

  skills: z.object({
    score: z.number().min(0).max(100),
    matchedSkills: z.array(z.string()),
    missingSkills: z.array(z.string()),
  }),

  recommendations: z.array(
    z.object({
      priority: z.enum([
        "high",
        "medium",
        "low",
      ]),
      recommendation: z.string(),
    })
  ),
});

export type ATSResult = z.infer<
  typeof ATSResultSchema
>;