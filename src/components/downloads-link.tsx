"use client";

import { downloadedSubjectCount, useDownloads } from "@/lib/downloads";
import { DownloadIcon } from "@/components/icons";
import Link from "next/link";

export function DownloadsLink() {
  const state = useDownloads();
  const count = downloadedSubjectCount(state);

  return (
    <Link
      href="/downloads"
      className="btn btn-ghost max-sm:px-2.5"
      aria-label={`Downloads${count > 0 ? `, ${count} folders` : ""}`}
    >
      <DownloadIcon width={14} height={14} />
      <span className="max-sm:hidden">Downloads</span>
      {count > 0 && (
        <span className="badge bg-neutral-900 px-1.5 text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
