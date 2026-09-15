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

export default async function PublicPortfolioPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // Only published portfolios can be viewed publicly.
  const { data: portfolio, error } = await supabase
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

  if (error || !portfolio) {
    notFound();
  }

  let resumeUrl: string | null = null;
  let profileImageUrl: string | null = null;

  // Generate a temporary signed URL for the private resume.
  if (portfolio.resume_file_path) {
    const { data, error: resumeError } = await supabase.storage
      .from("resumes")
      .createSignedUrl(
        portfolio.resume_file_path,
        60 * 60
      );

    if (resumeError) {
      console.error(
        "Public resume URL error:",
        resumeError
      );
    } else {
      resumeUrl = data?.signedUrl ?? null;
    }
  }

  // Generate a temporary signed URL for the private profile image.
  if (portfolio.profile_image_path) {
    const { data, error: imageError } = await supabase.storage
      .from("profile-images")
      .createSignedUrl(
        portfolio.profile_image_path,
        60 * 60
      );

    if (imageError) {
      console.error(
        "Public profile image URL error:",
        imageError
      );
    } else {
      profileImageUrl = data?.signedUrl ?? null;
    }
  }

  return (
    <main className="min-h-screen">
      <PortfolioRenderer
        data={portfolio.generated_data as PortfolioData}
        design={
          portfolio.design_config as PortfolioDesign | null
        }
        profileImageUrl={profileImageUrl}
        resumeUrl={resumeUrl}
      />
    </main>
  );
}