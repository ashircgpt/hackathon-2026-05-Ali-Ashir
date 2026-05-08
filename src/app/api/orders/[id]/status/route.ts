import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { STATUS_SEQUENCE } from "@/types";
import { getIO } from "@/lib/socket-server";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [orders]
 *     summary: Advance order status by one step
 *     description: >
 *       Advances the order status by one step in the sequence:
 *       NEW → PREPARING → BAKING → READY → SERVED.
 *       No request body required. Terminal state: SERVED cannot be advanced further.
 *       On success emits order-advance to kitchen room and order-status-update to
 *       the customer's table room via Socket.io.
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
 *         description: Order advanced — returns new id + status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       $ref: '#/components/schemas/OrderStatus'
 *       400:
 *         description: Invalid ID or already SERVED
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return fail("Invalid order ID", [], 400);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return fail("Order not found", [], 404);

  if (order.status === "SERVED") {
    return fail("Order is already served — no further status changes allowed", [], 400);
  }

  const idx = STATUS_SEQUENCE.indexOf(order.status);
  const nextStatus = STATUS_SEQUENCE[idx + 1];

  const updated = await prisma.order.update({
    where: { id },
    data: { status: nextStatus },
    select: { id: true, status: true, tableId: true },
  });

  // Notify kitchen, customer table, and admin via Socket.io
  try {
    const io = getIO();
    io.to("kitchen").emit("order-advance", { orderId: id, status: nextStatus });
    io.to(`table-${order.tableId}`).emit("order-status-update", {
      orderId: id,
      status: nextStatus,
    });
    io.to("admin").emit("order-advance", { orderId: id, status: nextStatus });
  } catch {
    // Socket.io not initialized — graceful degradation
  }

  return ok({ id: updated.id, status: updated.status });
}
