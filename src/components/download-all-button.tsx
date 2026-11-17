"use client";

import type { FileRow } from "@/lib/types";
import { publicObjectUrl, withDownloadParam } from "@/lib/files";
import { markFileDownloaded, useDownloads } from "@/lib/downloads";
import { createClient } from "@/lib/supabase/client";
import { DownloadIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Downloads every file in a folder in sequence (staggered so browsers
 * don't drop the burst) and records all of them in one batch.
 * Works for guests too — only the tracking is skipped when signed out.
 */
export function DownloadAllButton({
  files,
  subjectTitle,
}: {
  files: FileRow[];
  subjectTitle: string;
}) {
  const [busy, setBusy] = useState(false);
  const downloads = useDownloads();
  const router = useRouter();

  const savedCount = files.filter((f) => downloads[f.subject_id]?.files[f.id])
    .length;

  async function handleDownloadAll() {
    if (busy || files.length === 0) return;
    setBusy(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let ok = 0;
    const recorded: { file_id: string; user_id: string }[] = [];

    for (const file of files) {
      const url = withDownloadParam(
        publicObjectUrl(file.storage_path),
        file.name
      );

      const a = document.createElement("a");
      a.href = url;
      a.rel = "noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();

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

      if (user) recorded.push({ file_id: file.id, user_id: user.id });
      ok += 1;

      // Stagger so the browser doesn't treat the burst as one popup block.
      if (files.indexOf(file) < files.length - 1) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }

    if (recorded.length > 0) {
      // Best-effort batch record — one round trip.
      await supabase
        .from("file_downloads")
        .upsert(recorded, { onConflict: "file_id,user_id" });
    }

    if (ok > 0) {
      toast.success(`Downloading ${ok} ${ok === 1 ? "file" : "files"}`, {
        duration: 2500,
      });
      // Refresh the Downloads badge/sidebar.
      router.refresh();
    } else {
      toast.error("Could not start the download — please try again");
    }

    setBusy(false);
  }

  if (files.length === 0) return null;

  return (
    <button
      className="btn btn-primary"
      onClick={handleDownloadAll}
      disabled={busy}
      aria-label={`Download all ${files.length} files in ${subjectTitle}`}
    >
      <DownloadIcon width={14} height={14} />
      {busy
        ? "Preparing…"
        : savedCount > 0
          ? `Download all (${files.length})`
          : "Download all"}
    </button>
  );
}
