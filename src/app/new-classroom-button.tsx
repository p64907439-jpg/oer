"use client";

import { createClient } from "@/lib/supabase/client";
import { PlusIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/** Inline "New classroom" form shown in the home page section header. */
export function NewClassroomButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setCreating(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sign in to create a classroom");
      setCreating(false);
      return;
    }

    const { data, error } = await supabase
      .from("classrooms")
      .insert({ name: trimmed, owner_id: user.id })
      .select("id")
      .single();

    if (error) {
      toast.error(`Could not create classroom: ${error.message}`);
      setCreating(false);
      return;
    }

    toast.success(`Classroom "${trimmed}" created`);
    router.push(`/classrooms/${data.id}`);
  }

  if (!open) {
    return (
      <button className="btn btn-outline" onClick={() => setOpen(true)}>
        <PlusIcon width={14} height={14} />
        New classroom
      </button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="flex gap-2">
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Classroom name"
        maxLength={120}
        className="input w-48"
        aria-label="Classroom name"
      />
      <button
        type="submit"
        className="btn btn-primary shrink-0"
        disabled={creating || !name.trim()}
      >
        {creating ? "Creating…" : "Create"}
      </button>
      <button
        type="button"
        className="btn btn-ghost shrink-0"
        onClick={() => {
          setOpen(false);
          setName("");
        }}
      >
        Cancel
      </button>
    </form>
  );
}
