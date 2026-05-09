"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { assignZIndexes } from "@/lib/layer-rules";
import type { MenuItem } from "@/types";

interface Props {
  layers: MenuItem[];
  size?: "md" | "lg";
}

export default function PizzaCanvas({ layers, size = "lg" }: Props) {
  const scope = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const knownIds = useRef<Set<number>>(new Set());

  const stacked = assignZIndexes(layers);
  const dimClass =
    size === "lg" ? "w-[420px] h-[420px]" : "w-[320px] h-[320px]";

  // Animate any newly-added layer
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      stacked.forEach((item) => {
        if (!knownIds.current.has(item.id)) {
          const el = layerRefs.current.get(item.id);
          if (el) {
            if (reduce) {
              gsap.set(el, { opacity: 1, scale: 1 });
            } else {
              gsap.fromTo(
                el,
                { opacity: 0, scale: 0.55, y: -20, rotation: -6 },
                {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  rotation: 0,
                  duration: 0.5,
                  ease: "back.out(1.7)",
                },
              );
            }
          }
          knownIds.current.add(item.id);
        }
      });

      // Drop any IDs that are no longer present (cleanup tracking)
      const presentIds = new Set(stacked.map((s) => s.id));
      knownIds.current.forEach((id) => {
        if (!presentIds.has(id)) knownIds.current.delete(id);
      });
    }, scope);

    return () => ctx.revert();
  }, [stacked]);

  return (
    <div
      ref={scope}
      className={`relative ${dimClass} rounded-full bg-void/70 border-4 border-ash/60 shadow-[0_30px_80px_-20px_rgba(255,107,53,0.25)] flex items-center justify-center overflow-hidden`}
      aria-label="Pizza preview"
      role="img"
    >
      {/* Plate concentric rings */}
      <div className="absolute inset-2 rounded-full border border-ash/40 pointer-events-none" />
      <div className="absolute inset-6 rounded-full border border-ash/30 pointer-events-none" />

      {/* Empty hint */}
      {layers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-smoke/60 text-center">
            Tap an ingredient
            <br />
            to start
          </p>
        </div>
      )}

      {/* Stacked layers */}
      {stacked.map((item) => (
        <div
          key={item.id}
          ref={(el) => {
            if (el) layerRefs.current.set(item.id, el);
            else layerRefs.current.delete(item.id);
          }}
          className="absolute inset-0"
          style={{ zIndex: item.zIndex, opacity: 0 }}
        >
          <Image
            src={item.imageUrl}
            alt={`${item.name} layer`}
            fill
            sizes="420px"
            className="object-contain pointer-events-none select-none"
            priority={item.layerType === "BASE"}
          />
        </div>
      ))}
    </div>
  );
}
