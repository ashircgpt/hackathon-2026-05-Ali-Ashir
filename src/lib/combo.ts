// Shared helper: compute the most frequently ordered ingredient combo.
// Used by GET /api/menu/famous-combo and GET /api/admin/stats.
// SERVER-ONLY — uses Prisma. Do not import in Client Components.

import { prisma } from "@/lib/prisma";
import type { MenuItem } from "@/types";

export interface TopCombo {
  ingredients: MenuItem[];
  count: number;
}

/**
 * Scans SERVED orders (preferring feedback-backed ones) and returns the
 * most frequently ordered ingredient combination.
 * Returns null when no SERVED orders exist.
 */
export async function computeTopCombo(): Promise<TopCombo | null> {
  const allOrders = await prisma.order.findMany({
    where: { status: "SERVED" },
    include: {
      layers: {
        include: { menuItem: true },
        orderBy: { zIndex: "asc" },
      },
      feedback: true,
    },
  });

  if (allOrders.length === 0) return null;

  // Prefer feedback-backed orders; fall back to all SERVED
  const pool = allOrders.filter((o) => o.feedback !== null);
  const source = pool.length > 0 ? pool : allOrders;

  const comboCounts: Record<string, { items: MenuItem[]; count: number }> = {};

  for (const order of source) {
    const items = order.layers.map((l) => l.menuItem as unknown as MenuItem);
    // Sort by id for a canonical key regardless of order items were added
    const key = items
      .map((i) => i.id)
      .sort((a, b) => a - b)
      .join(",");

    if (!comboCounts[key]) {
      comboCounts[key] = { items, count: 0 };
    }
    comboCounts[key].count++;
  }

  const top = Object.values(comboCounts).sort((a, b) => b.count - a.count)[0];
  return top ? { ingredients: top.items, count: top.count } : null;
}
