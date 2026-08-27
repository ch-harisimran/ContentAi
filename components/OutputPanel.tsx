"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// A single AI-generated variation card. Used by VariationsPanel to render
// each of the N outputs from one /api/generate call.
export default function OutputPanel({ index, text }: { index: number; text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="editorial-card flex flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wide text-ink-faint">0{index + 1}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 border border-hairline px-3 py-1 font-mono text-[11px] text-ink-dim transition hover:border-accent hover:text-accent"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-dim">{text}</pre>
    </div>
  );
}
