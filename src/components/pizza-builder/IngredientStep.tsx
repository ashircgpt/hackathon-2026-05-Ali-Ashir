"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import IngredientCard from "./IngredientCard";
import type { LayerType, MenuItem } from "@/types";
import type { PizzaCanvasHandle } from "./PizzaCanvas";

interface Props {
  layerType: Exclude<LayerType, "BASE">;
  items: MenuItem[];
  selectedIds: Set<number>;
  onApply: (item: MenuItem) => void;
  dropTargetRef: RefObject<PizzaCanvasHandle>;
  stepLabel: string;
  helper: string;
  /** "tile" for grids (toppings), "pill" for shorter rows (sauce/cheese). */
  variant?: "tile" | "pill";
  selectedToppingsCount?: number;
}

export default function IngredientStep({
  layerType,
  items,
  selectedIds,
  onApply,
  dropTargetRef,
  stepLabel,
  helper,
  variant = "tile",
  selectedToppingsCount,
}: Props) {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scope.current) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        scope.current!.querySelectorAll("[data-ing-card]"),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" },
      );
    }, scope);
    return () => ctx.revert();
  }, []);

  const isToppings = layerType === "TOPPING";

  return (
    <div ref={scope} className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-cheese mb-1">
          {stepLabel}
        </p>
        <p className="text-xs text-cream/60">{helper}</p>
        {isToppings && (
          <p className="text-[10px] font-mono text-ember mt-1">
            {selectedToppingsCount ?? 0} topping
            {selectedToppingsCount === 1 ? "" : "s"} on your pizza
          </p>
        )}
      </div>

      <div
        className={`grid gap-3 sm:gap-4 w-full max-w-[560px] justify-items-center
          ${variant === "pill" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-3 sm:grid-cols-4"}`}
      >
        {items.map((item) => (
          <div key={item.id} data-ing-card>
            <IngredientCard
              item={item}
              selected={selectedIds.has(item.id)}
              onApply={onApply}
              dropTargetRef={dropTargetRef}
              variant={variant}
            />
          </div>
        ))}
      </div>

      <p className="text-[10px] text-cream/40 font-mono text-center">
        Tip: tap a card to apply, or drag it onto the pizza.
      </p>
    </div>
  );
}
