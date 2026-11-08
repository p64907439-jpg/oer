"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteFileButton({
  fileId,
  storagePath,
  bucket = "oer-files",
}: {
  fileId: string;
  storagePath: string;
  bucket?: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this file? Students will no longer see it.")) return;
    setDeleting(true);

    const supabase = createClient();

    // Remove the row first; orphaned storage objects are harmless.
    const { error } = await supabase.from("files").delete().eq("id", fileId);

    if (error) {
      toast.error(`Could not delete: ${error.message}`);
    } else {
      // Storage policy only allows removing objects under your own uid
      // folder — best effort, the row is already gone either way.
      await supabase.storage.from(bucket).remove([storagePath]);
      toast.success("File deleted");
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
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
