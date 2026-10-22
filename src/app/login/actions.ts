"use server";

import { createClient } from "@/lib/supabase/server";
import type { AccountRole } from "@/lib/types";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithGoogle(
  next: string | undefined,
  role: AccountRole = "teacher"
) {
  // Remember the teacher/student choice through the OAuth round-trip —
  // the callback route applies it to the profile.
  const cookieStore = await cookies();
  cookieStore.set("oer_role", role, {
    maxAge: 60 * 10,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const defaultNext = role === "student" ? "/" : "/dashboard";
  const safeNext = next && next.startsWith("/") ? next : defaultNext;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
