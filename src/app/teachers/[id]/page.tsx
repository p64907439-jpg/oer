import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SubjectCard } from "@/components/subject-card";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Subject } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export const instant = false;

export default async function TeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: teacher } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!teacher) notFound();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("teacher_id", id)
    .order("created_at", { ascending: false });

  const { data: fileRows } = await supabase
    .from("files")
    .select("subject_id, size_bytes")
    .eq("teacher_id", id);

  const stats = new Map<string, { count: number; size: number }>();
  for (const f of fileRows ?? []) {
    const s = stats.get(f.subject_id) ?? { count: 0, size: 0 };
    s.count += 1;
    s.size += f.size_bytes ?? 0;
    stats.set(f.subject_id, s);
  }

  const profile = teacher as Profile;
  const subjectRows = (subjects ?? []) as Subject[];

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        {/* Teacher profile header */}
        <header className="card animate-rise mt-10 p-6 sm:p-8">
          <div className="flex items-start gap-5">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="h-16 w-16 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-2xl font-semibold text-neutral-600">
                {(profile.full_name ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">
                {profile.full_name}
              </h1>
              {profile.headline && (
                <p className="mt-0.5 text-neutral-600">{profile.headline}</p>
              )}
              {profile.bio && (
                <p className="mt-3 max-w-2xl leading-relaxed text-neutral-600">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Their subjects */}
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-medium text-neutral-500">
            {subjectRows.length === 0
              ? "No subjects published yet"
              : `${subjectRows.length} subject${subjectRows.length === 1 ? "" : "s"}`}
          </h2>

          {subjectRows.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjectRows.map((subject, i) => {
                const stat = stats.get(subject.id) ?? { count: 0, size: 0 };
                return (
                  <SubjectCard
                    key={subject.id}
                    subject={{ ...subject, profiles: profile }}
                    fileCount={stat.count}
                    totalSize={stat.size}
                    index={i}
                  />
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-10 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-900 hover:underline">
            ← Back to all subjects
          </Link>
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
