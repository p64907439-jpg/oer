"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteSubjectButton({
  subjectId,
  label = "Delete subject",
  redirect: redirectAfter,
}: {
  subjectId: string;
  /** Button copy — "Delete subject" on the dashboard, "Delete folder" inside a classroom. */
  label?: string;
  /** Where to go after a successful delete (the page you're on may 404 next). */
  redirect?: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm(
      "Delete this subject folder and all of its files? This cannot be undone."
    );
    if (!ok) return;
    setDeleting(true);

    const supabase = createClient();

    // Storage objects live under {teacherId}/{subjectId}/ — remove them too.
    // Group by bucket: public subjects use oer-files, classroom folders
    // use oer-class-files. Objects uploaded by other teachers live under
    // their uid folders (RLS denies removing those) — harmless orphans.
    const { data: files } = await supabase
      .from("files")
      .select("storage_path, bucket")
      .eq("subject_id", subjectId);

    const byBucket = new Map<string, string[]>();
    for (const f of files ?? []) {
      const list = byBucket.get(f.bucket) ?? [];
      list.push(f.storage_path);
      byBucket.set(f.bucket, list);
    }
    for (const [bucket, paths] of byBucket) {
      if (paths.length > 0) {
        await supabase.storage.from(bucket).remove(paths);
      }
    }

    // DB rows cascade from subjects → files.
    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subjectId);

    if (error) {
      toast.error(`Could not delete subject: ${error.message}`);
    } else {
      toast.success("Folder deleted");
      if (redirectAfter) router.push(redirectAfter);
      router.refresh();
    }
    setDeleting(false);
  }

  return (
    <button
      className="btn btn-danger-ghost text-xs"
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? "Deleting…" : label}
    </button>
  );
}
