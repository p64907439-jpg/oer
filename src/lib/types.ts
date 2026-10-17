export type { Database } from "./supabase/types";

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  created_at: string;
};

export type Subject = {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type FileRow = {
  id: string;
  subject_id: string;
  teacher_id: string;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  kind: "video" | "pdf" | "image" | "other";
  created_at: string;
};

/** Subject joined with its teacher profile. */
export type SubjectWithTeacher = Subject & {
  profiles: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};
