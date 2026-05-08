import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { LayerType, OrderStatus } from "@prisma/client";
import { getIO } from "@/lib/socket-server";

export const dynamic = "force-dynamic";

const ORDER_INCLUDE = {
  layers: { include: { menuItem: true }, orderBy: { zIndex: "asc" as const } },
  feedback: true,
} as const;

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [orders]
 *     summary: List orders with optional filters
 *     description: >
 *       Returns orders newest-first. All query params are optional and combinable.
 *       Kitchen usage: ?today=true&exclude=SERVED
 *       Admin usage: ?status=NEW,PREPARING,BAKING,READY
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: NEW,PREPARING
 *         description: Comma-separated statuses to include (NEW|PREPARING|BAKING|READY|SERVED)
 *       - in: query
 *         name: exclude
 *         schema:
 *           type: string
 *           example: SERVED
 *         description: Comma-separated statuses to exclude (applied only when status param absent)
 *       - in: query
 *         name: tableId
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filter by table number
 *       - in: query
 *         name: today
 *         schema:
 *           type: string
 *           enum: ['true']
 *         description: When true, only orders created since midnight UTC today
 *     responses:
 *       200:
 *         description: Array of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *   post:
 *     tags: [orders]
 *     summary: Place a new pizza order
 *     description: >
 *       Creates an order with the given layers for a table. Validates layer rules:
 *       exactly one BASE required, at most one SAUCE, at most one CHEESE, unlimited
 *       TOPPINGs. All items must be available. On success emits order-new to kitchen
 *       room via Socket.io.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderPayload'
 *     responses:
 *       201:
 *         description: Order created
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
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const where: {
    status?: { in?: OrderStatus[]; notIn?: OrderStatus[] };
    tableId?: number;
    createdAt?: { gte: Date };
  } = {};

  // ?status=NEW,PREPARING — include only these statuses
  const statusParam = url.searchParams.get("status");
  if (statusParam) {
    const statuses = statusParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => VALID_STATUSES.has(s)) as OrderStatus[];
    if (statuses.length > 0) where.status = { in: statuses };
  }

  // ?exclude=SERVED — exclude these statuses (ignored if status param present)
  const excludeParam = url.searchParams.get("exclude");
  if (excludeParam && !statusParam) {
    const excluded = excludeParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => VALID_STATUSES.has(s)) as OrderStatus[];
    if (excluded.length > 0) where.status = { notIn: excluded };
  }

  // ?tableId=1
  const tableIdParam = url.searchParams.get("tableId");
  if (tableIdParam) {
    const tid = parseInt(tableIdParam, 10);
    if (!isNaN(tid) && tid > 0) where.tableId = tid;
  }

  // ?today=true — since midnight UTC
  if (url.searchParams.get("today") === "true") {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    where.createdAt = { gte: startOfDay };
  }

  const orders = await prisma.order.findMany({
    where,
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

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: itemIds } },
  });

  const foundIds = new Set(menuItems.map((m) => m.id));
  const missing = itemIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    return fail("Some menu items do not exist", missing.map(String));
  }

  const unavailable = menuItems.filter((m) => !m.isAvailable);
  if (unavailable.length > 0) {
    return fail("Some menu items are unavailable", unavailable.map((m) => m.name));
  }

  const bases = menuItems.filter((m) => m.layerType === LayerType.BASE);
  if (bases.length === 0) {
    return fail("At least one BASE layer is required", ["No BASE layer selected"]);
  }

  const sauces = menuItems.filter((m) => m.layerType === LayerType.SAUCE);
  if (sauces.length > 1) {
    return fail("Only one SAUCE layer is allowed", [`Got ${sauces.length}`]);
  }

  const cheeses = menuItems.filter((m) => m.layerType === LayerType.CHEESE);
  if (cheeses.length > 1) {
    return fail("Only one CHEESE layer is allowed", [`Got ${cheeses.length}`]);
  }

  const totalPrice =
    Math.round(menuItems.reduce((s, m) => s + m.price, 0) * 100) / 100;
  const totalCals = menuItems.reduce((s, m) => s + m.calories, 0);

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

  // Notify kitchen via Socket.io (silently skip if server not running custom server)
  try {
    getIO().to("kitchen").emit("order-new", order);
  } catch {
    // Socket.io not initialized — graceful degradation (falls back to polling)
  }

  return ok(order, 201);
}
