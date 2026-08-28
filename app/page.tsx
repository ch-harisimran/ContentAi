"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import HeroDemoCard from "@/components/HeroDemoCard";

const CONTENT_TYPE_LABELS = [
  "Social Caption",
  "Blog Outline",
  "Tweet Thread",
  "LinkedIn Post",
  "Product Description",
  "Email Subject Lines",
  "Video Script",
  "Image Caption",
];

const FEATURES = [
  {
    title: "Vision captions",
    desc: "Upload a photo. The model reads the subject, the background, the mood — and writes the caption to match.",
  },
  {
    title: "Three takes, not one",
    desc: "Every generation returns three distinct variations, side by side. Pick the one that sounds like you.",
  },
  {
    title: "Templates that remember",
    desc: "Save a recurring brief once. Your weekly update, always one click away.",
  },
  {
    title: "Analytics that matter",
    desc: "Streaks, activity, and a breakdown of what you actually write — not vanity metrics.",
  },
];

const FULL_TOPIC = "our new app helps remote teams stay in sync";
const OUTPUTS = [
  "Ready to stop context-switching between five tools? Meet the app built for how remote teams actually work.",
  "One dashboard. Every async workflow. Your remote team, finally in sync.",
  "🚀 Launching the productivity app built for async-first teams — no more status-update meetings.",
];

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const typedTextRef = useRef<HTMLSpanElement>(null);
  const typedCursorRef = useRef<HTMLSpanElement>(null);
  const outRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tickRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll progress bar + nav border-on-scroll
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (progressRef.current) progressRef.current.style.width = `${pct}%`;
      navRef.current?.classList.toggle("border-hairline", h.scrollTop > 40);
      navRef.current?.classList.toggle("bg-canvas/80", h.scrollTop > 40);
      navRef.current?.classList.toggle("backdrop-blur", h.scrollTop > 40);
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  // Custom cursor (desktop only — CSS hides it on touch devices)
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;
    }
    window.addEventListener("mousemove", onMove);
    const targets = document.querySelectorAll("[data-cursor-target]");
    const grow = () => cursorRef.current?.classList.add("w-11", "h-11", "bg-accent");
    const shrink = () => cursorRef.current?.classList.remove("w-11", "h-11", "bg-accent");
    targets.forEach((el) => {
      el.addEventListener("mouseenter", grow);
      el.addEventListener("mouseleave", shrink);
    });
    return () => {
      window.removeEventListener("mousemove", onMove);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", grow);
        el.removeEventListener("mouseleave", shrink);
      });
    };
  }, []);

  // Pinned scroll-scrubbed demo: typing, then variations cascade in
  useEffect(() => {
    let ticking = false;
    function update() {
      const wrap = pinWrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.min(1, Math.max(0, scrolled / total));

      const typeP = Math.min(1, p / 0.32);
      const chars = Math.round(typeP * FULL_TOPIC.length);
      if (typedTextRef.current) typedTextRef.current.textContent = FULL_TOPIC.slice(0, chars);
      if (typedCursorRef.current) typedCursorRef.current.style.display = typeP >= 1 ? "none" : "inline-block";

      const thresholds = [0.42, 0.6, 0.78];
      thresholds.forEach((t, i) => {
        const active = p > t;
        const row = outRowRefs.current[i];
        if (row) {
          row.style.opacity = active ? "1" : "0";
          row.style.transform = active ? "translateY(0)" : "translateY(28px)";
          row.classList.toggle("border-accent", active);
        }
        const tick = tickRefs.current[i];
        if (tick) {
          tick.classList.toggle("bg-accent", active);
          tick.classList.toggle("border-accent", active);
        }
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal underlines on feature rows + count-up stats
  useEffect(() => {
    const featIo = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("in-view")),
      { threshold: 0.4 }
    );
    featRowRefs.current.forEach((el) => el && featIo.observe(el));

    const counted = new WeakSet<Element>();
    const statIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting || counted.has(en.target)) return;
          counted.add(en.target);
          const target = Number(en.target.getAttribute("data-count") ?? "0");
          if (!target) return;
          let cur = 0;
          const step = () => {
            cur += Math.max(1, target / 20);
            en.target.textContent = String(Math.min(target, Math.round(cur)));
            if (cur < target) requestAnimationFrame(step);
          };
          step();
        });
      },
      { threshold: 0.6 }
    );
    statRefs.current.forEach((el) => el && statIo.observe(el));

    return () => {
      featIo.disconnect();
      statIo.disconnect();
    };
  }, []);

  return (
    <main className="bg-canvas">
      <div className="grain" />
      <div ref={progressRef} className="fixed left-0 top-0 z-[90] h-[2px] w-0 bg-accent" />
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[85] hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent transition-[width,height,background] duration-200 mix-blend-difference md:block"
      />

      {/* Nav */}
      <nav
        ref={navRef}
        className="fixed left-0 right-0 top-0 z-[70] border-b border-transparent px-6 py-5 transition-colors"
      >
        <div className="mx-auto flex max-w-[1360px] items-center justify-between">
          <Link href="/" data-cursor-target className="flex items-center gap-2.5 font-mono text-[13px] tracking-widest">
            <LogoMark size={22} />
            CONTENT<span className="text-accent">·</span>AI
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              data-cursor-target
              className="border border-hairline px-4 py-2 font-mono text-xs tracking-wide text-ink-dim transition hover:border-ink-dim hover:text-ink"
            >
              LOGIN
            </Link>
            <Link
              href="/signup"
              data-cursor-target
              className="group flex items-center gap-2 bg-accent px-4 py-2 font-mono text-xs tracking-wide text-canvas transition hover:bg-accent/90"
            >
              ENTER THE STUDIO
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col justify-center px-6 pb-16 pt-20">
        <div className="mx-auto grid w-full max-w-[1360px] grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_28rem] lg:gap-16">
          <div>
            <div className="mb-6 flex items-center gap-2 font-mono text-xs tracking-widest text-ink-dim">
              <span className="h-[15px] w-2 animate-blink bg-accent" />
              AI CONTENT STUDIO — NO FLUFF, NO NOISE
            </div>
            <h1 className="max-w-2xl font-serif text-[42px] font-medium leading-[0.98] tracking-tight sm:text-[64px] lg:text-[80px]">
              Say it once.
              <br />
              Ship it <em className="italic text-accent">eight</em> ways.
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-ink-dim">
              One topic, five tones, three takes to choose from — text or a photo in, ready-to-post copy out. Built
              for people who write daily, not for a demo reel.
            </p>
            <Link
              href="/signup"
              data-cursor-target
              className="group mt-9 flex w-fit items-center gap-2.5 border-b border-ink-faint pb-1 font-mono text-sm transition-colors hover:border-accent"
            >
              Start writing, free
              <span className="inline-block text-accent transition-transform group-hover:translate-x-1.5">→</span>
            </Link>

            <div className="mt-16 grid max-w-md grid-cols-3 gap-6 border-t border-hairline pt-6">
              {[
                ["8", "content types"],
                ["5", "tones"],
                ["3", "takes / topic"],
              ].map(([n, label]) => (
                <div key={label}>
                  <div className="font-serif text-3xl text-ink">{n}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroDemoCard />
          </div>
        </div>

        <div className="absolute bottom-9 right-6 hidden flex-col items-center gap-2.5 text-ink-faint sm:flex">
          <span className="font-mono text-[10px] tracking-[.2em]" style={{ writingMode: "vertical-rl" }}>
            SCROLL
          </span>
          <div className="relative h-12 w-px overflow-hidden bg-ink-faint">
            <div className="absolute left-0 top-[-100%] h-full w-full animate-[scrolldown_2s_ease-in-out_infinite] bg-accent" />
          </div>
        </div>
      </section>

      {/* Pinned scroll-scrubbed demo */}
      <div ref={pinWrapRef} className="h-[340vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div className="mb-5 font-mono text-[11.5px] tracking-[.18em] text-ink-faint">YOUR TOPIC</div>
          <div className="min-h-[1.6em] max-w-3xl font-serif text-[22px] sm:text-[38px]">
            <span ref={typedTextRef} />
            <span ref={typedCursorRef} className="inline-block h-[0.9em] w-[2px] translate-y-[2px] animate-blink bg-accent align-middle" />
          </div>
          <div className="mt-11 flex w-full max-w-3xl flex-col gap-4">
            {OUTPUTS.map((text, i) => (
              <div
                key={i}
                ref={(el) => {
                  outRowRefs.current[i] = el;
                }}
                className="flex items-start gap-4 border-l-2 border-hairline pl-4 text-left opacity-0 transition-[opacity,transform,border-color] duration-500"
                style={{ transform: "translateY(28px)" }}
              >
                <div className="flex-shrink-0 pt-0.5 font-mono text-[11px] text-ink-faint">0{i + 1}</div>
                <div className="text-sm leading-relaxed text-ink-dim">{text}</div>
              </div>
            ))}
          </div>
          <div className="absolute right-11 top-1/2 hidden -translate-y-1/2 flex-col gap-3.5 lg:flex">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                ref={(el) => {
                  tickRefs.current[i] = el;
                }}
                className="h-1.5 w-1.5 rounded-full border border-ink-faint transition-all duration-500"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-hairline py-6">
        <div className="flex w-max animate-scroll-x gap-10">
          {[...CONTENT_TYPE_LABELS, ...CONTENT_TYPE_LABELS].map((label, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-mono text-[13px] tracking-wide text-ink-faint transition-colors after:ml-10 after:text-ink-faint after:content-['·'] hover:text-accent"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-5 gap-y-14 px-6 py-28 text-center sm:grid-cols-4">
        {[
          { count: 8, label: "FORMATS" },
          { count: 5, label: "TONES" },
          { count: 3, label: "VARIATIONS EACH TIME" },
        ].map((s, i) => (
          <div key={s.label}>
            <div
              ref={(el) => {
                statRefs.current[i] = el;
              }}
              data-count={s.count}
              className="font-serif text-[40px] font-medium sm:text-[56px]"
            >
              0
            </div>
            <div className="mt-2 font-mono text-[11px] tracking-[.14em] text-ink-faint">{s.label}</div>
          </div>
        ))}
        <div>
          <div className="font-serif text-[40px] font-medium sm:text-[56px]">∞</div>
          <div className="mt-2 font-mono text-[11px] tracking-[.14em] text-ink-faint">BLANK PAGES AVOIDED</div>
        </div>
      </div>

      {/* Feature list */}
      <div className="mx-auto max-w-3xl px-6 pb-32 pt-6">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            ref={(el) => {
              featRowRefs.current[i] = el;
            }}
            className="feat-row group relative flex items-baseline gap-7 border-b border-hairline py-7"
          >
            <div className="w-6 flex-shrink-0 font-mono text-xs text-ink-faint">0{i + 1}</div>
            <div>
              <h3 className="font-serif text-2xl font-medium transition-[transform,color] duration-300 group-hover:translate-x-2 group-hover:text-accent">
                {f.title}
              </h3>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-dim">{f.desc}</p>
            </div>
            <span className="feat-underline pointer-events-none absolute bottom-[-1px] left-0 h-px w-0 bg-accent transition-[width] duration-700" />
          </div>
        ))}
      </div>

      {/* Quote */}
      <div className="mx-auto max-w-3xl px-6 pb-32 text-center">
        <p className="font-serif text-[22px] italic leading-snug sm:text-[32px]">
          "I stopped staring at a blank caption box. Three good options beat one perfect one I never finish."
        </p>
        <footer className="mt-6 font-mono text-xs tracking-wide text-ink-faint">— MAYA CHEN, INDIE CREATOR</footer>
      </div>

      {/* Closing CTA */}
      <div className="px-6 py-40 text-center">
        <h2 className="font-serif text-[34px] font-medium leading-tight sm:text-[64px]">
          Stop staring
          <br />
          at <em className="italic text-accent">blank pages</em>.
        </h2>
        <Link
          href="/signup"
          data-cursor-target
          className="group mx-auto mt-9 flex w-fit items-center gap-2.5 border-b border-ink-faint pb-1 font-mono text-sm transition-colors hover:border-accent"
        >
          Start writing, free
          <span className="inline-block text-accent transition-transform group-hover:translate-x-1.5">→</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="flex justify-between border-t border-hairline px-6 py-6 font-mono text-[11.5px] text-ink-faint">
        <span>CONTENT·AI © {new Date().getFullYear()}</span>
        <span className="hidden sm:inline">SAY IT ONCE. SHIP IT EIGHT WAYS.</span>
      </footer>

      <style>{`
        @keyframes scrolldown { 0% { top: -100%; } 60% { top: 100%; } 100% { top: 100%; } }
        .feat-row.in-view .feat-underline { width: 100%; }
      `}</style>
    </main>
  );
}
