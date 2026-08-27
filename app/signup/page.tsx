"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LogoMark from "@/components/LogoMark";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center gap-2.5 font-mono text-[13px] tracking-widest">
          <LogoMark size={22} />
          CONTENT<span className="text-accent">·</span>AI
        </Link>

        {done ? (
          <>
            <h1 className="font-serif text-3xl font-medium">Check your email</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              We sent a confirmation link to {email}. Click it to finish signing up.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-medium">Create an account</h1>
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
                <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-ink-faint">
                  PASSWORD (MIN 6 CHARACTERS)
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
              {error && <p className="text-sm text-accent">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-fit items-center gap-2.5 border-b border-ink-faint pb-1 font-mono text-sm transition-colors hover:border-accent disabled:opacity-50"
              >
                {loading ? "Signing up…" : "Sign up"}
                <span className="inline-block text-accent transition-transform group-hover:translate-x-1.5">→</span>
              </button>
            </form>
          </>
        )}

        <p className="mt-8 font-mono text-xs text-ink-faint">
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline decoration-ink-faint underline-offset-4 hover:decoration-accent">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
