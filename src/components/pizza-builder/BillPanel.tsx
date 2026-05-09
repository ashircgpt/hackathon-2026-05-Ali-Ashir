"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { MenuItem, NutritionTotals } from "@/types";

interface Props {
  items: MenuItem[];
  totals: NutritionTotals;
  onRemove: (id: number) => void;
  locked: boolean;
}

export default function BillPanel({ items, totals, onRemove, locked }: Props) {
  const scope = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  // Animated count-up on total
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const el = totalRef.current;
    if (!el) return;
    if (reduce) {
      el.textContent = `$${totals.price.toFixed(2)}`;
      prev.current = totals.price;
      return;
    }
    const proxy = { v: prev.current };
    gsap.to(proxy, {
      v: totals.price,
      duration: 0.45,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = `$${proxy.v.toFixed(2)}`;
      },
    });
    prev.current = totals.price;
  }, [totals.price]);

  return (
    <div
      ref={scope}
      className="bg-glass border border-ash rounded-2xl p-4 backdrop-blur-md shadow-[0_8px_30px_-10px_rgba(0,0,0,0.6)] flex flex-col gap-3 w-full"
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
        <p className="text-[10px] font-mono uppercase tracking-widest text-ember">
          Order Summary
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-cream/40 italic py-2">
          Your pizza is empty.
        </p>
      ) : (
        <ul className="flex flex-col gap-1 max-h-[180px] overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between text-xs gap-2"
            >
              <span className="text-cream/85 truncate">{item.name}</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono text-cream/60 text-[10px]">
                  ${item.price.toFixed(2)}
                </span>
                {!locked && (
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="w-4 h-4 rounded-full text-smoke hover:text-red-400 hover:bg-red-500/10 transition-colors text-[10px] leading-none focus:outline-none focus:ring-1 focus:ring-red-400"
                  >
                    ×
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-ash/60 pt-2 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-smoke">
          Total
        </span>
        <span
          ref={totalRef}
          className="font-mono text-ember text-lg font-bold tabular-nums"
        >
          ${totals.price.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
