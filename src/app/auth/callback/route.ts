import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Apply the teacher/student choice made on the login page.
      const cookieStore = await cookies();
      const role = cookieStore.get("oer_role")?.value;
      if (data.user && (role === "teacher" || role === "student")) {
        await supabase.from("profiles").update({ role }).eq("id", data.user.id);
      }
      if (role !== undefined) cookieStore.delete("oer_role");

      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
