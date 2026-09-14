import { GoogleGenAI } from "@google/genai";
import {
  PortfolioSchema,
  type PortfolioData,
} from "./portfolio-schema";
import { portfolioSystemPrompt } from "./portfolio-prompt";

// =========================================================
// API KEY
// =========================================================

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "GEMINI_API_KEY is not configured. Portfolio generation will fail until it is added to .env.local."
  );
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
});

// =========================================================
// GEMINI MODELS
// =========================================================

// Primary high-quality model
const PRIMARY_MODEL = "gemini-3.6-flash";

// First fallback
const FALLBACK_MODEL = "gemini-3.5-flash";

// Second fallback for high-volume availability
const SECOND_FALLBACK_MODEL =
  "gemini-3.1-flash-lite";

// =========================================================
// RETRY CONFIGURATION
// =========================================================

const MAX_RETRIES_PER_MODEL = 2;

const INITIAL_RETRY_DELAY_MS = 2500;

// =========================================================
// TYPES
// =========================================================

type GeminiError = {
  status?: number;
  code?: number;
  message?: string;
};

// =========================================================
// WAIT
// =========================================================

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// =========================================================
// GET ERROR MESSAGE
// =========================================================

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
}

// =========================================================
// DETECT RETRYABLE ERRORS
// =========================================================

function isRetryableError(
  error: unknown
): boolean {
  if (!error) {
    return false;
  }

  const err =
    error as GeminiError;

  const status =
    err.status ?? err.code;

  const message =
    getErrorMessage(error).toLowerCase();

  // 503 = temporarily unavailable
  if (status === 503) {
    return true;
  }

  // 429 = rate limit / resource exhausted
  if (status === 429) {
    return true;
  }

  // Some SDK errors expose the status
  // only inside the message.
  if (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted") ||
    message.includes("temporarily unavailable")
  ) {
    return true;
  }

  return false;
}

// =========================================================
// GEMINI RESPONSE SCHEMA
// =========================================================

const portfolioResponseSchema = {
  type: "object",

  properties: {
    personal: {
      type: "object",

      properties: {
        name: {
          type: "string",
        },

        headline: {
          type: "string",
        },

        email: {
          type: "string",
        },

        phone: {
          type: "string",
        },

        location: {
          type: "string",
        },

        website: {
          type: "string",
        },

        linkedin: {
          type: "string",
        },

        github: {
          type: "string",
        },
      },

      required: [
        "name",
        "headline",
        "email",
        "phone",
        "location",
        "website",
        "linkedin",
        "github",
      ],
    },

    summary: {
      type: "string",
    },

    skills: {
      type: "array",

      items: {
        type: "string",
      },
    },

    experience: {
      type: "array",

      items: {
        type: "object",

        properties: {
          company: {
            type: "string",
          },

          role: {
            type: "string",
          },

          location: {
            type: "string",
          },

          startDate: {
            type: "string",
          },

          endDate: {
            type: "string",
          },

          description: {
            type: "string",
          },
        },

        required: [
          "company",
          "role",
          "location",
          "startDate",
          "endDate",
          "description",
        ],
      },
    },

    education: {
      type: "array",

      items: {
        type: "object",

        properties: {
          institution: {
            type: "string",
          },

          degree: {
            type: "string",
          },

          field: {
            type: "string",
          },

          startDate: {
            type: "string",
          },

          endDate: {
            type: "string",
          },

          description: {
            type: "string",
          },
        },

        required: [
          "institution",
          "degree",
          "field",
          "startDate",
          "endDate",
          "description",
        ],
      },
    },

    projects: {
      type: "array",

      items: {
        type: "object",

        properties: {
          name: {
            type: "string",
          },

          description: {
            type: "string",
          },

          technologies: {
            type: "array",

            items: {
              type: "string",
            },
          },

          url: {
            type: "string",
          },
        },

        required: [
          "name",
          "description",
          "technologies",
          "url",
        ],
      },
    },

    certifications: {
      type: "array",

      items: {
        type: "object",

        properties: {
          name: {
            type: "string",
          },

          issuer: {
            type: "string",
          },

          date: {
            type: "string",
          },

          url: {
            type: "string",
          },
        },

        required: [
          "name",
          "issuer",
          "date",
          "url",
        ],
      },
    },

    achievements: {
      type: "array",

      items: {
        type: "string",
      },
    },

    languages: {
      type: "array",

      items: {
        type: "string",
      },
    },
  },

  required: [
    "personal",
    "summary",
    "skills",
    "experience",
    "education",
    "projects",
    "certifications",
    "achievements",
    "languages",
  ],
};

// =========================================================
// GENERATE USING ONE MODEL
// =========================================================

async function generateWithModel(
  model: string,
  resumeText: string
): Promise<PortfolioData> {
  console.log(
    `Sending portfolio request to Gemini: ${model}`
  );

  const response =
    await ai.models.generateContent({
      model,

      contents: `
${portfolioSystemPrompt}

Convert the following resume into structured portfolio data.

IMPORTANT:
- Return ONLY valid JSON.
- Follow the provided response schema exactly.
- Do not invent information.
- Do not add skills that are not present in the resume.
- Do not create fake employment.
- Do not create fake achievements.
- Do not create fake projects.
- Do not create fake certifications.
- If information is missing, use an empty string or empty array.

RESUME:
--------------------
${resumeText}
--------------------
`,

      config: {
        responseMimeType:
          "application/json",

        responseSchema:
          portfolioResponseSchema,
      },
    });

  const text =
    response.text;

  if (!text) {
    throw new Error(
      `Gemini returned an empty response using ${model}.`
    );
  }

  console.log(
    `Gemini returned ${text.length} characters using ${model}.`
  );

  // =======================================================
  // PARSE JSON
  // =======================================================

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(text);
  } catch {
    throw new Error(
      `Gemini returned invalid JSON using ${model}.`
    );
  }

  // =======================================================
  // VALIDATE USING ZOD
  // =======================================================

  const result =
    PortfolioSchema.safeParse(
      parsed
    );

  if (!result.success) {
    console.error(
      `Portfolio validation failed for ${model}:`,
      result.error.flatten()
    );

    throw new Error(
      `Gemini returned data that does not match the portfolio schema using ${model}.`
    );
  }

  return result.data;
}

// =========================================================
// RETRY ONE MODEL
// =========================================================

async function generateWithRetry(
  model: string,
  resumeText: string
): Promise<PortfolioData> {
  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= MAX_RETRIES_PER_MODEL;
    attempt++
  ) {
    try {
      console.log(
        `Gemini attempt ${attempt}/${MAX_RETRIES_PER_MODEL} using ${model}`
      );

      const result =
        await generateWithModel(
          model,
          resumeText
        );

      console.log(
        `Gemini generation succeeded using ${model}`
      );

      return result;
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini attempt ${attempt} failed using ${model}:`,
        error
      );

      // Don't retry permanent errors.
      if (
        !isRetryableError(error)
      ) {
        throw error;
      }

      // Don't wait after final attempt.
      if (
        attempt <
        MAX_RETRIES_PER_MODEL
      ) {
        const delay =
          INITIAL_RETRY_DELAY_MS *
          Math.pow(
            2,
            attempt - 1
          );

        console.log(
          `Temporary Gemini error. Waiting ${delay}ms before retry...`
        );

        await wait(delay);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        `Gemini failed after retries using ${model}.`
      );
}

// =========================================================
// MAIN PORTFOLIO GENERATOR
// =========================================================

export async function generatePortfolioFromResume(
  resumeText: string
): Promise<PortfolioData> {
  // =======================================================
  // 1. CHECK API KEY
  // =======================================================

  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to .env.local and restart the development server."
    );
  }

  // =======================================================
  // 2. VALIDATE RESUME
  // =======================================================

  if (
    !resumeText ||
    !resumeText.trim()
  ) {
    throw new Error(
      "Resume text is empty."
    );
  }

  // =======================================================
  // 3. LIMIT RESUME SIZE
  // =======================================================

  const MAX_RESUME_CHARACTERS =
    50000;

  const cleanedResumeText =
    resumeText.trim();

  const finalResumeText =
    cleanedResumeText.length >
    MAX_RESUME_CHARACTERS
      ? cleanedResumeText.slice(
          0,
          MAX_RESUME_CHARACTERS
        )
      : cleanedResumeText;

  console.log(
    "===================================="
  );

  console.log(
    "PORTFOLIO AI GENERATION START"
  );

  console.log(
    "Resume characters:",
    finalResumeText.length
  );

  console.log(
    "Primary model:",
    PRIMARY_MODEL
  );

  console.log(
    "Fallback model:",
    FALLBACK_MODEL
  );

  console.log(
    "Second fallback:",
    SECOND_FALLBACK_MODEL
  );

  console.log(
    "===================================="
  );

  // =======================================================
  // MODEL 1
  // =======================================================

  let primaryError: unknown = null;

  try {
    return await generateWithRetry(
      PRIMARY_MODEL,
      finalResumeText
    );
  } catch (error) {
    primaryError = error;

    console.error(
      `Primary model ${PRIMARY_MODEL} failed:`,
      error
    );

    // Permanent error → stop immediately.
    if (
      !isRetryableError(error)
    ) {
      throw new Error(
        `Gemini portfolio generation failed using ${PRIMARY_MODEL}: ${getErrorMessage(error)}`
      );
    }
  }

  // =======================================================
  // MODEL 2
  // =======================================================

  let fallbackError: unknown = null;

  try {
    console.log(
      `Trying first fallback model: ${FALLBACK_MODEL}`
    );

    return await generateWithRetry(
      FALLBACK_MODEL,
      finalResumeText
    );
  } catch (error) {
    fallbackError = error;

    console.error(
      `Fallback model ${FALLBACK_MODEL} failed:`,
      error
    );

    // If it is permanent, don't needlessly continue.
    if (
      !isRetryableError(error)
    ) {
      throw new Error(
        `Gemini portfolio generation failed using ${FALLBACK_MODEL}: ${getErrorMessage(error)}`
      );
    }
  }

  // =======================================================
  // MODEL 3
  // =======================================================

  try {
    console.log(
      `Trying second fallback model: ${SECOND_FALLBACK_MODEL}`
    );

    return await generateWithRetry(
      SECOND_FALLBACK_MODEL,
      finalResumeText
    );
  } catch (secondFallbackError) {
    console.error(
      `Second fallback model ${SECOND_FALLBACK_MODEL} failed:`,
      secondFallbackError
    );

    // =====================================================
    // ALL MODELS FAILED
    // =====================================================

    throw new Error(
      `Gemini portfolio generation failed.

Primary model (${PRIMARY_MODEL}):
${getErrorMessage(primaryError)}

Fallback model (${FALLBACK_MODEL}):
${getErrorMessage(fallbackError)}

Second fallback model (${SECOND_FALLBACK_MODEL}):
${getErrorMessage(secondFallbackError)}`
    );
  }
}