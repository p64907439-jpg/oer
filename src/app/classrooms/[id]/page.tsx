import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FolderIcon, SettingsIcon } from "@/components/icons";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { createClient } from "@/lib/supabase/server";
import { formatBytes } from "@/lib/files";
import type { ClassroomRole, Profile, Subject } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateClassroomFolderForm } from "./create-folder-form";

export const instant = false;

type ClassFolder = Subject & {
  profiles: Pick<Profile, "id" | "full_name"> | null;
  assigned: Pick<Profile, "id" | "full_name"> | null;
};

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // RLS: non-members get no row → 404, same as a missing classroom.
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, owner_id, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!classroom) notFound();

  const { data: membership } = await supabase
    .from("classroom_members")
    .select("role")
    .eq("classroom_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const role = (membership?.role ?? null) as ClassroomRole | null;
  if (!role) notFound();

  const { data: folders } = await supabase
    .from("subjects")
    .select(
      "*, profiles:teacher_id(id, full_name), assigned:assigned_teacher_id(id, full_name)"
    )
    .eq("classroom_id", id)
    .order("created_at", { ascending: false });

  const list = (folders ?? []) as unknown as ClassFolder[];

  // File stats for the folder grid.
  const { data: fileRows } = await supabase
    .from("files")
    .select("subject_id, size_bytes")
    .in(
      "subject_id",
      list.map((s) => s.id)
    );

  const stats = new Map<string, { count: number; size: number }>();
  for (const f of fileRows ?? []) {
    const s = stats.get(f.subject_id) ?? { count: 0, size: 0 };
    s.count += 1;
    s.size += f.size_bytes ?? 0;
    stats.set(f.subject_id, s);
  }

  // Owner picks the assignee when creating folders (defaults to self).
  const isOwner = role === "owner";
  let staff: Pick<Profile, "id" | "full_name">[] = [];
  if (isOwner) {
    const { data: members } = await supabase
      .from("classroom_members")
      .select("role, profile:profiles(id, full_name)")
      .eq("classroom_id", id)
      .order("role");
    staff = ((members ?? []) as unknown as {
      role: ClassroomRole;
      profile: Pick<Profile, "id" | "full_name"> | null;
    }[])
      .filter((m) => m.role !== "student" && m.profile)
      .map((m) => m.profile!);
  }

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← Browse
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <FolderIcon width={18} height={18} />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                {classroom.name}
              </h1>
              <p className="text-sm text-neutral-500 capitalize">
                {role === "owner" ? "You own this classroom" : `You are a ${role} here`}
              </p>
            </div>
          </div>

          {isOwner && (
            <Link
              href={`/classrooms/${id}/settings`}
              className="btn btn-outline"
              title="Class settings"
            >
              <SettingsIcon width={14} height={14} />
              Class settings
            </Link>
          )}
        </div>

        {isOwner && (
          <div className="mb-6">
            <CreateClassroomFolderForm classroomId={id} staff={staff} ownerId={user.id} />
          </div>
        )}

        {list.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((folder, i) => {
              const stat = stats.get(folder.id) ?? { count: 0, size: 0 };
              return (
                <Link
                  key={folder.id}
                  href={`/subjects/${folder.id}`}
                  className="card card-hover animate-rise block p-5"
                  style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug tracking-tight text-neutral-900">
                      {folder.title}
                    </h3>
                    <span className="badge shrink-0">
                      {stat.count} {stat.count === 1 ? "file" : "files"}
                    </span>
                  </div>

                  {folder.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
                      {folder.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-2 text-xs text-neutral-500">
                    <span className="truncate">
                      {folder.assigned?.full_name
                        ? `Assigned to ${folder.assigned.full_name}`
                        : "Unassigned"}
                    </span>
                    <span className="shrink-0">
                      {stat.size > 0 ? `${formatBytes(stat.size)} · ` : ""}
                      {stat.count === 0 ? "No files yet" : "materials"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
              <FolderIcon />
            </span>
            <div>
              <p className="font-medium text-neutral-900">No folders yet</p>
              <p className="mt-1 text-sm text-neutral-600">
                {isOwner
                  ? "Create your first subject folder and assign it to a teacher."
                  : "The classroom owner hasn't created any folders yet."}
              </p>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
