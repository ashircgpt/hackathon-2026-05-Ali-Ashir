import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { LayerType } from "@prisma/client";

export const dynamic = "force-dynamic";

const ORDER_INCLUDE = {
  layers: { include: { menuItem: true }, orderBy: { zIndex: "asc" as const } },
  feedback: true,
} as const;

export async function GET() {
  const orders = await prisma.order.findMany({
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return ok(orders);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const { tableId, layers } = body as Record<string, unknown>;
  const errors: string[] = [];

  // Basic field presence
  if (tableId === undefined || tableId === null) {
    errors.push("tableId is required");
  } else if (typeof tableId !== "number" || !Number.isInteger(tableId) || tableId < 1) {
    errors.push("tableId must be a positive integer");
  }

  if (!Array.isArray(layers) || layers.length === 0) {
    errors.push("layers must be a non-empty array of menu item IDs");
  } else if (!layers.every((id) => typeof id === "number" && Number.isInteger(id) && id > 0)) {
    errors.push("all layer IDs must be positive integers");
  }

  if (errors.length > 0) return fail("Validation failed", errors);

  const itemIds = layers as number[];

  // Fetch menu items
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: itemIds } },
  });

  // All IDs must exist
  const foundIds = new Set(menuItems.map((m) => m.id));
  const missing = itemIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    return fail("Some menu items do not exist", missing.map(String));
  }

  // All must be available
  const unavailable = menuItems.filter((m) => !m.isAvailable);
  if (unavailable.length > 0) {
    return fail(
      "Some menu items are unavailable",
      unavailable.map((m) => m.name),
    );
  }

  // At least one BASE
  const bases = menuItems.filter((m) => m.layerType === LayerType.BASE);
  if (bases.length === 0) {
    return fail("At least one BASE layer is required", ["No BASE layer selected"]);
  }

  // At most one SAUCE
  const sauces = menuItems.filter((m) => m.layerType === LayerType.SAUCE);
  if (sauces.length > 1) {
    return fail("Only one SAUCE layer is allowed", [`Got ${sauces.length}`]);
  }

  // At most one CHEESE
  const cheeses = menuItems.filter((m) => m.layerType === LayerType.CHEESE);
  if (cheeses.length > 1) {
    return fail("Only one CHEESE layer is allowed", [`Got ${cheeses.length}`]);
  }

  // Compute totals (snapshot — not re-derived later)
  const totalPrice =
    Math.round(menuItems.reduce((s, m) => s + m.price, 0) * 100) / 100;
  const totalCals = menuItems.reduce((s, m) => s + m.calories, 0);

  // Assign z-indexes
  let toppingIdx = 0;
  const layersData = itemIds.map((id) => {
    const item = menuItems.find((m) => m.id === id)!;
    let zIndex: number;
    if (item.layerType === LayerType.BASE) zIndex = 0;
    else if (item.layerType === LayerType.SAUCE) zIndex = 1;
    else if (item.layerType === LayerType.CHEESE) zIndex = 2;
    else zIndex = 3 + toppingIdx++;
    return { menuItemId: id, zIndex };
  });

  const order = await prisma.order.create({
    data: {
      tableId: tableId as number,
      totalPrice,
      totalCals,
      layers: { create: layersData },
    },
    include: ORDER_INCLUDE,
  });

  return ok(order, 201);
}
