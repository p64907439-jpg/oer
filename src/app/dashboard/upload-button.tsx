"use client";

import { createClient } from "@/lib/supabase/client";
import { kindFromMime, isTooLarge, safeFileName } from "@/lib/files";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadIcon } from "@/components/icons";

export function UploadButton({
  subjectId,
  teacherId,
}: {
  subjectId: string;
  teacherId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const supabase = createClient();
    setUploading(true);

    let ok = 0;
    let failed = 0;

    for (const file of Array.from(fileList)) {
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
      toast.success(
        `Uploaded ${ok} file${ok === 1 ? "" : "s"}`,
      );
      router.refresh();
    }
    if (failed > 0 && ok === 0) {
      toast.error("Upload failed");
    }

    setUploading(false);
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
      <button
        className="btn btn-outline text-xs"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <UploadIcon width={14} height={14} />
        {uploading ? "Uploading…" : "Upload files"}
      </button>
    </>
  );
}
