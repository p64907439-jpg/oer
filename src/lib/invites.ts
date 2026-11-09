"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

// Each hook instance joins realtime under its own topic name — the header
// badge and the bottom tab bar can both subscribe without a duplicate-join.
let topicSeq = 0;

/** Live count of pending invitations for this user (0 when signed out). */
export function usePendingInviteCount(userId: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return; // signed out → caller renders 0 (derived below)

    const supabase = createClient();
    let cancelled = false;
    const topic = `inbox-count-${userId}-${++topicSeq}`;

    async function loadCount() {
      const { count: pending } = await supabase
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("invitee_id", userId!)
        .eq("status", "pending");
      if (!cancelled && pending !== null) setCount(pending);
    }

    loadCount();

    const channel = supabase
      .channel(topic)
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

  // Signed out: always 0 — no effect, no stale count after sign-out.
  return userId ? count : 0;
}
