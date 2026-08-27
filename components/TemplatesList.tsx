"use client";

import Link from "next/link";
import { Trash2, Wand2 } from "lucide-react";
import { CONTENT_TYPES } from "@/lib/constants";
import { useCachedData } from "@/lib/useCachedData";
import { TEMPLATES_KEY } from "@/lib/warmAppData";
import { updateCached } from "@/lib/clientCache";
import type { TemplateRow } from "@/types/database";

export default function TemplatesList() {
  const data = useCachedData<{ templates: TemplateRow[] }>(TEMPLATES_KEY, "/api/templates");
  const templates = data?.templates ?? [];

  async function handleDelete(id: string) {
    updateCached<{ templates: TemplateRow[] }>(TEMPLATES_KEY, (prev) => ({
      templates: (prev?.templates ?? []).filter((t) => t.id !== id),
    }));
    await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
  }

  if (!data) return <p className="text-sm text-ink-faint">Loading…</p>;

  if (templates.length === 0) {
    return (
      <div className="editorial-card p-8 text-center">
        <p className="text-ink-dim">No saved templates yet.</p>
        <p className="mt-1 text-sm text-ink-faint">
          Generate something on the{" "}
          <Link href="/dashboard" className="text-accent underline decoration-accent/40 underline-offset-4">
            Generator
          </Link>{" "}
          page and click "Save as template" to reuse it later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <div key={t.id} className="editorial-card flex flex-col p-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-medium">{t.name}</h3>
            <button
              onClick={() => handleDelete(t.id)}
              className="shrink-0 text-ink-faint transition hover:text-accent"
              aria-label="Delete template"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <p className="mb-1 font-mono text-[11px] text-ink-faint">
            {CONTENT_TYPES.find((c) => c.value === t.content_type)?.label} · {t.tone}
          </p>
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-ink-dim">{t.topic_input}</p>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-1.5 border border-hairline py-2 font-mono text-xs tracking-wide text-ink-dim transition hover:border-accent hover:text-accent"
          >
            <Wand2 size={14} />
            USE IN GENERATOR
          </Link>
        </div>
      ))}
    </div>
  );
}
