import { NotFoundIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 sm:px-6">
        <div className="card w-full max-w-md animate-rise p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
            <NotFoundIcon />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            This page doesn&apos;t exist — the subject may have been removed,
            or the link is out of date.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/" className="btn btn-primary w-full">
              Browse all subjects
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
