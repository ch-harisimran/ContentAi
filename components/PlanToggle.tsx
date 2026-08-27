"use client";

// UNUSED — the app moved to a single flat 10/month quota for every account
// (see lib/constants.ts MONTHLY_GENERATION_LIMIT), so there's no paid tier
// to toggle. Left in place in case paid plans come back later; safe to
// delete otherwise. No longer imported anywhere.

import { useState } from "react";
import { Check } from "lucide-react";
import type { Plan } from "@/types/database";

const PLAN_DETAILS: Record<Plan, { price: string; features: string[] }> = {
  free: {
    price: "$0",
    features: ["10 generations / month", "All 8 content types", "3 variations per generation"],
  },
  pro: {
    price: "$29",
    features: ["200 generations / month", "All 8 content types", "3 variations per generation", "Priority support"],
  },
};

export default function PlanToggle({ initialPlan }: { initialPlan: Plan }) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [loading, setLoading] = useState(false);

  async function switchPlan(next: Plan) {
    if (next === plan || loading) return;
    setLoading(true);
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: next }),
    });
    setLoading(false);
    if (res.ok) setPlan(next);
  }

  return (
    <div>
      <h3 className="mb-3 font-serif text-lg font-medium">Plan</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(["free", "pro"] as Plan[]).map((p) => {
          const active = plan === p;
          return (
            <div key={p} className={`p-5 ${active ? "border border-accent" : "editorial-card"}`}>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wide text-ink">{p}</span>
                {active && <span className="border border-accent px-2 py-0.5 font-mono text-[10px] text-accent">CURRENT</span>}
              </div>
              <p className="mb-3 font-serif text-2xl font-medium">
                {PLAN_DETAILS[p].price}
                <span className="text-sm font-normal text-ink-faint">/mo</span>
              </p>
              <ul className="mb-4 flex flex-col gap-1.5 text-sm text-ink-dim">
                {PLAN_DETAILS[p].features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => switchPlan(p)}
                disabled={active || loading}
                className={
                  active
                    ? "w-full cursor-default border border-hairline py-2 font-mono text-xs tracking-wide text-ink-faint"
                    : "w-full border border-hairline py-2 font-mono text-xs tracking-wide text-ink-dim transition hover:border-accent hover:text-accent disabled:opacity-60"
                }
              >
                {active ? "CURRENTLY ACTIVE" : loading ? "UPDATING…" : `SWITCH TO ${p.toUpperCase()}`}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-faint">
        Mock toggle for demo purposes — wire up Stripe Checkout to charge real money.
      </p>
    </div>
  );
}
