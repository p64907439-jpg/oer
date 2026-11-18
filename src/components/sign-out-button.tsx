"use client";

import { signOut } from "@/app/login/actions";
import { LogOutIcon } from "@/components/icons";
import { useTransition } from "react";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="btn btn-ghost text-sm text-neutral-500 hover:text-neutral-900"
      disabled={pending}
      onClick={() => startTransition(() => signOut())}
    >
      <LogOutIcon width={15} height={15} />
      <span className="max-sm:hidden">{pending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
