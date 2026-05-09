"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { NutritionTotals } from "@/types";

interface Props {
  totals: NutritionTotals;
}

interface Tile {
  label: string;
  value: number;
  unit: string;
  decimals: number;
}

export default function NutritionPanel({ totals }: Props) {
  const scope = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const prevValues = useRef<Record<string, number>>({});

  const tiles: Tile[] = [
    { label: "Calories", value: totals.calories, unit: "kcal", decimals: 0 },
    { label: "Protein", value: totals.protein, unit: "g", decimals: 1 },
    { label: "Fat", value: totals.fats, unit: "g", decimals: 1 },
    { label: "Carbs", value: totals.carbs, unit: "g", decimals: 1 },
  ];

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      tiles.forEach((tile) => {
        const el = numberRefs.current.get(tile.label);
        if (!el) return;
        const prev = prevValues.current[tile.label] ?? 0;
        const next = tile.value;
        if (prev === next) return;

        if (reduce) {
          el.textContent = next.toFixed(tile.decimals);
        } else {
          const proxy = { v: prev };
          gsap.to(proxy, {
            v: next,
            duration: 0.45,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = proxy.v.toFixed(tile.decimals);
            },
          });
        }
        prevValues.current[tile.label] = next;
      });
    }, scope);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.calories, totals.protein, totals.fats, totals.carbs]);

  return (
    <div
      ref={scope}
      className="bg-glass border border-ash rounded-2xl p-4 backdrop-blur-md shadow-[0_8px_30px_-10px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-cheese animate-pulse" />
        <p className="text-[10px] font-mono uppercase tracking-widest text-cheese">
          Live Nutrition
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="bg-void/60 border border-ash/60 rounded-xl px-3 py-2"
          >
            <p className="text-[9px] font-mono uppercase tracking-widest text-smoke mb-0.5">
              {tile.label}
            </p>
            <p className="text-base font-bold text-cream tabular-nums leading-tight">
              <span
                ref={(el) => {
                  if (el) numberRefs.current.set(tile.label, el);
                }}
              >
                {tile.value.toFixed(tile.decimals)}
              </span>
              <span className="text-[10px] text-smoke ml-1 font-normal">
                {tile.unit}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
