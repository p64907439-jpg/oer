import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MailIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import type { Invitation, InvitationRole, InvitationStatus } from "@/lib/types";
import { redirect } from "next/navigation";
import { InboxList, type InboxItem } from "./inbox-list";

export const instant = false;

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/inbox");

  const { data } = await supabase
    .from("invitations")
    .select(
      "*, classroom:classrooms(id, name), inviter:inviter_id(id, full_name, avatar_url)"
    )
    .eq("invitee_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const invitations = (data ?? []) as unknown as (Invitation & {
    classroom: { id: string; name: string } | null;
    inviter: { id: string; full_name: string; avatar_url: string | null } | null;
  })[];

  const items: InboxItem[] = invitations.map((i) => ({
    id: i.id,
    status: i.status as InvitationStatus,
    role: i.role as InvitationRole,
    classroomId: i.classroom?.id ?? i.classroom_id,
    classroomName: i.classroom?.name ?? "Unknown classroom",
    inviterName: i.inviter?.full_name ?? "A teacher",
    createdAt: i.created_at,
  }));

  const pending = items.filter((i) => i.status === "pending");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <MailIcon width={16} height={16} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              Inbox
            </h1>
            <p className="text-sm text-neutral-500">
              Classroom invitations sent to your Google account.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <MailIcon width={20} height={20} />
            </span>
            <p className="font-medium text-neutral-700">No invitations yet</p>
            <p className="max-w-sm text-sm text-neutral-500">
              When a classroom owner invites you as a teacher or student,
              you&apos;ll be able to accept it here.
            </p>
          </div>
        ) : (
          <InboxList items={items} pendingCount={pending.length} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
