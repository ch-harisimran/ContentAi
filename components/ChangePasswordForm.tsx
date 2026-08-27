"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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

    setSuccess(true);
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="editorial-card p-5">
      <h3 className="font-serif text-lg font-medium">Change password</h3>
      <p className="mt-1 text-sm text-ink-faint">You're logged in, so no need to enter your current password.</p>
      <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm flex-col gap-4">
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
          <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-ink-faint">CONFIRM NEW PASSWORD</label>
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
        {success && <p className="text-sm text-ink-dim">Password updated.</p>}
        <button
          type="submit"
          disabled={loading}
          className="self-start bg-accent px-5 py-2 font-mono text-xs tracking-wide text-canvas transition hover:bg-accent/90 disabled:opacity-60"
        >
          {loading ? "UPDATING…" : "UPDATE PASSWORD"}
        </button>
      </form>
    </div>
  );
}
