"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@/components/icons";

export function DeleteFileButton({
  fileId,
  storagePath,
  fileName,
}: {
  fileId: string;
  storagePath: string;
  fileName?: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    // Use sonner action toast for undo-style confirmation
    toast(`Delete "${fileName ?? "this file"}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          setDeleting(true);
          const supabase = createClient();
          const { error } = await supabase.from("files").delete().eq("id", fileId);
          if (error) {
            toast.error(`Could not delete: ${error.message}`);
          } else {
            // Storage policy only allows teachers to remove objects — best
            // effort, the row is already gone either way.
            await supabase.storage.from("oer-files").remove([storagePath]);
            toast.success("File deleted");
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
      aria-label={`Delete ${fileName ?? "file"}`}
    >
      <TrashIcon width={14} height={14} />
    </button>
  );
}
