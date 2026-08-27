"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { warmAppDataWithTimeout } from "@/lib/warmAppData";
import LogoMark from "@/components/LogoMark";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // Warm every tab's data (history, templates, analytics, usage) before
    // handing off to the dashboard, so the rest of the app is already
    // sitting in the client cache — no per-tab spinner the first time each
    // one gets visited. Bounded so one slow endpoint can't strand the user
    // on this screen.
    setPreparing(true);
    await warmAppDataWithTimeout();

    // Stay in the loading state through the redirect itself — the button
    // unmounts with this page, so there's no stale "logged in" flash where
    // it looks like nothing happened.
    router.push(searchParams.get("redirectTo") || "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center gap-2.5 font-mono text-[13px] tracking-widest">
          <LogoMark size={22} />
          CONTENT<span className="text-accent">·</span>AI
        </Link>

        <h1 className="font-serif text-3xl font-medium">Log in</h1>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-ink-faint">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="underline-input w-full text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-ink-faint">PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="underline-input w-full text-sm text-ink"
            />
          </div>
          <Link href="/forgot-password" className="-mt-2 self-end font-mono text-xs text-ink-faint transition hover:text-accent">
            Forgot password?
          </Link>
          {error && <p className="text-sm text-accent">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="group mt-2 flex w-fit items-center gap-2.5 border-b border-ink-faint pb-1 font-mono text-sm transition-colors hover:border-accent disabled:opacity-50"
          >
            {preparing ? "Preparing your studio…" : loading ? "Logging in…" : "Log in"}
            <span className="inline-block text-accent transition-transform group-hover:translate-x-1.5">→</span>
          </button>
        </form>

        <p className="mt-8 font-mono text-xs text-ink-faint">
          No account?{" "}
          <Link href="/signup" className="text-ink underline decoration-ink-faint underline-offset-4 hover:decoration-accent">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
