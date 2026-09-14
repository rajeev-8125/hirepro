import { GoogleGenAI } from "@google/genai";
import {
  PortfolioDesignSchema,
  type PortfolioDesign,
} from "./portfolio-design-schema";
import { portfolioDesignSystemPrompt } from "./portfolio-design-prompt";

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
});

const MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const designResponseSchema = {
  type: "object",
  properties: {
    style: {
      type: "string",
      enum: [
        "modern",
        "minimal",
        "creative",
        "corporate",
        "developer",
        "elegant",
        "custom",
      ],
    },

    colors: {
      type: "object",
      properties: {
        background: { type: "string" },
        surface: { type: "string" },
        text: { type: "string" },
        mutedText: { type: "string" },
        primary: { type: "string" },
        secondary: { type: "string" },
      },
      required: [
        "background",
        "surface",
        "text",
        "mutedText",
        "primary",
        "secondary",
      ],
    },

    typography: {
      type: "object",
      properties: {
        heading: { type: "string" },
        body: { type: "string" },
      },
      required: ["heading", "body"],
    },

    hero: {
      type: "object",
      properties: {
        layout: {
          type: "string",
          enum: ["left", "center", "right", "split"],
        },

        photoPosition: {
          type: "string",
          enum: ["left", "center", "right", "none"],
        },

        photoShape: {
          type: "string",
          enum: ["circle", "rounded", "square", "none"],
        },

        photoSize: {
          type: "string",
          enum: ["small", "medium", "large"],
        },
      },
      required: [
        "layout",
        "photoPosition",
        "photoShape",
        "photoSize",
      ],
    },

    navigation: {
      type: "object",
      properties: {
        style: {
          type: "string",
          enum: ["simple", "centered", "floating", "minimal"],
        },
      },
      required: ["style"],
    },

    cards: {
      type: "object",
      properties: {
        style: {
          type: "string",
          enum: [
            "flat",
            "bordered",
            "soft",
            "glass",
            "elevated",
          ],
        },

        radius: {
          type: "string",
          enum: ["none", "small", "medium", "large"],
        },

        shadow: {
          type: "string",
          enum: ["none", "soft", "medium"],
        },
      },
      required: ["style", "radius", "shadow"],
    },

    sections: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "about",
          "skills",
          "experience",
          "projects",
          "education",
          "certifications",
          "achievements",
          "languages",
          "contact",
        ],
      },
    },

    emphasis: {
      type: "string",
      enum: [
        "about",
        "skills",
        "experience",
        "projects",
        "education",
      ],
    },

    animations: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },

        style: {
          type: "string",
          enum: ["none", "subtle", "smooth", "dynamic"],
        },
      },
      required: ["enabled", "style"],
    },

    resumeButton: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },
        label: { type: "string" },

        style: {
          type: "string",
          enum: ["filled", "outline", "minimal"],
        },
      },
      required: ["enabled", "label", "style"],
    },
  },

  required: [
    "style",
    "colors",
    "typography",
    "hero",
    "navigation",
    "cards",
    "sections",
    "emphasis",
    "animations",
    "resumeButton",
  ],
};

function isRetryableError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : JSON.stringify(error);

  return (
    message.includes("503") ||
    message.includes("429") ||
    message.includes("UNAVAILABLE") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("high demand")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithModel(
  model: string,
  contents: string
) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `Portfolio design AI: ${model}, attempt ${attempt}/${maxAttempts}`
      );

      return await ai.models.generateContent({
        model,

        contents,

        config: {
          responseMimeType: "application/json",
          responseSchema: designResponseSchema,
        },
      });
    } catch (error) {
      console.error(
        `Portfolio design AI error with ${model}, attempt ${attempt}:`,
        error
      );

      if (
        !isRetryableError(error) ||
        attempt === maxAttempts
      ) {
        throw error;
      }

      const delay = Math.min(
        1000 * Math.pow(2, attempt - 1),
        8000
      );

      console.log(
        `Retrying ${model} after ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw new Error(
    `Unable to generate portfolio design with ${model}.`
  );
}

export async function generatePortfolioDesign(
  description: string
): Promise<PortfolioDesign> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  const cleanDescription = description.trim();

  if (!cleanDescription) {
    throw new Error(
      "Please describe how you want your portfolio to look."
    );
  }

  const contents = `
${portfolioDesignSystemPrompt}

USER DESIGN REQUEST:
--------------------
${cleanDescription}
--------------------

Create the portfolio design configuration now.
`;

  const errors: string[] = [];

  for (const model of MODELS) {
    try {
      const response = await generateWithModel(
        model,
        contents
      );

      const text = response.text;

      if (!text) {
        throw new Error(
          "Gemini returned an empty design response."
        );
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(
          "Gemini returned invalid design JSON."
        );
      }

      const result =
        PortfolioDesignSchema.safeParse(parsed);

      if (!result.success) {
        console.error(
          `Portfolio design validation failed for ${model}:`,
          result.error.flatten()
        );

        throw new Error(
          "AI returned an invalid portfolio design."
        );
      }

      console.log(
        `Portfolio design successfully generated using ${model}`
      );

      return result.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : JSON.stringify(error);

      errors.push(`${model}: ${message}`);

      console.error(
        `Portfolio design model ${model} failed:`,
        error
      );
    }
  }

  throw new Error(
    `Portfolio design generation failed. ${errors.join(
      " | "
    )}`
  );
}