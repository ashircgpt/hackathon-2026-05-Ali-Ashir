'use client';

import { useDroppable } from "@dnd-kit/core";
import { Pizza } from "lucide-react";
import { cn } from "@/lib/utils";
import { assignZIndexes } from "@/lib/layer-rules";
import { SIZE_CANVAS_CLASS } from "@/lib/pizza-size";
import type { PizzaSize } from "@/lib/pizza-size";
import type { MenuItem } from "@/types";

interface PizzaCanvasProps {
  layers: MenuItem[];
  size: PizzaSize;
  justAddedId?: number | null;
}

export function PizzaCanvas({ layers, size, justAddedId }: PizzaCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "pizza-canvas" });
  const indexed = assignZIndexes(layers);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative rounded-full transition-all duration-300 overflow-hidden",
        SIZE_CANVAS_CLASS[size],
        "pizza-base-disc border-2",
        isOver
          ? "border-primary animate-ring-breathe glow-ring-hover"
          : layers.length > 0
            ? "border-primary/50 glow-ring-md"
            : "border-primary/20 glow-ring-idle",
      )}
      role="img"
      aria-label={
        layers.length === 0
          ? "Empty pizza canvas — add a base layer to start"
          : `Pizza preview with ${layers.length} layer${layers.length === 1 ? "" : "s"}`
      }
    >
      {/* Drop hint dashed ring — visible when dragging over */}
      {isOver && (
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary/60 pointer-events-none z-50" />
      )}

      {layers.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/40 pointer-events-none select-none">
          <Pizza className="h-16 w-16 animate-pulse-glow" aria-hidden />
          <span className="text-xs font-semibold tracking-widest uppercase">
            Drop an ingredient here
          </span>
        </div>
      ) : (
        indexed.map((layer) => (
          <img
            key={`${layer.id}-${justAddedId === layer.id ? "new" : "old"}`}
            src={layer.imageUrl}
            alt={layer.name}
            className={cn(
              "absolute inset-0 w-full h-full object-contain pointer-events-none",
              justAddedId === layer.id && "animate-pop-in",
            )}
            style={{ zIndex: layer.zIndex }}
            draggable={false}
          />
        ))
      )}
    </div>
  );
}
