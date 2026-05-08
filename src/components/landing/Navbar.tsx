"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#story",    label: "Story"    },
  { href: "#problem",  label: "Problem"  },
  { href: "#solution", label: "Solution" },
  { href: "#features", label: "Features" },
  { href: "#flow",     label: "How"      },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-void/85 backdrop-blur-lg border-b border-ash/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full bg-ember/15 flex items-center justify-center text-ember group-hover:bg-ember/25 transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
              <circle cx="12" cy="12" r="10" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">
            Pizza{" "}
            <span className="text-gradient-pizza">
              3.14
              <span className="font-serif italic">π</span>
            </span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-cream/60">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ember transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <Link
          href="/table/1"
          className="text-xs font-bold px-4 py-2 rounded-full bg-ember text-void hover:bg-cheese transition-colors focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-void"
        >
          Start Building
        </Link>
      </div>
    </nav>
  );
}
