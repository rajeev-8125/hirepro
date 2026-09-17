import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { ResumePDF } from "@/lib/resume/resume-pdf";

import { ResumeSchema } from "@/lib/ai/resume-schema";
import { ResumeDesignSchema } from "@/lib/ai/resume-design-schema";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function imageUrlToDataUri(
  imageUrl: string | null
): Promise<string | null> {
  if (!imageUrl) {
    return null;
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return null;
    }

    const contentType =
      response.headers.get("content-type") || "image/jpeg";

    const arrayBuffer = await response.arrayBuffer();

    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(
      "Failed to convert profile image:",
      error
    );

    return null;
  }
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const supabase = await createClient();

    // --------------------------------------------------
    // 1. AUTHENTICATION
    // --------------------------------------------------

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
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // 2. GET RESUME ID
    // --------------------------------------------------

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 3. LOAD ONLY THE USER'S RESUME
    // --------------------------------------------------

    const { data: resumeRecord, error: resumeError } =
      await supabase
        .from("resumes")
        .select(
          `
            id,
            user_id,
            title,
            resume_data,
            design_config,
            profile_image_path
          `
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (resumeError || !resumeRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 4. VALIDATE SAVED RESUME DATA
    // --------------------------------------------------

    const resumeResult = ResumeSchema.safeParse(
      resumeRecord.resume_data
    );

    if (!resumeResult.success) {
      console.error(
        "Saved resume validation failed:",
        resumeResult.error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Saved resume data is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    const designResult = ResumeDesignSchema.safeParse(
      resumeRecord.design_config
    );

    if (!designResult.success) {
      console.error(
        "Saved resume design validation failed:",
        designResult.error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Saved resume design is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 5. PROFILE IMAGE
    // --------------------------------------------------

    let profilePhoto: string | null = null;

    if (resumeRecord.profile_image_path) {
      const { data: signedImage } =
        await supabase.storage
          .from("profile-images")
          .createSignedUrl(
            resumeRecord.profile_image_path,
            60 * 10
          );

      if (signedImage?.signedUrl) {
        profilePhoto = await imageUrlToDataUri(
          signedImage.signedUrl
        );
      }
    }

    // --------------------------------------------------
    // 6. GENERATE PDF
    // --------------------------------------------------

    const pdfBuffer = await renderToBuffer(
      <ResumePDF
        resume={resumeResult.data}
        design={designResult.data}
        profilePhoto={profilePhoto}
      />
    );

    const pdfData = new Uint8Array(pdfBuffer);

    // --------------------------------------------------
    // 7. SAFE FILE NAME
    // --------------------------------------------------

    const name =
      resumeResult.data.personal.name
        ?.trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "resume";

    const title =
      resumeRecord.title
        ?.trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "Resume";

    const filename = `${name}-${title}.pdf`;

    // --------------------------------------------------
    // 8. RETURN PDF
    // --------------------------------------------------

    return new Response(pdfData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition":
          `attachment; filename="${filename}"`,

        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "Saved resume download error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to download resume.",
      },
      {
        status: 500,
      }
    );
  }
}