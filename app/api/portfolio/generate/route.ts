import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractText } from "unpdf";

import { generatePortfolioFromResume } from "@/lib/ai/portfolio-generator";
import { generatePortfolioDesign } from "@/lib/ai/portfolio-design-generator";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;

  let createdPortfolioId: string | null = null;
  let uploadedResumePath: string | null = null;
  let uploadedProfileImagePath: string | null = null;

  try {
    // =========================================================
    // 1. CREATE SUPABASE CLIENT
    // =========================================================

    supabase = await createClient();

    // =========================================================
    // 2. CHECK AUTHENTICATION
    // =========================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);

      return NextResponse.json(
        {
          error: "Authentication failed.",
          details: authError.message,
        },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    console.log("Authenticated user:", user.id);

    // =========================================================
    // 3. READ FORM DATA
    // =========================================================

    const formData = await request.formData();

    const resume = formData.get("file");
    const profileImage = formData.get("profileImage");
    const designDescription =
      formData.get("designDescription");

    // =========================================================
    // 4. VALIDATE RESUME
    // =========================================================

    if (!(resume instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload a PDF resume.",
        },
        { status: 400 }
      );
    }

    console.log("Resume:", resume.name);
    console.log("Resume size:", resume.size);

    if (
      resume.type !== "application/pdf" &&
      !resume.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          error: "Only PDF resumes are supported.",
        },
        { status: 400 }
      );
    }

    if (resume.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "Resume must be smaller than 10 MB.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 5. VALIDATE PROFILE IMAGE
    // =========================================================

    let validProfileImage: File | null = null;

    if (profileImage instanceof File && profileImage.size > 0) {
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedImageTypes.includes(profileImage.type)) {
        return NextResponse.json(
          {
            error:
              "Profile photo must be JPG, PNG or WebP.",
          },
          { status: 400 }
        );
      }

      if (profileImage.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error:
              "Profile photo must be smaller than 5 MB.",
          },
          { status: 400 }
        );
      }

      validProfileImage = profileImage;

      console.log(
        "Profile image:",
        profileImage.name
      );

      console.log(
        "Profile image type:",
        profileImage.type
      );
    }

    // =========================================================
    // 6. VALIDATE DESIGN DESCRIPTION
    // =========================================================

    if (
      typeof designDescription !== "string" ||
      !designDescription.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Please describe how you want your portfolio to look.",
        },
        { status: 400 }
      );
    }

    const cleanDesignDescription =
      designDescription.trim();

    console.log(
      "Design request:",
      cleanDesignDescription
    );

    // =========================================================
    // 7. EXTRACT TEXT FROM RESUME
    // =========================================================

    console.log("Reading PDF...");

    const arrayBuffer =
      await resume.arrayBuffer();

    const uint8Array =
      new Uint8Array(arrayBuffer);

    console.log(
      "Extracting resume text..."
    );

    const { text } = await extractText(
      uint8Array,
      {
        mergePages: true,
      }
    );

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from this PDF. Please upload a text-based PDF resume.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Resume text extracted:",
      text.length,
      "characters"
    );

    // =========================================================
    // 8. GENERATE PORTFOLIO CONTENT WITH GEMINI
    // =========================================================

    console.log(
      "Generating portfolio content with Gemini..."
    );

    const portfolioData =
      await generatePortfolioFromResume(
        text
      );

    console.log(
      "Portfolio content generated successfully."
    );

    // =========================================================
    // 9. GENERATE DESIGN CONFIG WITH GEMINI
    // =========================================================

    console.log(
      "Generating portfolio design with Gemini..."
    );

    const designConfig =
      await generatePortfolioDesign(
        cleanDesignDescription
      );

    console.log(
      "Portfolio design generated successfully."
    );

    // =========================================================
    // 10. CREATE PORTFOLIO TITLE
    // =========================================================

    const portfolioTitle =
      portfolioData.personal?.name
        ? `${portfolioData.personal.name}'s Portfolio`
        : "My Professional Portfolio";

    console.log(
      "Portfolio title:",
      portfolioTitle
    );

    // =========================================================
    // 11. SAVE PORTFOLIO TO SUPABASE
    // =========================================================

    console.log(
      "Creating portfolio database record..."
    );

    const {
      data: portfolio,
      error: insertError,
    } = await supabase
      .from("portfolios")
      .insert({
        user_id: user.id,

        title: portfolioTitle,

        generated_data: portfolioData,

        design_config: designConfig,

        resume_file_path: null,

        profile_image_path: null,

        theme: "professional",

        is_published: false,
      })
      .select()
      .single();

    if (insertError || !portfolio) {
      console.error(
        "Portfolio insert error:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            `Failed to create portfolio: ${
              insertError?.message ||
              "Unknown database error"
            }`,
        },
        { status: 500 }
      );
    }

    createdPortfolioId = portfolio.id;

    console.log(
      "Portfolio created:",
      createdPortfolioId
    );

    // =========================================================
    // 12. UPLOAD RESUME TO SUPABASE STORAGE
    // =========================================================

    uploadedResumePath =
      `${user.id}/${portfolio.id}/resume.pdf`;

    console.log(
      "Uploading resume:",
      uploadedResumePath
    );

    const {
      error: resumeUploadError,
    } = await supabase.storage
      .from("resumes")
      .upload(
        uploadedResumePath,
        resume,
        {
          contentType: "application/pdf",
          upsert: false,
        }
      );

    if (resumeUploadError) {
      console.error(
        "Resume upload error:",
        resumeUploadError
      );

      throw new Error(
        `Resume upload failed: ${resumeUploadError.message}`
      );
    }

    console.log(
      "Resume uploaded successfully."
    );

    // =========================================================
    // 13. UPLOAD PROFILE IMAGE
    // =========================================================

    if (validProfileImage) {
      let extension = "jpg";

      if (
        validProfileImage.type ===
        "image/png"
      ) {
        extension = "png";
      }

      if (
        validProfileImage.type ===
        "image/webp"
      ) {
        extension = "webp";
      }

      uploadedProfileImagePath =
        `${user.id}/${portfolio.id}/profile.${extension}`;

      console.log(
        "Uploading profile image:",
        uploadedProfileImagePath
      );

      const {
        error: profileUploadError,
      } = await supabase.storage
        .from("profile-images")
        .upload(
          uploadedProfileImagePath,
          validProfileImage,
          {
            contentType:
              validProfileImage.type,
            upsert: false,
          }
        );

      if (profileUploadError) {
        console.error(
          "Profile image upload error:",
          profileUploadError
        );

        throw new Error(
          `Profile image upload failed: ${profileUploadError.message}`
        );
      }

      console.log(
        "Profile image uploaded successfully."
      );
    }

    // =========================================================
    // 14. SAVE STORAGE PATHS TO DATABASE
    // =========================================================

    console.log(
      "Saving storage paths..."
    );

    const {
      data: updatedPortfolio,
      error: updateError,
    } = await supabase
      .from("portfolios")
      .update({
        resume_file_path:
          uploadedResumePath,

        profile_image_path:
          uploadedProfileImagePath,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", portfolio.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError || !updatedPortfolio) {
      console.error(
        "Portfolio path update error:",
        updateError
      );

      throw new Error(
        `Failed to save portfolio files: ${
          updateError?.message ||
          "Unknown database error"
        }`
      );
    }

    // =========================================================
    // 15. SUCCESS
    // =========================================================

    console.log(
      "===================================="
    );

    console.log(
      "PORTFOLIO GENERATION SUCCESS"
    );

    console.log(
      "Portfolio ID:",
      portfolio.id
    );

    console.log(
      "Resume:",
      uploadedResumePath
    );

    console.log(
      "Profile image:",
      uploadedProfileImagePath
    );

    console.log(
      "===================================="
    );

    return NextResponse.json({
      success: true,

      portfolio: updatedPortfolio,
    });
  } catch (error) {
    // =========================================================
    // CLEANUP
    // =========================================================

    console.error(
      "===================================="
    );

    console.error(
      "PORTFOLIO GENERATION ERROR"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    if (supabase) {
      // -----------------------------------------
      // Delete uploaded resume
      // -----------------------------------------

      if (uploadedResumePath) {
        try {
          await supabase.storage
            .from("resumes")
            .remove([
              uploadedResumePath,
            ]);

          console.log(
            "Cleaned up uploaded resume."
          );
        } catch (cleanupError) {
          console.error(
            "Resume cleanup failed:",
            cleanupError
          );
        }
      }

      // -----------------------------------------
      // Delete uploaded profile image
      // -----------------------------------------

      if (uploadedProfileImagePath) {
        try {
          await supabase.storage
            .from("profile-images")
            .remove([
              uploadedProfileImagePath,
            ]);

          console.log(
            "Cleaned up uploaded profile image."
          );
        } catch (cleanupError) {
          console.error(
            "Profile image cleanup failed:",
            cleanupError
          );
        }
      }

      // -----------------------------------------
      // Delete portfolio record
      // -----------------------------------------

      if (createdPortfolioId) {
        try {
          await supabase
            .from("portfolios")
            .delete()
            .eq(
              "id",
              createdPortfolioId
            )
            .eq(
              "user_id",
              (
                await supabase.auth.getUser()
              ).data.user?.id
            );

          console.log(
            "Cleaned up portfolio record."
          );
        } catch (cleanupError) {
          console.error(
            "Portfolio cleanup failed:",
            cleanupError
          );
        }
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Portfolio generation failed. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}