import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResume } from "@/lib/ai/resume-generator";
import { generateResumeDesign } from "@/lib/ai/resume-design-generator";

export const runtime = "nodejs";

type ResumeTemplate =
  | "ats"
  | "professional"
  | "modern"
  | "executive";

export async function POST(
  request: Request
) {
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
          error: "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    /*
     * --------------------------------------------------
     * REQUEST DATA
     * --------------------------------------------------
     */

    const body = await request.json();

    const {
      userInformation,
      template,
      resumeDesignDescription,
      profilePhoto,
      profilePhotoName,
      profilePhotoType,
    } = body as {
      userInformation?: string;
      template?: ResumeTemplate;
      resumeDesignDescription?: string;
      profilePhoto?: string | null;
      profilePhotoName?: string | null;
      profilePhotoType?: string | null;
    };

    if (!userInformation) {
      return NextResponse.json(
        {
          error:
            "Resume information is required.",
        },
        { status: 400 }
      );
    }

    const selectedTemplate: ResumeTemplate =
      template === "professional" ||
      template === "modern" ||
      template === "executive"
        ? template
        : "ats";

    /*
     * --------------------------------------------------
     * TEMPLATE INSTRUCTIONS
     * --------------------------------------------------
     */

    const templateDesignInstruction = `
Selected resume template: ${selectedTemplate}

Template requirements:

${
  selectedTemplate === "ats"
    ? `
- Maximum ATS compatibility
- Single-column layout
- Do not use a profile photo
- Minimal visual decoration
- Clear section headings
- Strong readability
- No graphics
- No complicated columns
- No tables
`
    : selectedTemplate === "professional"
    ? `
- Professional corporate appearance
- Clean hierarchy
- Optional profile photo
- Balanced spacing
- Conservative professional colors
- Strong readability
- ATS-friendly structure
`
    : selectedTemplate === "modern"
    ? `
- Modern professional appearance
- Two-column layout is allowed
- Optional profile photo
- Modern accent colors
- Strong visual hierarchy
- Clean sidebar if appropriate
- Maintain ATS readability
`
    : `
- Executive and premium appearance
- Elegant typography
- Spacious but efficient layout
- Optional profile photo
- Conservative premium colors
- Strong leadership-oriented presentation
- Maintain ATS readability
`
}
`;

    /*
     * --------------------------------------------------
     * GENERATE RESUME CONTENT
     * --------------------------------------------------
     */

    const resume =
      await generateResume(
        userInformation,
        resumeDesignDescription ||
          "Create a clean, professional, modern and ATS-friendly resume."
      );

    /*
     * --------------------------------------------------
     * GENERATE DESIGN
     * --------------------------------------------------
     */

    const designPrompt = `
${templateDesignInstruction}

User's personal design instructions:

${
  resumeDesignDescription ||
  "Create a clean, professional and ATS-friendly resume."
}

Important:
- Follow the selected template.
- Do not invent resume information.
- Keep the resume professional.
- Keep it readable.
- Prefer ATS-safe structures.
`;

    const design =
      await generateResumeDesign(
        designPrompt
      );

    /*
     * --------------------------------------------------
     * SAVE RESUME
     * --------------------------------------------------
     */

    const { data: savedResume, error: resumeError } =
      await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title:
            resume.personal.name
              ? `${resume.personal.name} Resume`
              : "My Resume",
        })
        .select()
        .single();

    if (resumeError || !savedResume) {
      console.error(
        "Resume insert error:",
        resumeError
      );

      return NextResponse.json(
        {
          error:
            resumeError?.message ||
            "Failed to save resume.",
        },
        { status: 500 }
      );
    }

    /*
     * --------------------------------------------------
     * SAVE RESUME VERSION
     * --------------------------------------------------
     */

    const versionContent = {
      resume,
      design,
      template: selectedTemplate,
    };

    const {
      data: savedVersion,
      error: versionError,
    } = await supabase
      .from("resume_versions")
      .insert({
        resume_id: savedResume.id,
        content: versionContent,
      })
      .select()
      .single();

    if (versionError) {
      console.error(
        "Resume version error:",
        versionError
      );

      /*
       * Clean up the resume if the version
       * could not be created.
       */
      await supabase
        .from("resumes")
        .delete()
        .eq("id", savedResume.id)
        .eq("user_id", user.id);

      return NextResponse.json(
        {
          error:
            versionError.message ||
            "Failed to save resume version.",
        },
        { status: 500 }
      );
    }

    /*
     * --------------------------------------------------
     * PROFILE PHOTO
     * --------------------------------------------------
     *
     * ATS template intentionally does not save
     * a profile photo.
     */

    let profilePhotoPath:
      | string
      | null = null;

    if (
      selectedTemplate !== "ats" &&
      profilePhoto &&
      profilePhotoType
    ) {
      try {
        /*
         * Convert base64 data URL to bytes.
         */

        const base64Data =
          profilePhoto.includes(",")
            ? profilePhoto.split(",")[1]
            : profilePhoto;

        if (!base64Data) {
          throw new Error(
            "Invalid profile photo data."
          );
        }

        const buffer =
          Buffer.from(
            base64Data,
            "base64"
          );

        /*
         * Protect storage from very large uploads.
         */

        if (
          buffer.length >
          5 * 1024 * 1024
        ) {
          throw new Error(
            "Profile photo must be under 5 MB."
          );
        }

        /*
         * Determine extension.
         */

        let extension = "jpg";

        if (
          profilePhotoType ===
          "image/png"
        ) {
          extension = "png";
        } else if (
          profilePhotoType ===
          "image/webp"
        ) {
          extension = "webp";
        } else if (
          profilePhotoType ===
          "image/jpeg"
        ) {
          extension = "jpg";
        }

        /*
         * Storage path.
         *
         * Important:
         * Do NOT include "profile-images/"
         * in the path because that is the bucket name.
         */

        profilePhotoPath =
          `${user.id}/${savedResume.id}/profile.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("profile-images")
          .upload(
            profilePhotoPath,
            buffer,
            {
              contentType:
                profilePhotoType,
              upsert: true,
            }
          );

        if (uploadError) {
          throw uploadError;
        }
      } catch (photoError) {
        console.error(
          "Profile photo upload error:",
          photoError
        );

        /*
         * Photo upload should not destroy
         * the generated resume.
         *
         * The resume remains available even
         * if the image upload fails.
         */
        profilePhotoPath = null;
      }
    }

    /*
     * --------------------------------------------------
     * SAVE PHOTO PATH
     * --------------------------------------------------
     *
     * We first try to update the resumes table
     * if the column exists.
     *
     * If your current schema does not yet have
     * profile_image_path, the generated resume
     * still remains valid.
     */

    if (profilePhotoPath) {
      const { error: photoPathError } =
        await supabase
          .from("resumes")
          .update({
            profile_image_path:
              profilePhotoPath,
          })
          .eq("id", savedResume.id)
          .eq("user_id", user.id);

      if (photoPathError) {
        console.warn(
          "Could not save profile image path:",
          photoPathError.message
        );
      }
    }

    /*
     * --------------------------------------------------
     * RESPONSE
     * --------------------------------------------------
     */

    return NextResponse.json({
      success: true,

      resume,

      design,

      resumeId: savedResume.id,

      versionId:
        savedVersion?.id ?? null,

      template: selectedTemplate,

      profileImagePath:
        profilePhotoPath,

      resumeDesignDescription:
        resumeDesignDescription || "",

      saved: true,
    });
  } catch (error) {
    console.error(
      "Resume generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate resume.",
      },
      { status: 500 }
    );
  }
}