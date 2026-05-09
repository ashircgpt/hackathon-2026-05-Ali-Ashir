import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const ORDER_INCLUDE = {
  layers: { include: { menuItem: true }, orderBy: { zIndex: "asc" as const } },
  feedback: true,
} as const;

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [orders]
 *     summary: Get a single order by ID
 *     description: >
 *       Returns the full order object with all layers (sorted by zIndex) and
 *       feedback. Used by the customer table polling fallback when Socket.io
 *       is unavailable.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order with layers and feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Order not found
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return fail("Invalid order ID", [], 400);

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    if (!order) return fail("Order not found", [], 404);
    return ok(order);
  } catch (err) {
    console.error("[/api/orders/[id]] error:", err);
    return fail("Failed to load order", [], 500);
  }
}
