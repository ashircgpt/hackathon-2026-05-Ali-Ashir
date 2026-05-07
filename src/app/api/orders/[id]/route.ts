import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const ORDER_INCLUDE = {
  layers: { include: { menuItem: true }, orderBy: { zIndex: "asc" as const } },
  feedback: true,
} as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return fail("Invalid order ID", [], 400);

  const order = await prisma.order.findUnique({
    where: { id },
    include: ORDER_INCLUDE,
  });

  if (!order) return fail("Order not found", [], 404);
  return ok(order);
}
