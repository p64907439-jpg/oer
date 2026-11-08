"use client";

import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/files";
import type { ClassroomRole, InvitationRole, Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type MemberRow = {
  userId: string;
  role: ClassroomRole;
  profile: Pick<Profile, "id" | "full_name" | "avatar_url">;
};

export type PendingInvite = {
  id: string;
  inviteeId: string;
  role: InvitationRole;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
};

type SearchResult = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
};

const SECTION_META = {
  teacher: { title: "Teachers", blurb: "Can upload to folders assigned to them." },
  student: { title: "Students", blurb: "Can view and download folder materials." },
} as const;

/**
 * One section of Class settings: search a Gmail address to invite,
 * list pending invitations with cancel, list members with remove.
 * Rendered twice — once for teachers, once for students.
 */
export function MembersManager({
  classroomId,
  ownerId,
  sectionRole,
  members,
  invites,
}: {
  classroomId: string;
  ownerId: string;
  sectionRole: InvitationRole;
  members: MemberRow[];
  invites: PendingInvite[];
}) {
  const router = useRouter();
  const meta = SECTION_META[sectionRole];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const memberIds = new Set(members.map((m) => m.userId));
  const invitedIds = new Set(invites.map((i) => i.inviteeId));

  // Debounced email search (RPC: prefix match, min 3 chars, accounts only).
  // All state updates live inside the timeout callback so the effect body
  // stays synchronous-free (react-hooks/set-state-in-effect).
  useEffect(() => {
    const term = query.trim();
    if (debounce.current) clearTimeout(debounce.current);

    debounce.current = setTimeout(async () => {
      if (term.length < 3) {
        setResults(null);
        setSearching(false);
        return;
      }

      setSearching(true);
      const supabase = createClient();
      const { data, error } = await supabase.rpc("find_user_by_email", {
        p_query: term,
      });
      if (error) {
        toast.error(`Search failed: ${error.message}`);
        setResults([]);
      } else {
        setResults((data ?? []) as unknown as SearchResult[]);
      }
      setSearching(false);
    }, 350);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  async function invite(person: SearchResult) {
    setInvitingId(person.id);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign in again to send invitations");
      setInvitingId(null);
      return;
    }

    const { error } = await supabase.from("invitations").insert({
      classroom_id: classroomId,
      inviter_id: user.id,
      invitee_id: person.id,
      role: sectionRole,
    });

    if (error) {
      if (error.message.includes("invitations_one_pending_idx")) {
        toast.info(`${person.full_name} already has a pending invitation`);
      } else if (error.message.includes("row-level security")) {
        toast.info(`${person.full_name} is already in this classroom`);
      } else {
        toast.error(`Could not invite: ${error.message}`);
      }
    } else {
      toast.success(`Invitation sent to ${person.email}`);
      setQuery("");
      setResults(null);
      router.refresh();
    }
    setInvitingId(null);
  }

  async function cancelInvite(invite: PendingInvite) {
    setBusyId(invite.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invite.id);
    if (error) toast.error(`Could not cancel: ${error.message}`);
    else toast.success("Invitation cancelled");
    setBusyId(null);
    router.refresh();
  }

  async function removeMember(member: MemberRow) {
    if (
      !confirm(
        `Remove ${member.profile.full_name} from this classroom? They will lose access immediately.`
      )
    )
      return;
    setBusyId(member.userId);
    const supabase = createClient();
    const { error } = await supabase
      .from("classroom_members")
      .delete()
      .eq("classroom_id", classroomId)
      .eq("user_id", member.userId);
    if (error) toast.error(`Could not remove: ${error.message}`);
    else toast.success(`${member.profile.full_name} removed`);
    setBusyId(null);
    router.refresh();
  }

  const visibleResults = (results ?? []).slice(0, 5);

  return (
    <section className="card p-4">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-500">
          {meta.title} · {members.length}
        </h2>
      </div>
      <p className="mb-3 text-xs text-neutral-500">{meta.blurb}</p>

      {/* Invite by Gmail — invitees must already have an account */}
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Invite ${sectionRole} by Google email…`}
          className="input"
          aria-label={`Search email to invite as ${sectionRole}`}
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
        />
        {query.trim().length >= 3 && (
          <div className="mt-2 flex flex-col gap-2">
            {searching && (
              <p className="text-xs text-neutral-500">Searching…</p>
            )}
            {!searching && visibleResults.length === 0 && (
              <p className="text-xs text-neutral-500">
                No OER account found. They need to sign in with Google once
                before they can be invited.
              </p>
            )}
            {!searching &&
              visibleResults.map((person) => {
                const isMember = memberIds.has(person.id);
                const isInvited = invitedIds.has(person.id);
                return (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2"
                  >
                    {person.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={person.avatar_url}
                        alt=""
                        className="h-7 w-7 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                        {(person.full_name || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {person.full_name}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {person.email}
                      </p>
                    </div>
                    {isMember ? (
                      <span className="badge shrink-0">Member</span>
                    ) : isInvited ? (
                      <span className="badge shrink-0 bg-blue-50 text-blue-700">
                        Invited
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary shrink-0"
                        onClick={() => invite(person)}
                        disabled={invitingId !== null}
                      >
                        {invitingId === person.id ? "Sending…" : "Invite"}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Pending invitations */}
      {invites.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {invites.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center gap-3 rounded-lg bg-blue-50/60 px-3 py-2"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {(inv.name || "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-800">
                  {inv.name}
                </p>
                <p className="text-xs text-neutral-500">
                  Invited {formatDate(inv.createdAt)}
                </p>
              </div>
              <button
                className="btn btn-ghost shrink-0 text-neutral-500"
                onClick={() => cancelInvite(inv)}
                disabled={busyId === inv.id}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Current members */}
      <ul className="mt-4 flex flex-col gap-2">
        {members.map((member) => (
          <li
            key={member.userId}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2"
          >
            {member.profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.profile.avatar_url}
                alt=""
                className="h-7 w-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                {member.profile.full_name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">
                {member.profile.full_name}
                {member.userId === ownerId && (
                  <span className="ml-2 text-xs font-normal text-neutral-400">
                    you
                  </span>
                )}
              </p>
            </div>
            {member.role === "owner" ? (
              <span className="badge shrink-0 bg-neutral-900 text-white">
                Owner
              </span>
            ) : (
              <button
                className="btn btn-ghost shrink-0 text-neutral-500"
                onClick={() => removeMember(member)}
                disabled={busyId === member.userId}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
