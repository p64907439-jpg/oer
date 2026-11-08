import { createClient } from "@/lib/supabase/server";
import type { ClassroomRole } from "@/lib/types";
import Link from "next/link";
import { NewClassroomButton } from "./new-classroom-button";

const ROLE_BADGES: Record<ClassroomRole, string> = {
  owner: "bg-neutral-900 text-white",
  teacher: "bg-blue-50 text-blue-700",
  student: "bg-amber-50 text-amber-700",
};

const ROLE_LABELS: Record<ClassroomRole, string> = {
  owner: "Owner",
  teacher: "Teacher",
  student: "Student",
};

/**
 * Signed-in users see their classrooms above the public browse grid.
 * Guests see nothing here — public browse stays exactly as before.
 */
export async function MyClassrooms() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("classroom_members")
    .select("role, classroom:classrooms(id, name, created_at)")
    .eq("user_id", user.id)
    .order("created_at", { referencedTable: "classrooms", ascending: false });

  const memberships = (data ?? []) as unknown as {
    role: ClassroomRole;
    classroom: { id: string; name: string; created_at: string } | null;
  }[];

  const rooms = memberships
    .filter((m) => m.classroom)
    .map((m) => ({ role: m.role, ...m.classroom! }));

  return (
    <section className="pb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-500">
          My classrooms{rooms.length > 0 ? ` · ${rooms.length}` : ""}
        </h2>
        <NewClassroomButton />
      </div>

      {rooms.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/classrooms/${room.id}`}
              className="card card-hover animate-rise block p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-snug tracking-tight text-neutral-900">
                  {room.name}
                </h3>
                <span className={`badge shrink-0 ${ROLE_BADGES[room.role]}`}>
                  {ROLE_LABELS[room.role]}
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {room.role === "student"
                  ? "Open folders and download materials"
                  : "Open folders and manage uploads"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
