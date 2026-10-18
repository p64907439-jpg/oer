"use client";

import { useSyncExternalStore } from "react";
import type { FileKind } from "./files";

export type DownloadedFile = {
  id: string;
  name: string;
  kind: FileKind;
  size_bytes: number | null;
  storage_path: string;
  downloaded_at: number;
};

export type DownloadedSubject = {
  id: string;
  title: string;
  files: Record<string, DownloadedFile>;
};

export type DownloadsState = Record<string, DownloadedSubject>;

const STORAGE_KEY = "oer-downloads-v1";
const EMPTY: DownloadsState = {};

let cache: DownloadsState | undefined;
const listeners = new Set<() => void>();

function load(): DownloadsState {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    cache = {};
  }
  return cache ?? EMPTY;
}

function save(next: DownloadsState) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full / private mode — keep in-memory cache only
  }
  listeners.forEach((listener) => listener());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Sync across browser tabs.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = undefined;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Live view of the download library (reactive via useSyncExternalStore). */
export function useDownloads(): DownloadsState {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

/** Saving a file also saves its subject folder into "My downloads". */
export function markFileDownloaded(
  subject: { id: string; title: string },
  file: {
    id: string;
    name: string;
    kind: FileKind;
    size_bytes: number | null;
    storage_path: string;
  }
) {
  const state = { ...load() };
  const existing = state[subject.id];
  if (existing?.files[file.id]) return; // already recorded — don't churn

  state[subject.id] = {
    id: subject.id,
    title: subject.title,
    files: {
      ...(existing?.files ?? {}),
      [file.id]: { ...file, downloaded_at: Date.now() },
    },
  };
  save(state);
}

export function removeSubject(subjectId: string) {
  const state = { ...load() };
  delete state[subjectId];
  save(state);
}

export function clearDownloads() {
  save({});
}

export function downloadedSubjectCount(state: DownloadsState): number {
  return Object.keys(state).length;
}
