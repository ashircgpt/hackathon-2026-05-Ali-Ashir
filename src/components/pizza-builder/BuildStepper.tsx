"use client";

import type { BuildStep } from "./PizzaBuilder";

interface Props {
  current: BuildStep;
  completed: Set<BuildStep>;
  onJump: (step: BuildStep) => void;
}

const STEPS: { id: BuildStep; label: string }[] = [
  { id: "DOUGH", label: "Dough" },
  { id: "SIZE", label: "Size" },
  { id: "SAUCE", label: "Sauce" },
  { id: "CHEESE", label: "Cheese" },
  { id: "TOPPINGS", label: "Toppings" },
  { id: "REVIEW", label: "Review" },
];

export default function BuildStepper({ current, completed, onJump }: Props) {
  return (
    <nav
      aria-label="Build progress"
      className="w-full bg-glass border border-ash rounded-2xl p-4"
    >
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const isCurrent = step.id === current;
          const isDone = completed.has(step.id) && !isCurrent;
          const isClickable = isDone;

          return (
            <li
              key={step.id}
              className="flex items-center flex-1 min-w-0 last:flex-initial"
            >
              <button
                type="button"
                onClick={() => isClickable && onJump(step.id)}
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex items-center gap-2 min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ember rounded-xl px-1 py-1
                  ${isClickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                    ${isCurrent
                      ? "border-ember bg-ember/25 text-ember"
                      : isDone
                        ? "border-cream/40 bg-cream/10 text-cream/70 group-hover:border-ember/60 group-hover:text-ember"
                        : "border-ash bg-void text-ash"}`}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span
                  className={`hidden sm:inline text-[11px] font-mono uppercase tracking-widest truncate
                    ${isCurrent ? "text-ember" : isDone ? "text-cream/70" : "text-ash"}`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={`flex-1 mx-1 sm:mx-2 h-px min-w-[8px]
                    ${isDone ? "bg-ember/60" : "bg-ash/60"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
