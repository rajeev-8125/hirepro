import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractText } from "unpdf";

import { generateATSResult } from "@/lib/ai/ats-analyzer";
import { ATSResultSchema } from "@/lib/ai/ats-schema";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function cleanText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request: Request) {
  try {
    // ------------------------------------------------------------
    // 1. Authentication
    // ------------------------------------------------------------
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in first.",
        },
        { status: 401 },
      );
    }

    // ------------------------------------------------------------
    // 2. Read multipart form data
    // ------------------------------------------------------------
    const formData = await request.formData();

    const resumeFile = formData.get("resume");
    const jobDescriptionValue = formData.get("jobDescription");

    // ATS remains completely independent of Resume Builder.
    // Any valid PDF resume can be checked.
    if (!(resumeFile instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a PDF resume.",
        },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------
    // 3. Validate file
    // ------------------------------------------------------------
    if (resumeFile.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded resume is empty.",
        },
        { status: 400 },
      );
    }

    if (resumeFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume PDF must be 5 MB or smaller.",
        },
        { status: 400 },
      );
    }

    const fileName = resumeFile.name.toLowerCase();

    if (
      resumeFile.type !== "application/pdf" &&
      !fileName.endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF resumes are supported.",
        },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------
    // 4. Optional job description
    // ------------------------------------------------------------
    const jobDescription =
      typeof jobDescriptionValue === "string"
        ? cleanText(jobDescriptionValue)
        : "";

    // ------------------------------------------------------------
    // 5. Extract PDF text
    // ------------------------------------------------------------
    const pdfBuffer = Buffer.from(await resumeFile.arrayBuffer());

    let extractedText = "";

    try {
      const result = await extractText(pdfBuffer);

      extractedText = Array.isArray(result.text)
        ? result.text.join("\n")
        : String(result.text ?? "");
    } catch (pdfError) {
      console.error("ATS verification PDF extraction error:", pdfError);

      return NextResponse.json(
        {
          success: false,
          error:
            "We could not read this PDF. Please upload a text-based PDF resume.",
        },
        { status: 422 },
      );
    }

    const resumeText = cleanText(extractedText);

    // ------------------------------------------------------------
    // 6. Validate extracted text
    // ------------------------------------------------------------
    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not extract enough readable text from this PDF.",
        },
        { status: 422 },
      );
    }

    // ------------------------------------------------------------
    // 7. Run the SAME ATS engine used by the initial checker
    // ------------------------------------------------------------
    const rawResult = await generateATSResult(
      resumeText,
      jobDescription,
    );

    // ------------------------------------------------------------
    // 8. Validate AI response
    // ------------------------------------------------------------
    const validation = ATSResultSchema.safeParse(rawResult);

    if (!validation.success) {
      console.error(
        "ATS verification validation failed:",
        validation.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The ATS analyzer returned an invalid result. Please try again.",
        },
        { status: 502 },
      );
    }

    const result = validation.data;

    // ------------------------------------------------------------
    // 9. Return verified score
    // ------------------------------------------------------------
    return NextResponse.json({
      success: true,

      score: result.overallScore,

      result,

      meta: {
        verified: true,
        hasJobDescription: Boolean(jobDescription),
        resumeCharacters: resumeText.length,
        resumeFileName: resumeFile.name,
        resumeFileSize: resumeFile.size,
      },
    });
  } catch (error) {
    console.error("ATS verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while verifying your optimized resume.",
      },
      { status: 500 },
    );
  }
}