"use client";

import { HelpIcon } from "@/components/icons";
import { useState } from "react";

/** Static class strings so Tailwind's JIT can see them. */
const CLAMP: Record<2 | 3 | 4, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
};

const LONG = 120; // characters before a description counts as "long"

/**
 * Long descriptions are hidden behind a "?" toggle: clamped by default,
 * tap the ? to reveal the full text (and again to re-hide).
 * The ? button sits at z-10 so it stays tappable inside link-wrapped cards.
 */
export function ClampedDescription({
  text,
  lines = 2,
  className = "",
}: {
  text: string | null | undefined;
  /** Clamp depth while collapsed. */
  lines?: 2 | 3 | 4;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!text) return null;

  const base = `text-sm leading-relaxed text-neutral-600 ${className}`;

  if (text.length <= LONG) {
    return <p className={base}>{text}</p>;
  }

  return (
    <div className="flex items-start gap-1.5">
      <p className={`min-w-0 flex-1 ${open ? "" : CLAMP[lines]} ${base}`}>
        {text}
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Hide full description" : "Show full description"}
        className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-800 active:scale-90"
      >
        <HelpIcon width={11} height={11} />
      </button>
    </div>
  );
}
