import type { SubjectWithTeacher } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/files";
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
    <Link
      href={`/subjects/${subject.id}`}
      className="card card-hover animate-rise block p-5"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug tracking-tight text-neutral-900">
          {subject.title}
        </h3>
        <span className="badge shrink-0">
          {fileCount} {fileCount === 1 ? "file" : "files"}
        </span>
      </div>

      {subject.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
          {subject.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <span className="flex items-center gap-2">
          {subject.profiles?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={subject.profiles.avatar_url}
              alt=""
              className="h-5 w-5 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-600">
              {(subject.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          {subject.profiles?.full_name || "Unknown teacher"}
        </span>
        <span>
          {totalSize > 0 ? `${formatBytes(totalSize)} · ` : ""}
          {formatDate(subject.created_at)}
        </span>
      </div>
    </Link>
  );
}
