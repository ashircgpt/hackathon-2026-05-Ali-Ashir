'use client';

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Pizza } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PizzaCanvas } from "./PizzaCanvas";
import { PizzaSizeSelector } from "./PizzaSizeSelector";
import { LayerPalette } from "./LayerPalette";
import { SelectedLayersPanel } from "./SelectedLayersPanel";
import { NutritionPanel } from "./NutritionPanel";
import { OrderSummary } from "./OrderSummary";
import { addLayer, removeLayer, hasBase } from "@/lib/layer-rules";
import type { MenuItem, Order } from "@/types";
import type { PizzaSize } from "@/lib/pizza-size";

interface PizzaBuilderProps {
  tableId: string;
}

export function PizzaBuilder({ tableId }: PizzaBuilderProps) {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [menuItems,     setMenuItems]     = useState<MenuItem[]>([]);
  const [selectedLayers, setSelectedLayers] = useState<MenuItem[]>([]);
  const [size,          setSize]          = useState<PizzaSize>("MEDIUM");
  const [placedOrder,   setPlacedOrder]   = useState<Order | null>(null);
  const [placedSize,    setPlacedSize]    = useState<PizzaSize | null>(null);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [isOrdering,    setIsOrdering]    = useState(false);
  const [orderError,    setOrderError]    = useState<string | null>(null);
  const [menuError,     setMenuError]     = useState<string | null>(null);

  // ── Interaction state ────────────────────────────────────────────────────────
  const [activeItem,  setActiveItem]  = useState<MenuItem | null>(null);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  // ── Refs for wheel/pinch (passive: false requires addEventListener) ──────────
  const canvasWrapperRef  = useRef<HTMLDivElement>(null);
  const sizeRef           = useRef<PizzaSize>("MEDIUM");
  const wheelThrottleRef  = useRef(false);
  const touchDistRef      = useRef<number | null>(null);

  // ── Menu fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setMenuItems(json.data);
        else setMenuError(json.message ?? "Failed to load menu");
      })
      .catch(() => setMenuError("Failed to load menu"))
      .finally(() => setIsMenuLoading(false));
  }, []);

  // ── Keep sizeRef in sync so wheel handler can read current size ──────────────
  useEffect(() => { sizeRef.current = size; }, [size]);

  // ── Wheel + touch pinch size control ─────────────────────────────────────────
  useEffect(() => {
    const el = canvasWrapperRef.current;
    if (!el) return;

    const SIZES: PizzaSize[] = ["SMALL", "MEDIUM", "LARGE"];
    const step = (dir: 1 | -1) => {
      if (wheelThrottleRef.current) return;
      wheelThrottleRef.current = true;
      setTimeout(() => { wheelThrottleRef.current = false; }, 600);
      setSize((prev) => {
        const i = SIZES.indexOf(prev);
        return SIZES[Math.max(0, Math.min(2, i + dir))];
      });
    };

    // Mouse wheel (scroll up = larger) AND trackpad pinch (ctrlKey: true)
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      step(e.deltaY < 0 ? 1 : -1);
    };

    // Two-finger touch pinch
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        touchDistRef.current = Math.hypot(dx, dy);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || touchDistRef.current === null) return;
      e.preventDefault();
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const newDist = Math.hypot(dx, dy);
      const delta = newDist - touchDistRef.current;
      if (Math.abs(delta) > 30) {
        step(delta > 0 ? 1 : -1);
        touchDistRef.current = newDist;
      }
    };
    const onTouchEnd = () => { touchDistRef.current = null; };

    el.addEventListener("wheel",      onWheel,      { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true  });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd);

    return () => {
      el.removeEventListener("wheel",      onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, []); // empty deps — reads size via sizeRef

  // ── dnd-kit sensors ──────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { distance: 8 } }),
  );

  // ── Layer handlers ────────────────────────────────────────────────────────────
  function handleAdd(item: MenuItem) {
    setSelectedLayers((prev) => addLayer(prev, item));
    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 500);
  }

  function handleRemove(id: number) {
    setSelectedLayers((prev) => removeLayer(prev, id));
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────────
  function handleDragStart(event: DragStartEvent) {
    setActiveItem(event.active.data.current?.item as MenuItem ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.over?.id === "pizza-canvas" && activeItem) handleAdd(activeItem);
    setActiveItem(null);
  }

  // ── Order placement ────────────────────────────────────────────────────────────
  async function handlePlaceOrder() {
    setIsOrdering(true);
    setOrderError(null);
    const frozenSize = size;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: Number(tableId),
          layers: selectedLayers.map((l) => l.id),
          // TODO: persist size to DB in a later milestone (requires schema change)
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? "Order failed");
      setPlacedOrder(json.data as Order);
      setPlacedSize(frozenSize);
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : "Order failed");
    } finally {
      setIsOrdering(false);
    }
  }

  function handleReset() {
    setSelectedLayers([]);
    setSize("MEDIUM");
    setPlacedOrder(null);
    setPlacedSize(null);
    setOrderError(null);
  }

  const canOrder = hasBase(selectedLayers) && !isOrdering && placedOrder === null;

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">

        {/* ── Thin header ── */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
              <Pizza className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <span className="font-bold text-sm tracking-tight">Pizza3.14</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Table #{tableId}
            </span>
            {selectedLayers.length > 0 && (
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
                {selectedLayers.length} layer{selectedLayers.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </header>

        {/* ── Canvas zone — flex-1, takes all available height ── */}
        <div
          ref={canvasWrapperRef}
          className="flex-1 flex flex-col items-center justify-center gap-5 overflow-hidden p-4"
        >
          {isMenuLoading ? (
            <div className="w-[560px] h-[560px] rounded-full bg-secondary/50 animate-pulse" />
          ) : (
            <PizzaCanvas layers={selectedLayers} size={size} justAddedId={justAddedId} />
          )}

          {/* Size selector + selected layer chips */}
          <div className="flex items-center gap-6">
            <PizzaSizeSelector value={size} onChange={setSize} />
            {selectedLayers.length > 0 && (
              <SelectedLayersPanel layers={selectedLayers} onRemove={handleRemove} />
            )}
          </div>

          {/* Order confirmation — appears inline after order placed */}
          {placedOrder && placedSize && (
            <OrderSummary order={placedOrder} size={placedSize} onReset={handleReset} />
          )}
        </div>

        {/* ── Bottom glass tray ── */}
        <div className="shrink-0 glass-tray border-t border-border/40">

          {/* Ingredient tab tray */}
          {menuError ? (
            <p className="text-xs text-destructive px-4 py-3">{menuError}</p>
          ) : (
            <LayerPalette items={menuItems} selectedLayers={selectedLayers} onAdd={handleAdd} />
          )}

          {/* HUD bar: nutrition stats + Place Order */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/30">
            <NutritionPanel layers={selectedLayers} size={size} />
            <div className="flex items-center gap-3">
              {!hasBase(selectedLayers) && selectedLayers.length > 0 && (
                <span className="text-[11px] text-muted-foreground">Add a base first</span>
              )}
              {orderError && (
                <span className="text-xs text-destructive">{orderError}</span>
              )}
              <Button
                onClick={handlePlaceOrder}
                disabled={!canOrder}
                aria-disabled={!canOrder}
                className={cn("transition-all", canOrder && "glow-primary")}
              >
                {isOrdering ? "Placing Order…" : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drag overlay — floating ingredient preview follows cursor ── */}
      <DragOverlay dropAnimation={null}>
        {activeItem && (
          <div className="w-16 h-16 rounded-full bg-card/95 border-2 border-primary/60 overflow-hidden shadow-xl pointer-events-none">
            <img
              src={activeItem.imageUrl}
              alt={activeItem.name}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
