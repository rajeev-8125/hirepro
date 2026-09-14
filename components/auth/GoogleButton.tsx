"use client";

import { createClient } from "@/lib/supabase/client";

type Props = {
  next?: string;
};

export default function GoogleButton({
  next = "/dashboard",
}: Props) {
  const supabase = createClient();

  async function handleGoogleLogin() {
    const safeNext =
      next.startsWith("/") ? next : "/dashboard";

    const redirectTo =
      `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        safeNext
      )}`;

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

    if (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-semibold transition hover:border-blue-400 hover:bg-slate-50"
    >
      <span className="text-lg">G</span>

      <span>Continue with Google</span>
    </button>
  );
}