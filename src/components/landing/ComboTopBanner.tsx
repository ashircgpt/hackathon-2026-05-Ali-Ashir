"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import type { MenuItem } from "@/types";

interface ComboData {
  ingredients: MenuItem[];
  count: number;
}

export default function ComboTopBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [combo, setCombo] = useState<ComboData | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/menu/famous-combo")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setCombo(json.data as ComboData);
      })
      .catch(() => {/* silent — banner stays hidden */});
  }, []);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el || !combo) return;
    gsap.fromTo(el, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 1.5 });
  }, [combo]);

  if (!combo) return null;

  const names = combo.ingredients.map((i) => i.name).join(" + ");

  return (
    <div
      ref={bannerRef}
      className="absolute top-6 left-1/2 -translate-x-1/2 z-20 opacity-0"
    >
      <div className="flex items-center gap-4 bg-glass border border-ash rounded-full px-6 py-2.5 text-sm whitespace-nowrap shadow-lg">
        <span className="text-ember font-semibold">
          🔥 Most Ordered — <span className="text-foreground/80">{names}</span>
        </span>
        <button
          onClick={() => router.push("/table/1")}
          className="text-xs font-bold text-void bg-ember rounded-full px-3 py-1 hover:bg-ember-dim transition-colors"
        >
          Order This →
        </button>
      </div>
    </div>
  );
}
