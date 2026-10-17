import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-neutral-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-[11px] font-bold text-white">
            O
          </span>
          OER
        </Link>

        <nav className="flex items-center gap-1.5">
          <Link href="/" className="btn btn-ghost">
            Browse
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-outline">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Teacher sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
