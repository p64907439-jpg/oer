import type { FileRow } from "@/lib/types";
import { KIND_LABELS, formatBytes, formatDate } from "@/lib/files";
import { DownloadIcon, KindIcon } from "./icons";

function publicUrlFor(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/oer-files/${path}`;
}

export function FileItem({ file }: { file: FileRow }) {
  const url = publicUrlFor(file.storage_path);
  const downloadUrl = `${url}?download=${encodeURIComponent(file.name)}`;

  return (
    <div className="animate-rise flex items-center gap-3 rounded-lg border border-neutral-200/80 bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
        <KindIcon kind={file.kind} />
      </span>

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
        <p className="mt-0.5 text-xs text-neutral-500">
          {KIND_LABELS[file.kind]} · {formatBytes(file.size_bytes)} ·{" "}
          {formatDate(file.created_at)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost text-xs"
        >
          View
        </a>
        <a href={downloadUrl} className="btn btn-outline text-xs" download>
          <DownloadIcon width={14} height={14} />
          Download
        </a>
      </div>
    </div>
  );
}
