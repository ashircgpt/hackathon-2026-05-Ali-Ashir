"use client";

import type { MenuItem, NutritionTotals } from "@/types";

interface Props {
  items: MenuItem[];
  totals: NutritionTotals;
  onRemove: (id: number) => void;
  onPlaceOrder: () => void;
  canPlace: boolean;
  placing: boolean;
  hasBase: boolean;
  error: string | null;
  locked: boolean;
}

export default function BillPanel({
  items,
  totals,
  onRemove,
  onPlaceOrder,
  canPlace,
  placing,
  hasBase,
  error,
  locked,
}: Props) {
  return (
    <div className="bg-glass border border-ash rounded-2xl p-5 w-full flex flex-col gap-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-cheese">
        Bill
      </p>

      {items.length === 0 ? (
        <p className="text-xs text-cream/40 italic py-3">
          No items yet — pick a base to start.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between text-sm group"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-cream/85 truncate">{item.name}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-cream/60 text-xs">
                  ${item.price.toFixed(2)}
                </span>
                {!locked && (
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="w-5 h-5 rounded-full text-smoke hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs leading-none focus:outline-none focus:ring-1 focus:ring-red-400"
                  >
                    ×
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-ash pt-3 flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-smoke">
          Total
        </span>
        <span className="font-mono text-ember text-xl font-bold tabular-nums">
          ${totals.price.toFixed(2)}
        </span>
      </div>

      {!locked && (
        <>
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            onClick={onPlaceOrder}
            disabled={!canPlace}
            className="w-full py-3 rounded-xl bg-ember text-void font-bold text-sm hover:bg-cheese transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ember/50"
          >
            {placing ? "Placing…" : "Place Order →"}
          </button>
          {!hasBase && (
            <p className="text-[10px] text-cream/40 text-center font-mono">
              Select a base to continue
            </p>
          )}
        </>
      )}
    </div>
  );
}
