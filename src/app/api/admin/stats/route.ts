import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    totalOrders,
    activeOrders,
    servedOrders,
    revenueAgg,
    verifiedFeedbackCount,
    orders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { status: { in: ["NEW", "PREPARING", "BAKING", "READY"] } },
    }),
    prisma.order.count({ where: { status: "SERVED" } }),
    prisma.order.aggregate({ _sum: { totalPrice: true } }),
    prisma.feedback.count(),
    prisma.order.findMany({
      include: {
        layers: { include: { menuItem: true } },
        feedback: true,
      },
    }),
  ]);

  // ordersByStatus
  const ordersByStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  // topCombo — prefer feedback-backed SERVED orders, fall back to all SERVED, then all
  const feedbackBacked = orders.filter(
    (o) => o.status === "SERVED" && o.feedback !== null,
  );
  const served = orders.filter((o) => o.status === "SERVED");
  const pool =
    feedbackBacked.length > 0
      ? feedbackBacked
      : served.length > 0
        ? served
        : orders;

  const comboCounts: Record<string, { names: string[]; count: number }> = {};
  for (const order of pool) {
    const names = order.layers.map((l) => l.menuItem.name).sort();
    const key = names.join(" | ");
    if (!comboCounts[key]) comboCounts[key] = { names, count: 0 };
    comboCounts[key].count++;
  }
  const topComboEntry = Object.values(comboCounts).sort(
    (a, b) =>
      b.count - a.count ||
      a.names.join().localeCompare(b.names.join()),
  )[0] ?? null;

  const totalRevenue =
    Math.round((revenueAgg._sum.totalPrice ?? 0) * 100) / 100;

  return ok({
    totalOrders,
    activeOrders,
    servedOrders,
    totalRevenue,
    averageRating: null, // no stars field in schema — plain text feedback only
    verifiedFeedbackCount,
    ordersByStatus,
    topCombo: topComboEntry
      ? { ingredients: topComboEntry.names, count: topComboEntry.count }
      : null,
  });
}
