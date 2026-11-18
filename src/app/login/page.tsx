import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LoginForm } from "./login-form";

export const instant = false;

export const metadata = {
  title: "Teacher sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-20 sm:px-6">
        <div className="card w-full max-w-sm animate-rise p-8">
          <div className="text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white shadow-sm">
              O
            </span>
            <h1 className="mt-4 text-xl font-semibold tracking-tight">
              Teacher sign in
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
              Shared account for the teaching team.
            </p>
          </div>

          <LoginForm next={next} />

          <p className="mt-5 text-center text-xs leading-relaxed text-neutral-400">
            Just browsing? No account needed — everything is open to view.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
