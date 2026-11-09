import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BottomNav } from "./bottom-nav";
import { DownloadsLink } from "./downloads-link";
import { InboxLink } from "./inbox-link";
import { InstallButton } from "./install-button";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <header className="safe-top sticky top-0 z-40 border-b border-neutral-200/70 bg-neutral-50/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-[15px] font-semibold tracking-tight"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-[11px] font-bold text-white">
              O
            </span>
            <span className="max-sm:hidden">OER</span>
          </Link>

          {/* Desktop: destinations live in the top bar. */}
          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/" className="btn btn-ghost">
              Browse
            </Link>
            <DownloadsLink />
            <InstallButton />
            {user ? (
              <>
                <InboxLink userId={user.id} />
                <Link href="/dashboard" className="btn btn-outline">
                  Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Sign in
              </Link>
            )}
          </nav>

          {/* Phone: destinations move to the bottom tab bar (BottomNav);
              the header keeps only auth control. */}
          <div className="flex items-center gap-1 sm:hidden">
            {user && <SignOutButton />}
          </div>
        </div>
      </header>
      <BottomNav userId={user?.id ?? null} />
    </>
  );
}
