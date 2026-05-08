"use client";

import { useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import gsap from "gsap";
import type { Order } from "@/types";
import UrgencyBar from "./UrgencyBar";

interface OrderCardProps {
  order: Order;
  onAdvance: (id: number) => void;
}

export default function OrderCard({ order, onAdvance }: OrderCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
  });

  // Combine dnd-kit setNodeRef with our cardRef
  function refCallback(node: HTMLDivElement | null) {
    setNodeRef(node);
    (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    gsap.fromTo(el, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  const ingredientNames = order.layers
    .map((l) => l.menuItem.name)
    .join(", ");

  const isReady = order.status === "READY";

  return (
    <div
      ref={refCallback}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        rounded-lg border p-3 bg-glass cursor-grab active:cursor-grabbing select-none
        transition-shadow
        ${isDragging ? "scale-[1.03] shadow-2xl border-ember z-50 opacity-90" : "border-ash"}
        ${isReady ? "glow-ready border-status-ready" : ""}
      `}
    >
      {/* Header */}
      <p className="font-mono text-smoke text-xs mb-1">
        #{order.id} · TABLE {order.tableId}
      </p>

      {/* Urgency bar */}
      <UrgencyBar createdAt={order.createdAt} />

      {/* Ingredient list */}
      <p className="text-xs text-smoke line-clamp-2 mb-2">{ingredientNames}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-ember text-sm font-semibold">
          ${order.totalPrice.toFixed(2)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdvance(order.id);
          }}
          className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-ash text-foreground/80 hover:bg-ember hover:text-void transition-colors focus:outline-none focus:ring-1 focus:ring-ember"
          aria-label={`Advance order ${order.id}`}
        >
          Advance →
        </button>
      </div>
    </div>
  );
}
