"use client";

import { signOut } from "@/app/login/actions";
import { LogOutIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      className="btn btn-ghost max-sm:px-2.5"
      title="Sign out"
      onClick={async () => {
        await signOut();
        toast.success("Signed out");
        router.push("/");
        router.refresh();
      }}
    >
      <LogOutIcon width={14} height={14} className="sm:hidden" />
      <span className="max-sm:hidden">Sign out</span>
    </button>
  );
}
