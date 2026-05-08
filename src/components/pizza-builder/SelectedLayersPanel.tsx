'use client';

import { X } from "lucide-react";
import { assignZIndexes } from "@/lib/layer-rules";
import type { MenuItem } from "@/types";

interface SelectedLayersPanelProps {
  layers: MenuItem[];
  onRemove: (id: number) => void;
}

export function SelectedLayersPanel({ layers, onRemove }: SelectedLayersPanelProps) {
  if (layers.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">No layers selected</p>
    );
  }

  const sorted = assignZIndexes(layers).sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {sorted.map((layer) => (
        <div
          key={layer.id}
          className="shrink-0 flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5"
        >
          <div className="w-6 h-6 rounded overflow-hidden shrink-0">
            <img
              src={layer.imageUrl}
              alt={layer.name}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
          <span className="text-xs font-medium whitespace-nowrap">{layer.name}</span>
          <button
            type="button"
            onClick={() => onRemove(layer.id)}
            aria-label={`Remove ${layer.name}`}
            className="ml-0.5 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
