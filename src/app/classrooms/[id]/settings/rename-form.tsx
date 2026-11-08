"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RenameForm({
  classroomId,
  initialName,
}: {
  classroomId: string;
  initialName: string;
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const trimmed = name.trim();
  const dirty = trimmed !== initialName;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed || !dirty) return;

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("classrooms")
      .update({ name: trimmed })
      .eq("id", classroomId);

    if (error) {
      toast.error(`Could not rename: ${error.message}`);
    } else {
      toast.success("Classroom renamed");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="card p-4">
      <h2 className="mb-3 text-sm font-medium text-neutral-500">
        Classroom name
      </h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="input flex-1"
          aria-label="Classroom name"
        />
        <button
          type="submit"
          className="btn btn-primary shrink-0"
          disabled={saving || !dirty || !trimmed}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
