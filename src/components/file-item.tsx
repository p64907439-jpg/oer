"use client";

import type { FileRow } from "@/lib/types";
import { KIND_LABELS, formatBytes, formatDate } from "@/lib/files";
import { markFileDownloaded, useDownloads } from "@/lib/downloads";
import { createClient } from "@/lib/supabase/client";
import { CheckIcon, DownloadIcon, KindIcon } from "./icons";
import { toast } from "sonner";

function publicUrlFor(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/oer-files/${path}`;
}

export function FileItem({
  file,
  subjectTitle,
  showStatus = false,
}: {
  file: FileRow;
  subjectTitle: string;
  /** Render an explicit "Saved / Not downloaded" mark (Downloads tab). */
  showStatus?: boolean;
}) {
  const downloads = useDownloads();
  const saved = !!downloads[file.subject_id]?.files[file.id];

  const url = publicUrlFor(file.storage_path);
  const downloadUrl = `${url}?download=${encodeURIComponent(file.name)}`;

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
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm font-medium text-neutral-900 hover:underline"
          title={file.name}
        >
          {file.name}
        </a>
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
          <DownloadIcon width={14} height={14} />
          Download
        </a>
      </div>
    </div>
  );
}
