"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Order, OrderStatus } from "@/types";
import OrderCard from "./OrderCard";
import EmptyColumnState from "./EmptyColumnState";

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW:       "New",
  PREPARING: "Preparing",
  BAKING:    "Baking",
  READY:     "Ready",
  SERVED:    "Served",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW:       "hsl(260 70% 65%)",
  PREPARING: "hsl(200 85% 55%)",
  BAKING:    "hsl(38 95% 55%)",
  READY:     "hsl(142 70% 45%)",
  SERVED:    "hsl(240 5% 40%)",
};

const STATUS_GLOW: Record<string, string> = {
  NEW:       "glow-new",
  PREPARING: "glow-baking",   // closest available token
  BAKING:    "glow-baking",
  READY:     "glow-ready",
  SERVED:    "",
};

interface KanbanColumnProps {
  status: OrderStatus;
  orders: Order[];
  onAdvance: (id: number) => void;
}

export default function KanbanColumn({ status, orders, onAdvance }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col flex-1 min-w-0 rounded-xl border bg-glass/50 overflow-hidden
        transition-shadow
        ${isOver ? `${STATUS_GLOW[status]} border-opacity-60` : "border-ash"}
      `}
    >
      {/* Column header */}
      <div
        className="px-4 py-3 border-b shrink-0"
        style={{ borderColor: STATUS_COLORS[status] }}
      >
        <div className="flex items-center justify-between">
          <span className="uppercase tracking-widest text-[11px] text-smoke font-semibold">
            {STATUS_LABELS[status]}
          </span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full text-void"
            style={{ backgroundColor: STATUS_COLORS[status] }}
          >
            {orders.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-3 overflow-y-auto flex-1 min-h-0">
        {orders.length === 0 ? (
          <EmptyColumnState />
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onAdvance={onAdvance} />
          ))
        )}
      </div>
    </div>
  );
}
