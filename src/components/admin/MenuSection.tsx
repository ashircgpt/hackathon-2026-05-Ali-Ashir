"use client";

import { useEffect, useState } from "react";
import type { MenuItem, LayerType, ApiResponse } from "@/types";

const LAYER_ORDER: LayerType[] = ["BASE", "SAUCE", "CHEESE", "TOPPING"];
const LAYER_LABELS: Record<LayerType, string> = {
  BASE: "Bases",
  SAUCE: "Sauces",
  CHEESE: "Cheeses",
  TOPPING: "Toppings",
};

export default function MenuSection() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/admin/menu")
      .then((r) => r.json())
      .then((res: ApiResponse<MenuItem[]>) => {
        if (res.success) setItems(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggle(item: MenuItem) {
    setToggling((prev) => new Set([...prev, item.id]));
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      const data: ApiResponse<MenuItem> = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((m) => (m.id === item.id ? data.data : m)),
        );
      }
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  const grouped = LAYER_ORDER.reduce<Record<LayerType, MenuItem[]>>(
    (acc, lt) => {
      acc[lt] = items.filter((m) => m.layerType === lt);
      return acc;
    },
    { BASE: [], SAUCE: [], CHEESE: [], TOPPING: [] },
  );

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cheese mb-2">
          Inventory
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
        <p className="text-sm text-smoke mt-1">
          Toggle ingredients on or off. Changes take effect immediately.
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-glass border border-ash animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {LAYER_ORDER.map((lt) => (
            <div key={lt}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-4">
                {LAYER_LABELS[lt]} — {grouped[lt].length} items
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[lt].map((item) => {
                  const isToggling = toggling.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`bg-glass border rounded-2xl p-5 flex items-center gap-4 transition-all
                        ${item.isAvailable ? "border-ash" : "border-ash opacity-50"}`}
                    >
                      {/* Photo */}
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-ash"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 rounded-full bg-void/60 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">OFF</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-cream text-sm truncate">{item.name}</p>
                        <p className="text-[10px] font-mono text-smoke mt-0.5">
                          {item.layerType} · ${item.price.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-smoke mt-0.5">
                          {item.calories} kcal
                        </p>
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={() => toggle(item)}
                        disabled={isToggling}
                        aria-label={item.isAvailable ? `Disable ${item.name}` : `Enable ${item.name}`}
                        className={`relative w-11 h-6 rounded-full transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-void
                          ${item.isAvailable ? "bg-status-ready" : "bg-ash"}
                          ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-void rounded-full shadow transition-transform
                            ${item.isAvailable ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
