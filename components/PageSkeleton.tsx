import Navbar from "@/components/Navbar";

// Shown automatically by Next.js the instant a user clicks into any authed
// route (via each route's loading.tsx), while that page's server component
// resolves. Reuses the real Navbar so nothing shifts once real content
// swaps in — only the content area below it is a placeholder.
export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="h-8 w-52 animate-pulse rounded-sm bg-hairline" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded-sm bg-hairline" />
        <div className="mt-10 flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="editorial-card h-28 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
