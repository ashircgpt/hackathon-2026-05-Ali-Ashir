"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import Image from "next/image";
import { assignZIndexes } from "@/lib/layer-rules";
import type { MenuItem, LayerType } from "@/types";

export type PizzaSize = "SMALL" | "MEDIUM" | "LARGE";

// Per-layer-type rendering config.
// containerInset: how far to pull each side in (% string). Keeps sauce/cheese within crust area
// and makes toppings appear at realistic pizza proportions.
// imageScale: additional CSS scale on the <img> itself — further shrinks toppings.
const LAYER_CONFIG: Record<
  LayerType,
  { containerInset: string; imageScale?: number }
> = {
  BASE:    { containerInset: "0" },
  SAUCE:   { containerInset: "5%" },
  CHEESE:  { containerInset: "6%" },
  TOPPING: { containerInset: "12%", imageScale: 0.75 },
};

const SIZE_SCALE: Record<PizzaSize, number> = {
  SMALL: 0.82,
  MEDIUM: 1,
  LARGE: 1.15,
};

interface Props {
  layers: MenuItem[];
  size?: PizzaSize;
  glow?: boolean;
  /** Enables horizontal swipe on the canvas. -1 = swipe left (next), 1 = swipe right (prev) */
  onSwipe?: (dir: -1 | 1) => void;
  /** Enables pinch + wheel resize. -1 = shrink, 1 = grow */
  onPinch?: (delta: -1 | 1) => void;
  /** Show overlay arrow indicators when swipe is enabled */
  swipeHint?: { left: string; right: string };
}

export interface PizzaCanvasHandle {
  getBoundingClientRect: () => DOMRect | undefined;
}

const SWIPE_THRESHOLD = 60; // px horizontal travel to register a swipe
const WHEEL_THRESHOLD = 80; // accumulated deltaY to trigger size jump
const PINCH_THRESHOLD = 1.25; // ratio of pinch distance to trigger size jump

const PizzaCanvas = forwardRef<PizzaCanvasHandle, Props>(function PizzaCanvas(
  { layers, size = "MEDIUM", glow = false, onSwipe, onPinch, swipeHint },
  forwardedRef,
) {
  const dishRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const knownIds = useRef<Set<number>>(new Set());

  useImperativeHandle(forwardedRef, () => ({
    getBoundingClientRect: () => dishRef.current?.getBoundingClientRect(),
  }));

  const stacked = assignZIndexes(layers);
  const scale = SIZE_SCALE[size];

  // Animate freshly-mounted layers in. Existing layers persist visually.
  useLayoutEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const presentIds = new Set(stacked.map((s) => s.id));

    stacked.forEach((item) => {
      if (knownIds.current.has(item.id)) return;
      const el = layerRefs.current.get(item.id);
      if (!el) return;

      if (reduce) {
        gsap.set(el, { opacity: 1, scale: 1, y: 0, rotate: 0 });
      } else {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.55, y: -24, rotate: -8 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            rotate: 0,
            duration: 0.55,
            ease: "back.out(1.6)",
          },
        );
      }
      knownIds.current.add(item.id);
    });

    knownIds.current.forEach((id) => {
      if (!presentIds.has(id)) knownIds.current.delete(id);
    });
  }, [stacked]);

  // Subtle glow pulse on REVIEW step
  useEffect(() => {
    if (!glow || !dishRef.current) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const tween = gsap.to(dishRef.current, {
      boxShadow:
        "0 30px 90px -10px rgba(255,107,53,0.5), 0 0 60px rgba(255,193,76,0.25)",
      duration: 1.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, [glow]);

  // ── Swipe (single-pointer horizontal drag) ────────────────────────────────
  useEffect(() => {
    if (!onSwipe || !dishRef.current) return;
    const el = dishRef.current;

    let startX: number | null = null;
    let pointerId: number | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startX = e.clientX;
      pointerId = e.pointerId;
    };
    const onUp = (e: PointerEvent) => {
      if (startX === null || pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        onSwipe(dx > 0 ? 1 : -1);
        // Slide animation hint
        gsap.fromTo(
          el,
          { x: dx > 0 ? -20 : 20 },
          { x: 0, duration: 0.4, ease: "back.out(1.6)" },
        );
      }
      startX = null;
      pointerId = null;
    };
    const onCancel = () => {
      startX = null;
      pointerId = null;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
    };
  }, [onSwipe]);

  // ── Pinch (two-pointer) + Wheel resize ────────────────────────────────────
  useEffect(() => {
    if (!onPinch || !dishRef.current) return;
    const el = dishRef.current;

    const pointers = new Map<number, { x: number; y: number }>();
    let initialDist: number | null = null;
    let wheelAccum = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;

    const distance = () => {
      const arr = Array.from(pointers.values());
      if (arr.length < 2) return 0;
      const dx = arr[0].x - arr[1].x;
      const dy = arr[0].y - arr[1].y;
      return Math.hypot(dx, dy);
    };

    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) initialDist = distance();
    };
    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && initialDist) {
        const cur = distance();
        const ratio = cur / initialDist;
        if (ratio >= PINCH_THRESHOLD) {
          onPinch(1);
          initialDist = cur;
        } else if (ratio <= 1 / PINCH_THRESHOLD) {
          onPinch(-1);
          initialDist = cur;
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) initialDist = null;
    };

    const onWheel = (e: WheelEvent) => {
      if (!onPinch) return;
      e.preventDefault();
      wheelAccum += e.deltaY;
      if (wheelTimer) clearTimeout(wheelTimer);
      if (Math.abs(wheelAccum) >= WHEEL_THRESHOLD) {
        onPinch(wheelAccum < 0 ? 1 : -1); // scroll up = grow
        wheelAccum = 0;
      } else {
        wheelTimer = setTimeout(() => {
          wheelAccum = 0;
        }, 200);
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [onPinch]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: 440,
        height: 440,
        maxWidth: "92vw",
        maxHeight: "92vw",
      }}
    >
      <div
        ref={dishRef}
        className={`relative w-full h-full rounded-full bg-void/70 border-4 border-ash/60 shadow-[0_30px_80px_-20px_rgba(255,107,53,0.25)] flex items-center justify-center overflow-hidden transition-transform duration-500
          ${onSwipe || onPinch ? "touch-none cursor-grab active:cursor-grabbing" : ""}`}
        style={{ transform: `scale(${scale})` }}
        aria-label="Pizza preview"
        role="img"
        data-pizza-canvas
      >
        {/* Plate concentric rings */}
        <div className="absolute inset-2 rounded-full border border-ash/40 pointer-events-none" />
        <div className="absolute inset-6 rounded-full border border-ash/30 pointer-events-none" />

        {/* Empty hint */}
        {layers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-smoke/60 text-center">
              Pick a base
              <br />
              to start
            </p>
          </div>
        )}

        {/* Stacked layers — opacity managed exclusively by GSAP */}
        {stacked.map((item) => {
          const cfg = LAYER_CONFIG[item.layerType] ?? LAYER_CONFIG.TOPPING;
          const inset = cfg.containerInset;
          return (
            <div
              key={item.id}
              ref={(el) => {
                if (el) layerRefs.current.set(item.id, el);
                else layerRefs.current.delete(item.id);
              }}
              className="absolute"
              style={{
                top: inset,
                left: inset,
                right: inset,
                bottom: inset,
                zIndex: item.zIndex,
              }}
            >
              <Image
                src={item.imageUrl}
                alt={`${item.name} layer`}
                fill
                sizes="440px"
                className="object-contain pointer-events-none select-none"
                style={cfg.imageScale ? { transform: `scale(${cfg.imageScale})` } : undefined}
                priority={item.layerType === "BASE"}
              />
            </div>
          );
        })}

        {/* Swipe hint overlay arrows */}
        {onSwipe && swipeHint && (
          <>
            <button
              type="button"
              onClick={() => onSwipe(1)}
              aria-label={swipeHint.left}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-void/80 border border-ash text-cream/80 hover:text-ember hover:border-ember transition-colors flex items-center justify-center text-lg font-bold backdrop-blur"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => onSwipe(-1)}
              aria-label={swipeHint.right}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-void/80 border border-ash text-cream/80 hover:text-ember hover:border-ember transition-colors flex items-center justify-center text-lg font-bold backdrop-blur"
            >
              ›
            </button>
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 text-[9px] font-mono uppercase tracking-[0.25em] text-smoke pointer-events-none">
              Swipe to switch
            </p>
          </>
        )}
      </div>
    </div>
  );
});

export default PizzaCanvas;
