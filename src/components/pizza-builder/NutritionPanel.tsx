'use client';

import { computeTotals } from "@/lib/nutrition";
import { SIZE_MULTIPLIERS, SIZE_LABELS } from "@/lib/pizza-size";
import type { MenuItem } from "@/types";
import type { PizzaSize } from "@/lib/pizza-size";

interface NutritionPanelProps {
  layers: MenuItem[];
  size: PizzaSize;
}

export function NutritionPanel({ layers, size }: NutritionPanelProps) {
  const raw = computeTotals(layers);
  const m = SIZE_MULTIPLIERS[size];

  const price    = Math.round(raw.price * m * 100) / 100;
  const calories = Math.round(raw.calories * m);
  const protein  = Math.round(raw.protein * m * 10) / 10;
  const fats     = Math.round(raw.fats * m * 10) / 10;
  const carbs    = Math.round(raw.carbs * m * 10) / 10;

  const stats = [
    { label: "Price",   value: `$${price.toFixed(2)}` },
    { label: "Kcal",    value: String(calories) },
    { label: "Protein", value: `${protein}g` },
    { label: "Fat",     value: `${fats}g` },
    { label: "Carbs",   value: `${carbs}g` },
  ];

  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 mr-3">
        {SIZE_LABELS[size]}
      </span>
      <div className="flex items-center gap-5">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span
              key={value}
              className="text-sm font-bold hud-value animate-count-up tabular-nums"
            >
              {value}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
