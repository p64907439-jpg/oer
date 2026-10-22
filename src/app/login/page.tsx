import { SignInForm } from "./sign-in-form";
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
              Sign in to OER
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
              Teachers get a dashboard to upload materials. Students get a
              profile that shows up in the folders they open.
            </p>
          </div>

          <SignInForm next={next} error={error} />

          <p className="mt-5 text-center text-xs leading-relaxed text-neutral-500">
            No account? No problem — every subject is open to browse as a
            guest.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
