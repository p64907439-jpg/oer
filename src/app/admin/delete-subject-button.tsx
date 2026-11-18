"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@/components/icons";

export function DeleteSubjectButton({
  subjectId,
  label = "Delete folder",
  redirect: redirectAfter,
  folderName,
}: {
  subjectId: string;
  /** Button copy — "Delete folder" on the admin, "Delete folder" on a folder page. */
  label?: string;
  /** Where to go after a successful delete (the page you're on may 404 next). */
  redirect?: string;
  folderName?: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    toast(`Delete "${folderName ?? "this folder"}" and all its files?`, {
      description: "This cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          setDeleting(true);
          const supabase = createClient();

          // Storage objects live under {teacherId}/{subjectId}/ — remove them
          // too (single public bucket). Anything RLS refuses to remove is a
          // harmless orphan row-free object.
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
            toast.error(`Could not delete: ${error.message}`);
          } else {
            toast.success("Folder deleted");
            if (redirectAfter) router.push(redirectAfter);
            router.refresh();
          }
          setDeleting(false);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  }

  return (
    <button
      className="btn btn-danger-ghost text-xs"
      onClick={handleDelete}
      disabled={deleting}
      aria-label={label}
    >
      <TrashIcon width={14} height={14} />
      <span className="max-sm:sr-only">{deleting ? "Deleting…" : label}</span>
    </button>
  );
}
