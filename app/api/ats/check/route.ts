import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateATSResult } from "@/lib/ai/ats-generator";
import {
  extractText,
  getDocumentProxy,
} from "unpdf";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_JOB_DESCRIPTION_LENGTH = 12000;

export async function POST(request: Request) {
  try {
    // =========================================================
    // 1. AUTHENTICATION
    // =========================================================

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
        { status: 401 },
      );
    }

    // =========================================================
    // 2. READ FORM DATA
    // =========================================================

    const formData = await request.formData();

    const file = formData.get("resume");
    const jobDescriptionValue =
      formData.get("jobDescription");

    // =========================================================
    // 3. VALIDATE RESUME FILE
    // =========================================================

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a resume PDF.",
        },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded PDF is empty.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume must be smaller than 5 MB.",
        },
        { status: 400 },
      );
    }

    /*
     * Some browsers do not always provide the correct
     * MIME type, so we check the filename as well.
     */

    const fileName =
      file.name.toLowerCase();

    const isPdf =
      file.type === "application/pdf" ||
      fileName.endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only PDF resume files are supported.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 4. JOB DESCRIPTION
    // =========================================================

    let jobDescription = "";

    if (
      typeof jobDescriptionValue ===
      "string"
    ) {
      jobDescription =
        jobDescriptionValue.trim();
    }

    if (
      jobDescription.length >
      MAX_JOB_DESCRIPTION_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Job description is too long. Please keep it under 12,000 characters.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 5. CONVERT PDF TO BYTES
    // =========================================================

    const arrayBuffer =
      await file.arrayBuffer();

    const pdfData = new Uint8Array(
      arrayBuffer,
    );

    // =========================================================
    // 6. LOAD PDF
    // =========================================================

    let pdf;

    try {
      pdf =
        await getDocumentProxy(
          pdfData,
        );
    } catch (error) {
      console.error(
        "[ATS] Failed to load PDF:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "We could not open this PDF. Please make sure it is a valid PDF file.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 7. VALIDATE PAGE COUNT
    // =========================================================

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
        { status: 400 },
      );
    }

    if (pdf.numPages > 20) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume PDF contains too many pages. Please upload a resume with 20 pages or fewer.",
        },
        { status: 400 },
      );
    }

    console.log(
      `[ATS] PDF loaded successfully. Pages: ${pdf.numPages}`,
    );

    // =========================================================
    // 8. EXTRACT TEXT
    // =========================================================

    let resumeText = "";

    try {
      const extracted =
        await extractText(pdf, {
          mergePages: true,
        });

      /*
       * IMPORTANT:
       *
       * Do not use:
       *
       * extracted.text.join(...)
       *
       * or:
       *
       * extracted.text.map(...)
       *
       * because the current unpdf typings expose
       * the text differently.
       *
       * String() safely converts the returned value
       * into a usable string.
       */

      resumeText = String(
        extracted.text ?? "",
      );
    } catch (error) {
      console.error(
        "[ATS] PDF text extraction failed:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "We could not read this PDF. Please upload a text-based PDF resume.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 9. CLEAN RESUME TEXT
    // =========================================================

    const cleanResumeText =
      resumeText
        .replace(/\u0000/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    console.log(
      `[ATS] Extracted resume characters: ${cleanResumeText.length}`,
    );

    // =========================================================
    // 10. CHECK EXTRACTED TEXT
    // =========================================================

    if (!cleanResumeText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This PDF does not contain selectable text. Please upload a text-based PDF resume.",
        },
        { status: 400 },
      );
    }

    /*
     * If almost no text was extracted, the PDF is very
     * likely an image/scanned document.
     */

    if (cleanResumeText.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not find enough readable text in this PDF. Please upload a text-based PDF resume.",
        },
        { status: 400 },
      );
    }

    // =========================================================
    // 11. DEBUG PREVIEW
    // =========================================================

    console.log(
      "[ATS] Resume text preview:",
      cleanResumeText.slice(0, 500),
    );

    // =========================================================
    // 12. GENERATE ATS ANALYSIS
    // =========================================================

    let result;

    try {
      result =
        await generateATSResult(
          cleanResumeText,
          jobDescription || undefined,
        );
    } catch (error) {
      console.error(
        "[ATS] AI analysis failed:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to analyze the resume with AI.",
        },
        { status: 500 },
      );
    }

    // =========================================================
    // 13. SAVE ATS CHECK
    // =========================================================

    const {
      data: atsCheck,
      error: atsCheckError,
    } = await supabase
      .from("ats_checks")
      .insert({
        user_id: user.id,
        job_description:
          jobDescription || null,
      })
      .select("id")
      .single();

    /*
     * Analysis should still be returned even if
     * database saving fails.
     */

    if (atsCheckError) {
      console.error(
        "[ATS] ATS check database error:",
        atsCheckError,
      );

      return NextResponse.json(
        {
          success: true,
          saved: false,
          result,
          message:
            "ATS analysis completed, but the result could not be saved.",
        },
        { status: 200 },
      );
    }

    // =========================================================
    // 14. SAVE ATS RESULT
    // =========================================================

    const {
      error: atsResultError,
    } = await supabase
      .from("ats_results")
      .insert({
        ats_check_id: atsCheck.id,
        overall_score:
          result.overallScore,
        result,
      });

    if (atsResultError) {
      console.error(
        "[ATS] ATS result database error:",
        atsResultError,
      );
    }

    // =========================================================
    // 15. RETURN SUCCESS
    // =========================================================

    return NextResponse.json(
      {
        success: true,
        saved: true,
        atsCheckId: atsCheck.id,
        result,
      },
      { status: 200 },
    );
  } catch (error) {
    // =========================================================
    // GLOBAL ERROR HANDLER
    // =========================================================

    console.error(
      "[ATS] Unexpected API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze resume.",
      },
      { status: 500 },
    );
  }
}