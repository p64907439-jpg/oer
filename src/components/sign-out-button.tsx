"use client";

import { signOut } from "@/app/login/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      className="btn btn-ghost"
      onClick={async () => {
        await signOut();
        toast.success("Signed out");
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
