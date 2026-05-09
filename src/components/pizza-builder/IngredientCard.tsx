"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { MenuItem } from "@/types";

interface Props {
  item: MenuItem;
  selected: boolean;
  onApply: (item: MenuItem) => void;
  // Optional drop target — when provided, the card supports drag-and-drop;
  // releasing the pointer over this rect applies the ingredient.
  dropTargetRef?: RefObject<{ getBoundingClientRect: () => DOMRect | undefined }>;
  /** Visual style: pill (sauce/cheese), tile (toppings), big (dough). */
  variant?: "tile" | "pill" | "big";
}

const DRAG_THRESHOLD = 8; // px before pointer-down counts as a drag, not a tap

export default function IngredientCard({
  item,
  selected,
  onApply,
  dropTargetRef,
  variant = "tile",
}: Props) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [drag, setDrag] = useState<{
    active: boolean;
    x: number;
    y: number;
    over: boolean;
  } | null>(null);
  const startPos = useRef<{ x: number; y: number; pointerId: number } | null>(
    null,
  );
  const wasDragging = useRef(false);

  function isOverDrop(x: number, y: number): boolean {
    const rect = dropTargetRef?.current?.getBoundingClientRect();
    if (!rect) return false;
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!dropTargetRef) return; // no drag mode for dough — let click fire
    startPos.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    wasDragging.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    wasDragging.current = true;
    setDrag({
      active: true,
      x: e.clientX,
      y: e.clientY,
      over: isOverDrop(e.clientX, e.clientY),
    });
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (!startPos.current) return;
    try {
      e.currentTarget.releasePointerCapture(startPos.current.pointerId);
    } catch {
      /* no-op */
    }

    if (wasDragging.current) {
      if (isOverDrop(e.clientX, e.clientY)) onApply(item);
      // The native `click` event fires after pointerup — onClick checks
      // wasDragging to avoid double-firing onApply.
    }
    setDrag(null);
    startPos.current = null;
  }

  function onPointerCancel() {
    setDrag(null);
    startPos.current = null;
    wasDragging.current = false;
  }

  function onClick() {
    if (wasDragging.current) {
      // Drag handled the action; suppress click
      wasDragging.current = false;
      return;
    }
    onApply(item);
  }

  // Quick scale pulse when selected state flips on
  useEffect(() => {
    if (!selected || !cardRef.current) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    gsap.fromTo(
      cardRef.current,
      { scale: 0.92 },
      { scale: 1, duration: 0.3, ease: "back.out(2)" },
    );
  }, [selected]);

  // Card visual variants
  const baseClass =
    "relative outline-none focus-visible:ring-2 focus-visible:ring-ember transition-all touch-none";
  const tileClass =
    "w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-2 flex flex-col items-center gap-1 p-2";
  const pillClass =
    "min-w-[140px] flex items-center gap-3 rounded-2xl border-2 px-3 py-2";
  const bigClass =
    "w-32 h-40 sm:w-40 sm:h-48 rounded-3xl border-2 flex flex-col items-center justify-between p-3";

  const variantClass =
    variant === "big" ? bigClass : variant === "pill" ? pillClass : tileClass;

  const stateClass = selected
    ? "border-ember bg-ember/15 shadow-[0_0_28px_rgba(255,107,53,0.35)]"
    : "border-ash bg-void/60 hover:border-ember/60 hover:scale-[1.03]";

  const imgSize =
    variant === "big" ? "h-24 w-24" : variant === "pill" ? "h-12 w-12" : "h-12 w-12";

  return (
    <>
      <button
        ref={cardRef}
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onClick}
        aria-pressed={selected}
        aria-label={`${item.name}, $${item.price.toFixed(2)}`}
        className={`${baseClass} ${variantClass} ${stateClass}`}
      >
        <div className={`relative ${imgSize}`}>
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="120px"
            className="object-contain pointer-events-none select-none"
          />
        </div>
        <div className={variant === "pill" ? "flex flex-col items-start" : "flex flex-col items-center"}>
          <span
            className={`text-[11px] font-medium leading-tight text-center max-w-[100px] truncate
              ${selected ? "text-ember" : "text-cream/85"}`}
          >
            {item.name}
          </span>
          <span className="text-[10px] font-mono text-cheese">
            ${item.price.toFixed(2)}
          </span>
        </div>

        {/* Selected check */}
        {selected && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ember text-void text-[10px] font-bold flex items-center justify-center shadow">
            ✓
          </span>
        )}
      </button>

      {/* Drag ghost */}
      {drag?.active && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: drag.x,
            top: drag.y,
            transform: `translate(-50%, -50%) scale(${drag.over ? 1.15 : 1})`,
            transition: "transform 0.12s ease-out",
          }}
        >
          <div
            className={`relative w-20 h-20 rounded-full bg-void/85 border-2 backdrop-blur-sm
              ${drag.over ? "border-ember shadow-[0_0_30px_rgba(255,107,53,0.6)]" : "border-ash"}`}
          >
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="80px"
              className="object-contain p-2"
            />
          </div>
          {drag.over && (
            <p className="text-[9px] font-mono uppercase tracking-widest text-ember text-center mt-2">
              Release to add
            </p>
          )}
        </div>
      )}
    </>
  );
}
