import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateATSResult } from "@/lib/ai/ats-generator";
import { ResumeSchema } from "@/lib/ai/resume-schema";
import { resumeDataToText } from "@/lib/ats/resume-data-to-text";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    /*
     * --------------------------------------------------
     * AUTHENTICATION
     * --------------------------------------------------
     */

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
        { status: 401 }
      );
    }

    /*
     * --------------------------------------------------
     * REQUEST
     * --------------------------------------------------
     */

    const body = await request.json();

    const resumeId =
      typeof body?.resumeId === "string"
        ? body.resumeId
        : "";

    const jobDescription =
      typeof body?.jobDescription === "string"
        ? body.jobDescription.trim()
        : "";

    if (!resumeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * LOAD USER'S SAVED RESUME
     * --------------------------------------------------
     */

    const { data: savedResume, error: resumeError } =
      await supabase
        .from("resumes")
        .select(
          `
            id,
            user_id,
            title,
            resume_data,
            design_config,
            template,
            profile_image_path
          `
        )
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single();

    if (resumeError || !savedResume) {
      console.error(
        "[ATS] Saved resume lookup failed:",
        resumeError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Saved resume could not be found.",
        },
        { status: 404 }
      );
    }

    /*
     * --------------------------------------------------
     * VALIDATE RESUME DATA
     * --------------------------------------------------
     */

    const resumeValidation =
      ResumeSchema.safeParse(
        savedResume.resume_data
      );

    if (!resumeValidation.success) {
      console.error(
        "[ATS] Saved resume validation failed:",
        resumeValidation.error.flatten()
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The saved resume contains invalid data.",
        },
        { status: 500 }
      );
    }

    const resume =
      resumeValidation.data;

    /*
     * --------------------------------------------------
     * CONVERT RESUME TO TEXT
     * --------------------------------------------------
     *
     * ATS analyzes the actual resume content.
     * We do NOT touch the design here.
     */

    const resumeText =
      resumeDataToText(resume);

    if (!resumeText.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not read the saved resume content.",
        },
        { status: 400 }
      );
    }

    console.log(
      `[ATS] Analyzing saved resume ${resumeId} for user ${user.id}`
    );

    /*
     * --------------------------------------------------
     * GENERATE ATS SCORE
     * --------------------------------------------------
     */

    const result =
      await generateATSResult(
        resumeText,
        jobDescription || undefined
      );

    /*
     * --------------------------------------------------
     * SAVE ATS CHECK
     * --------------------------------------------------
     */

    const {
      data: atsCheck,
      error: atsCheckError,
    } = await supabase
      .from("ats_checks")
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_description:
          jobDescription || null,
        overall_score:
          result.overallScore,
        status: "completed",
      })
      .select("id")
      .single();

    if (atsCheckError) {
      console.error(
        "[ATS] Could not save ATS check:",
        atsCheckError
      );

      /*
       * Analysis itself succeeded, so still
       * return the result to the user.
       */
      return NextResponse.json({
        success: true,
        saved: false,
        result,
        resumeId,
      });
    }

    /*
     * --------------------------------------------------
     * SAVE ATS RESULT
     * --------------------------------------------------
     */

    const {
      error: atsResultError,
    } = await supabase
      .from("ats_results")
      .insert({
        ats_check_id:
          atsCheck.id,
        keyword_score:
          result.keywordMatch.score,
        skills_score:
          result.skills.score,
        experience_score:
          result.experience.score,
        formatting_score:
          result.formatting.score,
        matched_keywords:
          result.keywordMatch
            .matchedKeywords,
        missing_keywords:
          result.keywordMatch
            .missingKeywords,
        suggestions:
          result.recommendations,
      });

    if (atsResultError) {
      console.error(
        "[ATS] Could not save ATS result:",
        atsResultError
      );
    }

    /*
     * --------------------------------------------------
     * RESPONSE
     * --------------------------------------------------
     */

    return NextResponse.json({
      success: true,
      saved: true,
      atsCheckId: atsCheck.id,
      resumeId,
      result,

      /*
       * VERY IMPORTANT:
       *
       * Return the original design.
       * We never generate a new design here.
       */
      design:
        savedResume.design_config,

      template:
        savedResume.template,

      profileImagePath:
        savedResume.profile_image_path,
    });
  } catch (error) {
    console.error(
      "[ATS] Saved resume analysis error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze saved resume.",
      },
      { status: 500 }
    );
  }
}