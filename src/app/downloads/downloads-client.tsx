"use client";

import { FileItem } from "@/components/file-item";
import { FolderIcon, DownloadIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import {
  clearDownloads,
  removeSubject,
  useDownloads,
  type DownloadsState,
  type DownloadedFile,
} from "@/lib/downloads";
import type { FileRow } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Rebuild a minimal FileRow from the local record (offline fallback). */
function storedFileToFileRow(subjectId: string, f: DownloadedFile): FileRow {
  return {
    id: f.id,
    subject_id: subjectId,
    teacher_id: "",
    name: f.name,
    storage_path: f.storage_path,
    mime_type: null,
    size_bytes: f.size_bytes,
    kind: f.kind,
    created_at: new Date(f.downloaded_at).toISOString(),
  };
}

function groupBySubject(rows: FileRow[]): Record<string, FileRow[]> {
  const map: Record<string, FileRow[]> = {};
  for (const row of rows) {
    (map[row.subject_id] ??= []).push(row);
  }
  return map;
}

export function DownloadsClient() {
  const state: DownloadsState = useDownloads();
  const subjectIds = Object.keys(state);
  const [remoteFiles, setRemoteFiles] = useState<
    Record<string, FileRow[]> | null
  >(null);
  const [loading, setLoading] = useState(subjectIds.length > 0);

  // Full file list per saved subject — lets us mark the ones NOT downloaded.
  // Falls back to local records when the network is unavailable.
  // (When no subjects are saved the empty state renders instead, so stale
  // data here is never visible.)
  useEffect(() => {
    if (subjectIds.length === 0) return;

    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("files")
      .select("*")
      .in("subject_id", subjectIds)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        setRemoteFiles(error || !data ? null : groupBySubject(data));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectIds.join("|")]);

  // -------- empty state --------
  if (subjectIds.length === 0) {
    return (
      <>
        <header className="py-8">
          <h1 className="text-2xl font-semibold tracking-tight">Downloads</h1>
        </header>
        <div className="card flex animate-rise flex-col items-center gap-3 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
            <DownloadIcon />
          </span>
          <div>
            <p className="font-medium text-neutral-900">Nothing here yet</p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-neutral-600">
              Download a file from any subject and its folder is saved here —
              so you always know where your materials live.
            </p>
          </div>
          <Link href="/" className="btn btn-primary mt-1">
            Browse subjects
          </Link>
        </div>
      </>
    );
  }

  const handleClearAll = () => {
    if (!confirm("Remove all subjects from your downloads?")) return;
    clearDownloads();
    toast.success("Downloads cleared");
  };

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3 py-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            Downloads
            <span className="badge">
              {subjectIds.length}{" "}
              {subjectIds.length === 1 ? "folder" : "folders"}
            </span>
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Subject folders you&apos;ve pulled files from, with everything
            saved and everything still to get.
          </p>
        </div>
        <button className="btn btn-ghost text-sm text-neutral-500" onClick={handleClearAll}>
          Clear all
        </button>
      </header>

      <div className="flex flex-col gap-4">
        {subjectIds.map((subjectId, i) => {
          const subject = state[subjectId];
          const storedCount = Object.keys(subject.files).length;

          // Live file list when online; local records only when offline.
          const files =
            remoteFiles?.[subjectId] ??
            Object.values(subject.files).map((f) =>
              storedFileToFileRow(subjectId, f)
            );

          const total = remoteFiles ? files.length : storedCount;
          const downloaded = storedCount;

          return (
            <section
              key={subjectId}
              className="card animate-rise p-5"
              style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
                    <FolderIcon width={16} height={16} />
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/subjects/${subjectId}`}
                      className="block truncate font-semibold tracking-tight hover:underline"
                    >
                      {subject.title}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {loading
                        ? "Loading files…"
                        : `${downloaded} of ${total} file${total === 1 ? "" : "s"} downloaded`}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="badge">
                    <CheckProgress done={downloaded} total={total} />
                    {downloaded}/{total}
                  </span>
                  <button
                    className="btn btn-danger-ghost text-xs"
                    onClick={() => {
                      removeSubject(subjectId);
                      toast.success(`Removed “${subject.title}” from Downloads`);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <ul className="mt-4 flex flex-col gap-2.5 border-t border-neutral-100 pt-4">
                {files.map((file) => (
                  <li key={file.id}>
                    <FileItem
                      file={file}
                      subjectTitle={subject.title}
                      showStatus
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

function CheckProgress({ done, total }: { done: number; total: number }) {
  if (total > 0 && done >= total) {
    return <span className="text-green-600">✓</span>;
  }
  return null;
}
