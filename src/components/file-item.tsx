"use client";

import type { FileRow } from "@/lib/types";
import {
  KIND_LABELS,
  formatBytes,
  formatDate,
  publicObjectUrl,
  withDownloadParam,
} from "@/lib/files";
import { markFileDownloaded, useDownloads } from "@/lib/downloads";
import { createClient } from "@/lib/supabase/client";
import { CheckIcon, DownloadIcon, KindIcon } from "./icons";
import { toast } from "sonner";

export function FileItem({
  file,
  subjectTitle,
  showStatus = false,
  actions,
}: {
  file: FileRow;
  subjectTitle: string;
  /** Render an explicit "Saved / Not downloaded" mark (Downloads tab). */
  showStatus?: boolean;
  /** Extra controls in the action row (e.g. delete for teachers). */
  actions?: React.ReactNode;
}) {
  const downloads = useDownloads();
  const saved = !!downloads[file.subject_id]?.files[file.id];

  // Everything lives in the public bucket — direct links, no signing.
  const url = publicObjectUrl(file.storage_path);
  const downloadUrl = withDownloadParam(url, file.name);

  function handleDownload() {
    if (!saved) {
      markFileDownloaded(
        { id: file.subject_id, title: subjectTitle },
        {
          id: file.id,
          name: file.name,
          kind: file.kind,
          size_bytes: file.size_bytes,
          storage_path: file.storage_path,
        }
      );
      toast.success(`"${file.name}" saved to Downloads`, { duration: 2500 });
    }
    // Credit signed-in downloaders to the teachers (guests stay anonymous).
    void recordDownload();
  }

  async function recordDownload() {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("file_downloads").upsert(
        {
          file_id: file.id,
          user_id: user.id,
          downloaded_at: new Date().toISOString(),
        },
        { onConflict: "file_id,user_id" }
      );
    } catch (err) {
      // tracking is best-effort — the download itself still proceeds
      console.error("Failed to record download", err);
    }
  }

  return (
    <div className="animate-slide-up group flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
      {/* Icon */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors duration-150 group-hover:bg-neutral-200/70">
        <KindIcon kind={file.kind} width={16} height={16} />
      </span>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm font-medium text-neutral-900 hover:underline"
          title={file.name}
        >
          {file.name}
        </a>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-neutral-400">
          <span>{KIND_LABELS[file.kind as keyof typeof KIND_LABELS]}</span>
          <span aria-hidden>·</span>
          <span>{formatBytes(file.size_bytes)}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(file.created_at)}</span>
          {saved && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1 text-green-600">
                <CheckIcon width={11} height={11} strokeWidth={2.5} />
                Saved
              </span>
            </>
          )}
          {!saved && showStatus && (
            <>
              <span aria-hidden>·</span>
              <span className="text-neutral-300">Not downloaded</span>
            </>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 sm:opacity-100">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost text-xs"
        >
          View
        </a>
        <a
          href={downloadUrl}
          className="btn btn-outline text-xs"
          download
          onClick={handleDownload}
        >
          <DownloadIcon width={13} height={13} />
          Save
        </a>
        {actions}
      </div>
    </div>
  );
}
