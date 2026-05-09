"use client";

import Image from "next/image";
import type { MenuItem } from "@/types";

interface Props {
  combo: { ingredients: MenuItem[]; count: number };
  onApply: (ids: number[]) => void;
  onDismiss: () => void;
}

export default function CombosBanner({ combo, onApply, onDismiss }: Props) {
  const total = combo.ingredients.reduce((s, i) => s + i.price, 0);

  return (
    <div className="bg-glass border border-ember/40 rounded-2xl p-4 shadow-[0_10px_40px_-15px_rgba(255,107,53,0.4)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[10px] font-mono uppercase tracking-widest text-cheese">
            🔥 Most Famous Combo
          </p>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cheese/15 text-cheese border border-cheese/30">
            Ordered {combo.count}×
          </span>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss combo suggestion"
          className="w-7 h-7 rounded-full text-smoke hover:text-cream hover:bg-ash/40 transition-colors text-lg leading-none focus:outline-none focus:ring-1 focus:ring-ember"
        >
          ×
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {combo.ingredients.map((item) => (
          <span
            key={item.id}
            className="flex items-center gap-1.5 bg-void/60 border border-ash rounded-xl pl-1.5 pr-2 py-1 text-xs text-cream/85"
          >
            <span className="relative w-5 h-5 shrink-0">
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="20px"
                className="object-contain"
              />
            </span>
            {item.name}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-smoke font-mono">
          Total{" "}
          <span className="text-ember font-bold">${total.toFixed(2)}</span>
        </span>
        <button
          onClick={() => onApply(combo.ingredients.map((i) => i.id))}
          className="px-4 py-2 rounded-xl bg-ember text-void text-xs font-bold hover:bg-cheese transition-colors focus:outline-none focus:ring-2 focus:ring-ember/50"
        >
          Apply Combo →
        </button>
      </div>
    </div>
  );
}
