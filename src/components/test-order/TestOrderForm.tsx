"use client";

import { useEffect, useState } from "react";
import { computeTotals } from "@/lib/nutrition";
import { getSocket, disconnectSocket } from "@/lib/socket-client";
import ComboBanner from "./ComboBanner";
import FeedbackForm from "./FeedbackForm";
import type {
  MenuItem,
  LayerType,
  OrderStatus,
  ApiResponse,
  Order,
} from "@/types/index";

const STATUS_STEPS: OrderStatus[] = [
  "NEW",
  "PREPARING",
  "BAKING",
  "READY",
  "SERVED",
];

const LAYER_ORDER: LayerType[] = ["BASE", "SAUCE", "CHEESE", "TOPPING"];
const LAYER_LABELS: Record<LayerType, string> = {
  BASE: "Base (pick 1 — required)",
  SAUCE: "Sauce (optional, pick 1)",
  CHEESE: "Cheese (optional, pick 1)",
  TOPPING: "Toppings (any)",
};

interface Props {
  tableId: string;
}

export default function TestOrderForm({ tableId }: Props) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [combo, setCombo] = useState<{ ingredients: MenuItem[]; count: number } | null>(null);
  const [comboDismissed, setComboDismissed] = useState(false);
  const tableNum = parseInt(tableId, 10) || 1;
  // Fetch menu on mount
  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((res: ApiResponse<MenuItem[]>) => {
        if (res.success) setMenuItems(res.data);
        else setMenuError("Failed to load menu.");
      })
      .catch(() => setMenuError("Failed to load menu."));
  }, []);

  // Fetch famous combo on mount (optional — silent on failure)
  useEffect(() => {
    fetch("/api/menu/famous-combo")
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setCombo(res.data); })
      .catch(() => {});
  }, []);

  // Socket.io — join table room and listen for live status pushes
  // Runs whenever orderId changes (null → number on place, number → null on reset)
  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();

    function joinRoom() {
      socket.emit("join-table", tableNum);
    }

    const handler = ({
      orderId: incoming,
      status,
    }: {
      orderId: number;
      status: OrderStatus;
    }) => {
      if (incoming === orderId) setOrderStatus(status);
    };

    joinRoom(); // join immediately (also covers already-connected socket)
    socket.on("connect", joinRoom); // re-join after any reconnect
    socket.on("order-status-update", handler);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("order-status-update", handler);
      socket.emit("leave-table", tableNum);
    };
  }, [orderId, tableNum]);

  // Disconnect socket cleanly on page unmount
  useEffect(() => () => disconnectSocket(), []);

  // Derived values
  const grouped = LAYER_ORDER.reduce<Record<LayerType, MenuItem[]>>(
    (acc, lt) => {
      acc[lt] = menuItems.filter((m) => m.layerType === lt);
      return acc;
    },
    { BASE: [], SAUCE: [], CHEESE: [], TOPPING: [] },
  );

  const selectedItems = menuItems.filter((m) => selected.has(m.id));
  const totals = computeTotals(selectedItems);
  const hasBase = selectedItems.some((m) => m.layerType === "BASE");
  const canOrder = hasBase && !orderId;

  function toggle(item: MenuItem) {
    if (orderId) return; // locked after order placed
    setSelected((prev) => {
      const next = new Set(prev);
      if (item.layerType === "BASE" || item.layerType === "SAUCE" || item.layerType === "CHEESE") {
        // radio behaviour — deselect others of same type first
        grouped[item.layerType].forEach((m) => next.delete(m.id));
        if (!prev.has(item.id)) next.add(item.id); // toggle off if already selected
      } else {
        // TOPPING — checkbox
        if (next.has(item.id)) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
    setError(null);
  }

  async function placeOrder() {
    if (!canOrder) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: tableNum, layers: [...selected] }),
      });
      const data: ApiResponse<Order> = await res.json();
      if (data.success) {
        setOrderId(data.data.id);
        setOrderStatus("NEW");
      } else {
        setError(data.errors?.join(" • ") ?? data.message);
      }
    } catch {
      setError("Network error — please retry.");
    } finally {
      setLoading(false);
    }
  }

  function applyCombo(ids: number[]) {
    if (orderId) return;
    const items = menuItems.filter((m) => ids.includes(m.id));
    setSelected(new Set(items.map((i) => i.id)));
    setComboDismissed(true);
    setError(null);
  }

  function resetOrder() {
    setSelected(new Set());
    setOrderId(null);
    setOrderStatus(null);
    setError(null);
    setComboDismissed(false);
  }

  const currentStepIndex = orderStatus
    ? STATUS_STEPS.indexOf(orderStatus)
    : -1;

  return (
    <div className="min-h-screen bg-void text-cream flex flex-col items-center justify-start px-4 py-12">
      {/* Header */}
      <div className="w-full max-w-5xl mb-8">
        <p className="text-xs font-mono uppercase tracking-[0.35em] text-cheese mb-2">
          Pizza3.14 — Table {tableNum}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Test Order Form
        </h1>
        <p className="text-sm text-cream/50 mt-1">
          Build an order, confirm live nutrition + bill, then track it through
          the kitchen.
        </p>
      </div>

      {menuError && (
        <div className="w-full max-w-5xl mb-6 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-sm">
          {menuError}
        </div>
      )}

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6">
        {/* ── LEFT: Ingredient Selector ── */}
        <div className="flex flex-col gap-4">
          {combo && !comboDismissed && !orderId && (
            <ComboBanner
              combo={combo}
              onApply={applyCombo}
              onDismiss={() => setComboDismissed(true)}
            />
          )}

          <div className="bg-glass border border-ash rounded-2xl p-6 flex flex-col gap-7">
          <p className="text-[11px] font-mono uppercase tracking-widest text-cheese">
            Select Ingredients
          </p>

          {menuItems.length === 0 && !menuError && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-ash/30 animate-pulse" />
              ))}
            </div>
          )}

          {LAYER_ORDER.map((lt) =>
            grouped[lt].length === 0 ? null : (
              <div key={lt}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-3">
                  {LAYER_LABELS[lt]}
                </p>
                <div className="flex flex-col gap-2">
                  {grouped[lt].map((item) => {
                    const isSelected = selected.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggle(item)}
                        disabled={!!orderId}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left
                          ${isSelected
                            ? "bg-ember/15 border-ember text-cream"
                            : "bg-glass border-ash text-cream/70 hover:border-ember/50 hover:text-cream"
                          }
                          ${orderId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                              ${isSelected ? "border-ember bg-ember" : "border-ash"}`}
                          >
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-void" />
                            )}
                          </span>
                          {item.name}
                        </span>
                        <span className="font-mono text-ember text-xs">
                          ${item.price.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ),
          )}
          </div>
        </div>

        {/* ── RIGHT: Bill, Nutrition, Actions ── */}
        <div className="flex flex-col gap-5">
          {/* Bill */}
          <div className="bg-glass border border-ash rounded-2xl p-6">
            <p className="text-[11px] font-mono uppercase tracking-widest text-cheese mb-4">
              Bill
            </p>
            {selectedItems.length === 0 ? (
              <p className="text-sm text-cream/40 italic">No items selected yet.</p>
            ) : (
              <div className="flex flex-col gap-1 mb-4">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-cream/80">{item.name}</span>
                    <span className="font-mono text-cream/60">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-ash flex justify-between font-bold">
                  <span className="text-cream">Total</span>
                  <span className="font-mono text-ember text-lg">
                    ${totals.price.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Nutrition */}
          <div className="bg-glass border border-ash rounded-2xl p-6">
            <p className="text-[11px] font-mono uppercase tracking-widest text-cheese mb-4">
              Nutrition
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Calories", value: `${totals.calories} kcal` },
                { label: "Protein", value: `${totals.protein.toFixed(1)} g` },
                { label: "Fat", value: `${totals.fats.toFixed(1)} g` },
                { label: "Carbs", value: `${totals.carbs.toFixed(1)} g` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-void/50 rounded-xl p-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-1">
                    {label}
                  </p>
                  <p className="text-lg font-bold text-cream">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Place Order */}
          {!orderId && (
            <div className="bg-glass border border-ash rounded-2xl p-6">
              {error && (
                <p className="text-sm text-red-400 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                onClick={placeOrder}
                disabled={!canOrder || loading}
                className="w-full py-4 rounded-xl bg-ember text-void font-bold text-base hover:bg-cheese transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Placing Order…" : "Place Order →"}
              </button>
              {!hasBase && (
                <p className="text-xs text-cream/40 text-center mt-2">
                  Select a base to continue
                </p>
              )}
            </div>
          )}

          {/* Order Status Tracker */}
          {orderId && orderStatus && (
            <div className="bg-glass border border-ash rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-mono uppercase tracking-widest text-cheese">
                  Order #{orderId} — Live Status
                </p>
              </div>

              {/* Step bar */}
              <div className="flex items-start gap-1">
                {STATUS_STEPS.map((step, i) => {
                  const isActive = i === currentStepIndex;
                  const isDone = i < currentStepIndex;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center gap-2">
                      {/* Dot */}
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                          ${isActive ? "border-ember bg-ember/20 text-ember" : isDone ? "border-cream/40 bg-cream/10 text-cream/60" : "border-ash bg-transparent text-ash"}`}
                      >
                        {isDone ? "✓" : i + 1}
                        {isActive && (
                          <span className="absolute w-8 h-8 rounded-full border-2 border-ember animate-ping opacity-40" />
                        )}
                      </div>
                      {/* Label */}
                      <span
                        className={`text-[9px] font-mono uppercase tracking-widest text-center leading-tight
                          ${isActive ? "text-ember" : isDone ? "text-cream/50" : "text-ash"}`}
                      >
                        {step}
                      </span>
                      {/* Connector line */}
                      {i < STATUS_STEPS.length - 1 && (
                        <div className="hidden" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Connector line between dots (desktop) */}
              <div className="relative mt-2 h-px">
                <div className="absolute inset-0 bg-ash" />
                <div
                  className="absolute inset-y-0 left-0 bg-ember transition-all duration-700"
                  style={{
                    width: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%`,
                  }}
                />
              </div>

              {orderStatus === "SERVED" && orderId && (
                <FeedbackForm orderId={orderId} onStartNewOrder={resetOrder} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
