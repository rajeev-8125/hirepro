import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateATSResult } from "@/lib/ai/ats-generator";
import { extractText } from "unpdf";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Read uploaded form
    const formData = await request.formData();

    const file = formData.get("resume");
    const jobDescriptionValue = formData.get("jobDescription");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a resume PDF." },
        { status: 400 }
      );
    }

    // 3. Validate file
    if (file.size === 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Resume must be smaller than 5 MB." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF resumes are supported." },
        { status: 400 }
      );
    }

    // 4. Get job description
    const jobDescription =
      typeof jobDescriptionValue === "string"
        ? jobDescriptionValue.trim()
        : "";

    // 5. Convert PDF to bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 6. Extract resume text
    const { text } = await extractText(buffer);

    const resumeText = Array.isArray(text)
      ? text.join("\n")
      : String(text ?? "");

    if (!resumeText.trim()) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from this PDF. Please upload a text-based resume PDF.",
        },
        { status: 400 }
      );
    }

    // 7. Generate ATS analysis
    const result = await generateATSResult(
      resumeText,
      jobDescription || undefined
    );

    // 8. Save ATS check
    const { data: atsCheck, error: atsCheckError } =
      await supabase
        .from("ats_checks")
        .insert({
          user_id: user.id,
          job_description: jobDescription || null,
        })
        .select("id")
        .single();

    if (atsCheckError) {
      console.error(
        "ATS check database error:",
        atsCheckError
      );

      return NextResponse.json(
        {
          error: "ATS analysis completed, but could not save the result.",
          result,
        },
        { status: 200 }
      );
    }

    // 9. Save detailed ATS result
    const { error: atsResultError } = await supabase
      .from("ats_results")
      .insert({
        ats_check_id: atsCheck.id,
        overall_score: result.overallScore,
        result,
      });

    if (atsResultError) {
      console.error(
        "ATS result database error:",
        atsResultError
      );
    }

    // 10. Return result
    return NextResponse.json({
      success: true,
      atsCheckId: atsCheck.id,
      result,
    });
  } catch (error) {
    console.error("ATS API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze resume.",
      },
      { status: 500 }
    );
  }
}