"use client";

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type Viewer = {
  user_id: string;
  viewed_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

type ProfileBrief = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

/**
 * subject_views.user_id points at auth.users, not profiles — PostgREST
 * can't embed profiles here, so fetch rows first, then profiles by id.
 */
async function fetchViewers(
  supabase: SupabaseClient,
  subjectId: string
): Promise<Viewer[] | null> {
  const { data: rows, error } = await supabase
    .from("subject_views")
    .select("user_id, viewed_at")
    .eq("subject_id", subjectId)
    .order("viewed_at", { ascending: false })
    .limit(30);

  if (error || !rows) return null;
  if (rows.length === 0) return [];

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", (rows as { user_id: string }[]).map((r) => r.user_id));

  const byId = new Map<string, ProfileBrief>(
    ((profileRows ?? []) as ProfileBrief[]).map((p) => [p.id, p])
  );

  return (rows as { user_id: string; viewed_at: string }[]).map((row) => {
    const profile = byId.get(row.user_id);
    return {
      user_id: row.user_id,
      viewed_at: row.viewed_at,
      profiles: profile
        ? {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          }
        : null,
    };
  });
}

function Avatar({
  name,
  url,
  size = 20,
}: {
  name: string;
  url: string | null;
  size?: number;
}) {
  const px = { width: size, height: size };
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        title={name}
        style={px}
        className="rounded-full bg-white ring-2 ring-white"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span
      title={name}
      style={px}
      className="flex items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-600 ring-2 ring-white"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * "Who viewed this folder" — sits beside the Share button. Signed-in
 * viewers are recorded and their icons shown; clicking expands the full
 * list of names. Guests see nothing (RLS blocks the list for anon, and
 * nothing is recorded for them).
 */
export function SubjectViewers({ subjectId }: { subjectId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return; // guest — stay hidden

      setMeId(user.id);
      setEnabled(true);

      // Record this visit (refreshes viewed_at if already recorded).
      await supabase.from("subject_views").upsert(
        {
          subject_id: subjectId,
          user_id: user.id,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "subject_id,user_id" }
      );

      const rows = await fetchViewers(supabase, subjectId);
      if (!cancelled && rows) setViewers(rows);
    }

    load();

    // Live updates as other signed-in people open the folder.
    const channel = supabase
      .channel(`subject-views-${subjectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subject_views",
          filter: `subject_id=eq.${subjectId}`,
        },
        () => {
          fetchViewers(supabase, subjectId).then((rows) => {
            if (!cancelled && rows) setViewers(rows);
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [subjectId]);

  if (!enabled || viewers.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Who viewed this folder"
        className={`btn text-xs ${open ? "btn-outline" : "btn-ghost"}`}
      >
        <span className="flex -space-x-1.5">
          {viewers.slice(0, 5).map((v) => (
            <Avatar
              key={v.user_id}
              name={v.profiles?.full_name ?? "Someone"}
              url={v.profiles?.avatar_url ?? null}
            />
          ))}
        </span>
        Viewed by {viewers.length}
      </button>

      {open && (
        <ul className="mt-1 w-full animate-rise rounded-lg border border-neutral-200/70 bg-neutral-50 p-2">
          {viewers.map((v) => {
            const name = v.profiles?.full_name ?? "Someone";
            return (
              <li
                key={v.user_id}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
              >
                <Avatar
                  name={name}
                  url={v.profiles?.avatar_url ?? null}
                  size={24}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-neutral-800">
                  {name}
                </span>
                {v.user_id === meId && <span className="badge">You</span>}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
