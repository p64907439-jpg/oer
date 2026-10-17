export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}

/** Mirrors the home page hero. */
export function HeroSkeleton() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Skeleton className="mx-auto h-10 w-3/4 rounded-lg sm:h-12" />
        <Skeleton className="mx-auto mt-4 h-5 w-2/3 rounded-md" />
        <Skeleton className="mx-auto mt-8 h-10 max-w-md rounded-lg" />
      </div>
    </section>
  );
}

/** Mirrors SubjectCard. */
export function SubjectCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-2/3 rounded-md" />
        <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-4 w-full rounded-md" />
      <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
    </div>
  );
}

/** Mirrors FileItem. */
export function FileRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200/80 bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="mt-2 h-3 w-1/3 rounded-md" />
      </div>
      <Skeleton className="h-8 w-10 shrink-0 rounded-lg" />
    </div>
  );
}

export function TeacherHeaderSkeleton() {
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-start gap-5">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-7 w-48 rounded-md" />
          <Skeleton className="mt-2 h-4 w-64 rounded-md" />
          <Skeleton className="mt-4 h-4 w-full max-w-xl rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SubjectHeaderSkeleton() {
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-7 w-2/3 rounded-md" />
          <Skeleton className="mt-3 h-4 w-full max-w-lg rounded-md" />
        </div>
        <Skeleton className="h-5 w-20 shrink-0 rounded-md" />
      </div>
      <Skeleton className="mt-6 h-9 w-48 rounded-lg" />
    </div>
  );
}

export function DashboardSectionSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <Skeleton className="mt-2 h-4 w-2/3 rounded-md" />
      <div className="mt-4 border-t border-neutral-100 pt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
