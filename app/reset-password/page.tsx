"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LogoMark from "@/components/LogoMark";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center gap-2.5 font-mono text-[13px] tracking-widest">
          <LogoMark size={22} />
          CONTENT<span className="text-accent">·</span>AI
        </Link>

        {hasSession === null ? (
          <p className="text-sm text-ink-faint">Checking your reset link…</p>
        ) : done ? (
          <>
            <h1 className="font-serif text-3xl font-medium">Password updated</h1>
            <p className="mt-3 text-sm text-ink-dim">Taking you to your dashboard…</p>
          </>
        ) : !hasSession ? (
          <>
            <h1 className="font-serif text-3xl font-medium">Link expired</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              This password reset link is invalid or has expired. Request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="group mt-6 flex w-fit items-center gap-2.5 border-b border-ink-faint pb-1 font-mono text-sm transition-colors hover:border-accent"
            >
              Request a new link
              <span className="inline-block text-accent transition-transform group-hover:translate-x-1.5">→</span>
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-medium">Set a new password</h1>
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-ink-faint">
                  NEW PASSWORD (MIN 6 CHARACTERS)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="underline-input w-full text-sm text-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-ink-faint">
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="underline-input w-full text-sm text-ink"
                />
              </div>
              {error && <p className="text-sm text-accent">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-fit items-center gap-2.5 border-b border-ink-faint pb-1 font-mono text-sm transition-colors hover:border-accent disabled:opacity-50"
              >
                {loading ? "Updating…" : "Update password"}
                <span className="inline-block text-accent transition-transform group-hover:translate-x-1.5">→</span>
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
