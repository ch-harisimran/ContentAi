"use client";

import { useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { CONTENT_TYPES } from "@/lib/constants";
import { useCachedData } from "@/lib/useCachedData";
import { HISTORY_ALL_KEY } from "@/lib/warmAppData";
import { updateCached, invalidateCached } from "@/lib/clientCache";
import type { GenerationBatch } from "@/types/database";

interface HistoryResponse {
  batches: GenerationBatch[];
}

export default function HistoryTable() {
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // The "all" filter is the one warmed right after login (see
  // warmAppData), so it's cached under a fixed key and loads instantly.
  // Any other filter is fetched fresh on demand — that's an explicit user
  // action, not the "why is this slow" case being fixed here.
  const cacheKey = filter === "all" ? HISTORY_ALL_KEY : `history:${filter}`;
  const data = useCachedData<HistoryResponse>(cacheKey, `/api/history?content_type=${filter}`);
  const batches = data?.batches ?? [];
  const loading = !data;

  async function handleDelete(batchId: string) {
    updateCached<HistoryResponse>(cacheKey, (prev) => ({
      batches: (prev?.batches ?? []).filter((b) => b.batch_id !== batchId),
    }));
    // The deletion also affects any other filtered view of the same data —
    // simplest correct thing is to drop the unfiltered cache so it
    // refetches next time it's actually viewed.
    if (cacheKey !== HISTORY_ALL_KEY) invalidateCached(HISTORY_ALL_KEY);
    await fetch(`/api/history?batch_id=${batchId}`, { method: "DELETE" });
  }

  async function handleCopy(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <label className="font-mono text-[11px] tracking-wide text-ink-faint">FILTER:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-sm border border-hairline bg-transparent px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
        >
          <option value="all">All types</option>
          {CONTENT_TYPES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-ink-faint">Loading…</p>}
      {!loading && batches.length === 0 && (
        <div className="editorial-card p-8 text-center text-sm text-ink-faint">No generations yet — go make something.</div>
      )}

      <div className="flex flex-col gap-4">
        {batches.map((batch) => (
          <div key={batch.batch_id} className="editorial-card p-5">
            <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-ink-faint">
              <span>
                {CONTENT_TYPES.find((c) => c.value === batch.content_type)?.label} · {batch.tone} ·{" "}
                {new Date(batch.created_at).toLocaleString()} · {batch.variations.length} variation
                {batch.variations.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={() => handleDelete(batch.batch_id)}
                className="flex items-center gap-1 text-ink-faint transition hover:text-accent"
              >
                <Trash2 size={13} />
                DELETE
              </button>
            </div>
            <p className="mb-3 text-sm font-medium text-ink-dim">Topic: {batch.topic_input}</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {batch.variations.map((v) => (
                <div key={v.id} className="border border-hairline p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-ink-faint">0{v.variation_index + 1}</span>
                    <button
                      onClick={() => handleCopy(v.id, v.output_text)}
                      className="flex items-center gap-1 font-mono text-[10px] text-ink-faint hover:text-accent"
                    >
                      {copiedId === v.id ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === v.id ? "COPIED" : "COPY"}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-ink-dim">
                    {v.output_text}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
