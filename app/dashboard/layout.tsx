import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

// Shared authenticated shell. /history, /templates, /analytics, and
// /settings each render their own copy of this shell (see lib/auth.ts)
// since Next.js layouts only apply within their own route subtree.
export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar email={user.email} />
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
