import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { ResumePDF } from "@/lib/resume/resume-pdf";

import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";

import {
  ResumeDesignSchema,
  type ResumeDesign,
} from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

type PDFRequest = {
  resume: ResumeData;
  design: ResumeDesign;
  profilePhoto?: string | null;
};

const MAX_PROFILE_PHOTO_SIZE = 8_000_000;

/**
 * Creates a safe filename from the candidate's name.
 */
function createSafeFileName(
  name: string | undefined,
): string {
  const safeName =
    name
      ?.trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "resume";

  return `${safeName}-Resume.pdf`;
}

export async function POST(request: Request) {
  try {
    // ============================================================
    // 1. AUTHENTICATION
    // ============================================================

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please sign in first.",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================================
    // 2. READ REQUEST BODY
    // ============================================================

    let body: PDFRequest;

    try {
      body =
        (await request.json()) as PDFRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // 3. CHECK RESUME
    // ============================================================

    if (!body.resume) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume data is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // 4. VALIDATE RESUME DATA
    // ============================================================

    const resumeValidation =
      ResumeSchema.safeParse(body.resume);

    if (!resumeValidation.success) {
      console.error(
        "Resume PDF validation failed:",
        resumeValidation.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid resume data.",
        },
        {
          status: 400,
        },
      );
    }

    const resume =
      resumeValidation.data;

    // ============================================================
    // 5. CHECK DESIGN
    // ============================================================

    if (!body.design) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume design is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // 6. VALIDATE DESIGN DATA
    // ============================================================

    const designValidation =
      ResumeDesignSchema.safeParse(
        body.design,
      );

    if (!designValidation.success) {
      console.error(
        "Resume design validation failed:",
        designValidation.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid resume design.",
        },
        {
          status: 400,
        },
      );
    }

    const design =
      designValidation.data;

    // ============================================================
    // 7. PROFILE PHOTO
    // ============================================================

    const profilePhoto =
      body.profilePhoto ?? null;

    if (
      profilePhoto &&
      profilePhoto.length >
        MAX_PROFILE_PHOTO_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Profile photo is too large. Please use a smaller image.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // 8. GENERATE PDF
    // ============================================================

    const pdfBuffer =
      await renderToBuffer(
        <ResumePDF
          resume={resume}
          design={design}
          profilePhoto={profilePhoto}
        />,
      );

    // ============================================================
    // 9. CONVERT BUFFER
    // ============================================================

    const pdfData =
      new Uint8Array(pdfBuffer);

    // ============================================================
    // 10. CREATE SAFE FILE NAME
    // ============================================================

    const fileName =
      createSafeFileName(
        resume.personal?.name,
      );

    // ============================================================
    // 11. RETURN PDF
    // ============================================================

    return new Response(
      pdfData,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${fileName}"`,

          "Content-Length":
            String(
              pdfData.byteLength,
            ),

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      },
    );
  } catch (error) {
    console.error(
      "Resume PDF generation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate PDF.",
      },
      {
        status: 500,
      },
    );
  }
}