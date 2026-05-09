"use client";

import type { PizzaSize } from "./PizzaCanvas";

interface Props {
  size: PizzaSize;
  onChange: (size: PizzaSize) => void;
}

const OPTIONS: { id: PizzaSize; label: string; sub: string; px: number }[] = [
  { id: "SMALL", label: "Small", sub: "Personal", px: 56 },
  { id: "MEDIUM", label: "Medium", sub: "Classic", px: 76 },
  { id: "LARGE", label: "Large", sub: "Sharing", px: 96 },
];

export default function SizeStep({ size, onChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-cheese mb-1">
          Step 2 — Adjust size
        </p>
        <p className="text-xs text-cream/60">
          Pick a size — your pizza canvas scales as you choose.
        </p>
      </div>

      <div className="flex gap-3 sm:gap-4">
        {OPTIONS.map((opt) => {
          const isActive = opt.id === size;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              aria-pressed={isActive}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-5 py-4 transition-all
                ${isActive
                  ? "border-ember bg-ember/15 shadow-[0_0_24px_rgba(255,107,53,0.3)]"
                  : "border-ash bg-void/60 hover:border-ember/50"}`}
            >
              <span
                className={`rounded-full bg-gradient-to-br from-cheese to-ember
                  ${isActive ? "" : "opacity-60"}`}
                style={{ width: opt.px, height: opt.px }}
                aria-hidden
              />
              <span className="flex flex-col items-center">
                <span
                  className={`text-sm font-bold ${isActive ? "text-ember" : "text-cream"}`}
                >
                  {opt.label}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-smoke">
                  {opt.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-cream/40 font-mono">
        Tip: pinch out / pinch in on touch screens to resize.
      </p>
    </div>
  );
}
