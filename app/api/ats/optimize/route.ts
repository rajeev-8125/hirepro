import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractText } from "unpdf";

import { optimizeResumeForATS } from "@/lib/ai/ats-resume-optimizer";
import { generateResumeDesign } from "@/lib/ai/resume-design-generator";

import { ATSResultSchema } from "@/lib/ai/ats-schema";
import { ResumeSchema } from "@/lib/ai/resume-schema";
import { ResumeDesignSchema } from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * ATS-safe fallback design.
 *
 * This is NOT a fixed visual template for the user's resume.
 * It is a safety fallback only in case the AI design generator
 * fails validation.
 */
const ATS_SAFE_FALLBACK_DESIGN = {
  layout: "single-column",
  density: "balanced",
  style: "ats",

  colors: {
    primary: "#1E3A8A",
    secondary: "#2563EB",
    text: "#0F172A",
    mutedText: "#64748B",
    background: "#FFFFFF",
    border: "#E2E8F0",
  },

  typography: {
    headingFont: "Arial",
    bodyFont: "Arial",
    headingSize: "medium",
    bodySize: "medium",
  },

  header: {
    alignment: "left",

    photo: {
      enabled: false,
      position: "right",
      shape: "circle",
      size: "small",
    },
  },

  sections: {
    order: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "achievements",
      "languages",
    ],

    emphasis: [
      "experience",
      "skills",
      "projects",
    ],
  },

  sidebar: {
    enabled: false,
    sections: [],
  },

  visual: {
    borderStyle: "subtle",
    cardStyle: "none",
    accentStyle: "line",
  },

  ats: {
    safe: true,
    tablesUsed: false,
    graphicsUsed: false,
    recommendedForATS: true,
  },
};

/**
 * Generate an ATS-safe design using the existing
 * ResumeDesignSchema.
 *
 * The prompt explicitly includes every field and enum
 * value expected by the schema.
 */
async function generateATSSafeDesign() {
  const designPrompt = `
Create an ATS-safe professional resume design.

This design is for a real job application.

The resume MUST be:

- single column
- ATS friendly
- machine readable
- recruiter friendly
- professional
- elegant
- modern but restrained
- easy to scan
- easy to print
- white background
- dark readable text
- strong contrast
- standard typography
- no unnecessary decoration

IMPORTANT:

Return ONLY valid JSON.

The output MUST EXACTLY follow this structure.

DO NOT omit any field.

DO NOT add any field.

DO NOT use null.

DO NOT use undefined.

DO NOT use values outside the specified enums.

EXACT JSON STRUCTURE:

{
  "layout": "single-column",

  "density": "balanced",

  "style": "ats",

  "colors": {
    "primary": "#1E3A8A",
    "secondary": "#2563EB",
    "text": "#0F172A",
    "mutedText": "#64748B",
    "background": "#FFFFFF",
    "border": "#E2E8F0"
  },

  "typography": {
    "headingFont": "Arial",
    "bodyFont": "Arial",
    "headingSize": "medium",
    "bodySize": "medium"
  },

  "header": {
    "alignment": "left",

    "photo": {
      "enabled": false,
      "position": "right",
      "shape": "circle",
      "size": "small"
    }
  },

  "sections": {
    "order": [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "achievements",
      "languages"
    ],

    "emphasis": [
      "experience",
      "skills",
      "projects"
    ]
  },

  "sidebar": {
    "enabled": false,
    "sections": []
  },

  "visual": {
    "borderStyle": "subtle",
    "cardStyle": "none",
    "accentStyle": "line"
  },

  "ats": {
    "safe": true,
    "tablesUsed": false,
    "graphicsUsed": false,
    "recommendedForATS": true
  }
}

MANDATORY ENUM VALUES:

layout:
- single-column
- two-column

For this ATS resume, use:
single-column

density:
- compact
- balanced
- spacious

Use:
balanced

style:
- ats
- professional
- modern
- executive
- minimal
- creative

Use:
ats

header.alignment:
- left
- center

Use:
left

header.photo.position:
- left
- right
- center

Use:
right

header.photo.shape:
- circle
- square
- rounded

Use:
circle

header.photo.size:
- small
- medium
- large

Use:
small

visual.borderStyle:
- none
- subtle
- strong

Use:
subtle

visual.cardStyle:
- none
- flat
- bordered
- soft

Use:
none

visual.accentStyle:
- text
- line
- background
- badge

Use:
line

Resume sections may ONLY be:

summary
skills
experience
education
projects
certifications
achievements
languages

sidebar sections may ONLY be:

skills
education
certifications
languages
achievements

ATS REQUIREMENTS:

- sidebar.enabled MUST be false
- header.photo.enabled MUST be false
- visual.cardStyle MUST be none
- layout MUST be single-column
- ats.safe MUST be true
- ats.tablesUsed MUST be false
- ats.graphicsUsed MUST be false
- ats.recommendedForATS MUST be true
- no tables
- no charts
- no graphics
- no progress bars
- no icons
- no text boxes
- no decorative symbols
- no unusual fonts
- no dark page background
- no complicated layout

Return ONLY the JSON object.
`;

  try {
    const generatedDesign =
      await generateResumeDesign(designPrompt);

    const validation =
      ResumeDesignSchema.safeParse(generatedDesign);

    if (validation.success) {
      /**
       * We still enforce the critical ATS requirements
       * after AI generation.
       */
      return {
        ...validation.data,

        layout: "single-column",

        density: "balanced",

        style: "ats",

        header: {
          ...validation.data.header,

          alignment: "left",

          photo: {
            ...validation.data.header.photo,
            enabled: false,
          },
        },

        sidebar: {
          enabled: false,
          sections: [],
        },

        visual: {
          ...validation.data.visual,
          cardStyle: "none",
        },

        ats: {
          safe: true,
          tablesUsed: false,
          graphicsUsed: false,
          recommendedForATS: true,
        },
      };
    }

    console.error(
      "[ATS] AI design validation failed:",
      validation.error.flatten()
    );
  } catch (error) {
    console.error(
      "[ATS] AI design generation failed:",
      error
    );
  }

  /**
   * If Gemini produces an invalid design after its own
   * retries, don't throw away the successfully optimized
   * resume.
   *
   * Use a guaranteed schema-valid ATS-safe design instead.
   */
  console.warn(
    "[ATS] Using ATS-safe fallback design."
  );

  return ResumeDesignSchema.parse(
    ATS_SAFE_FALLBACK_DESIGN
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("resume");
    const jobDescriptionValue =
      formData.get("jobDescription");
    const atsResultValue =
      formData.get("atsResult");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please upload the original resume PDF.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded resume is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume must be smaller than 5 MB.",
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only PDF resumes are supported.",
        },
        { status: 400 }
      );
    }

    if (typeof atsResultValue !== "string") {
      return NextResponse.json(
        {
          success: false,
          error:
            "ATS analysis is required before optimization.",
        },
        { status: 400 }
      );
    }

    /**
     * Parse ATS result from the frontend.
     */
    let parsedATSResult: unknown;

    try {
      parsedATSResult = JSON.parse(
        atsResultValue
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ATS analysis data.",
        },
        { status: 400 }
      );
    }

    /**
     * Validate ATS result before sending it
     * to the optimization engine.
     */
    const atsValidation =
      ATSResultSchema.safeParse(
        parsedATSResult
      );

    if (!atsValidation.success) {
      console.error(
        "[ATS] ATS result validation failed:",
        atsValidation.error.flatten()
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The ATS analysis structure is invalid.",
        },
        { status: 400 }
      );
    }

    const atsResult = atsValidation.data;

    const jobDescription =
      typeof jobDescriptionValue === "string"
        ? jobDescriptionValue.trim()
        : "";

    /**
     * Extract text from the original PDF.
     */
    const arrayBuffer =
      await file.arrayBuffer();

    const buffer = new Uint8Array(
      arrayBuffer
    );

    const { text } =
      await extractText(buffer);

    const resumeText = Array.isArray(text)
      ? text.join("\n")
      : String(text ?? "");

    const cleanResumeText =
      resumeText.trim();

    if (!cleanResumeText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not extract readable text from this PDF.",
        },
        { status: 400 }
      );
    }

    console.log(
      `[ATS] Optimizing resume for user ${user.id}`
    );

    /**
     * STEP 1
     *
     * Optimize resume content.
     */
    const optimizedResume =
      await optimizeResumeForATS(
        cleanResumeText,
        atsResult,
        jobDescription
      );

    /**
     * STEP 2
     *
     * Validate the optimized resume.
     */
    const resumeValidation =
      ResumeSchema.safeParse(
        optimizedResume
      );

    if (!resumeValidation.success) {
      console.error(
        "[ATS] Optimized resume validation failed:",
        resumeValidation.error.flatten()
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "AI returned an invalid optimized resume structure.",
        },
        { status: 500 }
      );
    }

    const validatedResume =
      resumeValidation.data;

    console.log(
      "[ATS] Optimized resume validated successfully."
    );

    /**
     * STEP 3
     *
     * Generate ATS-safe design.
     *
     * This has its own fallback, so a design-generation
     * problem cannot destroy the successful resume
     * optimization.
     */
    const optimizedDesign =
      await generateATSSafeDesign();

    console.log(
      "[ATS] Resume design validated successfully."
    );

    /**
     * Count recommendations applied.
     */
    const recommendations =
      atsResult.recommendations;

    const highPriority =
      recommendations.filter(
        (item) =>
          item.priority === "high"
      ).length;

    const mediumPriority =
      recommendations.filter(
        (item) =>
          item.priority === "medium"
      ).length;

    const lowPriority =
      recommendations.filter(
        (item) =>
          item.priority === "low"
      ).length;

    /**
     * Return optimized resume + design.
     *
     * The frontend will then call /api/ats/verify
     * to calculate the real AFTER ATS score.
     */
    return NextResponse.json(
      {
        success: true,

        originalScore:
          atsResult.overallScore,

        optimizedResume:
          validatedResume,

        optimizedDesign,

        optimization: {
          recommendationsApplied:
            recommendations.length,

          highPriority,

          mediumPriority,

          lowPriority,
        },

        verification: {
          required: true,

          message:
            "The optimized resume must be rechecked using the ATS analyzer before an improved score is displayed.",
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "[ATS] Optimization error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to optimize resume.",
      },
      {
        status: 500,
      }
    );
  }
}