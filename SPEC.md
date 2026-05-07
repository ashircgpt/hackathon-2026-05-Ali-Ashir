# Pizza3.14 — Product Specification

## Overview

Pizza3.14 is a tabletop pizza ordering system for restaurants. Customers build a custom pizza by dragging transparent PNG ingredient layers onto a canvas, place their order, and track it live from NEW through SERVED. After delivery, they submit text feedback stored in a tamper-evident blockchain-style ledger. Kitchen staff manage order progression through a dedicated dashboard. Admins review all orders, verify the feedback ledger integrity, and see the most popular pizza combination.

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
2. The ingredient palette shows all available layers grouped by type (BASE / SAUCE / CHEESE / TOPPING)
3. Drag one BASE layer onto the pizza canvas (required to place order)
4. Optionally drag one SAUCE, one CHEESE, and any number of TOPPINGs onto the canvas
5. Price, calories, protein, fats, and carbs update live in the nutrition panel as layers are added or removed
6. Click "Place Order" — order is created with status NEW
7. Status progress bar appears: NEW → PREPARING → BAKING → READY → SERVED
8. Status updates in real time via Server-Sent Events (SSE), with 3–5 s polling as fallback
9. After status reaches SERVED, a feedback textarea appears
10. Customer submits plain text feedback — one submission per order, gated on SERVED status

---

## Kitchen Flow

1. Navigate to `/kitchen` — authenticate with kitchen passphrase
2. See all active orders (NEW, PREPARING, BAKING, READY) sorted oldest-first
3. Click the advance button on each card to move status forward one step
4. SERVED orders are removed from the active board (or visually dimmed)

---

## Admin Flow

1. Navigate to `/admin` — authenticate with admin passphrase
2. **Orders tab**: all orders across all statuses with timestamps and prices
3. **Feedback tab**: full feedback ledger; chain validity shown as VALID or BROKEN
4. **Stats tab**: Most Famous Combo (layer configuration with highest order count) + order counts by status

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

All ingredient layer PNG images must follow these rules:

- **Top-down view**: image must be shot or rendered from directly above (90° overhead)
- **Transparent background**: PNG alpha channel; no solid background color
- **Uniform canvas size**: all PNGs must be the same pixel dimensions (e.g. 512×512 px)
- **Centered ingredient**: the ingredient must be centered within the canvas bounds
- **No third-party branding**: no Pizza Hut logos, trade dress, fonts, or visual style; no other brand assets
- **Layering contract**: images are designed to be stacked; only the ingredient itself should be opaque

---

## Status Workflow

```
NEW → PREPARING → BAKING → READY → SERVED
```

- Each PATCH to `/api/orders/[id]/status` advances one step
- SERVED is the final state — no further advancement allowed
- Feedback submission is blocked until status === SERVED

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

- Primary: Server-Sent Events (SSE) via `/api/orders/stream/[id]`
- Fallback: 3–5 second client-side polling if SSE is unstable on Vercel
- Chosen approach documented in `CLAUDE.md`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | Supabase free tier (PostgreSQL) via Prisma ORM |
| DB fallback | SQLite + Prisma (emergency only) |
| Drag & Drop | @dnd-kit/core |
| Styling | Tailwind CSS |
| Real-time | SSE (with polling fallback) |
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

---

## Seed Data

All data is synthetic. The seed script creates:
- 16 menu items (3 BASE, 4 SAUCE, 3 CHEESE, 6 TOPPING) with full nutrition data
- 8 historical orders across various statuses
- 2 feedback blocks seeding the chain
- "Most Famous Combo" winner embedded in seeded orders: Classic Dough + Marinara + Mozzarella + Pepperoni + Mushrooms (3 occurrences)
