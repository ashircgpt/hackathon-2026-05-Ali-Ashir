"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DndContext, type DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import gsap from "gsap";
import type { Order, OrderStatus } from "@/types";
import { getSocket, disconnectSocket } from "@/lib/socket-client";
import KanbanColumn from "./KanbanColumn";
import KitchenHeader from "./KitchenHeader";

const STATUS_SEQUENCE: OrderStatus[] = ["NEW", "PREPARING", "BAKING", "READY", "SERVED"];

function isToday(dateStr: string | Date) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export default function KitchenBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const ordersRef = useRef<Order[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?today=true");
      const json = await res.json();
      if (json.success) {
        const todays = (json.data as Order[]).filter((o) => isToday(o.createdAt));
        setOrders(todays);
        ordersRef.current = todays;
      }
    } catch {
      // silent — keep stale data on display
    }
  }, []);

  // Polling fallback (4s) — keeps board in sync even if socket drops
  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 4_000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  // Socket.io — real-time updates (instant, no poll delay)
  useEffect(() => {
    const socket = getSocket();

    function joinKitchen() {
      socket.emit("join-kitchen");
    }

    // New order placed by a customer → prepend to board
    function onOrderNew(order: Order) {
      if (!isToday(order.createdAt)) return;
      setOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev; // deduplicate
        const next = [order, ...prev];
        ordersRef.current = next;
        return next;
      });
    }

    // Kitchen advances an order on another terminal (or server confirms advance)
    function onOrderAdvance({ orderId, status }: { orderId: number; status: OrderStatus }) {
      setOrders((prev) => {
        const next = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
        ordersRef.current = next;
        return next;
      });
    }

    joinKitchen(); // join immediately
    socket.on("connect", joinKitchen); // re-join after any reconnect
    socket.on("order-new", onOrderNew);
    socket.on("order-advance", onOrderAdvance);

    return () => {
      socket.off("connect", joinKitchen);
      socket.off("order-new", onOrderNew);
      socket.off("order-advance", onOrderAdvance);
      disconnectSocket();
    };
  }, []);

  async function advanceOrder(orderId: number) {
    const order = ordersRef.current.find((o) => o.id === orderId);
    if (!order) return;
    const currentIdx = STATUS_SEQUENCE.indexOf(order.status);
    if (currentIdx === -1 || currentIdx >= STATUS_SEQUENCE.length - 1) return;
    const nextStatus = STATUS_SEQUENCE[currentIdx + 1];

    // Optimistic update
    const prev = ordersRef.current;
    const updated = prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
    setOrders(updated);
    ordersRef.current = updated;

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, { method: "PATCH" });
      if (!res.ok) throw new Error("advance failed");
    } catch {
      // Revert on failure
      setOrders(prev);
      ordersRef.current = prev;
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const orderId = active.id as number;
    const targetStatus = over.id as OrderStatus;
    const order = ordersRef.current.find((o) => o.id === orderId);
    if (!order) return;

    const currentIdx = STATUS_SEQUENCE.indexOf(order.status);
    const targetIdx  = STATUS_SEQUENCE.indexOf(targetStatus);

    // Only allow drop onto exactly the next status
    if (targetIdx !== currentIdx + 1) {
      // Shake the card back
      const cardEl = document.querySelector(`[data-order-id="${orderId}"]`);
      if (cardEl) {
        gsap.fromTo(cardEl, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
      }
      return;
    }

    advanceOrder(orderId);
  }

  // Split orders by status
  const byStatus = (status: OrderStatus) => orders.filter((o) => o.status === status);
  const todayTotal = orders.length;

  const counts: Record<OrderStatus, number> = {
    NEW:       byStatus("NEW").length,
    PREPARING: byStatus("PREPARING").length,
    BAKING:    byStatus("BAKING").length,
    READY:     byStatus("READY").length,
    SERVED:    byStatus("SERVED").length,
  };

  return (
    <>
      <KitchenHeader counts={counts} todayTotal={todayTotal} />
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 p-4 flex-1 overflow-hidden min-h-0">
          {(["NEW", "PREPARING", "BAKING", "READY", "SERVED"] as OrderStatus[]).map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              orders={byStatus(status)}
              onAdvance={advanceOrder}
            />
          ))}
        </div>
      </DndContext>
    </>
  );
}
