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
            duration: 0.4,
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
    // tiles is derived from totals; depending on the four numeric fields is sufficient
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.calories, totals.protein, totals.fats, totals.carbs]);

  return (
    <div
      ref={scope}
      className="bg-glass border border-ash rounded-2xl p-5 w-full"
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-cheese mb-4">
        Live Nutrition
      </p>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="bg-void/60 border border-ash/60 rounded-xl p-3"
          >
            <p className="text-[9px] font-mono uppercase tracking-widest text-smoke mb-1">
              {tile.label}
            </p>
            <p className="text-lg font-bold text-cream tabular-nums">
              <span
                ref={(el) => {
                  if (el) numberRefs.current.set(tile.label, el);
                }}
              >
                {tile.value.toFixed(tile.decimals)}
              </span>
              <span className="text-xs text-smoke ml-1 font-normal">
                {tile.unit}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
