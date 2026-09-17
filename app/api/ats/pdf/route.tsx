import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { ResumeSchema } from "@/lib/ai/resume-schema";
import { ATSResumePDF } from "@/lib/ats/ats-resume-pdf";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body?.resume) {
      return NextResponse.json(
        {
          success: false,
          error: "Optimized resume data is required.",
        },
        { status: 400 },
      );
    }

    const parsedResume = ResumeSchema.safeParse(body.resume);

    if (!parsedResume.success) {
      console.error(
        "ATS PDF ResumeSchema validation failed:",
        parsedResume.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid optimized resume data.",
        },
        { status: 400 },
      );
    }

    const resume = parsedResume.data;

    const pdfBuffer = await renderToBuffer(
      <ATSResumePDF resume={resume} />,
    );

    const safeName =
      resume.personal.name
        ?.trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "resume";

    const fileName = `${safeName}-ats-optimized-resume.pdf`;

    return new NextResponse(pdfBuffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("ATS PDF generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate ATS PDF.",
      },
      { status: 500 },
    );
  }
}