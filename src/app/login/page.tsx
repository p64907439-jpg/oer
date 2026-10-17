import { signInWithGoogle } from "./actions";
import { GoogleIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-20 sm:px-6">
        <div className="card w-full max-w-md animate-rise p-8">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-lg font-bold text-white">
              O
            </span>
            <h1 className="mt-4 text-xl font-semibold tracking-tight">
              Teacher sign in
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
              Create subjects, upload materials, and share them with your
              students.
            </p>
          </div>

          {error && (
            <p className="mt-5 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              Sign-in failed ({error}). Please try again.
            </p>
          )}

          <form action={signInWithGoogle.bind(null, next)} className="mt-6">
            <button type="submit" className="btn btn-primary btn-lg w-full">
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-relaxed text-neutral-500">
            Students don&apos;t need an account — everything here is open to
            browse.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
