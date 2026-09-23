import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { generateResume } from "@/lib/ai/resume-generator";
import { generateResumeDesign } from "@/lib/ai/resume-design-generator";

import type { ResumeDesign } from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

type ResumeTemplate =
  | "ats"
  | "professional"
  | "modern"
  | "executive";

type PhotoSize = "small" | "medium" | "large";
type PhotoShape = "circle" | "rounded" | "square";
type PhotoHorizontal = "left" | "center" | "right";
type PhotoVertical = "top" | "center" | "bottom";

type PhotoSettings = {
  size?: PhotoSize;
  zoom?: number;
  horizontal?: PhotoHorizontal;
  vertical?: PhotoVertical;
  shape?: PhotoShape;
};

function normalizePhotoSettings(
  settings?: PhotoSettings | null
): Required<PhotoSettings> {
  return {
    size:
      settings?.size === "small" ||
      settings?.size === "large"
        ? settings.size
        : "medium",

    zoom:
      typeof settings?.zoom === "number" &&
      Number.isFinite(settings.zoom)
        ? Math.min(200, Math.max(50, settings.zoom))
        : 100,

    horizontal:
      settings?.horizontal === "left" ||
      settings?.horizontal === "right"
        ? settings.horizontal
        : "center",

    vertical:
      settings?.vertical === "top" ||
      settings?.vertical === "bottom"
        ? settings.vertical
        : "center",

    shape:
      settings?.shape === "square" ||
      settings?.shape === "rounded"
        ? settings.shape
        : "circle",
  };
}

function applyPhotoSettings(
  design: ResumeDesign,
  template: ResumeTemplate,
  profilePhoto: string | null | undefined,
  photoSettings?: PhotoSettings | null
): ResumeDesign {
  const settings =
    normalizePhotoSettings(photoSettings);

  const photoEnabled =
    template !== "ats" &&
    Boolean(profilePhoto);

  return {
    ...design,

    header: {
      ...design.header,

      photo: {
        ...design.header.photo,

        enabled: photoEnabled,

        position:
          settings.horizontal,

        shape:
          settings.shape,

        size:
          settings.size,
      },
    },
  };
}

export async function POST(
  request: Request
) {
  try {
    const supabase = await createClient();

    // ============================================================
    // 1. AUTHENTICATION
    // ============================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please sign in.",
        },
        {
          status: 401,
        }
      );
    }

    // ============================================================
    // 2. REQUEST BODY
    // ============================================================

    const body = await request.json();

    const {
      userInformation,
      template,
      resumeDesignDescription,
      profilePhoto,
      profilePhotoName,
      profilePhotoType,
      photoSettings,
    } = body as {
      userInformation?: string;
      template?: ResumeTemplate;
      resumeDesignDescription?: string;
      profilePhoto?: string | null;
      profilePhotoName?: string | null;
      profilePhotoType?: string | null;
      photoSettings?: PhotoSettings | null;
    };

    if (!userInformation?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume information is required.",
        },
        {
          status: 400,
        }
      );
    }

    const selectedTemplate: ResumeTemplate =
      template === "professional" ||
      template === "modern" ||
      template === "executive"
        ? template
        : "ats";

    // ============================================================
    // 3. TEMPLATE INSTRUCTIONS
    // ============================================================

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

    // ============================================================
    // 4. GENERATE RESUME CONTENT
    // ============================================================

    const resume =
      await generateResume(
        userInformation,
        resumeDesignDescription?.trim() ||
          "Create a clean, professional, modern and ATS-friendly resume."
      );

    // ============================================================
    // 5. GENERATE AI DESIGN
    // ============================================================

    const designPrompt = `
${templateDesignInstruction}

User's personal design instructions:

${
  resumeDesignDescription?.trim() ||
  "Create a clean, professional and ATS-friendly resume."
}

Important:
- Follow the selected template.
- Do not invent resume information.
- Keep the resume professional.
- Keep it readable.
- Prefer ATS-safe structures.
`;

    const aiDesign =
      await generateResumeDesign(
        designPrompt
      );

    // ============================================================
    // 6. MAKE USER PHOTO SETTINGS AUTHORITATIVE
    // ============================================================

    const finalDesign =
      applyPhotoSettings(
        aiDesign,
        selectedTemplate,
        profilePhoto,
        photoSettings
      );

    // ============================================================
    // 7. SAVE MAIN RESUME
    // ============================================================
    //
    // IMPORTANT:
    // Your actual Supabase schema contains:
    //
    // resumes.resume_data
    // resumes.design_config
    // resumes.template
    //
    // It does NOT use "content".
    //

    const { data: savedResume, error: resumeError } =
      await supabase
        .from("resumes")
        .insert({
          user_id: user.id,

          title:
            resume.personal.name?.trim()
              ? `${resume.personal.name.trim()} Resume`
              : "My Resume",

          resume_data: resume,

          design_config:
            finalDesign,

          template:
            selectedTemplate,

          source_type:
            "manual",
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
          success: false,
          error:
            resumeError?.message ||
            "Failed to save resume.",
        },
        {
          status: 500,
        }
      );
    }

    // ============================================================
    // 8. SAVE RESUME VERSION
    // ============================================================
    //
    // IMPORTANT:
    // resume_versions uses resume_data.
    // There is no "content" column.
    //

    const {
      data: savedVersion,
      error: versionError,
    } = await supabase
      .from("resume_versions")
      .insert({
        resume_id:
          savedResume.id,

        version_number: 1,

        version_name:
          "Initial Resume",

        resume_data:
          resume,

        design_config:
          finalDesign,

        template:
          selectedTemplate,
      })
      .select()
      .single();

    if (versionError) {
      console.error(
        "Resume version error:",
        versionError
      );

      // Clean up the main resume if
      // version creation failed.
      await supabase
        .from("resumes")
        .delete()
        .eq("id", savedResume.id)
        .eq("user_id", user.id);

      return NextResponse.json(
        {
          success: false,
          error:
            versionError.message ||
            "Failed to save resume version.",
        },
        {
          status: 500,
        }
      );
    }

    // ============================================================
    // 9. PROFILE PHOTO UPLOAD
    // ============================================================

    let profilePhotoPath:
      | string
      | null = null;

    if (
      selectedTemplate !== "ats" &&
      profilePhoto &&
      profilePhotoType
    ) {
      try {
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

        if (
          buffer.length >
          5 * 1024 * 1024
        ) {
          throw new Error(
            "Profile photo must be under 5 MB."
          );
        }

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
        }

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

        // Save photo path to resume.
        const {
          error: photoPathError,
        } = await supabase
          .from("resumes")
          .update({
            profile_image_path:
              profilePhotoPath,
          })
          .eq(
            "id",
            savedResume.id
          )
          .eq(
            "user_id",
            user.id
          );

        if (photoPathError) {
          console.warn(
            "Could not save profile image path:",
            photoPathError.message
          );
        }
      } catch (photoError) {
        console.error(
          "Profile photo upload error:",
          photoError
        );

        profilePhotoPath = null;
      }
    }

    // ============================================================
    // 10. RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,

      resume,

      design:
        finalDesign,

      resumeId:
        savedResume.id,

      versionId:
        savedVersion?.id ?? null,

      template:
        selectedTemplate,

      profileImagePath:
        profilePhotoPath,

      resumeDesignDescription:
        resumeDesignDescription?.trim() || "",

      photoSettings:
        normalizePhotoSettings(
          photoSettings
        ),

      saved: true,
    });
  } catch (error) {
    console.error(
      "Resume generation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate resume.",
      },
      {
        status: 500,
      }
    );
  }
}