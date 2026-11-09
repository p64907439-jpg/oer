"use client";

import { usePendingInviteCount } from "@/lib/invites";
import { MailIcon } from "@/components/icons";
import Link from "next/link";

/**
 * Header link to the invitation inbox with a live pending-invite count.
 * Phone layouts move this destination into the bottom tab bar instead.
 */
export function InboxLink({ userId }: { userId: string }) {
  const count = usePendingInviteCount(userId);

  return (
    <Link
      href="/inbox"
      className="btn btn-ghost"
      aria-label={`Inbox${count > 0 ? `, ${count} new invitations` : ""}`}
    >
      <MailIcon width={14} height={14} />
      <span>Inbox</span>
      {count > 0 && (
        <span className="badge bg-neutral-900 px-1.5 text-white">{count}</span>
      )}
    </Link>
  );
}
