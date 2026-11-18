import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SubjectCard } from "@/components/subject-card";
import { FolderIcon, SearchIcon } from "@/components/icons";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { createClient } from "@/lib/supabase/server";
import type { SubjectWithTeacher } from "@/lib/types";

// Prerendering would block on live Supabase data — render per-request.
export const instant = false;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*, profiles:teacher_id(id, full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(60);

  const list = (subjects ?? []) as unknown as SubjectWithTeacher[];

  const filtered = query
    ? list.filter((s) => {
        const haystack = `${s.title} ${s.description ?? ""} ${
          s.profiles?.full_name ?? ""
        }`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : list;

  // File counts + sizes per subject
  const { data: fileRows } = await supabase
    .from("files")
    .select("subject_id, size_bytes");

  const stats = new Map<string, { count: number; size: number }>();
  for (const f of fileRows ?? []) {
    const s = stats.get(f.subject_id) ?? { count: 0, size: 0 };
    s.count += 1;
    s.size += f.size_bytes ?? 0;
    stats.set(f.subject_id, s);
  }

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 text-center sm:py-24">
          <h1 className="animate-rise mx-auto max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl">
            Open Education
            <br />
            Resources
          </h1>
          <p
            className="animate-rise mx-auto mt-4 max-w-sm text-base leading-relaxed text-neutral-500"
            style={{ animationDelay: "60ms" }}
          >
            Browse subjects from your teachers.{" "}
            <span className="font-medium text-neutral-800">
              No account needed.
            </span>
          </p>

          <form
            action="/"
            method="GET"
            className="animate-rise mx-auto mt-8 flex max-w-sm items-center gap-2"
            style={{ animationDelay: "120ms" }}
          >
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <SearchIcon width={16} height={16} />
              </span>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search subjects…"
                className="input pl-9"
                aria-label="Search subjects"
                enterKeyHint="search"
              />
            </div>
            <button type="submit" className="btn btn-primary shrink-0">
              Search
            </button>
          </form>
        </section>

        {/* Subject grid */}
        <section className="pb-24">
          {filtered.length > 0 ? (
            <>
              <p className="mb-5 text-sm text-neutral-400">
                {query
                  ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${query}"`
                  : `${filtered.length} subject${filtered.length === 1 ? "" : "s"} available`}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((subject, i) => {
                  const stat = stats.get(subject.id) ?? { count: 0, size: 0 };
                  return (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      fileCount={stat.count}
                      totalSize={stat.size}
                      index={i}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="card animate-rise flex flex-col items-center gap-3 p-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                <FolderIcon />
              </span>
              <div>
                <p className="font-medium text-neutral-900">Nothing here yet</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {query
                    ? "No subjects match your search."
                    : "No subjects have been published yet. Check back soon."}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
