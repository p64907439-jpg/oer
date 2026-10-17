"use client";

import { createClient } from "@/lib/supabase/client";
import { kindFromMime, isTooLarge, safeFileName } from "@/lib/files";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadIcon } from "@/components/icons";

type UploadState = {
  label: string;
  /** 1-based index of the file currently uploading */
  current: number;
  total: number;
};

export function UploadButton({
  subjectId,
  teacherId,
}: {
  subjectId: string;
  teacherId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState | null>(null);
  const router = useRouter();

  const uploading = state !== null;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const supabase = createClient();
    const files = Array.from(fileList);
    let ok = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      setState({ label: file.name, current: i + 1, total: files.length });

      if (isTooLarge(file.size)) {
        toast.error(`"${file.name}" is over the 50 MB limit`);
        failed++;
        continue;
      }

      const path = `${teacherId}/${subjectId}/${Date.now()}-${safeFileName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from("oer-files")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        toast.error(`Could not upload "${file.name}": ${uploadError.message}`);
        failed++;
        continue;
      }

      const { error: insertError } = await supabase.from("files").insert({
        subject_id: subjectId,
        teacher_id: teacherId,
        name: file.name,
        storage_path: path,
        mime_type: file.type || null,
        size_bytes: file.size,
        kind: kindFromMime(file.type),
      });

      if (insertError) {
        toast.error(`Could not save "${file.name}": ${insertError.message}`);
        failed++;
        continue;
      }

      ok++;
    }

    if (ok > 0) {
      toast.success(`Uploaded ${ok} file${ok === 1 ? "" : "s"}`);
      router.refresh();
    }
    if (failed > 0 && ok === 0) {
      toast.error("Upload failed");
    }

    setState(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="video/*,image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
      />

      {uploading ? (
        /* Upload state: which file, how many left, and batch progress.
           Determinate beats a spinner for perceived speed. */
        <div
          className="w-48"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={state.total}
          aria-valuenow={state.current - 1}
          aria-label={`Uploading ${state.label}`}
        >
          <div className="flex items-baseline justify-between text-xs">
            <span className="truncate pr-2 font-medium text-neutral-700">
              {state.total > 1 && (
                <span className="text-neutral-400">
                  {state.current}/{state.total}{" "}
                </span>
              )}
              {state.label}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900"
              style={{
                width: `${(state.current / state.total) * 100}%`,
                transition: "width 250ms var(--ease-out)",
              }}
            />
          </div>
        </div>
      ) : (
        <button
          className="btn btn-outline text-xs"
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon width={14} height={14} />
          Upload files
        </button>
      )}
    </>
  );
}
