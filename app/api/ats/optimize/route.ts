import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractText } from "unpdf";
import { optimizeResumeForATS } from "@/lib/ai/ats-resume-optimizer";
import { ATSResultSchema } from "@/lib/ai/ats-schema";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    // 1. Authentication
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

    // 2. Read form data
    const formData = await request.formData();

    const file = formData.get("resume");
    const jobDescriptionValue =
      formData.get("jobDescription");

    const atsResultValue =
      formData.get("atsResult");

    // 3. Validate resume
    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Please upload the original resume PDF.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          error: "The uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "Resume must be smaller than 5 MB.",
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error:
            "Only PDF resumes are supported.",
        },
        { status: 400 }
      );
    }

    // 4. Validate ATS result
    if (typeof atsResultValue !== "string") {
      return NextResponse.json(
        {
          error:
            "ATS analysis is required before optimization.",
        },
        { status: 400 }
      );
    }

    let atsResult;

    try {
      atsResult = JSON.parse(atsResultValue);
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid ATS analysis data.",
        },
        { status: 400 }
      );
    }

    const atsValidation =
      ATSResultSchema.safeParse(atsResult);

    if (!atsValidation.success) {
      return NextResponse.json(
        {
          error:
            "The ATS analysis structure is invalid.",
        },
        { status: 400 }
      );
    }

    // 5. Job description
    const jobDescription =
      typeof jobDescriptionValue === "string"
        ? jobDescriptionValue.trim()
        : "";

    // 6. Extract PDF text
    const arrayBuffer =
      await file.arrayBuffer();

    const buffer = new Uint8Array(arrayBuffer);

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

    // 7. Optimize resume
    const optimizedResume =
      await optimizeResumeForATS(
        resumeText,
        atsValidation.data,
        jobDescription
      );

    // 8. Return optimized ResumeData
    return NextResponse.json({
      success: true,
      optimizedResume,
      originalScore:
        atsValidation.data.overallScore,
    });
  } catch (error) {
    console.error(
      "ATS optimization API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to optimize resume.",
      },
      { status: 500 }
    );
  }
}