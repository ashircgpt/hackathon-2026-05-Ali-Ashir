"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Order, OrderStatus, ApiResponse } from "@/types";
import { getSocket, disconnectSocket } from "@/lib/socket-client";

const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW:       "text-purple-400 bg-purple-400/10 border-purple-400/30",
  PREPARING: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  BAKING:    "text-amber-400 bg-amber-400/10 border-amber-400/30",
  READY:     "text-green-400 bg-green-400/10 border-green-400/30",
  SERVED:    "text-smoke bg-smoke/10 border-smoke/30",
};

const ALL_STATUSES: OrderStatus[] = ["NEW", "PREPARING", "BAKING", "READY", "SERVED"];

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [todayOnly, setTodayOnly] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep current filter values accessible inside socket callbacks without stale closures
  const filterRef = useRef({ statusFilter, todayOnly });
  filterRef.current = { statusFilter, todayOnly };

  const fetchOrders = useCallback(() => {
    const { statusFilter: sf, todayOnly: to } = filterRef.current;
    const params = new URLSearchParams();
    if (sf !== "ALL") params.set("status", sf);
    if (to) params.set("today", "true");
    fetch(`/api/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((res: ApiResponse<Order[]>) => {
        if (res.success) setOrders(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch when filters change (immediate, show loading spinner)
  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [statusFilter, todayOnly, fetchOrders]);

  // 8-second polling fallback so the list stays fresh even without socket events
  useEffect(() => {
    const pollId = setInterval(fetchOrders, 8_000);
    return () => clearInterval(pollId);
  }, [fetchOrders]);

  // Socket.io — instant re-fetch on new order or status change
  useEffect(() => {
    const socket = getSocket();

    function joinAdmin() {
      socket.emit("join-admin");
    }

    function scheduleRefresh() {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(fetchOrders, 400);
    }

    joinAdmin();
    socket.on("connect", joinAdmin);
    socket.on("order-new", scheduleRefresh);
    socket.on("order-advance", scheduleRefresh);

    return () => {
      socket.off("connect", joinAdmin);
      socket.off("order-new", scheduleRefresh);
      socket.off("order-advance", scheduleRefresh);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      disconnectSocket();
    };
  }, [fetchOrders]);

  function fmt(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cheese mb-2">
          Operations
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-glass border border-ash rounded-xl p-1">
          {(["ALL", ...ALL_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all
                ${statusFilter === s
                  ? "bg-ember text-void font-bold"
                  : "text-smoke hover:text-cream"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-smoke cursor-pointer select-none">
          <input
            type="checkbox"
            checked={todayOnly}
            onChange={(e) => setTodayOnly(e.target.checked)}
            className="accent-ember"
          />
          Today only
        </label>
        <span className="ml-auto text-xs text-smoke font-mono">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-glass border border-ash rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-void/30 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-smoke text-sm">No orders match the current filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ash">
                {["", "ID", "Table", "Status", "Ingredients", "Total", "Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-smoke">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isExpanded = expandedId === order.id;
                const ingredients = order.layers.map((l) => l.menuItem.name).join(", ");
                return (
                  <>
                    <tr
                      key={order.id}
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="border-b border-ash/50 last:border-0 cursor-pointer hover:bg-ash/20 transition-colors"
                    >
                      <td className="pl-4 py-3 text-smoke">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </td>
                      <td className="px-4 py-3 font-mono text-cream">#{order.id}</td>
                      <td className="px-4 py-3 text-smoke">T-{order.tableId}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-smoke text-xs max-w-[220px] truncate">
                        {ingredients}
                      </td>
                      <td className="px-4 py-3 font-mono text-ember">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-smoke text-xs">{fmt(order.createdAt)}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${order.id}-exp`} className="bg-void/40 border-b border-ash/50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-2">Layers</p>
                              <div className="flex flex-col gap-1.5">
                                {order.layers.map((l) => (
                                  <div key={l.id} className="flex items-center gap-3 text-xs">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={l.menuItem.imageUrl} alt={l.menuItem.name} className="w-7 h-7 rounded-full object-cover border border-ash" />
                                    <span className="text-cream">{l.menuItem.name}</span>
                                    <span className="text-smoke">{l.menuItem.layerType}</span>
                                    <span className="ml-auto font-mono text-ember">${l.menuItem.price.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-2">Order Info</p>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between"><span className="text-smoke">Order ID</span><span className="font-mono text-cream">#{order.id}</span></div>
                                <div className="flex justify-between"><span className="text-smoke">Table</span><span className="text-cream">T-{order.tableId}</span></div>
                                <div className="flex justify-between"><span className="text-smoke">Total Price</span><span className="font-mono text-ember">${order.totalPrice.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-smoke">Calories</span><span className="font-mono text-cream">{order.totalCals} kcal</span></div>
                                <div className="flex justify-between"><span className="text-smoke">Placed At</span><span className="font-mono text-cream">{fmt(order.createdAt)}</span></div>
                                {order.feedback && (
                                  <div className="mt-3 pt-3 border-t border-ash">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-cheese mb-1">Feedback</p>
                                    <p className="text-cream/80 italic">&ldquo;{order.feedback.content}&rdquo;</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
