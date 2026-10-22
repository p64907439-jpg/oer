"use client";

import { formatDate } from "@/lib/files";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type Downloader = {
  user_id: string;
  downloaded_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

type ProfileBrief = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

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
 * file_downloads.user_id points at auth.users, not profiles — PostgREST
 * can't embed profiles here, so fetch rows first, then profiles by id.
 * Returns null on error (caller keeps its previous state).
 */
async function fetchList(
  supabase: SupabaseClient,
  fileId: string
): Promise<Downloader[] | null> {
  const { data: rows, error } = await supabase
    .from("file_downloads")
    .select("user_id, downloaded_at")
    .eq("file_id", fileId)
    .order("downloaded_at", { ascending: false })
    .limit(50);
  if (error || !rows) return null;
  if (rows.length === 0) return [];

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", (rows as { user_id: string }[]).map((r) => r.user_id));

  const byId = new Map<string, ProfileBrief>(
    ((profileRows ?? []) as ProfileBrief[]).map((p) => [p.id, p])
  );

  return (rows as { user_id: string; downloaded_at: string }[]).map((row) => {
    const profile = byId.get(row.user_id);
    return {
      user_id: row.user_id,
      downloaded_at: row.downloaded_at,
      profiles: profile
        ? {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          }
        : null,
    };
  });
}

/**
 * Who downloaded this file — visible only to the file's uploader (enforced
 * by RLS). Shows a count chip; clicking expands the list of downloaders.
 * Guests aren't recorded, so only signed-in downloads appear.
 */
export function FileDownloaders({ fileId }: { fileId: string }) {
  const [list, setList] = useState<Downloader[] | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    const rows = await fetchList(createClient(), fileId);
    if (rows) setList(rows);
  };

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const run = () => {
      fetchList(supabase, fileId).then((rows) => {
        if (!cancelled && rows) setList(rows);
      });
    };

    run();
    // The owner often downloads in another tab, then returns here —
    // refetch whenever the dashboard regains focus so counts are fresh.
    window.addEventListener("focus", run);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", run);
    };
  }, [fileId]);

  // Still loading — render nothing to avoid a "No downloads" flash.
  if (list === null) return null;

  if (list.length === 0) {
    return <span className="badge text-neutral-400">No downloads yet</span>;
  }

  const count = list.length;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const willOpen = !open;
          setOpen(willOpen);
          // Refresh on every expand so a just-finished download shows up.
          if (willOpen) void refresh();
        }}
        aria-expanded={open}
        title="Who downloaded this file"
        className={`btn text-xs ${open ? "btn-outline" : "btn-ghost"}`}
      >
        <span className="flex -space-x-1.5">
          {list.slice(0, 3).map((d) => (
            <Avatar
              key={d.user_id}
              name={d.profiles?.full_name ?? "Someone"}
              url={d.profiles?.avatar_url ?? null}
              size={16}
            />
          ))}
        </span>
        {count} download{count === 1 ? "" : "s"}
      </button>

      {open && (
        <ul className="order-last mt-1 w-full animate-rise rounded-lg border border-neutral-200/70 bg-neutral-50 p-2">
          {list.map((d) => {
            const name = d.profiles?.full_name ?? "Someone";
            return (
              <li
                key={d.user_id}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
              >
                <Avatar name={name} url={d.profiles?.avatar_url ?? null} />
                <span className="min-w-0 flex-1 truncate text-sm text-neutral-800">
                  {name}
                </span>
                <span className="shrink-0 text-xs text-neutral-400">
                  {formatDate(d.downloaded_at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
