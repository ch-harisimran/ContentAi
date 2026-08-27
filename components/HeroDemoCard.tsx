"use client";

import { useEffect, useState } from "react";

// The hero's right side, doing actual work instead of sitting empty: a live
// simulation of what the product does — one topic in, three toned takes out.
// Cycles through real examples, pauses on hover, and lets you jump to any
// example via the dots. This is the product's core loop, not a decoration.
const EXAMPLES = [
  {
    topic: "our coffee shop's new oat milk latte",
    tag: "SOCIAL CAPTION",
    takes: [
      { tone: "WARM", text: "Oat milk, new latte, same cozy corner. ☕" },
      { tone: "PLAYFUL", text: "We put oat milk in a latte and now nothing else exists." },
      { tone: "CONFIDENT", text: "Our new oat milk latte. Try it before everyone else does." },
    ],
  },
  {
    topic: "we just redesigned our pricing page",
    tag: "LINKEDIN POST",
    takes: [
      { tone: "PROFESSIONAL", text: "We rebuilt our pricing page from scratch. Here's what changed, and why it converts better —" },
      { tone: "BOLD", text: "Our old pricing page was costing us customers. So we tore it down and started over." },
      { tone: "CASUAL", text: "New pricing page just dropped. Simpler, clearer, actually makes sense now." },
    ],
  },
  {
    topic: "our indie game's launch trailer",
    tag: "TWEET THREAD",
    takes: [
      { tone: "PLAYFUL", text: "1/ We just shipped 3 years of work into a 90-second trailer. Here's what we learned 🧵" },
      { tone: "CONFIDENT", text: "1/ The trailer is live. Three years of nights and weekends, distilled into 90 seconds." },
      { tone: "WARM", text: "1/ To everyone who followed this game from a napkin sketch to today — this one's for you." },
    ],
  },
  {
    topic: "what our team learned at the offsite",
    tag: "BLOG OUTLINE",
    takes: [
      { tone: "PROFESSIONAL", text: "5 Things Our Team Learned From a Week Without Slack" },
      { tone: "CASUAL", text: "We turned off Slack for a week. Here's what actually happened." },
      { tone: "BOLD", text: "Why we're never going back to async-by-default after this offsite." },
    ],
  },
];

const THINKING_MS = 1100;
const STAGGER_MS = 200;
const HOLD_MS = 3200;
const CYCLE_MS = THINKING_MS + STAGGER_MS * 3 + HOLD_MS;

type Phase = "thinking" | "revealed";

export default function HeroDemoCard() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("thinking");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    setPhase("thinking");
    const toReveal = setTimeout(() => setPhase("revealed"), THINKING_MS);
    const toNext = setTimeout(() => {
      setExampleIndex((i) => (i + 1) % EXAMPLES.length);
    }, CYCLE_MS);
    return () => {
      clearTimeout(toReveal);
      clearTimeout(toNext);
    };
  }, [exampleIndex, paused]);

  const example = EXAMPLES[exampleIndex];
  const revealed = phase === "revealed";

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="editorial-card relative flex w-full max-w-md flex-col p-7 sm:p-8"
    >
      <style>{`
        @keyframes hdc-sweep { from { width: 0%; } to { width: 92%; } }
        @keyframes hdc-dot { 0%, 60%, 100% { opacity: .25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }
        @keyframes hdc-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-ink-faint">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" style={{ animation: "blink 1.6s ease-in-out infinite" }} />
          STUDIO — LIVE PREVIEW
        </span>
        <span>{String(exampleIndex + 1).padStart(2, "0")} / {String(EXAMPLES.length).padStart(2, "0")}</span>
      </div>

      <div className="mt-6">
        <p className="font-mono text-[10px] tracking-wide text-ink-faint">TOPIC</p>
        <p className="mt-1.5 text-[15px] leading-snug text-ink-dim">{example.topic}</p>
        <p className="mt-3.5 font-mono text-[10px] tracking-wide text-accent">→ {example.tag}</p>
      </div>

      <div className="mt-5 min-h-[196px] border-t border-hairline pt-5">
        {!revealed ? (
          <div className="flex h-[196px] flex-col justify-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-ink-faint">
              <span>GENERATING THREE TAKES</span>
              <span className="flex gap-[3px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1 w-1 rounded-full bg-ink-faint"
                    style={{ animation: `hdc-dot 1.2s ease-in-out ${i * 0.18}s infinite` }}
                  />
                ))}
              </span>
            </div>
            <div className="h-px w-full overflow-hidden bg-hairline">
              <div
                className="h-full bg-accent"
                style={{ animation: `hdc-sweep ${THINKING_MS}ms ease-out forwards` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {example.takes.map((take, i) => (
              <div
                key={`${exampleIndex}-${i}`}
                style={{ animation: `hdc-rise 420ms ease-out ${i * STAGGER_MS}ms both` }}
              >
                <p className="font-mono text-[10px] tracking-wide text-ink-faint">
                  TAKE {i + 1} <span className="text-accent">— {take.tone}</span>
                </p>
                <p className="mt-1 font-serif text-[16.5px] leading-snug text-ink">{take.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-1.5">
        {EXAMPLES.map((_, i) => (
          <button
            key={i}
            onClick={() => setExampleIndex(i)}
            aria-label={`Show example ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === exampleIndex ? "w-5 bg-accent" : "w-1.5 bg-ink-faint hover:bg-ink-dim"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
