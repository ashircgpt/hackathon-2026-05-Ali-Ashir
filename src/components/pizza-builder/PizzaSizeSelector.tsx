'use client';

import { cn } from "@/lib/utils";
import { SIZE_SHORT_LABELS, SIZE_LABELS } from "@/lib/pizza-size";
import type { PizzaSize } from "@/lib/pizza-size";

const SIZES: PizzaSize[] = ["SMALL", "MEDIUM", "LARGE"];

// Visual diameter scales with size — reinforces the S/M/L concept
const SIZE_BTN_CLASS: Record<PizzaSize, string> = {
  SMALL:  "w-9  h-9  text-xs",
  MEDIUM: "w-11 h-11 text-sm",
  LARGE:  "w-14 h-14 text-base",
};

interface PizzaSizeSelectorProps {
  value: PizzaSize;
  onChange: (size: PizzaSize) => void;
}

// TODO: Pinch-to-zoom gesture is implemented as wheel/touch handler in PizzaBuilder.
// S/M/L buttons remain the always-working fallback and primary visual control.

export function PizzaSizeSelector({ value, onChange }: PizzaSizeSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
        Size
      </span>
      <div className="flex items-end gap-2" role="group" aria-label="Pizza size">
        {SIZES.map((size) => (
          <button
            key={size}
            type="button"
            title={SIZE_LABELS[size]}
            onClick={() => onChange(size)}
            aria-label={`Select ${SIZE_LABELS[size]} pizza size`}
            aria-pressed={value === size}
            className={cn(
              "rounded-full border-2 font-bold transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              SIZE_BTN_CLASS[size],
              value === size
                ? "bg-primary text-primary-foreground border-primary glow-primary scale-105"
                : "bg-secondary text-secondary-foreground border-border hover:border-primary/40 hover:bg-accent",
            )}
          >
            {SIZE_SHORT_LABELS[size]}
          </button>
        ))}
      </div>
    </div>
  );
}
