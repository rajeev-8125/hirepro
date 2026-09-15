import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { ResumePDF } from "@/lib/resume/resume-pdf";

import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

type PDFRequest = {
  resume: ResumeData;
  design: ResumeDesign;
  profilePhoto?: string | null;
};

export async function POST(request: Request) {
  try {
    // ---------------------------------------------
    // 1. AUTHENTICATION
    // ---------------------------------------------

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ---------------------------------------------
    // 2. READ REQUEST BODY
    // ---------------------------------------------

    const body =
      (await request.json()) as PDFRequest;

    if (!body.resume) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume data is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.design) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume design is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------
    // 3. PROFILE PHOTO SIZE CHECK
    // ---------------------------------------------

    if (
      body.profilePhoto &&
      body.profilePhoto.length > 8_000_000
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile photo is too large.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------
    // 4. GENERATE PDF
    // ---------------------------------------------

    const pdfBuffer =
      await renderToBuffer(
        <ResumePDF
          resume={body.resume}
          design={body.design}
          profilePhoto={
            body.profilePhoto ?? null
          }
        />
      );

    // ---------------------------------------------
    // 5. CONVERT BUFFER TO UINT8ARRAY
    // ---------------------------------------------

    const pdfData =
      new Uint8Array(pdfBuffer);

    // ---------------------------------------------
    // 6. CREATE SAFE FILE NAME
    // ---------------------------------------------

    const safeName =
      body.resume.personal.name
        ?.trim()
        .replace(
          /[^a-zA-Z0-9]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        ) || "resume";

    // ---------------------------------------------
    // 7. RETURN PDF
    // ---------------------------------------------

    return new Response(pdfData, {
      status: 200,
      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename="${safeName}-Resume.pdf"`,

        "Cache-Control":
          "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "Resume PDF generation error:",
      error
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
      }
    );
  }
}