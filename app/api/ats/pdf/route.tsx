import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  renderToBuffer,
} from "@react-pdf/renderer";

import {
  ResumeSchema,
} from "@/lib/ai/resume-schema";

import {
  ATSResumePDF,
} from "@/lib/ats/ats-resume-pdf";

export const runtime = "nodejs";

type ResumePageCount = 1 | 2 | 3;

function parsePageCount(
  value: unknown,
): ResumePageCount {
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

function safeFileName(
  name: string,
) {
  const cleaned =
    name
      .trim()
      .replace(
        /[^a-zA-Z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      )
      .toLowerCase();

  return (
    cleaned ||
    "resume"
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * ============================================================
     * AUTHENTICATION
     * ============================================================
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

    /*
     * ============================================================
     * REQUEST
     * ============================================================
     */

    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid JSON request.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      !("resume" in body)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Optimized resume data is required.",
        },
        {
          status: 400,
        },
      );
    }

    const requestBody =
      body as {
        resume: unknown;
        pageCount?: unknown;
      };

    /*
     * ============================================================
     * RESUME VALIDATION
     * ============================================================
     */

    const parsedResume =
      ResumeSchema.safeParse(
        requestBody.resume,
      );

    if (!parsedResume.success) {
      console.error(
        "[ATS PDF] Resume validation failed:",
        parsedResume.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid optimized resume data.",
          details:
            parsedResume.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const resume =
      parsedResume.data;

    /*
     * ============================================================
     * PAGE COUNT
     * ============================================================
     */

    const pageCount =
      parsePageCount(
        requestBody.pageCount,
      );

    /*
     * ============================================================
     * PDF GENERATION
     * ============================================================
     *
     * IMPORTANT:
     *
     * This PDF is the same document that the frontend later
     * sends back to /api/ats/check for the NEW ATS score.
     */

    const pdfBuffer =
      await renderToBuffer(
        <ATSResumePDF
          resume={resume}
          pageCount={pageCount}
        />,
      );

    if (
      !pdfBuffer ||
      pdfBuffer.length === 0
    ) {
      throw new Error(
        "The generated PDF is empty.",
      );
    }

    /*
     * ============================================================
     * FILE NAME
     * ============================================================
     */

    const name =
      safeFileName(
        resume.personal.name,
      );

    const fileName =
      `${name}-ats-optimized-resume.pdf`;

    /*
     * ============================================================
     * RESPONSE
     * ============================================================
     */

    return new NextResponse(
      pdfBuffer as BodyInit,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${fileName}"`,

          "Content-Length":
            String(
              pdfBuffer.length,
            ),

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-HirePro-Page-Count":
            String(pageCount),

          "X-HirePro-ATS-Ready":
            "true",
        },
      },
    );
  } catch (error) {
    console.error(
      "[ATS PDF] Generation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate the optimized ATS PDF.",
      },
      {
        status: 500,
      },
    );
  }
}