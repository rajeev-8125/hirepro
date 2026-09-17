import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";

import type { PortfolioData } from "@/lib/ai/portfolio-schema";
import type { PortfolioDesign } from "@/lib/ai/portfolio-design-schema";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPortfolio(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select(`
      id,
      title,
      generated_data,
      design_config,
      resume_file_path,
      profile_image_path,
      is_published
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    supabase,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const result = await getPortfolio(slug);

  if (!result) {
    return {
      title: "Portfolio Not Found | HirePro",
      description: "The requested portfolio could not be found.",
    };
  }

  const data = result.generated_data as PortfolioData;

  const name =
    data.personal?.name?.trim() ||
    result.title ||
    "Professional Portfolio";

  const headline =
    data.personal?.headline?.trim() ||
    "Professional Portfolio";

  const description =
    data.summary?.trim() ||
    `${name} — ${headline}`;

  return {
    title: `${name} | Portfolio`,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${name} | Portfolio`,
      description,
      type: "website",
    },
  };
}

export default async function PublicPortfolioPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const result = await getPortfolio(slug);

  if (!result) {
    notFound();
  }

  const {
    generated_data,
    design_config,
    resume_file_path,
    profile_image_path,
  } = result;

  const supabase = result.supabase;

  let resumeUrl: string | null = null;
  let profileImageUrl: string | null = null;

  /*
   * Resume
   *
   * The resume remains private in Supabase Storage.
   * A temporary signed URL is generated only for
   * the published portfolio visitor.
   */
  if (resume_file_path) {
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(
        resume_file_path,
        60 * 60,
      );

    if (error) {
      console.error(
        "Public resume URL error:",
        error,
      );
    } else {
      resumeUrl = data?.signedUrl ?? null;
    }
  }

  /*
   * Profile image
   *
   * The profile image also remains private and is
   * exposed through a temporary signed URL.
   */
  if (profile_image_path) {
    const { data, error } = await supabase.storage
      .from("profile-images")
      .createSignedUrl(
        profile_image_path,
        60 * 60,
      );

    if (error) {
      console.error(
        "Public profile image URL error:",
        error,
      );
    } else {
      profileImageUrl = data?.signedUrl ?? null;
    }
  }

  return (
    <PortfolioRenderer
      data={generated_data as PortfolioData}
      design={design_config as PortfolioDesign | null}
      profileImageUrl={profileImageUrl}
      resumeUrl={resumeUrl}
    />
  );
}