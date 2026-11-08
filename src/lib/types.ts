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
  /** null = public subject; set = members-only classroom folder. */
  classroom_id: string | null;
  /** Which teacher may upload (classroom folders only). Owner uploads anywhere. */
  assigned_teacher_id: string | null;
};

export type FileBucket = "oer-files" | "oer-class-files";

export type FileRow = {
  id: string;
  subject_id: string;
  teacher_id: string;
  name: string;
  storage_path: string;
  bucket: FileBucket;
  mime_type: string | null;
  size_bytes: number | null;
  kind: "video" | "pdf" | "image" | "other";
  created_at: string;
};

/** Subject joined with its teacher profile. */
export type SubjectWithTeacher = Subject & {
  profiles: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};

/** Per-classroom role — never stored on the user, only on membership rows. */
export type ClassroomRole = "owner" | "teacher" | "student";

export type Classroom = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export type ClassroomMember = {
  classroom_id: string;
  user_id: string;
  role: ClassroomRole;
  created_at: string;
};

export type InvitationRole = "teacher" | "student";
export type InvitationStatus = "pending" | "accepted" | "declined";

export type Invitation = {
  id: string;
  classroom_id: string;
  inviter_id: string;
  invitee_id: string;
  role: InvitationRole;
  status: InvitationStatus;
  created_at: string;
  responded_at: string | null;
};
