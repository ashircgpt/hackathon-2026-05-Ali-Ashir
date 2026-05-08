import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { computeTopCombo } from "@/lib/combo";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [admin]
 *     summary: Admin dashboard statistics
 *     description: >
 *       Returns aggregate stats for the admin dashboard: order counts, revenue,
 *       status breakdown, hourly chart data (today), and the most famous combo.
 *       Requires admin cookie.
 *     security:
 *       - adminCookie: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AdminStats'
 */
export async function GET() {
  // Start of today (UTC midnight)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [
    totalOrders,
    activeOrders,
    servedOrders,
    revenueAgg,
    verifiedFeedbackCount,
    todayOrdersRaw,
    allOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { status: { in: ["NEW", "PREPARING", "BAKING", "READY"] } },
    }),
    prisma.order.count({ where: { status: "SERVED" } }),
    prisma.order.aggregate({ _sum: { totalPrice: true } }),
    prisma.feedback.count(),
    // Today's orders for stat cards + hourly chart
    prisma.order.findMany({
      where: { createdAt: { gte: todayStart } },
      select: { status: true, totalPrice: true, createdAt: true },
    }),
    // All orders for status breakdown
    prisma.order.findMany({
      select: { status: true },
    }),
  ]);

  // Status breakdown across all time
  const ordersByStatus = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  // Today's aggregate stats
  const todayOrders = todayOrdersRaw.length;
  const todayRevenue =
    Math.round(todayOrdersRaw.reduce((s, o) => s + o.totalPrice, 0) * 100) / 100;

  // Hourly breakdown for bar chart (hours 0–23, today only)
  const hourlyMap: Record<number, { count: number; revenue: number }> = {};
  for (let h = 0; h < 24; h++) hourlyMap[h] = { count: 0, revenue: 0 };
  for (const o of todayOrdersRaw) {
    const h = o.createdAt.getUTCHours();
    hourlyMap[h].count++;
    hourlyMap[h].revenue =
      Math.round((hourlyMap[h].revenue + o.totalPrice) * 100) / 100;
  }
  const hourlyBreakdown = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: hourlyMap[h].count,
    revenue: hourlyMap[h].revenue,
  }));

  const totalRevenue =
    Math.round((revenueAgg._sum.totalPrice ?? 0) * 100) / 100;

  // Most famous combo via shared helper
  const topComboResult = await computeTopCombo();

  return ok({
    totalOrders,
    activeOrders,
    servedOrders,
    totalRevenue,
    todayOrders,
    todayRevenue,
    averageRating: null, // no stars field in schema — plain text feedback only
    verifiedFeedbackCount,
    ordersByStatus,
    hourlyBreakdown,
    topCombo: topComboResult
      ? { ingredients: topComboResult.ingredients, count: topComboResult.count }
      : null,
  });
}
