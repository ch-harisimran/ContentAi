import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Shared guard for server-rendered pages outside the /dashboard subtree
// (which already gets this via app/dashboard/layout.tsx). Redirects to
// /login if there's no session, otherwise returns the authed user.
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
