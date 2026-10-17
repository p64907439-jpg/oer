import {
  FileRowSkeleton,
  SubjectHeaderSkeleton,
} from "@/components/skeletons";

export default function SubjectLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 sm:px-6" aria-busy>
      <div className="flex items-center gap-1.5 py-6" aria-hidden>
        <div className="h-4 w-14 rounded-md bg-neutral-200/70 animate-pulse" />
        <div className="h-4 w-1.5 rounded-md bg-neutral-200/70 animate-pulse" />
        <div className="h-4 w-40 rounded-md bg-neutral-200/70 animate-pulse" />
      </div>
      <SubjectHeaderSkeleton />
      <section className="mt-8 flex flex-col gap-2.5" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <FileRowSkeleton key={i} />
        ))}
      </section>
    </main>
  );
}
