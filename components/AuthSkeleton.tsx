// Shown while /login or /signup itself is resolving after a Link click —
// mirrors the real form's layout so there's no jump when it swaps in.
export default function AuthSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 h-6 w-36 animate-pulse rounded-sm bg-hairline" />
        <div className="h-8 w-44 animate-pulse rounded-sm bg-hairline" />
        <div className="mt-8 flex flex-col gap-6">
          <div className="h-11 animate-pulse rounded-sm bg-hairline/70" />
          <div className="h-11 animate-pulse rounded-sm bg-hairline/70" />
          <div className="h-4 w-24 animate-pulse rounded-sm bg-hairline" />
        </div>
      </div>
    </main>
  );
}
