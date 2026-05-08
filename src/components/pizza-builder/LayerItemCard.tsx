'use client';

import { useDraggable } from "@dnd-kit/core";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types";

interface LayerItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  onAdd: (item: MenuItem) => void;
}

export function LayerItemCard({ item, isSelected, onAdd }: LayerItemCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `layer-${item.id}`,
    data: { item },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAdd(item);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? "Remove" : "Add"} ${item.name}`}
      onClick={() => onAdd(item)}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex items-center gap-3 rounded-lg p-2.5 cursor-pointer select-none",
        "border transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging ? "opacity-40 scale-[0.94]" : "active:scale-[0.96]",
        isSelected
          ? "border-primary/50 bg-primary/10 shimmer-selected shadow-[0_0_12px_hsl(24_95%_53%/0.20)]"
          : "border-border bg-card hover:scale-[1.02] hover:border-primary/30 hover:bg-accent/60 hover:shadow-[0_0_10px_hsl(24_95%_53%/0.15)]",
      )}
    >
      {/* Ingredient image */}
      <div className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-secondary/80">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Name + price */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate leading-tight">{item.name}</p>
        <p className={cn(
          "text-[11px] mt-0.5",
          isSelected ? "text-primary/90" : "text-muted-foreground",
        )}>
          ${item.price.toFixed(2)}
        </p>
      </div>

      {/* Selected checkmark */}
      {isSelected && (
        <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="h-3 w-3 text-primary" aria-hidden />
        </div>
      )}
    </div>
  );
}
