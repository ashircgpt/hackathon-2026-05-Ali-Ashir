// Pizza3.14 — deterministic seed script
// Run with: npm run db:seed
// Idempotent: uses upsert so re-running is safe.
// All data is synthetic — no real customer info.

import { PrismaClient, LayerType, OrderStatus } from "@prisma/client";
import crypto from "crypto";

const db = new PrismaClient();

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

// ---------------------------------------------------------------------------
// Menu items — 3 BASE, 3 SAUCE, 2 CHEESE, 7 TOPPING  (15 total)
// imageUrls match files under public/assets/pizza/
// ---------------------------------------------------------------------------

const MENU_ITEMS = [
  // BASE
  {
    id: 1,
    name: "Classic Dough",
    layerType: LayerType.BASE,
    imageUrl: "/assets/pizza/bases/1.jpg",
    price: 3.0,
    calories: 220,
    protein: 7.0,
    fats: 2.0,
    carbs: 42.0,
    sortOrder: 1,
  },
  {
    id: 2,
    name: "Whole Wheat Crust",
    layerType: LayerType.BASE,
    imageUrl: "/assets/pizza/bases/2.jpg",
    price: 3.5,
    calories: 200,
    protein: 9.0,
    fats: 2.0,
    carbs: 38.0,
    sortOrder: 2,
  },
  {
    id: 3,
    name: "Cauliflower Crust",
    layerType: LayerType.BASE,
    imageUrl: "/assets/pizza/bases/3.jpg",
    price: 4.0,
    calories: 120,
    protein: 5.0,
    fats: 4.0,
    carbs: 18.0,
    sortOrder: 3,
  },
  // SAUCE
  {
    id: 4,
    name: "Tomato Sauce",
    layerType: LayerType.SAUCE,
    imageUrl: "/assets/pizza/sauces/tomatto.jpg",
    price: 1.0,
    calories: 45,
    protein: 2.0,
    fats: 1.0,
    carbs: 8.0,
    sortOrder: 4,
  },
  {
    id: 5,
    name: "BBQ Sauce",
    layerType: LayerType.SAUCE,
    imageUrl: "/assets/pizza/sauces/bbq.jpg",
    price: 1.0,
    calories: 60,
    protein: 1.0,
    fats: 0.0,
    carbs: 14.0,
    sortOrder: 5,
  },
  {
    id: 6,
    name: "Spicy Sauce",
    layerType: LayerType.SAUCE,
    imageUrl: "/assets/pizza/sauces/spicy.jpg",
    price: 1.5,
    calories: 55,
    protein: 1.0,
    fats: 2.0,
    carbs: 9.0,
    sortOrder: 6,
  },
  // CHEESE
  {
    id: 8,
    name: "Mozzarella",
    layerType: LayerType.CHEESE,
    imageUrl: "/assets/pizza/cheese/mozzarella.jpg",
    price: 2.0,
    calories: 160,
    protein: 11.0,
    fats: 12.0,
    carbs: 1.0,
    sortOrder: 7,
  },
  {
    id: 10,
    name: "Double Cheddar",
    layerType: LayerType.CHEESE,
    imageUrl: "/assets/pizza/cheese/cheddar_cheese.jpg",
    price: 2.5,
    calories: 220,
    protein: 14.0,
    fats: 18.0,
    carbs: 1.0,
    sortOrder: 8,
  },
  // TOPPING
  {
    id: 11,
    name: "Pepperoni",
    layerType: LayerType.TOPPING,
    imageUrl: "/assets/pizza/toppings/peperonis.jpg",
    price: 2.0,
    calories: 130,
    protein: 6.0,
    fats: 11.0,
    carbs: 1.0,
    sortOrder: 9,
  },
  {
    id: 12,
    name: "Mushrooms",
    layerType: LayerType.TOPPING,
    imageUrl: "/assets/pizza/toppings/mushrooms.jpg",
    price: 1.0,
    calories: 20,
    protein: 2.0,
    fats: 0.0,
    carbs: 3.0,
    sortOrder: 10,
  },
  {
    id: 13,
    name: "Capsicum",
    layerType: LayerType.TOPPING,
    imageUrl: "/assets/pizza/toppings/capsicum.jpg",
    price: 1.0,
    calories: 15,
    protein: 1.0,
    fats: 0.0,
    carbs: 3.0,
    sortOrder: 11,
  },
  {
    id: 14,
    name: "Olives",
    layerType: LayerType.TOPPING,
    imageUrl: "/assets/pizza/toppings/olives.jpg",
    price: 1.0,
    calories: 35,
    protein: 0.0,
    fats: 3.0,
    carbs: 2.0,
    sortOrder: 12,
  },
  {
    id: 15,
    name: "Jalapeños",
    layerType: LayerType.TOPPING,
    imageUrl: "/assets/pizza/toppings/jalapenos.jpg",
    price: 0.75,
    calories: 10,
    protein: 0.0,
    fats: 0.0,
    carbs: 2.0,
    sortOrder: 13,
  },
  {
    id: 16,
    name: "Onions",
    layerType: LayerType.TOPPING,
    imageUrl: "/assets/pizza/toppings/onions.jpg",
    price: 0.75,
    calories: 15,
    protein: 0.0,
    fats: 0.0,
    carbs: 4.0,
    sortOrder: 14,
  },
  {
    id: 17,
    name: "Chicken Chunks",
    layerType: LayerType.TOPPING,
    imageUrl: "/assets/pizza/toppings/chicken_chunks.jpg",
    price: 2.5,
    calories: 110,
    protein: 14.0,
    fats: 5.0,
    carbs: 0.0,
    sortOrder: 15,
  },
] as const;

// ---------------------------------------------------------------------------
// Helper: compute total price and calories from item IDs
// ---------------------------------------------------------------------------

function computeTotals(itemIds: number[]): { totalPrice: number; totalCals: number } {
  const items = MENU_ITEMS.filter((m) => itemIds.includes(m.id));
  const totalPrice = Math.round(items.reduce((s, m) => s + m.price, 0) * 100) / 100;
  const totalCals = items.reduce((s, m) => s + m.calories, 0);
  return { totalPrice, totalCals };
}

// ---------------------------------------------------------------------------
// Helper: build OrderLayer create data with correct z-indexes
// BASE=0, SAUCE=1, CHEESE=2, TOPPING=3+n
// ---------------------------------------------------------------------------

function buildLayers(itemIds: number[]) {
  const items = MENU_ITEMS.filter((m) => itemIds.includes(m.id));
  let toppingIndex = 0;
  return items.map((item) => {
    let zIndex: number;
    if (item.layerType === "BASE") zIndex = 0;
    else if (item.layerType === "SAUCE") zIndex = 1;
    else if (item.layerType === "CHEESE") zIndex = 2;
    else zIndex = 3 + toppingIndex++;
    return { menuItemId: item.id, zIndex };
  });
}

// ---------------------------------------------------------------------------
// Order definitions
// Most Famous Combo: Classic Dough(1) + Tomato Sauce(4) + Mozzarella(8) +
//                   Pepperoni(11) + Mushrooms(12) — appears in orders 1, 2, 7
// ---------------------------------------------------------------------------

const ORDERS: Array<{
  id: number;
  tableId: number;
  status: OrderStatus;
  itemIds: number[];
  createdAt: Date;
}> = [
  // Order 1 — NEW — Famous Combo ⭐
  {
    id: 1,
    tableId: 1,
    status: OrderStatus.NEW,
    itemIds: [1, 4, 8, 11, 12],
    createdAt: new Date("2026-05-07T09:00:00.000Z"),
  },
  // Order 2 — PREPARING — Famous Combo ⭐
  {
    id: 2,
    tableId: 2,
    status: OrderStatus.PREPARING,
    itemIds: [1, 4, 8, 11, 12],
    createdAt: new Date("2026-05-07T09:10:00.000Z"),
  },
  // Order 3 — BAKING
  {
    id: 3,
    tableId: 3,
    status: OrderStatus.BAKING,
    itemIds: [1, 6, 10, 11, 15],
    createdAt: new Date("2026-05-07T09:20:00.000Z"),
  },
  // Order 4 — BAKING
  {
    id: 4,
    tableId: 4,
    status: OrderStatus.BAKING,
    itemIds: [2, 5, 8, 12, 13],
    createdAt: new Date("2026-05-07T09:30:00.000Z"),
  },
  // Order 5 — READY
  {
    id: 5,
    tableId: 1,
    status: OrderStatus.READY,
    itemIds: [1, 5, 8, 14, 13],
    createdAt: new Date("2026-05-07T08:30:00.000Z"),
  },
  // Order 6 — READY
  {
    id: 6,
    tableId: 2,
    status: OrderStatus.READY,
    itemIds: [3, 4, 10, 12, 13],
    createdAt: new Date("2026-05-07T08:40:00.000Z"),
  },
  // Order 7 — SERVED — Famous Combo ⭐ — has feedback (genesis block)
  {
    id: 7,
    tableId: 3,
    status: OrderStatus.SERVED,
    itemIds: [1, 4, 8, 11, 12],
    createdAt: new Date("2026-05-07T08:00:00.000Z"),
  },
  // Order 8 — SERVED — has feedback (block 1)
  {
    id: 8,
    tableId: 4,
    status: OrderStatus.SERVED,
    itemIds: [2, 6, 10, 11, 15],
    createdAt: new Date("2026-05-07T08:15:00.000Z"),
  },
];

// ---------------------------------------------------------------------------
// Feedback chain — 2 deterministic blocks
// ---------------------------------------------------------------------------

const FEEDBACK_CONTENT_1 = "Great pizza! The crust was perfectly crispy.";
const FEEDBACK_CONTENT_2 = "Loved the Tomato sauce. Will definitely order again!";

// Deterministic timestamps for reproducible hashes
const FEEDBACK_TIMESTAMP_1 = new Date("2026-05-07T10:00:00.000Z");
const FEEDBACK_TIMESTAMP_2 = new Date("2026-05-07T11:30:00.000Z");

function buildChain() {
  // Block 0 — genesis (prevHash = "0")
  const contentHash1 = sha256(FEEDBACK_CONTENT_1);
  const prevHash1 = "0";
  const ts1 = FEEDBACK_TIMESTAMP_1.toISOString();
  const blockHash1 = sha256(prevHash1 + ts1 + contentHash1);

  // Block 1 — chained to block 0
  const contentHash2 = sha256(FEEDBACK_CONTENT_2);
  const prevHash2 = blockHash1;
  const ts2 = FEEDBACK_TIMESTAMP_2.toISOString();
  const blockHash2 = sha256(prevHash2 + ts2 + contentHash2);

  return [
    {
      orderId: 7,
      content: FEEDBACK_CONTENT_1,
      contentHash: contentHash1,
      prevHash: prevHash1,
      timestamp: FEEDBACK_TIMESTAMP_1,
      blockHash: blockHash1,
    },
    {
      orderId: 8,
      content: FEEDBACK_CONTENT_2,
      contentHash: contentHash2,
      prevHash: prevHash2,
      timestamp: FEEDBACK_TIMESTAMP_2,
      blockHash: blockHash2,
    },
  ];
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Seeding Pizza3.14 database...");

  // 1. Menu items (upsert by id)
  console.log("  → Menu items...");
  for (const item of MENU_ITEMS) {
    await db.menuItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log(`     ${MENU_ITEMS.length} menu items seeded`);

  // 2. Orders + layers (delete existing layers then upsert order)
  console.log("  → Orders...");
  for (const orderDef of ORDERS) {
    const { totalPrice, totalCals } = computeTotals(orderDef.itemIds);
    const layers = buildLayers(orderDef.itemIds);

    // Delete existing layers for this order (for idempotency)
    await db.orderLayer.deleteMany({ where: { orderId: orderDef.id } });

    await db.order.upsert({
      where: { id: orderDef.id },
      update: {
        tableId: orderDef.tableId,
        status: orderDef.status,
        totalPrice,
        totalCals,
        layers: { create: layers },
      },
      create: {
        id: orderDef.id,
        tableId: orderDef.tableId,
        status: orderDef.status,
        totalPrice,
        totalCals,
        createdAt: orderDef.createdAt,
        layers: { create: layers },
      },
    });
  }
  console.log(`     ${ORDERS.length} orders seeded`);

  // 3. Feedback chain
  console.log("  → Feedback chain...");
  const feedbackBlocks = buildChain();
  for (const block of feedbackBlocks) {
    await db.feedback.upsert({
      where: { orderId: block.orderId },
      update: block,
      create: block,
    });
  }
  console.log(`     ${feedbackBlocks.length} feedback blocks seeded`);

  // Reset PostgreSQL sequences so app-created records don't collide with seed IDs.
  console.log("  → Resetting sequences...");
  await db.$executeRaw`SELECT setval(pg_get_serial_sequence('"MenuItem"', 'id'), MAX(id)) FROM "MenuItem"`;
  await db.$executeRaw`SELECT setval(pg_get_serial_sequence('"Order"', 'id'), MAX(id)) FROM "Order"`;
  await db.$executeRaw`SELECT setval(pg_get_serial_sequence('"OrderLayer"', 'id'), MAX(id)) FROM "OrderLayer"`;
  await db.$executeRaw`SELECT setval(pg_get_serial_sequence('"Feedback"', 'id'), MAX(id)) FROM "Feedback"`;
  console.log("     Sequences advanced past seed IDs");

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
