import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { STATUS_SEQUENCE } from "@/types";

export const dynamic = "force-dynamic";

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
    select: { id: true, status: true },
  });

  return ok(updated);
}
