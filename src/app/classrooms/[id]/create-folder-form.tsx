"use client";

import { createClient } from "@/lib/supabase/client";
import { PlusIcon } from "@/components/icons";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Owner-only form: create a subject folder inside the classroom and
 * assign it to one teacher (defaults to the owner, per spec).
 */
export function CreateClassroomFolderForm({
  classroomId,
  ownerId,
  staff,
}: {
  classroomId: string;
  ownerId: string;
  staff: Pick<Profile, "id" | "full_name">[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState(ownerId);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setCreating(true);
    const supabase = createClient();
    const { error } = await supabase.from("subjects").insert({
      teacher_id: ownerId,
      title: trimmed,
      description: description.trim() || null,
      classroom_id: classroomId,
      assigned_teacher_id: assignee || ownerId,
    });

    if (error) {
      toast.error(`Could not create folder: ${error.message}`);
    } else {
      toast.success(`Folder "${trimmed}" created`);
      setTitle("");
      setDescription("");
      setAssignee(ownerId);
      setOpen(false);
      router.refresh();
    }
    setCreating(false);
  }

  if (!open) {
    return (
      <button className="btn btn-outline" onClick={() => setOpen(true)}>
        <PlusIcon width={14} height={14} />
        New folder
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Folder title (e.g. Algebra I)"
          maxLength={160}
          className="input flex-1"
          aria-label="Folder title"
        />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="input sm:w-56"
          aria-label="Assign uploads to teacher"
        >
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id === ownerId ? `${s.full_name} (you)` : s.full_name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        maxLength={500}
        className="input resize-none"
        aria-label="Folder description"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={creating || !title.trim()}
        >
          {creating ? "Creating…" : "Create folder"}
        </button>
      </div>
    </form>
  );
}
