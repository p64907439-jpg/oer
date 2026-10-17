"use client";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        headline: headline.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error(`Could not save profile: ${error.message}`);
    } else {
      toast.success("Profile saved");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card animate-rise p-5">
      <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
        Your profile
      </h2>
      <p className="mt-1 text-xs text-neutral-500">
        Students see this on your subject pages.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label htmlFor="profile-name" className="label">
            Name
          </label>
          <input
            id="profile-name"
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div>
          <label htmlFor="profile-headline" className="label">
            Headline <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="profile-headline"
            className="input"
            placeholder="e.g. High school math teacher"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            maxLength={140}
          />
        </div>
        <div>
          <label htmlFor="profile-bio" className="label">
            Bio <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            id="profile-bio"
            className="input min-h-24 resize-y"
            placeholder="A few words about you and how you teach"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={1000}
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary mt-4"
        disabled={saving || !fullName.trim()}
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
