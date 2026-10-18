import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DownloadsLink } from "./downloads-link";
import { GridIcon } from "./icons";
import { InstallButton } from "./install-button";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
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

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="btn btn-ghost hidden sm:inline-flex max-sm:px-2.5"
          >
            Browse
          </Link>
          <DownloadsLink />
          <InstallButton />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="btn btn-outline max-sm:px-2.5"
                title="Dashboard"
              >
                <GridIcon width={14} height={14} className="sm:hidden" />
                <span className="max-sm:hidden">Dashboard</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className="btn btn-primary max-sm:px-3">
              <span className="max-sm:hidden">Teacher </span>Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
