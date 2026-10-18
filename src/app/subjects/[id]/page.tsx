import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FileItem } from "@/components/file-item";
import { FolderIcon } from "@/components/icons";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ShareButton } from "@/components/share-dialog";
import { createClient } from "@/lib/supabase/server";
import { formatBytes } from "@/lib/files";
import type { FileRow, Profile } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export const instant = false;

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: subject } = await supabase
    .from("subjects")
    .select("*, profiles:teacher_id(*)")
    .eq("id", id)
    .maybeSingle();

  if (!subject) notFound();

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("subject_id", id)
    .order("created_at", { ascending: false });

  const teacher = subject.profiles as Profile | null;
  const fileRows = (files ?? []) as FileRow[];
  const totalSize = fileRows.reduce((sum, f) => sum + (f.size_bytes ?? 0), 0);

  return (
    <>
      <RealtimeRefresh subjectId={id} />
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 py-6 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-900 hover:underline">
            Browse
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-neutral-900">{subject.title}</span>
        </nav>

        {/* Subject header */}
        <header className="card animate-rise p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">
                {subject.title}
              </h1>
              {subject.description && (
                <p className="mt-2 leading-relaxed text-neutral-600">
                  {subject.description}
                </p>
              )}
            </div>
            <span className="badge shrink-0">
              {fileRows.length} {fileRows.length === 1 ? "file" : "files"}
              {totalSize > 0 ? ` · ${formatBytes(totalSize)}` : ""}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <ShareButton
              url={`/subjects/${id}`}
              title={subject.title}
              className="btn btn-primary text-sm"
            />
            {teacher && (
              <span className="text-xs text-neutral-400">
                Scan the QR code to share with students
              </span>
            )}
          </div>

          {teacher && (
            <Link
              href={`/teachers/${teacher.id}`}
              className="mt-6 inline-flex items-center gap-3 rounded-lg py-1 pr-3 transition-colors duration-150 hover:bg-neutral-50"
            >
              {teacher.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={teacher.avatar_url}
                  alt=""
                  className="h-9 w-9 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                  {(teacher.full_name ?? "?").charAt(0).toUpperCase()}
                </span>
              )}
              <span>
                <span className="block text-sm font-medium text-neutral-900">
                  {teacher.full_name}
                </span>
                {teacher.headline && (
                  <span className="block text-xs text-neutral-500">
                    {teacher.headline}
                  </span>
                )}
              </span>
            </Link>
          )}
        </header>

        {/* Files */}
        <section className="mt-8">
          {fileRows.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {fileRows.map((file) => (
                <li key={file.id}>
                  <FileItem file={file} subjectTitle={subject.title} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                <FolderIcon />
              </span>
              <div>
                <p className="font-medium text-neutral-900">
                  No materials yet
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  The teacher hasn&apos;t uploaded anything to this subject.
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
