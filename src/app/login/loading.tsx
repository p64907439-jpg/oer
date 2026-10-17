export default function LoginLoading() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-20 sm:px-6">
      <div className="card w-full max-w-md p-8" aria-busy>
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-xl bg-neutral-200/70 animate-pulse" />
          <div className="mt-4 h-5 w-40 rounded-md bg-neutral-200/70 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded-md bg-neutral-200/70 animate-pulse" />
        </div>
        <div className="mt-6 h-11 w-full rounded-lg bg-neutral-200/70 animate-pulse" />
        <div className="mt-5 h-3 w-56 rounded-md bg-neutral-200/70 animate-pulse" />
      </div>
    </main>
  );
}
