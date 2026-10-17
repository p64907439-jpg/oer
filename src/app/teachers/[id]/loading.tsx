import {
  SubjectCardSkeleton,
  TeacherHeaderSkeleton,
} from "@/components/skeletons";

export default function TeacherLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6" aria-busy>
      <div className="mt-10">
        <TeacherHeaderSkeleton />
      </div>
      <section className="mt-10" aria-hidden>
        <div className="mb-4 h-4 w-32 rounded-md bg-neutral-200/70 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SubjectCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
