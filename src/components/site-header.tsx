import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BottomNav } from "./bottom-nav";
import { DownloadsLink } from "./downloads-link";
import { InstallButton } from "./install-button";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isTeacher = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_teacher")
      .eq("id", user.id)
      .maybeSingle();
    isTeacher = !!profile?.is_teacher;
  }

  return (
    <>
      <header className="safe-top sticky top-0 z-40 border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-[15px] font-semibold tracking-tight text-neutral-900 transition-opacity duration-150 hover:opacity-70"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-[12px] font-bold text-white shadow-sm">
              O
            </span>
            <span className="max-sm:hidden">OER</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/" className="btn btn-ghost text-sm">
              Browse
            </Link>
            <DownloadsLink />
            <InstallButton />
            {isTeacher ? (
              <>
                <Link href="/admin" className="btn btn-outline text-sm">
                  Admin
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link href="/admin" className="btn btn-primary text-sm">
                Teacher login
              </Link>
            )}
          </nav>

          {/* Mobile: only auth control */}
          <div className="flex items-center gap-1 sm:hidden">
            {isTeacher && <SignOutButton />}
          </div>
        </div>
      </header>
      <BottomNav isTeacher={isTeacher} />
    </>
  );
}
