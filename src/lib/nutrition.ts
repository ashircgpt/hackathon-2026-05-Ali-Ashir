// Pure nutrition and pricing calculations — no DB calls, no side effects.
// Used by: NutritionPanel (client) and POST /api/orders (server).
// See src/lib/CLAUDE.md for test expectations.
// TODO Milestone pizza builder: activate when MenuItem type is available from DB.

import type { MenuItem, NutritionTotals } from "@/types";

export function computeTotals(layers: MenuItem[]): NutritionTotals {
  const totals = layers.reduce(
    (acc, item) => ({
      price: acc.price + item.price,
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      fats: acc.fats + item.fats,
      carbs: acc.carbs + item.carbs,
    }),
    { price: 0, calories: 0, protein: 0, fats: 0, carbs: 0 },
  );

  return {
    ...totals,
    price: Math.round(totals.price * 100) / 100,
  };
}
