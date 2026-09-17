import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  extractText,
  getDocumentProxy,
} from "unpdf";

import {
  optimizeResumeForATS,
} from "@/lib/ai/ats-resume-optimizer";

import {
  generateResumeDesign,
} from "@/lib/ai/resume-design-generator";

import {
  ATSResultSchema,
} from "@/lib/ai/ats-schema";

import {
  ResumeSchema,
} from "@/lib/ai/resume-schema";

import {
  ResumeDesignSchema,
} from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

/**
 * ATS-safe fallback design.
 *
 * This is only used when the AI design generator
 * fails or returns invalid data.
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
 * Generate an ATS-safe design.
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

The output MUST EXACTLY follow the
ResumeDesignSchema structure.

DO NOT omit fields.

DO NOT add fields.

DO NOT use null.

DO NOT use undefined.

Use ONLY valid enum values.

Use this structure:

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

ATS REQUIREMENTS:

- sidebar.enabled MUST be false
- header.photo.enabled MUST be false
- visual.cardStyle MUST be none
- layout MUST be single-column
- ats.safe MUST be true
- ats.tablesUsed MUST be false
- ats.graphicsUsed MUST be false
- ats.recommendedForATS MUST be true

DO NOT use:

- tables
- charts
- graphics
- progress bars
- icons
- text boxes
- decorative symbols
- unusual fonts
- dark page backgrounds
- complicated columns

Return ONLY JSON.
`;

  try {
    const generatedDesign =
      await generateResumeDesign(
        designPrompt,
      );

    const validation =
      ResumeDesignSchema.safeParse(
        generatedDesign,
      );

    if (validation.success) {
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
      validation.error.flatten(),
    );
  } catch (error) {
    console.error(
      "[ATS] AI design generation failed:",
      error,
    );
  }

  console.warn(
    "[ATS] Using ATS-safe fallback design.",
  );

  return ResumeDesignSchema.parse(
    ATS_SAFE_FALLBACK_DESIGN,
  );
}

/**
 * Normalize extracted PDF text.
 */
function cleanExtractedText(
  text: string,
): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Parse and validate requested resume page count.
 *
 * The page count is an AI optimization requirement.
 * It is NOT merely a PDF formatting option.
 */
function parsePageCount(
  value: FormDataEntryValue | null,
): 1 | 2 | 3 {
  if (
    typeof value !== "string"
  ) {
    return 2;
  }

  const parsed =
    Number(value);

  if (parsed === 1) {
    return 1;
  }

  if (parsed === 3) {
    return 3;
  }

  return 2;
}

/**
 * POST /api/ats/optimize
 */
export async function POST(
  request: Request,
) {
  try {
    /**
     * ----------------------------------------
     * AUTHENTICATION
     * ----------------------------------------
     */
    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please sign in.",
        },
        {
          status: 401,
        },
      );
    }

    /**
     * ----------------------------------------
     * FORM DATA
     * ----------------------------------------
     */
    const formData =
      await request.formData();

    const file =
      formData.get("resume");

    const jobDescriptionValue =
      formData.get(
        "jobDescription",
      );

    const atsResultValue =
      formData.get(
        "atsResult",
      );

    /**
     * ----------------------------------------
     * TARGET PAGE COUNT
     * ----------------------------------------
     *
     * This comes from the UI selection:
     *
     * 1 page
     * 2 pages
     * 3 pages
     *
     * It is passed into the AI optimizer below.
     */
    const pageCount =
      parsePageCount(
        formData.get(
          "pageCount",
        ),
      );

    console.log(
      `[ATS] Requested optimization length: ${pageCount} page(s)`,
    );

    /**
     * ----------------------------------------
     * FILE VALIDATION
     * ----------------------------------------
     */
    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please upload the original resume PDF.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      file.size === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The uploaded resume is empty.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume must be smaller than 5 MB.",
        },
        {
          status: 400,
        },
      );
    }

    const fileName =
      file.name.toLowerCase();

    const isPdf =
      file.type ===
        "application/pdf" ||
      fileName.endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only PDF resume files are supported.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * ----------------------------------------
     * ATS RESULT VALIDATION
     * ----------------------------------------
     */
    if (
      typeof atsResultValue !==
      "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ATS analysis is required before optimization.",
        },
        {
          status: 400,
        },
      );
    }

    let parsedATSResult: unknown;

    try {
      parsedATSResult =
        JSON.parse(
          atsResultValue,
        );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid ATS analysis data.",
        },
        {
          status: 400,
        },
      );
    }

    const atsValidation =
      ATSResultSchema.safeParse(
        parsedATSResult,
      );

    if (
      !atsValidation.success
    ) {
      console.error(
        "[ATS] ATS result validation failed:",
        atsValidation.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The ATS analysis structure is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    const atsResult =
      atsValidation.data;

    /**
     * ----------------------------------------
     * JOB DESCRIPTION
     * ----------------------------------------
     */
    const jobDescription =
      typeof jobDescriptionValue ===
      "string"
        ? jobDescriptionValue.trim()
        : "";

    /**
     * ----------------------------------------
     * READ PDF
     * ----------------------------------------
     */
    const arrayBuffer =
      await file.arrayBuffer();

    const pdfData =
      new Uint8Array(
        arrayBuffer,
      );

    let pdf;

    try {
      pdf =
        await getDocumentProxy(
          pdfData,
        );
    } catch (error) {
      console.error(
        "[ATS] Failed to load PDF during optimization:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "We could not open this PDF. Please make sure it is a valid PDF file.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !pdf ||
      !pdf.numPages ||
      pdf.numPages <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This PDF does not contain any readable pages.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      pdf.numPages > 20
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume PDF contains too many pages. Please upload a resume with 20 pages or fewer.",
        },
        {
          status: 400,
        },
      );
    }

    console.log(
      `[ATS] PDF loaded successfully. Original pages: ${pdf.numPages}`,
    );

    /**
     * ----------------------------------------
     * EXTRACT TEXT
     * ----------------------------------------
     */
    let resumeText = "";

    try {
      const extracted =
        await extractText(
          pdf,
          {
            mergePages: true,
          },
        );

      resumeText =
        String(
          extracted.text ?? "",
        );
    } catch (error) {
      console.error(
        "[ATS] PDF text extraction failed during optimization:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "We could not read this PDF. Please upload a text-based PDF resume.",
        },
        {
          status: 400,
        },
      );
    }

    const cleanResumeText =
      cleanExtractedText(
        resumeText,
      );

    console.log(
      `[ATS] Extracted resume characters: ${cleanResumeText.length}`,
    );

    if (
      !cleanResumeText
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not extract readable text from this PDF.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      cleanResumeText.length <
      50
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not find enough readable text in this PDF.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * ----------------------------------------
     * AI OPTIMIZATION
     * ----------------------------------------
     *
     * IMPORTANT:
     *
     * pageCount is passed as the fourth argument.
     *
     * The optimizer should use:
     *
     * - ATS missing keywords
     * - ATS missing skills
     * - ATS recommendations
     * - job description
     * - original resume facts
     * - selected page count
     *
     * while preventing fabricated information.
     */
    console.log(
      `[ATS] Starting AI optimization for ${pageCount} page(s).`,
    );

    const optimizedResume =
      await optimizeResumeForATS(
        cleanResumeText,
        atsResult,
        jobDescription,
        pageCount,
      );

    /**
     * ----------------------------------------
     * VALIDATE OPTIMIZED RESUME
     * ----------------------------------------
     */
    const resumeValidation =
      ResumeSchema.safeParse(
        optimizedResume,
      );

    if (
      !resumeValidation.success
    ) {
      console.error(
        "[ATS] Optimized resume validation failed:",
        resumeValidation.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "AI returned an invalid optimized resume structure.",
        },
        {
          status: 500,
        },
      );
    }

    const validatedResume =
      resumeValidation.data;

    console.log(
      "[ATS] Optimized resume validated successfully.",
    );

    /**
     * ----------------------------------------
     * GENERATE ATS DESIGN
     * ----------------------------------------
     */
    const optimizedDesign =
      await generateATSSafeDesign();

    console.log(
      "[ATS] ATS-safe resume design generated successfully.",
    );

    /**
     * ----------------------------------------
     * COUNT RECOMMENDATIONS
     * ----------------------------------------
     */
    const recommendations =
      atsResult.recommendations ??
      [];

    const highPriority =
      recommendations.filter(
        (item) =>
          item.priority ===
          "high",
      ).length;

    const mediumPriority =
      recommendations.filter(
        (item) =>
          item.priority ===
          "medium",
      ).length;

    const lowPriority =
      recommendations.filter(
        (item) =>
          item.priority ===
          "low",
      ).length;

    /**
     * ----------------------------------------
     * RETURN RESULT
     * ----------------------------------------
     */
    return NextResponse.json(
      {
        success: true,

        originalScore:
          atsResult.overallScore,

        optimizedResume:
          validatedResume,

        optimizedDesign,

        requestedPageCount:
          pageCount,

        originalPdfPageCount:
          pdf.numPages,

        optimization: {
          recommendationsApplied:
            recommendations.length,

          highPriority,

          mediumPriority,

          lowPriority,
        },

        optimizationStrategy: {
          pageCount,

          usesMissingKeywords: true,

          usesMissingSkills: true,

          usesRecommendations: true,

          usesJobDescription:
            Boolean(
              jobDescription,
            ),

          preservesOriginalFacts:
            true,

          preventsFabrication:
            true,
        },

        verification: {
          required: true,

          message:
            "The optimized resume should be rechecked using the ATS analyzer before displaying the final improved score.",
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[ATS] Optimization error:",
      error,
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
      },
    );
  }
}