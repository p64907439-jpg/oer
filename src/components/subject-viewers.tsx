"use client";

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type Viewer = {
  user_id: string;
  viewed_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

/** PostgREST types the embedded to-one join as an array — normalize it. */
type RawViewer = Omit<Viewer, "profiles"> & {
  profiles:
    | { full_name: string | null; avatar_url: string | null }[]
    | { full_name: string | null; avatar_url: string | null }
    | null;
};

async function fetchViewers(
  supabase: SupabaseClient,
  subjectId: string
): Promise<Viewer[] | null> {
  const { data, error } = await supabase
    .from("subject_views")
    .select("user_id, viewed_at, profiles(full_name, avatar_url)")
    .eq("subject_id", subjectId)
    .order("viewed_at", { ascending: false })
    .limit(30);

  if (error || !data) return null;

  return (data as unknown as RawViewer[]).map((row) => ({
    ...row,
    profiles: Array.isArray(row.profiles)
      ? (row.profiles[0] ?? null)
      : row.profiles,
  }));
}

/**
 * "Who viewed this folder" — signed-in viewers are recorded and their
 * profile icons shown in the folder. Guests see nothing (RLS blocks the
 * list for anon, and nothing is recorded for them).
 */
export function SubjectViewers({ subjectId }: { subjectId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [expanded, setExpanded] = useState(false);

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

  const MAX_AVATARS = 8;
  const shown = expanded ? viewers : viewers.slice(0, MAX_AVATARS);
  const extra = viewers.length - shown.length;
  const iAmHere = meId !== null && viewers.some((v) => v.user_id === meId);

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-t border-neutral-100 pt-4">
      <div className="flex -space-x-1.5">
        {shown.map((v) => {
          const name = v.profiles?.full_name ?? "Someone";
          return v.profiles?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={v.user_id}
              src={v.profiles.avatar_url}
              alt={name}
              title={name}
              className="h-6 w-6 rounded-full bg-white ring-2 ring-white"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span
              key={v.user_id}
              title={name}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-600 ring-2 ring-white"
            >
              {name.charAt(0).toUpperCase()}
            </span>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500">
        {viewers.length === 1 ? "1 person has" : `${viewers.length} people have`}{" "}
        viewed this folder{iAmHere ? " — including you" : ""}.
      </p>
      {extra > 0 && (
        <button
          type="button"
          className="btn btn-ghost text-xs"
          onClick={() => setExpanded(true)}
        >
          +{extra} more
        </button>
      )}
    </div>
  );
}
