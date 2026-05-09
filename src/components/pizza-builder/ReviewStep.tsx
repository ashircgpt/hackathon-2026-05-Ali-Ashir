"use client";

import type { MenuItem, NutritionTotals } from "@/types";
import type { PizzaSize } from "./PizzaCanvas";
import type { BuildStep } from "./PizzaBuilder";

interface Props {
  base: MenuItem | undefined;
  sauce: MenuItem | undefined;
  cheese: MenuItem | undefined;
  toppings: MenuItem[];
  size: PizzaSize;
  totals: NutritionTotals;
  onEdit: (step: BuildStep) => void;
  onPlaceOrder: () => void;
  canPlace: boolean;
  placing: boolean;
  error: string | null;
}

const SIZE_LABEL: Record<PizzaSize, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

interface RowProps {
  label: string;
  value: string;
  step: BuildStep;
  onEdit: (step: BuildStep) => void;
  required?: boolean;
}

function Row({ label, value, step, onEdit, required }: RowProps) {
  const empty = value === "—" || value === "";
  return (
    <li className="flex items-center justify-between gap-3 py-2 border-b border-ash/40 last:border-b-0">
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-mono uppercase tracking-widest text-smoke">
          {label}
          {required && empty && (
            <span className="text-red-400 ml-1">— required</span>
          )}
        </span>
        <span
          className={`text-sm truncate ${empty ? "text-cream/40 italic" : "text-cream"}`}
        >
          {empty ? "Not selected" : value}
        </span>
      </div>
      <button
        onClick={() => onEdit(step)}
        className="shrink-0 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full border border-ash text-smoke hover:border-ember hover:text-ember transition-colors focus:outline-none focus:ring-1 focus:ring-ember"
      >
        Edit →
      </button>
    </li>
  );
}

export default function ReviewStep({
  base,
  sauce,
  cheese,
  toppings,
  size,
  totals,
  onEdit,
  onPlaceOrder,
  canPlace,
  placing,
  error,
}: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-cheese mb-1">
          Step 6 — Review &amp; Place Order
        </p>
        <p className="text-xs text-cream/60">
          Take one last look at your masterpiece.
        </p>
      </div>

      {/* Order summary */}
      <div className="bg-glass border border-ash rounded-2xl p-5">
        <ul>
          <Row
            label="Dough"
            value={base?.name ?? "—"}
            step="DOUGH"
            onEdit={onEdit}
            required
          />
          <Row
            label="Size"
            value={SIZE_LABEL[size]}
            step="SIZE"
            onEdit={onEdit}
          />
          <Row
            label="Sauce"
            value={sauce?.name ?? "—"}
            step="SAUCE"
            onEdit={onEdit}
            required
          />
          <Row
            label="Cheese"
            value={cheese?.name ?? "—"}
            step="CHEESE"
            onEdit={onEdit}
            required
          />
          <Row
            label="Toppings"
            value={
              toppings.length === 0
                ? "—"
                : toppings.map((t) => t.name).join(", ")
            }
            step="TOPPINGS"
            onEdit={onEdit}
          />
        </ul>
      </div>

      {/* Nutrition + Total */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Calories", value: `${totals.calories}`, unit: "kcal" },
          { label: "Protein", value: totals.protein.toFixed(1), unit: "g" },
          { label: "Fat", value: totals.fats.toFixed(1), unit: "g" },
          { label: "Carbs", value: totals.carbs.toFixed(1), unit: "g" },
        ].map((tile) => (
          <div
            key={tile.label}
            className="bg-void/60 border border-ash rounded-xl p-3"
          >
            <p className="text-[9px] font-mono uppercase tracking-widest text-smoke mb-1">
              {tile.label}
            </p>
            <p className="text-base font-bold text-cream tabular-nums">
              {tile.value}
              <span className="text-xs text-smoke ml-1 font-normal">
                {tile.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Bill total + Place Order */}
      <div className="bg-glass border border-ash rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-widest text-smoke">
            Total
          </span>
          <span className="font-mono text-ember text-2xl font-bold tabular-nums">
            ${totals.price.toFixed(2)}
          </span>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={onPlaceOrder}
          disabled={!canPlace || placing}
          className="w-full py-4 rounded-xl bg-ember text-void font-bold text-base hover:bg-cheese transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ember/50"
        >
          {placing ? "Placing Order…" : "Place Order →"}
        </button>

        {!canPlace && (
          <p className="text-[10px] text-cream/40 text-center font-mono">
            Dough, sauce, and cheese are required to place an order.
          </p>
        )}
      </div>
    </div>
  );
}
