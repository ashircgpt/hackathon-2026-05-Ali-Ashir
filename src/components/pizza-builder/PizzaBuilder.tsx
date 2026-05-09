"use client";

import { useEffect, useMemo, useState } from "react";
import { addLayer, hasBase, removeLayer } from "@/lib/layer-rules";
import { computeTotals } from "@/lib/nutrition";
import { getSocket, disconnectSocket } from "@/lib/socket-client";
import type {
  ApiResponse,
  MenuItem,
  Order,
  OrderStatus,
} from "@/types";

import PizzaCanvas from "./PizzaCanvas";
import IngredientOrbit from "./IngredientOrbit";
import NutritionPanel from "./NutritionPanel";
import BillPanel from "./BillPanel";
import CombosBanner from "./CombosBanner";
import WaitingPhase from "./WaitingPhase";
import ServedPhase from "./ServedPhase";

interface Props {
  tableId: string;
}

type Combo = { ingredients: MenuItem[]; count: number };

export default function PizzaBuilder({ tableId }: Props) {
  const tableNum = parseInt(tableId, 10) || 1;

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MenuItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [combo, setCombo] = useState<Combo | null>(null);
  const [comboDismissed, setComboDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  // Fetch menu
  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((res: ApiResponse<MenuItem[]>) => {
        if (res.success) {
          setMenu(res.data.filter((m) => m.isAvailable));
        } else {
          setMenuError("Failed to load menu.");
        }
      })
      .catch(() => setMenuError("Failed to load menu."));
  }, []);

  // Fetch famous combo (silent on failure)
  useEffect(() => {
    fetch("/api/menu/famous-combo")
      .then((r) => r.json())
      .then((res: ApiResponse<Combo | null>) => {
        if (res.success && res.data) setCombo(res.data);
      })
      .catch(() => {});
  }, []);

  // Socket — join table room and listen for status pushes
  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();

    const joinRoom = () => socket.emit("join-table", tableNum);
    const handler = ({
      orderId: incoming,
      status,
    }: {
      orderId: number;
      status: OrderStatus;
    }) => {
      if (incoming === orderId) setOrderStatus(status);
    };

    joinRoom();
    socket.on("connect", joinRoom);
    socket.on("order-status-update", handler);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("order-status-update", handler);
      socket.emit("leave-table", tableNum);
    };
  }, [orderId, tableNum]);

  // Disconnect on unmount
  useEffect(() => () => disconnectSocket(), []);

  const totals = useMemo(() => computeTotals(selected), [selected]);
  const baseSelected = hasBase(selected);
  const canPlace = baseSelected && !placing;
  const locked = orderId !== null;

  const selectedIds = useMemo(
    () => new Set(selected.map((s) => s.id)),
    [selected],
  );

  function toggle(item: MenuItem) {
    if (locked) return;
    setError(null);
    setSelected((prev) => {
      // Re-tap a TOPPING removes it; re-tap radio just no-ops (already selected)
      if (item.layerType === "TOPPING") {
        const exists = prev.some((p) => p.id === item.id);
        return exists ? removeLayer(prev, item.id) : addLayer(prev, item);
      }
      // BASE/SAUCE/CHEESE: re-tapping the SAME selection clears it; otherwise replace
      const same = prev.find(
        (p) => p.layerType === item.layerType && p.id === item.id,
      );
      if (same) return removeLayer(prev, item.id);
      return addLayer(prev, item);
    });
  }

  function removeById(id: number) {
    if (locked) return;
    setError(null);
    setSelected((prev) => removeLayer(prev, id));
  }

  function applyCombo(ids: number[]) {
    if (locked) return;
    const items = menu.filter((m) => ids.includes(m.id));
    // Build the array in layer order so canvas stack reads correctly
    const ordered: MenuItem[] = [];
    (["BASE", "SAUCE", "CHEESE", "TOPPING"] as const).forEach((lt) => {
      items.filter((i) => i.layerType === lt).forEach((i) => ordered.push(i));
    });
    setSelected(ordered);
    setComboDismissed(true);
    setError(null);
  }

  async function placeOrder() {
    if (!canPlace) return;
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableNum,
          layers: selected.map((s) => s.id),
        }),
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
      setPlacing(false);
    }
  }

  // ── Render branches ─────────────────────────────────────────────────────────
  if (orderId && orderStatus === "SERVED") {
    return (
      <main className="min-h-screen bg-void text-cream flex items-center justify-center px-4 py-12">
        <ServedPhase orderId={orderId} tableNum={tableNum} />
      </main>
    );
  }

  if (orderId && orderStatus && orderStatus !== "SERVED") {
    return (
      <main className="min-h-screen bg-void text-cream flex items-center justify-center px-4 py-12">
        <WaitingPhase
          orderId={orderId}
          tableNum={tableNum}
          status={orderStatus}
        />
      </main>
    );
  }

  // BUILD phase
  return (
    <main className="min-h-screen bg-void text-cream px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="text-center md:text-left">
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cheese mb-2">
            Pizza3.14 — Table {tableNum}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Build your pizza
          </h1>
          <p className="text-xs text-cream/50 mt-1">
            Tap ingredients on the orbit to layer them onto your pizza.
          </p>
        </header>

        {menuError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-sm">
            {menuError}
          </div>
        )}

        {/* Combo banner */}
        {combo && !comboDismissed && (
          <CombosBanner
            combo={combo}
            onApply={applyCombo}
            onDismiss={() => setComboDismissed(true)}
          />
        )}

        {/* Main grid: left dock — orbit+canvas — right dock */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-6 items-start">
          {/* Left: Nutrition */}
          <aside className="lg:sticky lg:top-6 order-2 lg:order-1">
            <NutritionPanel totals={totals} />
          </aside>

          {/* Center: Orbit + Canvas */}
          <section className="order-1 lg:order-2 flex justify-center">
            {menu.length === 0 ? (
              <div className="aspect-square w-full max-w-[600px] rounded-2xl bg-glass border border-ash animate-pulse" />
            ) : (
              <IngredientOrbit
                items={menu}
                selectedIds={selectedIds}
                onSelect={toggle}
                locked={locked}
              >
                <PizzaCanvas layers={selected} size="lg" />
              </IngredientOrbit>
            )}
          </section>

          {/* Right: Bill + Place Order */}
          <aside className="lg:sticky lg:top-6 order-3">
            <BillPanel
              items={selected}
              totals={totals}
              onRemove={removeById}
              onPlaceOrder={placeOrder}
              canPlace={canPlace}
              placing={placing}
              hasBase={baseSelected}
              error={error}
              locked={locked}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
