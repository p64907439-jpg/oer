"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SignInState = { error: string | null };

/**
 * Shared-teacher sign-in (email + password from the env credentials).
 * Returns an error message on failure; redirects on success.
 */
export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  const safeNext = next.startsWith("/") ? next : "/admin";

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Wrong email or password. Try again." };
  }

  // Only the shared teacher account gets the admin; anything else
  // bounces back to public browse (RLS would block it anyway).
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_teacher")
    .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle();

  redirect(profile?.is_teacher ? safeNext : "/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}
