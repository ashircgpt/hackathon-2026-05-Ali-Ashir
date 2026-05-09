"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import IngredientCard from "./IngredientCard";
import type { MenuItem } from "@/types";

interface Props {
  bases: MenuItem[];
  selectedId: number | null;
  onSelect: (item: MenuItem) => void;
}

export default function DoughStep({ bases, selectedId, onSelect }: Props) {
  const scope = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(() => {
    const idx = bases.findIndex((b) => b.id === selectedId);
    return idx >= 0 ? idx : 0;
  });

  // Sync index with external selection changes (e.g. combo)
  useEffect(() => {
    if (selectedId == null) return;
    const idx = bases.findIndex((b) => b.id === selectedId);
    if (idx >= 0) setActiveIdx(idx);
  }, [selectedId, bases]);

  // Step entrance animation
  useEffect(() => {
    if (!scope.current) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        scope.current!.querySelectorAll("[data-dough-card]"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" },
      );
    }, scope);
    return () => ctx.revert();
  }, []);

  function prev() {
    setActiveIdx((i) => (i - 1 + bases.length) % bases.length);
  }
  function next() {
    setActiveIdx((i) => (i + 1) % bases.length);
  }

  return (
    <div ref={scope} className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-cheese mb-1">
          Step 1 — Choose your dough
        </p>
        <p className="text-xs text-cream/60">
          Tap a crust to select it. The base layer of every great pizza.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full justify-center">
        <button
          onClick={prev}
          aria-label="Previous dough"
          className="w-10 h-10 rounded-full border border-ash text-smoke hover:border-ember hover:text-ember transition-colors flex items-center justify-center text-lg"
        >
          ‹
        </button>

        <div
          className="flex gap-3 sm:gap-4 overflow-x-auto px-2 py-2 snap-x snap-mandatory scroll-smooth max-w-[480px]"
          style={{ scrollbarWidth: "none" }}
        >
          {bases.map((base, i) => {
            const isActive = i === activeIdx;
            return (
              <div
                key={base.id}
                data-dough-card
                className={`snap-center shrink-0 transition-transform ${isActive ? "scale-105" : "scale-95 opacity-70"}`}
              >
                <IngredientCard
                  item={base}
                  selected={selectedId === base.id}
                  onApply={(item) => {
                    setActiveIdx(i);
                    onSelect(item);
                  }}
                  variant="big"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={next}
          aria-label="Next dough"
          className="w-10 h-10 rounded-full border border-ash text-smoke hover:border-ember hover:text-ember transition-colors flex items-center justify-center text-lg"
        >
          ›
        </button>
      </div>

      <div className="flex gap-1.5">
        {bases.map((b, i) => (
          <span
            key={b.id}
            className={`w-1.5 h-1.5 rounded-full transition-colors
              ${i === activeIdx ? "bg-ember" : "bg-ash/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
