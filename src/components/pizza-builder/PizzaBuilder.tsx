"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addLayer, hasBase, removeLayer } from "@/lib/layer-rules";
import { computeTotals } from "@/lib/nutrition";
import { getSocket, disconnectSocket } from "@/lib/socket-client";
import type {
  ApiResponse,
  MenuItem,
  Order,
  OrderStatus,
} from "@/types";

import PizzaCanvas, {
  type PizzaCanvasHandle,
  type PizzaSize,
} from "./PizzaCanvas";
import RotatingOrbit from "./RotatingOrbit";
import BuildStepper from "./BuildStepper";
import DoughStep from "./DoughStep";
import SizeStep from "./SizeStep";
import OrbitStep from "./OrbitStep";
import ReviewStep from "./ReviewStep";
import NutritionPanel from "./NutritionPanel";
import BillPanel from "./BillPanel";
import WaitingPhase from "./WaitingPhase";
import ServedPhase from "./ServedPhase";

export type BuildStep =
  | "DOUGH"
  | "SIZE"
  | "SAUCE"
  | "CHEESE"
  | "TOPPINGS"
  | "REVIEW";

const BUILD_STEPS: BuildStep[] = [
  "DOUGH",
  "SIZE",
  "SAUCE",
  "CHEESE",
  "TOPPINGS",
  "REVIEW",
];

const SIZE_ORDER: PizzaSize[] = ["SMALL", "MEDIUM", "LARGE"];

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

  const [buildStep, setBuildStep] = useState<BuildStep>("DOUGH");
  const [pizzaSize, setPizzaSize] = useState<PizzaSize>("MEDIUM");

  const canvasRef = useRef<PizzaCanvasHandle>(null);

  // Fetch menu
  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((res: ApiResponse<MenuItem[]>) => {
        if (res.success) setMenu(res.data.filter((m) => m.isAvailable));
        else setMenuError("Failed to load menu.");
      })
      .catch(() => setMenuError("Failed to load menu."));
  }, []);

  // Fetch combo
  useEffect(() => {
    fetch("/api/menu/famous-combo")
      .then((r) => r.json())
      .then((res: ApiResponse<Combo | null>) => {
        if (res.success && res.data) setCombo(res.data);
      })
      .catch(() => {});
  }, []);

  // Socket
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

  useEffect(() => () => disconnectSocket(), []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const out: Record<"BASE" | "SAUCE" | "CHEESE" | "TOPPING", MenuItem[]> = {
      BASE: [],
      SAUCE: [],
      CHEESE: [],
      TOPPING: [],
    };
    menu.forEach((m) => {
      out[m.layerType].push(m);
    });
    return out;
  }, [menu]);

  const selectedBase = selected.find((s) => s.layerType === "BASE");
  const selectedSauce = selected.find((s) => s.layerType === "SAUCE");
  const selectedCheese = selected.find((s) => s.layerType === "CHEESE");
  const selectedToppings = useMemo(
    () => selected.filter((s) => s.layerType === "TOPPING"),
    [selected],
  );

  const totals = useMemo(() => computeTotals(selected), [selected]);
  const baseSelected = hasBase(selected);
  const canPlace =
    baseSelected && !!selectedSauce && !!selectedCheese && !placing;

  const completedSteps = useMemo(() => {
    const s = new Set<BuildStep>();
    if (selectedBase) {
      s.add("DOUGH");
      s.add("SIZE");
    }
    if (selectedSauce) s.add("SAUCE");
    if (selectedCheese) s.add("CHEESE");
    if (selectedSauce && selectedCheese) s.add("TOPPINGS");
    return s;
  }, [selectedBase, selectedSauce, selectedCheese]);

  const selectedIdsByLayer = useMemo(() => {
    return {
      BASE: new Set(selected.filter((s) => s.layerType === "BASE").map((s) => s.id)),
      SAUCE: new Set(selected.filter((s) => s.layerType === "SAUCE").map((s) => s.id)),
      CHEESE: new Set(selected.filter((s) => s.layerType === "CHEESE").map((s) => s.id)),
      TOPPING: new Set(selected.filter((s) => s.layerType === "TOPPING").map((s) => s.id)),
    };
  }, [selected]);

  // ── Selection actions ─────────────────────────────────────────────────────
  function applyIngredient(item: MenuItem) {
    if (orderId) return;
    setError(null);
    setSelected((prev) => {
      if (item.layerType === "TOPPING") {
        const exists = prev.some((p) => p.id === item.id);
        return exists ? removeLayer(prev, item.id) : addLayer(prev, item);
      }
      const same = prev.find(
        (p) => p.layerType === item.layerType && p.id === item.id,
      );
      if (same) return removeLayer(prev, item.id);
      return addLayer(prev, item);
    });
  }

  function removeById(id: number) {
    if (orderId) return;
    setSelected((prev) => removeLayer(prev, id));
  }

  function applyCombo() {
    if (orderId || !combo) return;
    const ids = combo.ingredients.map((i) => i.id);
    const items = menu.filter((m) => ids.includes(m.id));
    const ordered: MenuItem[] = [];
    (["BASE", "SAUCE", "CHEESE", "TOPPING"] as const).forEach((lt) => {
      items.filter((i) => i.layerType === lt).forEach((i) => ordered.push(i));
    });
    setSelected(ordered);
    setPizzaSize("MEDIUM");
    setComboDismissed(true);
    setError(null);
    setBuildStep("REVIEW");
  }

  // Cycle dough via swipe (or arrow click)
  function cycleDough(dir: -1 | 1) {
    if (orderId || grouped.BASE.length === 0) return;
    const current = selectedBase
      ? grouped.BASE.findIndex((b) => b.id === selectedBase.id)
      : -1;
    const next =
      current < 0
        ? 0
        : (current + (dir > 0 ? 1 : -1) + grouped.BASE.length) %
          grouped.BASE.length;
    const target = grouped.BASE[next];
    if (!target) return;
    setSelected((prev) => {
      const without = prev.filter((p) => p.layerType !== "BASE");
      return [target, ...without];
    });
  }

  // Adjust size via pinch / scroll
  function bumpSize(delta: -1 | 1) {
    if (orderId) return;
    const idx = SIZE_ORDER.indexOf(pizzaSize);
    const next = Math.max(0, Math.min(SIZE_ORDER.length - 1, idx + delta));
    if (next !== idx) setPizzaSize(SIZE_ORDER[next]);
  }

  // ── Step navigation ───────────────────────────────────────────────────────
  function canAdvance(from: BuildStep): boolean {
    switch (from) {
      case "DOUGH":
        return !!selectedBase;
      case "SIZE":
        return !!selectedBase;
      case "SAUCE":
        return !!selectedSauce;
      case "CHEESE":
        return !!selectedCheese;
      case "TOPPINGS":
        return true;
      case "REVIEW":
        return canPlace;
    }
  }

  function goNext() {
    const idx = BUILD_STEPS.indexOf(buildStep);
    if (idx < 0 || idx >= BUILD_STEPS.length - 1) return;
    if (!canAdvance(buildStep)) return;
    setBuildStep(BUILD_STEPS[idx + 1]);
  }

  function goBack() {
    const idx = BUILD_STEPS.indexOf(buildStep);
    if (idx <= 0) return;
    setBuildStep(BUILD_STEPS[idx - 1]);
  }

  function jumpTo(step: BuildStep) {
    if (orderId) return;
    if (completedSteps.has(step) || step === buildStep) {
      setBuildStep(step);
    }
  }

  // ── Order ─────────────────────────────────────────────────────────────────
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

  // ── Phase rendering ───────────────────────────────────────────────────────
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

  // ── BUILD render helpers ──────────────────────────────────────────────────
  const isReview = buildStep === "REVIEW";
  const stepIdx = BUILD_STEPS.indexOf(buildStep);

  // Decide what occupies the canvas area for the current step
  function renderCanvasArea() {
    const orbitItems =
      buildStep === "SAUCE"
        ? grouped.SAUCE
        : buildStep === "CHEESE"
          ? grouped.CHEESE
          : buildStep === "TOPPINGS"
            ? grouped.TOPPING
            : null;

    const orbitSelectedIds =
      buildStep === "SAUCE"
        ? selectedIdsByLayer.SAUCE
        : buildStep === "CHEESE"
          ? selectedIdsByLayer.CHEESE
          : buildStep === "TOPPINGS"
            ? selectedIdsByLayer.TOPPING
            : new Set<number>();

    const swipeProps =
      buildStep === "DOUGH"
        ? {
            onSwipe: cycleDough,
            swipeHint: { left: "Previous dough", right: "Next dough" },
          }
        : {};

    const pinchProps = buildStep === "SIZE" ? { onPinch: bumpSize } : {};

    const canvas = (
      <PizzaCanvas
        ref={canvasRef}
        layers={selected}
        size={pizzaSize}
        glow={isReview}
        {...swipeProps}
        {...pinchProps}
      />
    );

    if (orbitItems && orbitItems.length > 0) {
      return (
        <RotatingOrbit
          items={orbitItems}
          selectedIds={orbitSelectedIds}
          onApply={applyIngredient}
          dropTargetRef={canvasRef}
        >
          {canvas}
        </RotatingOrbit>
      );
    }

    return canvas;
  }

  function renderStepBlurb() {
    switch (buildStep) {
      case "DOUGH":
        return (
          <DoughStep
            bases={grouped.BASE}
            selectedId={selectedBase?.id ?? null}
          />
        );
      case "SIZE":
        return <SizeStep size={pizzaSize} onChange={setPizzaSize} />;
      case "SAUCE":
        return (
          <OrbitStep
            stepLabel="Step 3 — Pour the sauce"
            helper="Drag a sauce from the orbit onto the pizza, or tap it to add."
          />
        );
      case "CHEESE":
        return (
          <OrbitStep
            stepLabel="Step 4 — Top with cheese"
            helper="Grab a cheese and slide it onto your pizza, or tap to add."
          />
        );
      case "TOPPINGS":
        return (
          <OrbitStep
            stepLabel="Step 5 — Stack the toppings"
            helper="Drag as many toppings as you like onto the pizza. Tap an existing topping to remove it."
            selectedCount={selectedToppings.length}
            selectedNoun="topping"
          />
        );
      case "REVIEW":
        return null;
    }
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-void text-cream px-4 py-5 md:py-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cheese mb-1">
              Pizza3.14 — Table {tableNum}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Build your pizza
            </h1>
          </div>
        </header>

        {menuError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-sm">
            {menuError}
          </div>
        )}

        {/* Combo mini-banner */}
        {combo && !comboDismissed && !isReview && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-glass border border-ember/40">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cheese shrink-0">
                🔥 Most Famous Combo
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cheese/15 text-cheese border border-cheese/30 shrink-0">
                Ordered {combo.count}×
              </span>
              <span className="text-xs text-cream/70 truncate">
                {combo.ingredients.map((i) => i.name).join(" · ")}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={applyCombo}
                className="px-3 py-1.5 rounded-full bg-ember text-void text-xs font-bold hover:bg-cheese transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setComboDismissed(true)}
                aria-label="Dismiss combo suggestion"
                className="w-7 h-7 rounded-full text-smoke hover:text-cream hover:bg-ash/40 transition-colors text-base leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <BuildStepper
          current={buildStep}
          completed={completedSteps}
          onJump={jumpTo}
        />

        {isReview ? (
          <div className="flex flex-col items-center gap-6">
            {renderCanvasArea()}
            <ReviewStep
              base={selectedBase}
              sauce={selectedSauce}
              cheese={selectedCheese}
              toppings={selectedToppings}
              size={pizzaSize}
              totals={totals}
              onEdit={(s) => setBuildStep(s)}
              onPlaceOrder={placeOrder}
              canPlace={canPlace}
              placing={placing}
              error={error}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-6 items-start">
            {/* Left: Nutrition */}
            <aside className="lg:sticky lg:top-4 order-2 lg:order-1">
              <NutritionPanel totals={totals} />
            </aside>

            {/* Center: Canvas + step copy + nav */}
            <section className="order-1 lg:order-2 flex flex-col items-center gap-5">
              <div className="w-full flex justify-center">
                {renderCanvasArea()}
              </div>

              <div className="w-full max-w-xl">{renderStepBlurb()}</div>

              {/* Footer nav */}
              <div className="flex items-center justify-between gap-3 w-full max-w-md pt-2">
                <button
                  onClick={goBack}
                  disabled={stepIdx <= 0}
                  className="px-4 py-2.5 rounded-xl border border-ash text-smoke text-sm hover:border-cream/40 hover:text-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Back
                </button>

                <span className="text-[10px] font-mono uppercase tracking-widest text-smoke">
                  Step {stepIdx + 1} of {BUILD_STEPS.length}
                </span>

                <button
                  onClick={goNext}
                  disabled={!canAdvance(buildStep)}
                  className="px-5 py-2.5 rounded-xl bg-ember text-void text-sm font-bold hover:bg-cheese transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {stepIdx === BUILD_STEPS.length - 2
                    ? "Review Order →"
                    : "Next →"}
                </button>
              </div>
            </section>

            {/* Right: Bill */}
            <aside className="lg:sticky lg:top-4 order-3">
              <BillPanel
                items={selected}
                totals={totals}
                onRemove={removeById}
                locked={!!orderId}
              />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
