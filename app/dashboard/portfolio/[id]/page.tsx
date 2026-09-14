import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortfolioEditor from "@/components/portfolio/PortfolioEditor";

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/dashboard/portfolio/${id}`);
  }

  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !portfolio) {
    redirect("/dashboard/portfolio");
  }

  return <PortfolioEditor portfolio={portfolio} />;
}