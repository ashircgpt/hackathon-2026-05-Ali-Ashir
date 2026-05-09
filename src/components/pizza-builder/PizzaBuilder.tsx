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
import BuildStepper from "./BuildStepper";
import DoughStep from "./DoughStep";
import SizeStep from "./SizeStep";
import IngredientStep from "./IngredientStep";
import ReviewStep from "./ReviewStep";
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

  // Fetch combo (silent)
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

  // ── Derived values ─────────────────────────────────────────────────────────
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
      s.add("SIZE"); // size always has a default
    }
    if (selectedSauce) s.add("SAUCE");
    if (selectedCheese) s.add("CHEESE");
    if (selectedSauce && selectedCheese) s.add("TOPPINGS"); // toppings optional
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

  // ── Selection actions ──────────────────────────────────────────────────────
  function applyIngredient(item: MenuItem) {
    if (orderId) return;
    setError(null);
    setSelected((prev) => {
      if (item.layerType === "TOPPING") {
        const exists = prev.some((p) => p.id === item.id);
        return exists ? removeLayer(prev, item.id) : addLayer(prev, item);
      }
      // BASE/SAUCE/CHEESE: re-tap same id clears it; otherwise replace
      const same = prev.find(
        (p) => p.layerType === item.layerType && p.id === item.id,
      );
      if (same) return removeLayer(prev, item.id);
      return addLayer(prev, item);
    });
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

  // ── Step navigation ────────────────────────────────────────────────────────
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

  // ── Order ──────────────────────────────────────────────────────────────────
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

  // ── Phase rendering ────────────────────────────────────────────────────────
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

  // ── BUILD phase render helpers ─────────────────────────────────────────────
  const isReview = buildStep === "REVIEW";
  const stepIdx = BUILD_STEPS.indexOf(buildStep);

  function renderStepControls() {
    switch (buildStep) {
      case "DOUGH":
        return (
          <DoughStep
            bases={grouped.BASE}
            selectedId={selectedBase?.id ?? null}
            onSelect={applyIngredient}
          />
        );
      case "SIZE":
        return <SizeStep size={pizzaSize} onChange={setPizzaSize} />;
      case "SAUCE":
        return (
          <IngredientStep
            layerType="SAUCE"
            items={grouped.SAUCE}
            selectedIds={selectedIdsByLayer.SAUCE}
            onApply={applyIngredient}
            dropTargetRef={canvasRef}
            stepLabel="Step 3 — Add a sauce"
            helper="Tap a sauce or drag it onto the pizza."
            variant="pill"
          />
        );
      case "CHEESE":
        return (
          <IngredientStep
            layerType="CHEESE"
            items={grouped.CHEESE}
            selectedIds={selectedIdsByLayer.CHEESE}
            onApply={applyIngredient}
            dropTargetRef={canvasRef}
            stepLabel="Step 4 — Add cheese"
            helper="Pick a cheese — drag or tap."
            variant="pill"
          />
        );
      case "TOPPINGS":
        return (
          <IngredientStep
            layerType="TOPPING"
            items={grouped.TOPPING}
            selectedIds={selectedIdsByLayer.TOPPING}
            onApply={applyIngredient}
            dropTargetRef={canvasRef}
            stepLabel="Step 5 — Add toppings"
            helper="Stack as many as you like — tap again to remove."
            variant="tile"
            selectedToppingsCount={selectedToppings.length}
          />
        );
      case "REVIEW":
        return (
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
        );
    }
  }

  return (
    <main className="min-h-screen bg-void text-cream px-4 py-6 md:py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">
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

          {/* Compact totals strip */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-smoke">
              Total{" "}
              <span className="text-ember font-bold ml-1">
                ${totals.price.toFixed(2)}
              </span>
            </span>
            <span className="text-smoke">
              <span className="text-cream font-bold">{totals.calories}</span>{" "}
              kcal
            </span>
          </div>
        </header>

        {menuError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-sm">
            {menuError}
          </div>
        )}

        {/* Famous combo mini-banner */}
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

        {/* Stepper */}
        <BuildStepper
          current={buildStep}
          completed={completedSteps}
          onJump={jumpTo}
        />

        {/* Canvas + step controls */}
        {isReview ? (
          <div className="flex flex-col items-center gap-6">
            <PizzaCanvas
              ref={canvasRef}
              layers={selected}
              size={pizzaSize}
              glow
            />
            {renderStepControls()}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 items-center">
            {/* Pizza canvas */}
            <div className="flex justify-center">
              <PizzaCanvas
                ref={canvasRef}
                layers={selected}
                size={pizzaSize}
              />
            </div>

            {/* Step controls */}
            <div className="bg-glass border border-ash rounded-3xl p-5 sm:p-6 flex flex-col gap-5">
              {renderStepControls()}

              {/* Footer nav */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-ash/60">
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
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
