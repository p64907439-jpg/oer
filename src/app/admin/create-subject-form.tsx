"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "@/components/icons";

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
      toast.error(`Could not create folder: ${error.message}`);
    } else {
      toast.success(`Folder "${trimmed}" created`);
      setTitle("");
      setDescription("");
      router.refresh();
    }
    setCreating(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card animate-rise flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:gap-4"
    >
      <div className="flex-1">
        <label htmlFor="subject-title" className="label">
          Folder name
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
          Description{" "}
          <span className="font-normal text-neutral-400">(optional)</span>
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
      <button
        type="submit"
        className="btn btn-primary shrink-0"
        disabled={creating || !title.trim()}
      >
        <PlusIcon width={15} height={15} />
        {creating ? "Creating…" : "Create folder"}
      </button>
    </form>
  );
}
