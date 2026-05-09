"use client";

import type { MenuItem } from "@/types";

interface Props {
  bases: MenuItem[];
  selectedId: number | null;
}

export default function DoughStep({ bases, selectedId }: Props) {
  const idx = bases.findIndex((b) => b.id === selectedId);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-cheese">
        Step 1 — Choose your dough
      </p>
      <p className="text-xs text-cream/65 text-center max-w-md">
        Swipe the pizza left or right (or use the arrows) to flip through the
        crusts. The selected dough lands on the table instantly.
      </p>

      <div className="flex gap-1.5 mt-1">
        {bases.map((b, i) => (
          <span
            key={b.id}
            className={`w-1.5 h-1.5 rounded-full transition-colors
              ${i === idx ? "bg-ember" : "bg-ash/60"}`}
          />
        ))}
      </div>

      {selectedId !== null && bases[idx] && (
        <p className="text-sm font-bold text-cream">
          {bases[idx].name}
          <span className="text-ember font-mono text-xs ml-2">
            ${bases[idx].price.toFixed(2)}
          </span>
        </p>
      )}
    </div>
  );
}
