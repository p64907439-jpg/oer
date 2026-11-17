import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ClampedDescription } from "@/components/clamped-description";
import { DownloadAllButton } from "@/components/download-all-button";
import { FileItem } from "@/components/file-item";
import { FolderIcon } from "@/components/icons";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ShareButton } from "@/components/share-dialog";
import { SubjectViewers } from "@/components/subject-viewers";
import { createClient } from "@/lib/supabase/server";
import { formatBytes } from "@/lib/files";
import type { FileRow } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UploadButton } from "@/app/admin/upload-button";
import { DeleteFileButton } from "@/app/admin/delete-file-button";
import { DeleteSubjectButton } from "@/app/admin/delete-subject-button";

export const instant = false;

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subject } = await supabase
    .from("subjects")
    .select("*, profiles:teacher_id(*)")
    .eq("id", id)
    .maybeSingle();

  if (!subject) notFound();

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("subject_id", subject.id)
    .order("created_at", { ascending: true });

  const fileRows = (files ?? []) as FileRow[];
  const totalSize = fileRows.reduce((sum, f) => sum + (f.size_bytes ?? 0), 0);

  // Record this view (best-effort, signed-in only).
  if (user) {
    await supabase.from("subject_views").upsert(
      {
        subject_id: subject.id,
        user_id: user.id,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: "subject_id,user_id" }
    );
  }

  // Only the shared teacher account may upload or delete — RLS enforces
  // this server-side too; this just hides the controls from everyone else.
  let isTeacher = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_teacher")
      .eq("id", user.id)
      .maybeSingle();
    isTeacher = !!profile?.is_teacher;
  }

  return (
    <>
      <RealtimeRefresh subjectId={subject.id} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-800">
            Browse
          </Link>
          <span aria-hidden>/</span>
          <span className="text-neutral-800">{subject.title}</span>
        </div>

        <header className="card mb-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                <FolderIcon />
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  {subject.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                  <span>
                    Uploaded by{" "}
                    {subject.profiles
                      ? subject.profiles.full_name
                      : "Unknown"}
                  </span>
                  <span>·</span>
                  <span>
                    {fileRows.length} {fileRows.length === 1 ? "file" : "files"}
                    {totalSize > 0 && ` · ${formatBytes(totalSize)}`}
                  </span>
                </div>
              </div>
            </div>

            {isTeacher && <SubjectViewers subjectId={subject.id} />}
          </div>

          {subject.description && (
            <div className="mt-4">
              <ClampedDescription text={subject.description} lines={3} />
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
            {isTeacher && (
              <UploadButton subjectId={subject.id} teacherId={user!.id} />
            )}
            {fileRows.length > 0 && (
              <DownloadAllButton
                files={fileRows}
                subjectTitle={subject.title}
              />
            )}
            <ShareButton
              url={`/subjects/${subject.id}`}
              title={subject.title}
            />
            {isTeacher && (
              <DeleteSubjectButton
                subjectId={subject.id}
                label="Delete folder"
                redirect="/admin"
              />
            )}
          </div>
        </header>

        {fileRows.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {fileRows.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                subjectTitle={subject.title}
                actions={
                  isTeacher ? (
                    <DeleteFileButton
                      fileId={file.id}
                      storagePath={file.storage_path}
                    />
                  ) : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
              <FolderIcon />
            </div>
            <p className="mt-4 font-medium text-neutral-900">
              No files uploaded yet
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {isTeacher
                ? "Use the button above to upload files to this folder."
                : "Check back soon — the teachers haven't uploaded anything yet."}
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
