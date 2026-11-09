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
import { useEffect, useState } from "react";
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
  /** Extra controls in the action row (e.g. delete for the uploader). */
  actions?: React.ReactNode;
}) {
  const downloads = useDownloads();
  const saved = !!downloads[file.subject_id]?.files[file.id];

  // Classroom files live in a private bucket → resolve a signed URL on
  // mount (members only; RLS gates the signed URL). Public files are
  // direct URLs, exactly as before.
  const isPrivate = file.bucket !== "oer-files";
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isPrivate) return;
    let cancelled = false;
    const supabase = createClient();
    supabase.storage
      .from(file.bucket)
      .createSignedUrl(file.storage_path, 3600)
      .then(({ data }) => {
        if (!cancelled && data?.signedUrl) setSignedUrl(data.signedUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [file.bucket, file.storage_path, isPrivate]);

  const url = isPrivate ? signedUrl : publicObjectUrl(file.bucket, file.storage_path);
  const downloadUrl = url ? withDownloadParam(url, file.name) : null;

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
          bucket: file.bucket,
        }
      );
      toast.success(`“${file.name}” saved to Downloads`, { duration: 2500 });
    }
    // Credit signed-in downloaders to the file's owner (guests stay anonymous).
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
    <div className="animate-rise flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200/80 bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
        <KindIcon kind={file.kind} />
      </span>

      <div className="min-w-0 flex-1 basis-40">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-sm font-medium text-neutral-900 hover:underline"
            title={file.name}
          >
            {file.name}
          </a>
        ) : (
          <span
            className="block truncate text-sm font-medium text-neutral-900"
            title={file.name}
          >
            {file.name}
          </span>
        )}
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
          <span>
            {KIND_LABELS[file.kind]} · {formatBytes(file.size_bytes)} ·{" "}
            {formatDate(file.created_at)}
          </span>
          {saved && (
            <span className="badge !bg-green-50 !text-green-700">
              <CheckIcon width={12} height={12} strokeWidth={2.5} />
              Saved
            </span>
          )}
          {!saved && showStatus && (
            <span className="badge">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full border-[1.5px] border-neutral-400"
              />
              Not downloaded
            </span>
          )}
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost text-xs"
          >
            View
          </a>
        ) : (
          <span className="btn btn-ghost text-xs opacity-50" aria-hidden>
            View
          </span>
        )}
        {downloadUrl ? (
          <a
            href={downloadUrl}
            className="btn btn-outline text-xs"
            download
            onClick={handleDownload}
          >
            <DownloadIcon width={14} height={14} />
            Download
          </a>
        ) : (
          <span className="btn btn-outline text-xs opacity-50" aria-hidden>
            <DownloadIcon width={14} height={14} />
            Download
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}
