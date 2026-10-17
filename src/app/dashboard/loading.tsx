import { DashboardSectionSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/skeletons";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6" aria-busy>
      <header className="py-8">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="mt-2 h-4 w-64 rounded-md" />
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_1fr]">
        {/* Profile card skeleton */}
        <div className="card p-5">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="mt-1 h-3 w-48 rounded-md" />
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <Skeleton className="mb-1.5 h-4 w-12 rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-4 w-16 rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-4 w-10 rounded-md" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="mt-1 h-10 w-28 rounded-lg" />
          </div>
        </div>

        {/* Subjects column skeleton */}
        <div className="flex flex-col gap-4">
          <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Skeleton className="mb-1.5 h-4 w-20 rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="flex-[2]">
              <Skeleton className="mb-1.5 h-4 w-24 rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="h-[42px] w-24 shrink-0 rounded-lg" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <DashboardSectionSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
