"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Subscribes to Supabase Realtime changes and refreshes the current
 * route's server-rendered data when rows change. Zero UI of its own.
 *
 * - No args: refreshes on any subject/file change (public browse pages)
 * - teacherId: only that teacher's subjects/files (dashboard)
 * - subjectId: only one subject's files (subject page)
 */
export function RealtimeRefresh({
  teacherId,
  subjectId,
}: {
  teacherId?: string;
  subjectId?: string;
}) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Debounce bursts (bulk uploads, rapid deletes) into one refresh.
    const scheduleRefresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 600);
    };

    const channel = supabase
      .channel(`realtime-refresh-${subjectId ?? teacherId ?? "global"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subjects",
          ...(teacherId ? { filter: `teacher_id=eq.${teacherId}` } : {}),
        },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "files",
          ...(subjectId
            ? { filter: `subject_id=eq.${subjectId}` }
            : teacherId
              ? { filter: `teacher_id=eq.${teacherId}` }
              : {}),
        },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [router, teacherId, subjectId]);

  return null;
}
