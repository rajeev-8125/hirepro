import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { ResumeSchema } from "@/lib/ai/resume-schema";
import { ATSResumePDF } from "@/lib/ats/ats-resume-pdf";

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

export async function POST(
  request: NextRequest,
) {
  try {
    // ============================================================
    // 1. AUTHENTICATION
    // ============================================================

    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
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

    // ============================================================
    // 2. READ REQUEST
    // ============================================================

    const body =
      await request.json();

    if (!body?.resume) {
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

    // ============================================================
    // 3. VALIDATE RESUME
    // ============================================================

    const parsedResume =
      ResumeSchema.safeParse(
        body.resume,
      );

    if (!parsedResume.success) {
      console.error(
        "ATS PDF ResumeSchema validation failed:",
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

    // ============================================================
    // 4. PAGE COUNT
    // ============================================================

    const pageCount =
      parsePageCount(
        body.pageCount,
      );

    // ============================================================
    // 5. GENERATE PDF
    // ============================================================

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

    // ============================================================
    // 6. SAFE FILE NAME
    // ============================================================

    const safeName =
      resume.personal.name
        ?.trim()
        .replace(
          /[^a-zA-Z0-9]+/g,
          "-",
        )
        .replace(
          /^-+|-+$/g,
          "",
        )
        .toLowerCase() ||
      "resume";

    const fileName =
      `${safeName}-ats-optimized-resume.pdf`;

    // ============================================================
    // 7. RETURN PDF
    // ============================================================

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
            "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "ATS PDF generation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate ATS optimized PDF.",
      },
      {
        status: 500,
      },
    );
  }
}