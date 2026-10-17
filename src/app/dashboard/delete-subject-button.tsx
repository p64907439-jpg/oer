"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteSubjectButton({ subjectId }: { subjectId: string }) {
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
    const { data: files } = await supabase
      .from("files")
      .select("storage_path")
      .eq("subject_id", subjectId);

    const paths = (files ?? []).map((f) => f.storage_path);
    if (paths.length > 0) {
      await supabase.storage.from("oer-files").remove(paths);
    }

    // DB rows cascade from subjects → files.
    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subjectId);

    if (error) {
      toast.error(`Could not delete subject: ${error.message}`);
    } else {
      toast.success("Subject deleted");
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
      {deleting ? "Deleting…" : "Delete subject"}
    </button>
  );
}
