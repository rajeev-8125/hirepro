import { ATSResultSchema, type ATSResult } from "@/lib/ai/ats-schema";

/**
 * Deterministic HirePro ATS scoring.
 *
 * The score is intentionally calculated from the submitted text instead of
 * asking an LLM to guess a number. This makes the score repeatable for the
 * same resume + job description and gives the optimizer a stable target.
 */

const STOP_WORDS = new Set([
  "about", "after", "again", "against", "also", "among", "and", "any", "are", "because", "been", "being", "before", "between", "both", "but", "can", "could", "did", "does", "doing", "during", "each", "for", "from", "further", "had", "has", "have", "having", "her", "here", "hers", "him", "his", "how", "into", "its", "itself", "just", "more", "most", "not", "now", "our", "ours", "out", "over", "same", "she", "should", "some", "such", "than", "that", "the", "their", "theirs", "them", "then", "there", "these", "they", "this", "those", "through", "to", "under", "until", "very", "was", "were", "what", "when", "where", "which", "while", "who", "will", "with", "would", "you", "your", "years", "year", "role", "work", "working", "experience", "required", "requirements", "responsibilities", "candidate", "company", "team", "including", "using", "use", "ability", "strong", "skills", "knowledge", "preferred", "plus", "etc",
]);

const STANDARD_HEADINGS = [
  "summary", "professional summary", "experience", "work experience", "education", "skills", "projects", "certifications", "achievements", "languages", "contact",
];

const ACTION_WORDS = [
  "built", "created", "developed", "designed", "implemented", "led", "managed", "improved", "optimized", "automated", "analyzed", "delivered", "launched", "reduced", "increased", "integrated", "engineered", "deployed", "tested", "maintained", "coordinated", "resolved", "streamlined", "configured", "migrated", "documented",
];

function clean(text: string) {
  return text.replace(/\u0000/g, "").replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function tokens(text: string) {
  return clean(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-/ ]/g, " ")
    .split(/\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 3 && !STOP_WORDS.has(x));
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function extractKeywords(jobDescription: string) {
  const words = tokens(jobDescription);
  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);
}

function hasSection(text: string, names: string[]) {
  const lower = text.toLowerCase();
  return names.some((name) => new RegExp(`(^|\\n|\\s)${name.replace(/ /g, "\\s+")}(\\s|:|$)`, "i").test(lower));
}

function keywordScore(resumeText: string, jobDescription: string) {
  if (!jobDescription.trim()) {
    const resumeTokens = unique(tokens(resumeText));
    const useful = resumeTokens.filter((x) => x.length >= 4);
    const score = Math.min(100, 55 + Math.min(45, useful.length * 1.2));
    return { score: Math.round(score), matchedKeywords: useful.slice(0, 25), missingKeywords: [] as string[] };
  }

  const resumeLower = resumeText.toLowerCase();
  const keywords = extractKeywords(jobDescription);
  const matched = keywords.filter((keyword) => resumeLower.includes(keyword));
  const missing = keywords.filter((keyword) => !resumeLower.includes(keyword));
  const score = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 50;
  return { score, matchedKeywords: matched.slice(0, 25), missingKeywords: missing.slice(0, 25) };
}

function formattingScore(text: string) {
  const lower = text.toLowerCase();
  let score = 100;
  const issues: string[] = [];

  const presentHeadings = STANDARD_HEADINGS.filter((heading) => hasSection(text, [heading]));
  if (presentHeadings.length < 3) {
    score -= 18;
    issues.push("Use clear standard section headings such as Summary, Skills, Experience and Education.");
  }
  if ((text.match(/[|]{2,}/g) ?? []).length > 0) {
    score -= 8;
    issues.push("Avoid dense pipe-separated formatting that can reduce text extraction reliability.");
  }
  if ((text.match(/_{4,}|-{6,}|={5,}/g) ?? []).length > 0) {
    score -= 5;
    issues.push("Avoid decorative separator lines when they do not add semantic structure.");
  }
  if (lower.includes("references available upon request")) {
    score -= 2;
    issues.push("References are usually optional unless the employer requests them.");
  }
  if (text.length < 500) {
    score -= 15;
    issues.push("The resume contains relatively little searchable content.");
  }
  if (text.length > 12000) {
    score -= 10;
    issues.push("The resume is unusually long; prioritize relevant information.");
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

function experienceScore(text: string) {
  const lower = text.toLowerCase();
  let score = 35;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const actionHits = ACTION_WORDS.filter((word) => lower.includes(word));
  const metrics = (text.match(/\b\d+(?:\.\d+)?\s?(?:%|x|k|m|million|thousand|users|clients|projects|years?)\b/gi) ?? []).length;

  if (hasSection(text, ["experience", "work experience", "professional experience"])) {
    score += 25;
    strengths.push("Experience is clearly represented.");
  } else {
    weaknesses.push("Add a clear Experience section when you have work, internship or project-based experience.");
  }

  if (actionHits.length >= 5) {
    score += 20;
    strengths.push("Uses action-oriented language.");
  } else {
    score += actionHits.length * 2;
    weaknesses.push("Use stronger action verbs to describe responsibilities and outcomes.");
  }

  if (metrics >= 2) {
    score += 20;
    strengths.push("Includes measurable outcomes or scale where available.");
  } else {
    weaknesses.push("Add measurable outcomes only where they are factual and defensible.");
  }

  return { score: Math.max(0, Math.min(100, score)), strengths, weaknesses };
}

function skillsScore(text: string, jobDescription: string) {
  const lower = text.toLowerCase();
  const jobKeywords = jobDescription.trim() ? extractKeywords(jobDescription) : [];
  const matched = jobKeywords.filter((word) => lower.includes(word));
  const missing = jobKeywords.filter((word) => !lower.includes(word));
  const explicitSkills = hasSection(text, ["skills", "technical skills", "professional skills"]);

  let score = explicitSkills ? 65 : 45;
  if (matched.length) score += Math.min(25, matched.length * 2);
  if (!jobDescription.trim()) score += Math.min(20, unique(tokens(text)).filter((x) => x.length >= 4).length / 4);

  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    matchedSkills: matched.slice(0, 25),
    missingSkills: missing.slice(0, 25),
  };
}

export function generateATSResult(resumeText: string, jobDescription = ""): ATSResult {
  const resume = clean(resumeText);
  if (!resume) throw new Error("Resume text is empty.");

  const keyword = keywordScore(resume, clean(jobDescription));
  const formatting = formattingScore(resume);
  const experience = experienceScore(resume);
  const skills = skillsScore(resume, clean(jobDescription));

  // Stable weighted score: keyword alignment matters most when a JD exists.
  const overall = Math.round(
    keyword.score * 0.35 +
    formatting.score * 0.20 +
    experience.score * 0.25 +
    skills.score * 0.20,
  );

  const recommendations: ATSResult["recommendations"] = [];
  if (keyword.missingKeywords.length) recommendations.push({ priority: "high", recommendation: `Add relevant missing job terms only when they accurately describe your experience: ${keyword.missingKeywords.slice(0, 8).join(", ")}.` });
  if (formatting.score < 80) recommendations.push({ priority: "high", recommendation: "Use standard headings and simple text structure to improve ATS extraction." });
  if (experience.score < 75) recommendations.push({ priority: "medium", recommendation: "Strengthen experience bullets with action verbs and factual outcomes." });
  if (skills.score < 75) recommendations.push({ priority: "medium", recommendation: "Make relevant technical and role-specific skills explicit in a dedicated Skills section." });
  if (!recommendations.length) recommendations.push({ priority: "low", recommendation: "Maintain the current structure and tailor keywords to each job description." });

  const result: ATSResult = {
    overallScore: overall,
    summary: jobDescription.trim()
      ? `HirePro scored this resume at ${overall}/100 using keyword alignment, formatting, experience evidence and skills alignment against the supplied job description.`
      : `HirePro scored this resume at ${overall}/100 using keyword quality, formatting, experience evidence and skills structure.` ,
    keywordMatch: keyword,
    formatting,
    experience,
    skills,
    recommendations,
  };

  return ATSResultSchema.parse(result);
}
