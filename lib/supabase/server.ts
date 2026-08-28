import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client for use in Server Components, Route Handlers,
// and Server Actions. Reads/writes the session via Next.js cookies().
//
// Deliberately NOT passing the `Database` generic here. The installed
// @supabase/supabase-js version resolves its `Schema` generic to `never`
// (not `any`) whenever it can't prove the passed Database type satisfies
// its internal GenericSchema constraint — and once that happens, every
// .select()/.insert()/.update() call across every table silently resolves
// to `never`, breaking `next build`'s type-check with no clear indication
// of the real cause. That's what repeatedly broke this project's Vercel
// builds. Table row shapes are enforced manually instead, via the
// UserRow/GenerationRow/TemplateRow types in @/types/database, cast at the
// call site after each query.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — safe to ignore because
            // middleware refreshes the session on every request.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Same as above.
          }
        },
      },
    }
  );
}
