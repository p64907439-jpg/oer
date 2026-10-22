"use client";

import { GoogleIcon } from "@/components/icons";
import type { AccountRole } from "@/lib/types";
import { useState } from "react";
import { signInWithGoogle } from "./actions";

export function SignInForm({ next, error }: { next?: string; error?: string }) {
  const [role, setRole] = useState<AccountRole>("teacher");

  return (
    <>
      {error && (
        <p className="mt-5 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          Sign-in failed ({error}). Please try again.
        </p>
      )}

      <fieldset className="mt-6">
        <legend className="label">I am a…</legend>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={role === "teacher"}
            onClick={() => setRole("teacher")}
            className={`btn ${role === "teacher" ? "btn-primary" : "btn-outline"}`}
          >
            Teacher
          </button>
          <button
            type="button"
            aria-pressed={role === "student"}
            onClick={() => setRole("student")}
            className={`btn ${role === "student" ? "btn-primary" : "btn-outline"}`}
          >
            Student
          </button>
        </div>
      </fieldset>

      <form action={signInWithGoogle.bind(null, next, role)} className="mt-4">
        <button type="submit" className="btn btn-primary btn-lg w-full">
          <GoogleIcon />
          Continue with Google
        </button>
      </form>
    </>
  );
}
