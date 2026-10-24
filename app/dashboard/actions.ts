"use server";

import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

/** Customer portal sign-in (separate redirect target from the admin flow). */
export async function customerSignIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!isSupabaseConfigured()) {
    redirect(
      "/dashboard/login?error=" +
        encodeURIComponent(
          "Database is not configured. Set the Supabase environment variables in .env.local.",
        ),
    );
  }

  // Only allow same-app redirect targets.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/dashboard/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(target);
}

export async function customerSignOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect("/dashboard/login");
}
