"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "./LogoMark";

const LINKS = [
  { href: "/dashboard", label: "Generator" },
  { href: "/templates", label: "Templates" },
  { href: "/history", label: "History" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar({ email }: { email?: string | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-mono text-[13px] tracking-widest">
          <LogoMark size={22} />
          CONTENT<span className="text-accent">·</span>AI
        </Link>
        <nav className="hidden items-center gap-6 font-mono text-xs tracking-wide md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`transition ${active ? "text-accent" : "text-ink-faint hover:text-ink"}`}
              >
                {l.label.toUpperCase()}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden font-mono text-xs text-ink-faint sm:inline">
            {email ? email : <span className="inline-block h-3 w-28 animate-pulse rounded-sm bg-hairline align-middle" />}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full border border-hairline px-4 py-1.5 font-mono text-xs tracking-wide text-ink-dim transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              LOG OUT
            </button>
          </form>
        </div>
      </div>
      {/* mobile nav */}
      <nav className="flex items-center gap-4 overflow-x-auto border-t border-hairline px-6 py-2 font-mono text-[11px] tracking-wide md:hidden">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap transition ${active ? "text-accent" : "text-ink-faint hover:text-ink"}`}
            >
              {l.label.toUpperCase()}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
