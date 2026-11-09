"use client";

import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/files";
import { CheckIcon, CloseIcon, FolderIcon } from "@/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type InboxItem = {
  id: string;
  status: "pending" | "accepted" | "declined";
  role: "teacher" | "student";
  classroomId: string;
  classroomName: string;
  inviterName: string;
  createdAt: string;
};

const ROLE_LABELS = { teacher: "Teacher", student: "Student" } as const;

export function InboxList({
  items,
  pendingCount,
}: {
  items: InboxItem[];
  pendingCount: number;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function respond(item: InboxItem, action: "accept" | "decline") {
    setBusyId(item.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("invitations")
      .update({ status: action === "accept" ? "accepted" : "declined" })
      .eq("id", item.id)
      .eq("status", "pending");

    if (error) {
      toast.error(`Could not respond: ${error.message}`);
      router.refresh();
    } else if (action === "accept") {
      // Flow: accepting takes you straight into the classroom
      // (navigation re-renders the server components on arrival).
      toast.success(`You joined ${item.classroomName}`);
      router.push(`/classrooms/${item.classroomId}`);
    } else {
      toast.success("Invitation declined");
      router.refresh();
    }
    setBusyId(null);
  }

  async function dismiss(item: InboxItem) {
    setBusyId(item.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", item.id);

    if (error) toast.error(`Could not remove: ${error.message}`);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {pendingCount > 0 && (
        <p className="text-sm font-medium text-neutral-600">
          {pendingCount} pending{" "}
          {pendingCount === 1 ? "invitation" : "invitations"}
        </p>
      )}

      {items.map((item) => {
        const busy = busyId === item.id;
        return (
          <div key={item.id} className="card flex flex-wrap items-center gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
              <FolderIcon width={16} height={16} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {item.status === "accepted" ? (
                  <Link
                    href={`/classrooms/${item.classroomId}`}
                    className="truncate font-semibold text-neutral-900 hover:underline"
                  >
                    {item.classroomName}
                  </Link>
                ) : (
                  <span className="truncate font-semibold text-neutral-900">
                    {item.classroomName}
                  </span>
                )}
                <span className="badge">{ROLE_LABELS[item.role]}</span>
                {item.status === "accepted" && (
                  <span className="badge bg-emerald-50 text-emerald-700">
                    Joined
                  </span>
                )}
                {item.status === "declined" && (
                  <span className="badge bg-neutral-100 text-neutral-500">
                    Declined
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">
                Invited by {item.inviterName} · {formatDate(item.createdAt)}
              </p>
            </div>

            {item.status === "pending" ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => respond(item, "decline")}
                  disabled={busy}
                >
                  <CloseIcon width={14} height={14} />
                  Decline
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => respond(item, "accept")}
                  disabled={busy}
                >
                  <CheckIcon width={14} height={14} />
                  Accept
                </button>
              </div>
            ) : (
              <button
                className="btn btn-ghost shrink-0 text-neutral-500"
                onClick={() => dismiss(item)}
                disabled={busy}
              >
                Dismiss
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
