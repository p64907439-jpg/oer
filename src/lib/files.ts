export type FileKind = "video" | "pdf" | "image" | "other";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB — Supabase free-tier per-file limit

/** Direct URL for a storage object. Public bucket only — classroom files
 *  live in a private bucket and need signed URLs instead. */
export function publicObjectUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

/** Force a download with the original filename. Cross-origin `download`
 *  attributes are ignored by browsers — the query param is what makes
 *  storage serve Content-Disposition: attachment. Works on signed URLs too. */
export function withDownloadParam(url: string, name: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(name)}`;
}

export function kindFromMime(mime: string | null | undefined): FileKind {
  if (!mime) return "other";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

export function isTooLarge(bytes: number) {
  return bytes > MAX_FILE_BYTES;
}

export const KIND_LABELS: Record<FileKind, string> = {
  video: "Video",
  pdf: "PDF",
  image: "Image",
  other: "File",
};

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes < 1) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Make a filename safe for a storage path segment. */
export function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "file";
}
