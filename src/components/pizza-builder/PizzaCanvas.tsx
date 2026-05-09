"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { assignZIndexes } from "@/lib/layer-rules";
import type { MenuItem } from "@/types";

export type PizzaSize = "SMALL" | "MEDIUM" | "LARGE";

const SIZE_SCALE: Record<PizzaSize, number> = {
  SMALL: 0.82,
  MEDIUM: 1,
  LARGE: 1.15,
};

interface Props {
  layers: MenuItem[];
  size?: PizzaSize;
  glow?: boolean;
}

export interface PizzaCanvasHandle {
  getBoundingClientRect: () => DOMRect | undefined;
}

const PizzaCanvas = forwardRef<PizzaCanvasHandle, Props>(function PizzaCanvas(
  { layers, size = "MEDIUM", glow = false },
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

    // Drop tracking IDs that are no longer present (handles layer removal/reset)
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
        className="relative w-full h-full rounded-full bg-void/70 border-4 border-ash/60 shadow-[0_30px_80px_-20px_rgba(255,107,53,0.25)] flex items-center justify-center overflow-hidden transition-transform duration-500"
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

        {/* Stacked layers — each layer keeps its inline opacity managed by GSAP */}
        {stacked.map((item) => (
          <div
            key={item.id}
            ref={(el) => {
              if (el) layerRefs.current.set(item.id, el);
              else layerRefs.current.delete(item.id);
            }}
            className="absolute inset-0"
            style={{ zIndex: item.zIndex }}
          >
            <Image
              src={item.imageUrl}
              alt={`${item.name} layer`}
              fill
              sizes="440px"
              className="object-contain pointer-events-none select-none"
              priority={item.layerType === "BASE"}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default PizzaCanvas;
