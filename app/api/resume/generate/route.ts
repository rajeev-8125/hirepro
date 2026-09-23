import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { generateResume } from "@/lib/ai/resume-generator";
import { generateResumeDesign } from "@/lib/ai/resume-design-generator";

import {
  ResumeSchema,
  type ResumeData,
} from "@/lib/ai/resume-schema";

import {
  ResumeDesignSchema,
  type ResumeDesign,
} from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

type ResumeTemplate =
  | "ats"
  | "professional"
  | "modern"
  | "executive";

type GenerateBody = {
  userInformation?: string;
  template?: ResumeTemplate;
  resumeDesignDescription?: string;
  profilePhoto?: string | null;
  profilePhotoName?: string | null;
  profilePhotoType?: string | null;
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function getTemplate(
  value: unknown,
): ResumeTemplate {
  if (
    value === "ats" ||
    value === "professional" ||
    value === "modern" ||
    value === "executive"
  ) {
    return value;
  }

  return "professional";
}

function getTemplateInstruction(
  template: ResumeTemplate,
): string {
  switch (template) {
    case "ats":
      return `
ATS-FIRST STRUCTURE

- Single column
- No sidebar
- No tables
- No graphics
- No decorative icons
- No progress bars
- Conventional section headings
- Excellent text extraction
- Strong recruiter readability
- No profile photo
`;

    case "modern":
      return `
MODERN PROFESSIONAL STRUCTURE

- Still use a clean single-column document
- Modern but restrained typography
- Strong visual hierarchy
- Subtle accent color
- Excellent whitespace
- Optional profile photo
- ATS-readable text structure
`;

    case "executive":
      return `
EXECUTIVE STRUCTURE

- Single-column premium resume
- Strong name/header hierarchy
- Conservative professional colors
- Elegant spacing
- Strong leadership presentation
- Optional profile photo
- No unnecessary decoration
`;

    default:
      return `
PROFESSIONAL STRUCTURE

- Single-column professional resume
- Strong recruiter hierarchy
- Clean typography
- Subtle accent color
- Balanced spacing
- Optional profile photo
- ATS-readable
`;
  }
}

function forceSafeStructure(
  design: ResumeDesign,
  template: ResumeTemplate,
): ResumeDesign {
  const safe = {
    ...design,

    layout: "single-column" as const,

    sidebar: {
      enabled: false,
      sections: [],
    },

    visual: {
      ...design.visual,

      borderStyle:
        design.visual.borderStyle ===
        "strong"
          ? "subtle"
          : design.visual.borderStyle,

      cardStyle: "none" as const,

      accentStyle:
        design.visual.accentStyle ===
        "background"
          ? "line"
          : design.visual.accentStyle,
    },

    ats: {
      ...design.ats,

      safe: true,

      tablesUsed: false,

      graphicsUsed: false,

      recommendedForATS:
        template === "ats"
          ? true
          : design.ats
              .recommendedForATS,
    },

    sections: {
      ...design.sections,

      order: [
        "summary",
        "skills",
        "experience",
        "projects",
        "education",
        "certifications",
        "achievements",
        "languages",
      ],

      emphasis: [
        "experience",
        "skills",
        "projects",
      ],
    },
  };

  return ResumeDesignSchema.parse(
    safe,
  );
}

function decodeBase64DataUrl(
  value: string,
): Buffer {
  const commaIndex =
    value.indexOf(",");

  const base64 =
    commaIndex >= 0
      ? value.slice(
          commaIndex + 1,
        )
      : value;

  return Buffer.from(
    base64,
    "base64",
  );
}

function getPhotoExtension(
  mimeType: string,
): string {
  switch (mimeType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/jpeg":
    case "image/jpg":
    default:
      return "jpg";
  }
}

function safeName(
  value: string,
): string {
  return (
    value
      .trim()
      .replace(
        /[^a-zA-Z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      ) || "Resume"
  );
}

/* ============================================================
   GET — LOAD LATEST RESUME
============================================================ */

export async function GET() {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please sign in.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      data: resumeRecord,
      error,
    } = await supabase
      .from("resumes")
      .select(
        `
          id,
          title,
          resume_data,
          design_config,
          template,
          profile_image_path,
          updated_at
        `,
      )
      .eq(
        "user_id",
        user.id,
      )
      .order(
        "updated_at",
        {
          ascending: false,
        },
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Latest resume query error:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to load your latest resume.",
        },
        {
          status: 500,
        },
      );
    }

    if (!resumeRecord) {
      return NextResponse.json({
        success: true,
        resume: null,
        design: null,
        template: null,
        profileImageUrl: null,
      });
    }

    const resumeValidation =
      ResumeSchema.safeParse(
        resumeRecord.resume_data,
      );

    const designValidation =
      ResumeDesignSchema.safeParse(
        resumeRecord.design_config,
      );

    if (
      !resumeValidation.success ||
      !designValidation.success
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Saved resume data is invalid.",
        },
        {
          status: 500,
        },
      );
    }

    let profileImageUrl:
      | string
      | null = null;

    if (
      resumeRecord.profile_image_path
    ) {
      const {
        data: signed,
      } = await supabase.storage
        .from("profile-images")
        .createSignedUrl(
          resumeRecord.profile_image_path,
          60 * 60,
        );

      profileImageUrl =
        signed?.signedUrl ??
        null;
    }

    return NextResponse.json({
      success: true,

      resume:
        resumeValidation.data,

      design:
        designValidation.data,

      template:
        resumeRecord.template,

      profileImageUrl,
    });
  } catch (error) {
    console.error(
      "Latest resume error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load resume.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ============================================================
   POST — GENERATE + SAVE RESUME
============================================================ */

export async function POST(
  request: Request,
) {
  try {
    const supabase =
      await createClient();

    /* --------------------------------------------------------
       AUTH
    -------------------------------------------------------- */

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please sign in.",
        },
        {
          status: 401,
        },
      );
    }

    /* --------------------------------------------------------
       BODY
    -------------------------------------------------------- */

    let body: GenerateBody;

    try {
      body =
        (await request.json()) as GenerateBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const userInformation =
      body.userInformation?.trim();

    if (!userInformation) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume information is required.",
        },
        {
          status: 400,
        },
      );
    }

    const template =
      getTemplate(body.template);

    const personalDesignInstruction =
      body.resumeDesignDescription?.trim() ||
      "Clean, professional, recruiter-friendly resume with excellent readability.";

    /* --------------------------------------------------------
       AI CONTENT
    -------------------------------------------------------- */

    const resumeRaw =
      await generateResume(
        userInformation,
        `
Create a high-quality professional resume.

The output must preserve the user's factual information.

Use this structure:

1. Personal information
2. Professional summary
3. Skills
4. Experience
5. Projects
6. Education
7. Certifications
8. Achievements
9. Languages

Do not invent experience, employers, dates,
technologies, certifications or achievements.

Keep wording concise and professional.

User design preference:
${personalDesignInstruction}
        `.trim(),
      );

    const resumeValidation =
      ResumeSchema.safeParse(
        resumeRaw,
      );

    if (
      !resumeValidation.success
    ) {
      console.error(
        "Generated resume validation error:",
        resumeValidation.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The AI generated an invalid resume structure.",
        },
        {
          status: 502,
        },
      );
    }

    const resume: ResumeData =
      resumeValidation.data;

    /* --------------------------------------------------------
       AI DESIGN
    -------------------------------------------------------- */

    const designPrompt = `
You are HirePro's professional resume design engine.

Create a polished recruiter-quality resume design.

${getTemplateInstruction(template)}

REFERENCE STRUCTURE:

The final resume should visually resemble a premium
Careerflow-style professional resume:

- candidate name at the top
- target role directly beneath the name
- compact contact row
- strong horizontal section hierarchy
- SUMMARY
- SKILLS
- EXPERIENCE
- PROJECTS
- EDUCATION
- CERTIFICATIONS
- ACHIEVEMENTS
- LANGUAGES

The document must look intentional and professionally
designed, not like a raw AI-generated document.

IMPORTANT:

Do NOT use:
- tables
- complicated grids
- decorative graphics
- progress bars
- skill percentages
- excessive icons

The PDF renderer will enforce a single-column
ATS-readable structure.

User's design instructions:

${personalDesignInstruction}

Return only a valid design object.
    `.trim();

    const generatedDesign =
      await generateResumeDesign(
        designPrompt,
      );

    const designValidation =
      ResumeDesignSchema.safeParse(
        generatedDesign,
      );

    if (
      !designValidation.success
    ) {
      console.error(
        "Generated design validation error:",
        designValidation.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The AI generated an invalid resume design.",
        },
        {
          status: 502,
        },
      );
    }

    const design =
      forceSafeStructure(
        designValidation.data,
        template,
      );

    /* --------------------------------------------------------
       CREATE RESUME RECORD
    -------------------------------------------------------- */

    const title =
      resume.personal.name
        ? `${resume.personal.name} Resume`
        : "My Resume";

    const {
      data: savedResume,
      error: resumeError,
    } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,

        title,

        source_type:
          "ai_generated",

        resume_data:
          resume,

        design_config:
          design,

        template,

        is_primary: true,
      })
      .select(
        `
          id,
          title,
          template,
          resume_data,
          design_config,
          profile_image_path
        `,
      )
      .single();

    if (
      resumeError ||
      !savedResume
    ) {
      console.error(
        "Resume insert error:",
        resumeError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            resumeError?.message ||
            "Failed to save the generated resume.",
        },
        {
          status: 500,
        },
      );
    }

    /* --------------------------------------------------------
       SAVE VERSION
    -------------------------------------------------------- */

    const {
      error: versionError,
    } = await supabase
      .from("resume_versions")
      .insert({
        resume_id:
          savedResume.id,

        version_number: 1,

        version_name:
          "AI Generated",

        resume_data:
          resume,

        design_config:
          design,

        template,
      });

    if (versionError) {
      console.error(
        "Resume version insert error:",
        versionError,
      );

      // We intentionally do not delete the resume.
      // The main resume record is already valid and usable.
    }

    /* --------------------------------------------------------
       PROFILE PHOTO
    -------------------------------------------------------- */

    let profilePhotoPath:
      | string
      | null = null;

    if (
      template !== "ats" &&
      body.profilePhoto &&
      body.profilePhotoType
    ) {
      try {
        const photoBuffer =
          decodeBase64DataUrl(
            body.profilePhoto,
          );

        if (
          photoBuffer.length >
          MAX_PHOTO_SIZE
        ) {
          throw new Error(
            "Profile photo must be smaller than 5 MB.",
          );
        }

        const extension =
          getPhotoExtension(
            body.profilePhotoType,
          );

        profilePhotoPath =
          `${user.id}/${savedResume.id}/profile.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("profile-images")
          .upload(
            profilePhotoPath,
            photoBuffer,
            {
              contentType:
                body.profilePhotoType,
              upsert: true,
            },
          );

        if (uploadError) {
          throw uploadError;
        }

        const {
          error:
            photoPathError,
        } = await supabase
          .from("resumes")
          .update({
            profile_image_path:
              profilePhotoPath,
          })
          .eq(
            "id",
            savedResume.id,
          )
          .eq(
            "user_id",
            user.id,
          );

        if (photoPathError) {
          console.error(
            "Profile image path update error:",
            photoPathError,
          );
        }
      } catch (photoError) {
        console.error(
          "Profile photo error:",
          photoError,
        );

        profilePhotoPath =
          null;
      }
    }

    /* --------------------------------------------------------
       SIGNED PHOTO URL
    -------------------------------------------------------- */

    let profileImageUrl:
      | string
      | null = null;

    if (profilePhotoPath) {
      const {
        data: signed,
      } = await supabase.storage
        .from("profile-images")
        .createSignedUrl(
          profilePhotoPath,
          60 * 60,
        );

      profileImageUrl =
        signed?.signedUrl ??
        null;
    }

    /* --------------------------------------------------------
       RESPONSE
    -------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      resume,

      design,

      resumeId:
        savedResume.id,

      template,

      profileImagePath:
        profilePhotoPath,

      profileImageUrl,

      saved: true,

      versionNumber: 1,
    });
  } catch (error) {
    console.error(
      "Resume generation error:",
      error,
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
      },
    );
  }
}