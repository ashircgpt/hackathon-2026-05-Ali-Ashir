"use client";

import type { PizzaSize } from "./PizzaCanvas";

interface Props {
  size: PizzaSize;
  onChange: (size: PizzaSize) => void;
}

const OPTIONS: { id: PizzaSize; label: string; sub: string }[] = [
  { id: "SMALL", label: "Small", sub: "Personal" },
  { id: "MEDIUM", label: "Medium", sub: "Classic" },
  { id: "LARGE", label: "Large", sub: "Sharing" },
];

export default function SizeStep({ size, onChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-cheese">
        Step 2 — Adjust the size
      </p>
      <p className="text-xs text-cream/65 text-center max-w-md">
        Pinch the pizza in or out (touch), or scroll on the pizza (mouse) to
        resize. You can also pick a preset below.
      </p>

      <div className="flex gap-2">
        {OPTIONS.map((opt) => {
          const isActive = opt.id === size;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-0.5 rounded-xl border-2 px-4 py-2 transition-all
                ${isActive
                  ? "border-ember bg-ember/15 shadow-[0_0_20px_rgba(255,107,53,0.3)]"
                  : "border-ash bg-void/60 hover:border-ember/50"}`}
            >
              <span
                className={`text-sm font-bold ${isActive ? "text-ember" : "text-cream"}`}
              >
                {opt.label}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-smoke">
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
