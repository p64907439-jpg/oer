"use client";

import { signIn, type SignInState } from "@/app/login/actions";
import { useActionState } from "react";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    { error: null }
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          className="input"
          placeholder="teachers@school.edu"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="input"
          placeholder="••••••••"
          required
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="animate-slide-up rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-lg mt-1 w-full"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
