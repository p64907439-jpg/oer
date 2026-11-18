import type { SubjectWithTeacher } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/files";
import { ClampedDescription } from "@/components/clamped-description";
import { FolderIcon } from "@/components/icons";
import Link from "next/link";

export function SubjectCard({
  subject,
  fileCount,
  totalSize,
  index = 0,
}: {
  subject: SubjectWithTeacher;
  fileCount: number;
  totalSize: number;
  index?: number;
}) {
  return (
    <div
      className="card card-hover animate-rise group relative flex flex-col p-5"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      {/* Whole-card link */}
      <Link
        href={`/subjects/${subject.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2"
      >
        <span className="sr-only">{subject.title}</span>
      </Link>

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors duration-150 group-hover:bg-neutral-200/70">
            <FolderIcon width={16} height={16} />
          </span>
          <h3 className="font-semibold leading-snug tracking-tight text-neutral-900">
            {subject.title}
          </h3>
        </div>
        <span className="badge shrink-0">
          {fileCount} {fileCount === 1 ? "file" : "files"}
        </span>
      </div>

      {/* Description */}
      {subject.description && (
        <div className="mt-2.5 ml-12">
          <ClampedDescription text={subject.description} lines={2} />
        </div>
      )}

      {/* Footer row */}
      <div className="mt-auto ml-12 flex items-center justify-between pt-3 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          {subject.profiles?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={subject.profiles.avatar_url}
              alt=""
              className="h-4 w-4 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200 text-[9px] font-semibold text-neutral-500">
              {(subject.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate">{subject.profiles?.full_name || "Teacher"}</span>
        </span>
        <span className="shrink-0">
          {totalSize > 0 ? `${formatBytes(totalSize)} · ` : ""}
          {formatDate(subject.created_at)}
        </span>
      </div>
    </div>
  );
}
