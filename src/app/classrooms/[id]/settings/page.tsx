import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SettingsIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import type {
  ClassroomRole,
  InvitationRole,
  InvitationStatus,
  Profile,
} from "@/lib/types";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MembersManager } from "./members-manager";
import { RenameForm } from "./rename-form";

export const instant = false;

export default async function ClassSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/classrooms/${id}/settings`);

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, owner_id, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!classroom) notFound();

  // Settings are owner-only; RLS hides rows from everyone else → 404.
  const { data: membership } = await supabase
    .from("classroom_members")
    .select("role")
    .eq("classroom_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership?.role !== "owner") notFound();

  const { data: memberRows } = await supabase
    .from("classroom_members")
    .select("user_id, role, profile:profiles(id, full_name, avatar_url)")
    .eq("classroom_id", id)
    .order("role");

  const members = ((memberRows ?? []) as unknown as {
    user_id: string;
    role: ClassroomRole;
    profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  }[])
    .filter((m) => m.profile)
    .map((m) => ({
      userId: m.user_id,
      role: m.role,
      profile: m.profile!,
    }));

  const { data: inviteRows } = await supabase
    .from("invitations")
    .select(
      "id, role, status, invitee_id, created_at, invitee:invitee_id(id, full_name, avatar_url)"
    )
    .eq("classroom_id", id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const invites = ((inviteRows ?? []) as unknown as {
    id: string;
    role: InvitationRole;
    status: InvitationStatus;
    invitee_id: string;
    created_at: string;
    invitee:
      | (Pick<Profile, "id" | "full_name" | "avatar_url"> & { id: string })
      | null;
  }[]).map((i) => ({
    id: i.id,
    inviteeId: i.invitee_id,
    role: i.role,
    name: i.invitee?.full_name ?? "Unknown",
    avatarUrl: i.invitee?.avatar_url ?? null,
    createdAt: i.created_at,
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href={`/classrooms/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
          prefetch={false}
        >
          ← {classroom.name}
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <SettingsIcon width={16} height={16} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              Class settings
            </h1>
            <p className="text-sm text-neutral-500">
              Rename the classroom and invite teachers or students by Gmail.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <RenameForm classroomId={id} initialName={classroom.name} />

          <MembersManager
            classroomId={id}
            ownerId={user.id}
            sectionRole="teacher"
            members={members.filter((m) => m.role !== "student")}
            invites={invites.filter((i) => i.role === "teacher")}
          />

          <MembersManager
            classroomId={id}
            ownerId={user.id}
            sectionRole="student"
            members={members.filter((m) => m.role === "student")}
            invites={invites.filter((i) => i.role === "student")}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
