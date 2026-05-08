"use client";

import type { MenuItem } from "@/types";

interface Props {
  combo: { ingredients: MenuItem[]; count: number };
  onApply: (ids: number[]) => void;
  onDismiss: () => void;
}

export default function ComboBanner({ combo, onApply, onDismiss }: Props) {
  const total = combo.ingredients.reduce((s, i) => s + i.price, 0);

  return (
    <div className="bg-glass border border-ember/30 rounded-2xl p-5 mb-2">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
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
          className="text-smoke hover:text-cream transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Ingredient chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {combo.ingredients.map((item) => (
          <span
            key={item.id}
            className="flex items-center gap-1.5 bg-void/50 border border-ash rounded-xl px-3 py-1.5 text-xs text-cream/80"
          >
            {item.name}
            <span className="font-mono text-ember">${item.price.toFixed(2)}</span>
          </span>
        ))}
      </div>

      {/* Total + apply */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-smoke font-mono">
          Total <span className="text-ember font-bold">${total.toFixed(2)}</span>
        </span>
        <button
          onClick={() => onApply(combo.ingredients.map((i) => i.id))}
          className="px-5 py-2 rounded-xl bg-ember text-void text-sm font-bold hover:bg-cheese transition-colors"
        >
          Apply This Combo →
        </button>
      </div>
    </div>
  );
}
