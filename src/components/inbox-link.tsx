"use client";

import { createClient } from "@/lib/supabase/client";
import { MailIcon } from "@/components/icons";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Header link to the invitation inbox with a live pending-invite count.
 * Subscribes to this user's invitation rows so new invites badge instantly.
 */
export function InboxLink({ userId }: { userId: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadCount() {
      const { count: pending } = await supabase
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("invitee_id", userId)
        .eq("status", "pending");
      if (!cancelled && pending !== null) setCount(pending);
    }

    loadCount();

    const channel = supabase
      .channel(`inbox-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invitations",
          filter: `invitee_id=eq.${userId}`,
        },
        loadCount
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Link
      href="/inbox"
      className="btn btn-ghost max-sm:px-2.5"
      aria-label={`Inbox${count > 0 ? `, ${count} new invitations` : ""}`}
    >
      <MailIcon width={14} height={14} />
      <span className="max-sm:hidden">Inbox</span>
      {count > 0 && (
        <span className="badge bg-neutral-900 px-1.5 text-white">{count}</span>
      )}
    </Link>
  );
}
