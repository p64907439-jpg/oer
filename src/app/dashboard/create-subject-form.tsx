"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function CreateSubjectForm({ teacherId }: { teacherId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setCreating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("subjects")
      .insert({ teacher_id: teacherId, title: trimmed, description: description.trim() || null });

    if (error) {
      toast.error(`Could not create subject: ${error.message}`);
    } else {
      toast.success(`Subject "${trimmed}" created`);
      setTitle("");
      setDescription("");
      router.refresh();
    }
    setCreating(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card animate-rise flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="subject-title" className="label">
          New subject
        </label>
        <input
          id="subject-title"
          className="input"
          placeholder="e.g. Algebra II"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />
      </div>
      <div className="flex-[2]">
        <label htmlFor="subject-desc" className="label">
          Description <span className="text-neutral-400">(optional)</span>
        </label>
        <input
          id="subject-desc"
          className="input"
          placeholder="What students will find here"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
        />
      </div>
      <button type="submit" className="btn btn-primary h-[42px] shrink-0" disabled={creating || !title.trim()}>
        {creating ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
