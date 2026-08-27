import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthedShell from "@/components/AuthedShell";

// /history, /templates, /analytics, and /settings each do this same
// requireUser() + AuthedShell wrap themselves (see lib/auth.ts) since
// Next.js layouts only apply within their own route subtree, and those
// pages aren't nested under /dashboard.
export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AuthedShell email={user.email}>{children}</AuthedShell>;
}
