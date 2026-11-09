"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Owner-only classroom deletion (class settings → Danger zone).
 * DB rows cascade: members, invitations, subjects → files. Storage
 * objects in the private bucket are orphaned but unreachable.
 */
export function DeleteClassroomButton({
  classroomId,
  classroomName,
}: {
  classroomId: string;
  classroomName: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm(
      `Delete "${classroomName}"? Its folders, file records, invitations and members will be removed for everyone. This cannot be undone.`
    );
    if (!ok) return;
    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("classrooms")
      .delete()
      .eq("id", classroomId);

    if (error) {
      toast.error(`Could not delete classroom: ${error.message}`);
      setDeleting(false);
      return;
    }

    toast.success("Classroom deleted");
    router.push("/");
    router.refresh();
  }

  return (
    <button
      className="btn btn-danger-ghost"
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? "Deleting…" : "Delete classroom"}
    </button>
  );
}
