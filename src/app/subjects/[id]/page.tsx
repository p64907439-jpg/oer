import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DownloadAllButton } from "@/components/download-all-button";
import { FileItem } from "@/components/file-item";
import { FolderIcon } from "@/components/icons";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ShareButton } from "@/components/share-dialog";
import { SubjectViewers } from "@/components/subject-viewers";
import { createClient } from "@/lib/supabase/server";
import { formatBytes } from "@/lib/files";
import type { ClassroomRole, FileRow } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UploadButton } from "@/app/dashboard/upload-button";

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

  // RLS: classroom folders only resolve for members → 404 otherwise.
  const { data: subject } = await supabase
    .from("subjects")
    .select(
      "*, profiles:teacher_id(*), classroom:classroom_id(id, name), assigned:assigned_teacher_id(id, full_name)"
    )
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

  const classroom = (subject.classroom ?? null) as {
    id: string;
    name: string;
  } | null;

  // Who may upload: owner anywhere; invited teacher only their assigned
  // folders; for public subjects the owning teacher (unchanged).
  let role: ClassroomRole | null = null;
  if (classroom && user) {
    const { data: membership } = await supabase
      .from("classroom_members")
      .select("role")
      .eq("classroom_id", classroom.id)
      .eq("user_id", user.id)
      .maybeSingle();
    role = (membership?.role ?? null) as ClassroomRole | null;
  }

  const canUpload = !classroom
    ? !!user && subject.teacher_id === user.id
    : role === "owner" ||
      (!!user && subject.assigned_teacher_id === user.id);

  return (
    <>
      <RealtimeRefresh subjectId={subject.id} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-800">
            Browse
          </Link>
          {classroom && (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/classrooms/${classroom.id}`}
                className="hover:text-neutral-800"
                prefetch={false}
              >
                {classroom.name}
              </Link>
            </>
          )}
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
                  {classroom && (
                    <span className="badge bg-neutral-900 text-white">
                      {classroom.name}
                    </span>
                  )}
                  {classroom && subject.assigned && (
                    <span className="badge">
                      {subject.profiles?.id === subject.assigned.id
                        ? "Owner uploads"
                        : `Uploads: ${subject.assigned.full_name}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {user && <SubjectViewers subjectId={subject.id} />}
          </div>

          {subject.description && (
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              {subject.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
            {canUpload && (
              <UploadButton
                subjectId={subject.id}
                teacherId={user!.id}
                bucket={classroom ? "oer-class-files" : "oer-files"}
              />
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
          </div>
        </header>

        {fileRows.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {fileRows.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                subjectTitle={subject.title}
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
              {canUpload
                ? "Use the button above to upload files to this folder."
                : "Check back soon — the owner hasn't uploaded anything yet."}
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
