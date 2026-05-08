'use client';

import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SIZE_LABELS } from "@/lib/pizza-size";
import type { Order } from "@/types";
import type { PizzaSize } from "@/lib/pizza-size";

interface OrderSummaryProps {
  order: Order;
  size: PizzaSize;
  onReset: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  PREPARING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  BAKING: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  READY: "bg-green-500/20 text-green-300 border-green-500/30",
  SERVED: "bg-teal-500/20 text-teal-300 border-teal-500/30",
};

export function OrderSummary({ order, size, onReset }: OrderSummaryProps) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden />
        <span className="text-sm font-semibold">Order Placed!</span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>Order #{order.id}</span>
        <span>·</span>
        <span>Table #{order.tableId}</span>
        <span>·</span>
        <span>{SIZE_LABELS[size]}</span>
        <span>·</span>
        <Badge
          className={`text-[10px] px-1.5 py-0 h-4 border ${STATUS_COLORS[order.status] ?? ""}`}
          variant="outline"
        >
          {order.status}
        </Badge>
      </div>

      {order.layers.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {order.layers
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((layer) => (
              <li key={layer.id}>· {layer.menuItem.name}</li>
            ))}
        </ul>
      )}

      <p className="text-[10px] text-muted-foreground/60 italic">
        Size shown for reference — will be persisted in a future update.
      </p>

      <Button variant="outline" size="sm" onClick={onReset} className="w-full">
        Start New Pizza
      </Button>
    </div>
  );
}
