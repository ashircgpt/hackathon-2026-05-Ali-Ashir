# Pizza3.14 — Product Specification

## Overview

Pizza3.14 is a tabletop pizza ordering system for restaurants. Customers build a custom pizza by selecting ingredient layers from an orbit ring around a central canvas, place their order, and track it live from NEW through SERVED. Real-time push notifications (Socket.io) keep the customer table and kitchen board in sync. While waiting, customers can play mini games on the table. After delivery, they submit text feedback stored in a tamper-evident blockchain-style ledger. Kitchen staff manage order progression through a Kanban board that shows only today's active orders. Admins review stats, full order history, manage menu availability, and verify the feedback ledger integrity.

This product is inspired by tabletop ordering concepts. It does not use Pizza Hut branding, assets, trade dress, or any copyrighted material.

---

## User Roles

| Role | URL | Auth |
|---|---|---|
| Customer | `/table/{tableId}` | Public (no auth) |
| Kitchen Staff | `/kitchen` | Demo passphrase |
| Admin | `/admin` | Demo passphrase (separate from kitchen) |

Auth is a demo passphrase gate only — not suitable for production. See Post-Hackathon Roadmap for hardening.

---

## Customer Flow

1. Navigate to `/table/{tableId}` (e.g. `/table/1`)
2. The table UI loads: black glass full-screen tabletop, no browser chrome
3. A **Most Famous Combo banner** appears at the top — auto-populates the canvas with the top combo; customer can dismiss it
4. Ingredients are arranged in an **orbit ring** around the pizza canvas — BASE / SAUCE / CHEESE / TOPPING grouped and accessible
5. Tap or drag an ingredient from the orbit ring to add it to the pizza (GSAP fly-in animation)
6. **Left panel**: live nutrition panel (calories, protein, fat, carbs) updates with each addition/removal
7. **Right panel**: live bill breakdown (per-item prices + total) and the Place Order button
8. Exactly one BASE layer is required before Place Order is enabled
9. Click "Place Order" — order is created with status NEW
10. **Waiting mode**: a status track bar appears; the orbit ring and panels fade out; mini games appear on the table surface
11. Status updates in real time via **Socket.io push** from kitchen → customer as toast notifications
12. After status reaches SERVED, feedback form appears
13. Customer submits plain text feedback — one submission per order, gated on SERVED status

---

## Kitchen Flow

1. Navigate to `/kitchen` — authenticate with kitchen passphrase
2. See a **Kanban board — today's orders only** in four columns: NEW | PREPARING | BAKING | READY
3. New orders appear live on the board via Socket.io (no refresh needed)
4. Click the "Advance →" button on a card to move it to the next column (PATCH `/api/orders/[id]/status`)
5. Status advancement emits a Socket.io event → customer table receives a toast notification + status bar update
6. GSAP animates card transitions between columns
7. SERVED orders are removed from the board (handled separately in order history)

---

## Admin Flow

1. Navigate to `/admin` — authenticate with admin passphrase
2. **Stats dashboard**: order volume chart, revenue chart, most famous combo, status breakdown, average order value
3. **Orders management**: full order list with status filters
4. **Menu management**: toggle `isAvailable` per item, view prices and image previews
5. **Feedback ledger**: full ledger view + "Verify Chain" button that re-computes all SHA-256 hashes client-side and shows VALID or BROKEN per block

---

## Table UI Layout (`/table/[tableId]`)

```
┌─────────────────────────────────────────────────────────────┐
│  [Most Famous Combo banner — dismissible]                   │
├──────────────┬──────────────────────────┬───────────────────┤
│              │                          │                   │
│  Nutrition   │   [PIZZA CANVAS]         │   Bill Panel      │
│  Panel       │   + orbit ring of        │   + Place Order   │
│  (left)      │     ingredients          │   (right)         │
│              │                          │                   │
│              │   [Waiting: games here]  │                   │
└──────────────┴──────────────────────────┴───────────────────┘
```

- **Background**: black glass (`#0a0a0a` / near-black), full `h-screen`, no web chrome
- **Pizza canvas**: circular, central, hero element. Realistic stacked food photo layers.
- **Orbit ring**: ingredients orbit the canvas in a ring; selecting one flies it onto the pizza (GSAP)
- **Left panel**: live nutrition (calories, protein, fat, carbs)
- **Right panel**: live bill breakdown (each selected item + price + size multiplier) + Place Order button
- **Top banner**: Most Famous Combo — auto-populates pizza on load; dismissible with GSAP slide-out
- **Waiting mode** (post-order, pre-SERVED): orbit ring fades, panels collapse, two mini games appear on the table surface
- **GSAP** handles all animations: ingredient fly-in, layer pop-in, orbit pulse, combo banner, waiting transition, order celebration

---

## Waiting Games

After an order is placed and while waiting for SERVED status, two mini games are available on the table:

1. **Tic Tac Toe** — two-player (pass-and-play) on the table surface
2. **Pizza Trivia** — quick-fire trivia questions about pizza, food, and Italian culture (client-side only, no backend)

Both games are client-only. No backend, no scores persisted, no DB changes.

---

## Pizza Layer Types and Rules

| Type | Quantity | Examples |
|---|---|---|
| BASE | Exactly 1 (required) | Classic Dough, Whole Wheat, Cauliflower Crust |
| SAUCE | 0 or 1 | Marinara, Pesto, BBQ, Garlic Cream |
| CHEESE | 0 or 1 | Mozzarella, Vegan Cheese, Double Cheddar |
| TOPPING | 0 or many (no max) | Pepperoni, Mushrooms, Bell Peppers, Olives, Jalapeños, Pineapple |

Layer render order on canvas: BASE (z-index 0) → SAUCE (z-index 1) → CHEESE (z-index 2) → TOPPINGS (z-index 3, 4, 5…)

---

## Pizza Asset Rules

All ingredient layer images must follow these rules:

- **Top-down view**: image must be shot or rendered from directly above (90° overhead)
- **Realistic food photography**: JPEG or PNG; photorealistic food photos preferred over abstract flat art
- **Uniform canvas size**: all images must be the same pixel dimensions (e.g. 512×512 px)
- **Centered ingredient**: the ingredient must be centered within the canvas bounds
- **No third-party branding**: no Pizza Hut logos, trade dress, fonts, or visual style; no other brand assets
- **Layering contract**: for stacked rendering, only the ingredient itself should be the primary visual; edge areas should fade/be transparent where possible
- **File paths**: `public/assets/pizza/bases/*.jpg`, `public/assets/pizza/sauces/*.jpg`, `public/assets/pizza/cheese/*.jpg`, `public/assets/pizza/toppings/*.jpg`
- **Seed imageUrl fields must match these paths exactly**

---

## Status Workflow

```
NEW → PREPARING → BAKING → READY → SERVED
```

- Each PATCH to `/api/orders/[id]/status` advances one step
- SERVED is the final state — no further advancement allowed
- Feedback submission is blocked until status === SERVED
- Each status advance emits a Socket.io event to the customer table

---

## Feedback Ledger (Blockchain-style)

Each feedback entry is a block in a linked append-only chain:

```
contentHash = SHA256(rawText)
prevHash    = blockHash of previous block (or literal "0" for genesis)
timestamp   = new Date().toISOString()  // ISO 8601 UTC
blockHash   = SHA256(prevHash + timestamp + contentHash)
```

- The chain is stored in the `Feedback` table, ordered by `id` ascending
- Tampering with any stored field breaks the chain
- Admin UI re-computes each `blockHash` client-side to verify chain integrity
- No delete or update is ever performed on the `Feedback` table

---

## Real-time Strategy

- **Primary**: Socket.io bidirectional push
  - Kitchen advances status → server emits `order-status-update` → customer table room receives toast + status bar update
  - New orders appear on kitchen board without refresh
  - Customer table room: `table-${tableId}`, Kitchen room: `kitchen`
- **Replaced**: SSE (`/api/orders/stream/[id]`) is superseded by Socket.io (see ADR-008)
- **Fallback**: 3–5 s client polling if Socket.io is unavailable

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | Supabase free tier (PostgreSQL) via Prisma ORM |
| DB fallback | SQLite + Prisma (emergency only) |
| Drag & Drop | @dnd-kit/core |
| Animations | GSAP (ingredient fly-in, layer pop, orbit pulse, celebrations) |
| Styling | Tailwind CSS |
| Real-time | Socket.io (replaces SSE) |
| Hashing | Node `crypto` (server) + Web Crypto API (client) |
| Auth | Demo passphrase + signed cookie (AUTH_SECRET) |
| Deployment | Vercel free tier |

---

## Out of Scope (Hackathon)

The following are explicitly excluded from this build:

- Payment processing of any kind
- Hardware integration (printers, tablets, POS terminals)
- Real distributed blockchain (the ledger is an integrity chain, not a consensus network)
- Production authentication (current auth is demo-only)
- Paid APIs or paid services of any kind
- Real customer PII or production data
- Email or SMS notifications
- Multi-restaurant or multi-location support
- Table management UI (tables are hardcoded IDs for demo)
- Persisting mini game scores

---

## Seed Data

All data is synthetic. The seed script creates:
- 16 menu items (3 BASE, 4 SAUCE, 3 CHEESE, 6 TOPPING) with full nutrition data
- 8 historical orders across various statuses
- 2 feedback blocks seeding the chain
- "Most Famous Combo" winner embedded in seeded orders: Classic Dough + Marinara + Mozzarella + Pepperoni + Mushrooms (3 occurrences)
