import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ClampedDescription } from "@/components/clamped-description";
import { KindIcon, LiveDot } from "@/components/icons";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { createClient } from "@/lib/supabase/server";
import { KIND_LABELS, formatBytes, formatDate } from "@/lib/files";
import type { FileRow, Profile, Subject } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateSubjectForm } from "./create-subject-form";
import { DeleteFileButton } from "./delete-file-button";
import { DeleteSubjectButton } from "./delete-subject-button";
import { FileDownloaders } from "./file-downloaders";
import { ProfileForm } from "./profile-form";
import { UploadButton } from "./upload-button";
import { ShareButton } from "@/components/share-dialog";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Safety net: profile row is created by a DB trigger on signup.
  const profile: Profile =
    (profileRow as Profile | null) ??
    ({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? "",
      avatar_url: user.user_metadata?.avatar_url ?? null,
      headline: null,
      bio: null,
      created_at: new Date().toISOString(),
    } satisfies Profile);

  // Public subjects only — classroom folders live in their own section.
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("teacher_id", user.id)
    .is("classroom_id", null)
    .order("created_at", { ascending: false });

  // Classroom folders I own or that are assigned to me.
  const { data: memberRows } = await supabase
    .from("classroom_members")
    .select("classroom_id, role, classroom:classrooms(name)")
    .eq("user_id", user.id);

  const memberships = (memberRows ?? []) as unknown as {
    classroom_id: string;
    role: string;
    classroom: { name: string } | null;
  }[];
  const classIds = memberships.map((m) => m.classroom_id);

  const { data: classFolderRows } =
    classIds.length > 0
      ? await supabase
          .from("subjects")
          .select("*, classroom:classrooms(id, name)")
          .in("classroom_id", classIds)
          .or(`assigned_teacher_id.eq.${user.id},teacher_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
      : { data: [] };

  // My uploads (stats + public lists) plus every file in my class folders
  // (other teachers' uploads belong to the owner for awareness).
  const { data: myFiles } = await supabase
    .from("files")
    .select("*")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  const { data: classFiles } =
    classFolderRows && classFolderRows.length > 0
      ? await supabase
          .from("files")
          .select("*")
          .in(
            "subject_id",
            classFolderRows.map((s) => s.id)
          )
          .order("created_at", { ascending: false })
      : { data: [] };

  const subjectRows = (subjects ?? []) as Subject[];
  const classFolders = (classFolderRows ?? []) as (Subject & {
    classroom: { id: string; name: string } | null;
  })[];
  const fileRows = (myFiles ?? []) as FileRow[];

  // Dedupe by file id, then group by subject.
  const fileById = new Map<string, FileRow>();
  for (const f of [...fileRows, ...((classFiles ?? []) as FileRow[])]) {
    fileById.set(f.id, f);
  }
  const filesBySubject = new Map<string, FileRow[]>();
  for (const f of fileById.values()) {
    const arr = filesBySubject.get(f.subject_id) ?? [];
    arr.push(f);
    filesBySubject.set(f.subject_id, arr);
  }

  const totalFiles = fileRows.length;
  const totalSize = fileRows.reduce((sum, f) => sum + (f.size_bytes ?? 0), 0);

  return (
    <>
      <RealtimeRefresh teacherId={user.id} />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4 py-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "Dashboard"}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              {subjectRows.length} subject{subjectRows.length === 1 ? "" : "s"} ·{" "}
              {totalFiles} file{totalFiles === 1 ? "" : "s"}
              {totalSize > 0 ? ` · ${formatBytes(totalSize)} total` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="badge"
              title="Changes from other sessions appear automatically"
            >
              <LiveDot />
              Live
            </span>
            <Link
              href={`/teachers/${user.id}`}
              className="btn btn-outline text-sm"
            >
              View public profile
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left: profile */}
          <ProfileForm profile={profile} />

          {/* Right: subjects */}
          <div className="flex flex-col gap-4">
            <CreateSubjectForm teacherId={user.id} />

            {subjectRows.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="font-medium text-neutral-900">
                  Create your first subject
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Subjects are folders students can browse — like
                  &ldquo;Algebra II&rdquo; or &ldquo;World History&rdquo;.
                </p>
              </div>
            ) : (
              subjectRows.map((subject, i) => {
                const subjectFiles = filesBySubject.get(subject.id) ?? [];
                return (
                  <section
                    key={subject.id}
                    className="card animate-rise p-5"
                    style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold tracking-tight">
                            {subject.title}
                          </h2>
                          <span className="badge">
                            {subjectFiles.length}{" "}
                            {subjectFiles.length === 1 ? "file" : "files"}
                          </span>
                        </div>
                        {subject.description && (
                          <div className="mt-1">
                            <ClampedDescription
                              text={subject.description}
                              lines={2}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <ShareButton
                          url={`/subjects/${subject.id}`}
                          title={subject.title}
                        />
                        <Link
                          href={`/subjects/${subject.id}`}
                          className="btn btn-ghost text-xs"
                        >
                          View page
                        </Link>
                        <DeleteSubjectButton subjectId={subject.id} />
                      </div>
                    </div>

                    <div className="mt-4 border-t border-neutral-100 pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-neutral-500">
                          Materials
                        </p>
                        <UploadButton
                          subjectId={subject.id}
                          teacherId={user.id}
                        />
                      </div>

                      {subjectFiles.length > 0 ? (
                        <ul className="mt-3 flex flex-col divide-y divide-neutral-100">
                          {subjectFiles.map((file) => (
                            <li
                              key={file.id}
                              className="flex flex-wrap items-center gap-3 py-2"
                            >
                              <span className="text-neutral-400">
                                <KindIcon kind={file.kind as never} width={16} height={16} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-neutral-800">
                                  {file.name}
                                </span>
                                <span className="block text-xs text-neutral-500">
                                  {KIND_LABELS[file.kind as keyof typeof KIND_LABELS] ?? "File"} ·{" "}
                                  {formatBytes(file.size_bytes)} ·{" "}
                                  {formatDate(file.created_at)}
                                </span>
                              </span>
                              <FileDownloaders fileId={file.id} />
                              <DeleteFileButton
                                fileId={file.id}
                                storagePath={file.storage_path}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-neutral-500">
                          No files yet — upload videos, PDFs, or images.
                        </p>
                      )}
                    </div>
                  </section>
                );
              })
            )}

            {/* Classroom folders — owned or assigned to me (RLS-gated) */}
            {classFolders.length > 0 && (
              <section className="flex flex-col gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-medium text-neutral-500">
                    Classroom folders · {classFolders.length}
                  </h2>
                  <span className="h-px flex-1 bg-neutral-200" />
                </div>

                {classFolders.map((folder, i) => {
                  const folderFiles = filesBySubject.get(folder.id) ?? [];
                  const isOwner = folder.teacher_id === user.id;
                  return (
                    <section
                      key={folder.id}
                      className="card animate-rise p-5"
                      style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold tracking-tight">
                              {folder.title}
                            </h2>
                            <span className="badge bg-neutral-900 text-white">
                              {folder.classroom?.name ?? "Classroom"}
                            </span>
                            <span className="badge">
                              {folderFiles.length}{" "}
                              {folderFiles.length === 1 ? "file" : "files"}
                            </span>
                          </div>
                          {folder.description && (
                            <div className="mt-1">
                              <ClampedDescription
                                text={folder.description}
                                lines={2}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Link
                            href={`/subjects/${folder.id}`}
                            className="btn btn-ghost text-xs"
                          >
                            View page
                          </Link>
                          {isOwner && (
                            <DeleteSubjectButton subjectId={folder.id} />
                          )}
                        </div>
                      </div>

                      <div className="mt-4 border-t border-neutral-100 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-medium text-neutral-500">
                            Materials
                          </p>
                          <UploadButton
                            subjectId={folder.id}
                            teacherId={user.id}
                            bucket="oer-class-files"
                          />
                        </div>

                        {folderFiles.length > 0 ? (
                          <ul className="mt-3 flex flex-col divide-y divide-neutral-100">
                            {folderFiles.map((file) => (
                              <li
                                key={file.id}
                                className="flex flex-wrap items-center gap-3 py-2"
                              >
                                <span className="text-neutral-400">
                                  <KindIcon kind={file.kind as never} width={16} height={16} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm text-neutral-800">
                                    {file.name}
                                  </span>
                                  <span className="block text-xs text-neutral-500">
                                    {KIND_LABELS[file.kind as keyof typeof KIND_LABELS] ?? "File"} ·{" "}
                                    {formatBytes(file.size_bytes)} ·{" "}
                                    {formatDate(file.created_at)}
                                  </span>
                                </span>
                                <FileDownloaders fileId={file.id} />
                                {file.teacher_id === user.id && (
                                  <DeleteFileButton
                                    fileId={file.id}
                                    storagePath={file.storage_path}
                                    bucket={file.bucket}
                                  />
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-neutral-500">
                            No files yet — upload videos, PDFs, or images.
                          </p>
                        )}
                      </div>
                    </section>
                  );
                })}
              </section>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
