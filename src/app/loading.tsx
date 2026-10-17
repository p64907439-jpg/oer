import { HeroSkeleton, SubjectCardSkeleton } from "@/components/skeletons";

export default function HomeLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6" aria-busy>
      <HeroSkeleton />
      <section className="pb-20" aria-hidden>
        <div className="mb-4 h-4 w-48 rounded-md bg-neutral-200/70 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SubjectCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
