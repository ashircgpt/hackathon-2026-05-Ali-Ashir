"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import Image from "next/image";
import type { LayerType, MenuItem } from "@/types";

interface Props {
  items: MenuItem[];
  selectedIds: Set<number>;
  onSelect: (item: MenuItem) => void;
  locked: boolean;
  children?: ReactNode;
}

const LAYER_LABEL: Record<LayerType, string> = {
  BASE: "Base",
  SAUCE: "Sauce",
  CHEESE: "Cheese",
  TOPPING: "Topping",
};

const LAYER_GROUP_ORDER: LayerType[] = ["BASE", "SAUCE", "CHEESE", "TOPPING"];

export default function IngredientOrbit({
  items,
  selectedIds,
  onSelect,
  locked,
  children,
}: Props) {
  const scope = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Order items: BASE → SAUCE → CHEESE → TOPPING (preserves a clean visual cluster)
  const ordered = LAYER_GROUP_ORDER.flatMap((lt) =>
    items.filter((m) => m.layerType === lt),
  );

  const total = ordered.length || 1;

  useEffect(() => {
    if (!scope.current) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        scope.current!.querySelectorAll("[data-orbit-item]"),
        { opacity: 0, scale: 0.6 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: "back.out(1.5)",
        },
      );
    }, scope);

    return () => ctx.revert();
  }, [ordered.length]);

  function handleClick(item: MenuItem) {
    if (locked) return;
    const el = itemRefs.current.get(item.id);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (el && !reduce) {
      gsap.fromTo(
        el,
        { scale: 1 },
        { scale: 1.18, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" },
      );
    }
    onSelect(item);
  }

  return (
    <div
      ref={scope}
      className="relative w-full max-w-[720px] aspect-square mx-auto"
      aria-label="Ingredient orbit"
    >
      {/* Orbit ring guide (dashed circle) */}
      <div className="absolute inset-[14%] rounded-full border border-dashed border-ash/40 pointer-events-none" />

      {/* Pizza canvas slot (children) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">{children}</div>
      </div>

      {/* Orbit items */}
      {ordered.map((item, i) => {
        const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
        const radiusPct = 47; // % from center
        const x = 50 + radiusPct * Math.cos(angle);
        const y = 50 + radiusPct * Math.sin(angle);
        const isSelected = selectedIds.has(item.id);

        return (
          <button
            key={item.id}
            data-orbit-item
            ref={(el) => {
              if (el) itemRefs.current.set(item.id, el);
              else itemRefs.current.delete(item.id);
            }}
            onClick={() => handleClick(item)}
            disabled={locked}
            aria-label={`${item.name} — ${LAYER_LABEL[item.layerType]}, $${item.price.toFixed(2)}`}
            aria-pressed={isSelected}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
            className={`absolute group flex flex-col items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ember rounded-2xl
              ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div
              className={`relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-full border-2 transition-all
                ${isSelected
                  ? "border-ember bg-ember/15 shadow-[0_0_24px_rgba(255,107,53,0.4)]"
                  : "border-ash/70 bg-void/60 hover:border-ember/60 hover:scale-105"
                }`}
            >
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="72px"
                className="object-contain p-1.5 select-none pointer-events-none"
              />
              <span
                className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border
                  ${isSelected
                    ? "bg-ember text-void border-ember"
                    : "bg-void/90 text-ember border-ash"}`}
              >
                ${item.price.toFixed(0)}
              </span>
            </div>
            <span
              className={`text-[10px] font-medium leading-tight text-center max-w-[80px] truncate
                ${isSelected ? "text-ember" : "text-cream/70"}`}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
