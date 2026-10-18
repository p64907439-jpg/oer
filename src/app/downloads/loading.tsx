"use client";

import { Skeleton } from "@/components/skeletons";

export default function DownloadsLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6" aria-busy>
      <header className="py-8">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="mt-2 h-4 w-64 rounded-md" />
      </header>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200/80 px-3.5 py-3"
                >
                  <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                    <Skeleton className="mt-2 h-3 w-1/3 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
