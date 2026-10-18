"use client";

import { AlertIcon } from "@/components/icons";
import Link from "next/link";
import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-5xl flex-col items-center justify-center px-4 sm:px-6">
      <div className="card w-full max-w-md animate-rise p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <AlertIcon />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          We couldn&apos;t load this page. Try again — if it keeps failing,
          the service may be temporarily unavailable.
        </p>
        <button onClick={reset} className="btn btn-primary mt-6 w-full">
          Try again
        </button>
        <Link href="/" className="btn btn-ghost mt-2 w-full text-neutral-500">
          Go home
        </Link>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-neutral-400">
            Error ref: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
