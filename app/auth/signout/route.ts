import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Sign out the current user
  await supabase.auth.signOut();

  // Redirect to the HirePro landing page
  return NextResponse.redirect(new URL("/", request.url));
}