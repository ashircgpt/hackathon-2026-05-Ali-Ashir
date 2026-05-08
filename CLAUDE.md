# CLAUDE.md — Pizza3.14

## Project Overview

Pizza3.14 is a Next.js 14 App Router application for tabletop pizza ordering. Customers select ingredient layers from an orbit ring around a central pizza canvas, place orders, track live status via Socket.io push notifications, play mini games while waiting, and submit feedback. Full product spec: see `SPEC.md`.

---

## Repository Structure

```
.
├── SPEC.md                         — Product specification
├── CLAUDE.md                       — This file
├── PROMPT_LOG.md                   — Log of AI prompts used
├── COST_LOG.md                     — Log of service costs
├── .env.example                    — Env var template (no real values)
├── vercel.json                     — Vercel build config
├── prisma/
│   ├── schema.prisma               — Database schema
│   ├── seed.ts                     — Seed script
│   └── migrations/                 — Prisma migration files
├── public/
│   └── assets/
│       └── pizza/
│           ├── bases/              — Base layer images (*.jpg)
│           ├── sauces/             — Sauce layer images (*.jpg)
│           ├── cheese/             — Cheese layer images (*.jpg)
│           └── toppings/           — Topping layer images (*.jpg)
├── docs/
│   ├── PM_BRIEF.md
│   ├── ARCHITECTURE_OVERVIEW.md
│   ├── TECHNICAL_DECISIONS.md
│   └── POST_HACKATHON_ROADMAP.md
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                — Animated landing page
    │   ├── globals.css
    │   ├── table/[tableId]/
    │   │   └── page.tsx            — Customer pizza builder
    │   ├── kitchen/
    │   │   └── page.tsx            — Kitchen Kanban board
    │   ├── admin/
    │   │   └── page.tsx            — Admin dashboard
    │   ├── login/
    │   │   └── page.tsx            — Passphrase login
    │   └── api/
    │       ├── menu/route.ts
    │       ├── orders/
    │       │   ├── route.ts
    │       │   └── [id]/
    │       │       ├── route.ts
    │       │       └── status/route.ts
    │       ├── feedback/route.ts
    │       ├── admin/
    │       │   ├── feedback/route.ts
    │       │   └── stats/route.ts
    │       └── auth/login/route.ts
    ├── components/
    │   ├── pizza-builder/
    │   │   ├── PizzaBuilder.tsx    — Main client wrapper
    │   │   ├── PizzaCanvas.tsx     — Stacked ingredient layer renderer
    │   │   ├── IngredientOrbit.tsx — Orbit ring of selectable ingredients
    │   │   ├── NutritionPanel.tsx  — Left panel: live nutrition totals
    │   │   ├── BillPanel.tsx       — Right panel: bill breakdown + Place Order
    │   │   ├── CombosBanner.tsx    — Top dismissible Most Famous Combo banner
    │   │   ├── SelectedLayersPanel.tsx
    │   │   └── OrderSummary.tsx
    │   ├── waiting/
    │   │   ├── WaitingGames.tsx    — Post-order games container
    │   │   ├── TicTacToe.tsx       — Tic Tac Toe game
    │   │   └── PizzaTrivia.tsx     — Pizza trivia game
    │   ├── order/
    │   │   ├── OrderStatus.tsx
    │   │   └── FeedbackForm.tsx
    │   ├── kitchen/
    │   │   ├── KitchenOrderBoard.tsx
    │   │   └── KitchenOrderCard.tsx
    │   └── admin/
    │       ├── AllOrdersTable.tsx
    │       ├── FeedbackLedger.tsx
    │       ├── ChainVerifier.tsx
    │       └── TopComboBadge.tsx
    ├── lib/
    │   ├── prisma.ts               — Prisma client singleton
    │   ├── hash.ts                 — SHA-256 (Node crypto, server-side)
    │   ├── hash-browser.ts         — SHA-256 (Web Crypto API, client-side)
    │   ├── nutrition.ts            — Nutrition calculation helpers
    │   ├── pizza-size.ts           — PizzaSize type + multipliers
    │   └── layer-rules.ts          — Layer validation helpers
    ├── types/
    │   └── index.ts                — Shared TypeScript types
    └── middleware.ts               — Auth gate for /kitchen and /admin
```

---

## Common Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # ESLint check

npm run db:migrate       # prisma migrate dev
npm run db:seed          # npx prisma db seed
npm run db:reset         # prisma migrate reset --force (re-seeds)
npm run db:studio        # prisma studio (visual DB browser at :5555)
npm run db:generate      # prisma generate (after schema changes)
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in real values. Never commit `.env`.

```env
DATABASE_URL=postgresql://user:password@host:5432/pizza314
AUTH_SECRET=<32-byte hex — generate: openssl rand -hex 32>
KITCHEN_PASSPHRASE=kitchen_demo
ADMIN_PASSPHRASE=admin_demo
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For Vercel deployment: set all env vars in the Vercel dashboard only — never in `vercel.json` or source code.

---

## Key Design Decisions

### 1. Supabase (PostgreSQL) over SQLite
Persistent across deployments. Free tier requires no credit card. Prisma-compatible. If Supabase is unavailable, switch `prisma/schema.prisma` provider to `sqlite` and set `DATABASE_URL=file:./prisma/dev.db` — data resets on each Vercel deploy but acceptable for demo.

### 2. Socket.io for real-time (replaces SSE)
Socket.io provides bidirectional push: kitchen status advances are emitted server-side and received instantly by the customer table without polling. See ADR-008 for full decision record. The old SSE route (`/api/orders/stream/[id]`) is superseded.

**Socket.io conventions:**
- Single shared Socket.io server instance (mounted on the Next.js HTTP server)
- Kitchen joins room `'kitchen'`; customer table joins room `table-${tableId}`
- Status advance emits: `socket.to('kitchen').emit('order-new', order)` and `socket.to(`table-${order.tableId}`).emit('order-status-update', { orderId, status })`
- Event payload for status updates: `{ orderId: number, status: OrderStatus }`
- Customer table receives `'order-status-update'` → shows toast + updates status bar
- Kitchen board receives `'order-new'` → card appears without refresh

**Current real-time strategy in use:** Socket.io

### 3. GSAP for animations
All pizza canvas animations, ingredient transitions, orbit interactions, and status celebrations use GSAP. Do not use CSS keyframes for anything that GSAP handles.

**GSAP conventions:**
- Ingredient fly-in from orbit ring to canvas: `gsap.to(el, { x, y, scale, duration: 0.4, ease: 'back.out(1.7)' })`
- Layer pop-in on canvas: `gsap.fromTo(el, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' })`
- Orbit pulse on hover: `gsap.to(orbitItem, { scale: 1.12, duration: 0.2, ease: 'power2.out' })`
- Combo banner slide-in/out: `gsap.fromTo(banner, { y: -60 }, { y: 0, duration: 0.4, ease: 'power3.out' })`
- Waiting mode transition (orbit + panels fade): `gsap.to([orbit, panels], { opacity: 0, duration: 0.5 })` then reveal games
- Order celebration (confetti/burst): GSAP timeline, triggered once when SERVED
- Always kill GSAP tweens on component unmount: `tween.kill()` in cleanup
- Never use `animate-*` Tailwind utilities for elements managed by GSAP — they conflict

### 4. @dnd-kit over react-dnd
Better touch support. Smaller bundle. Works without HTML5 DnD quirks. Both `PointerSensor` and `TouchSensor` must be registered — default PointerSensor alone breaks on mobile.

### 5. Demo passphrase auth
Signed cookie using `AUTH_SECRET` env var. No user table, no JWT, no OAuth. Kitchen and admin have separate cookies. Customer routes are fully public. Documented as temporary — see Post-Hackathon Roadmap.

### 6. Blockchain ledger is append-only
The `Feedback` table is never updated or deleted. Each block's `blockHash = SHA256(prevHash + timestamp + contentHash)`. The read-last-block + write-new-block must be inside a Prisma `$transaction` to prevent concurrent submissions from colliding on `prevHash`.

### 7. Server-side z-index assignment
`OrderLayer.zIndex` is set by the server on order creation based on `LayerType`: BASE=0, SAUCE=1, CHEESE=2, TOPPING=3+n where n increments per additional topping. This is the canonical render order; the client must respect it.

### 8. Asset path convention
All pizza ingredient images live under `public/assets/pizza/{bases,sauces,cheese,toppings}/`. Seed data `imageUrl` fields must match these paths exactly (e.g. `"/assets/pizza/bases/classic-dough.jpg"`). Do not use the old `public/layers/` path.

---

## Gotchas

- **Prisma singleton**: `src/lib/prisma.ts` must use the global singleton pattern to avoid "too many connections" in Next.js hot-reload dev mode.
- **SHA-256 split**: Server uses Node `crypto.createHash('sha256')` (sync). Browser chain verifier uses `crypto.subtle.digest` (async, returns Promise). These are in separate files (`hash.ts` vs `hash-browser.ts`). Do not mix them.
- **@dnd-kit sensors**: Register both `PointerSensor` and `TouchSensor`. Use `activationConstraint: { distance: 8 }` to prevent accidental drags.
- **Layer type enforcement**: BASE must be exactly 1; the client enforces this before enabling "Place Order". The server also validates: reject orders with no BASE layer.
- **Feedback gate**: `POST /api/feedback` must check `order.status === 'SERVED'` before writing. Return 400 if not SERVED.
- **Cookie names**: Kitchen cookie = `pizza314_kitchen_auth`, Admin cookie = `pizza314_admin_auth`. Using distinct names prevents role confusion in middleware.
- **GSAP cleanup**: Always call `tween.kill()` or `ctx.revert()` in the useEffect cleanup to prevent memory leaks and animation conflicts on unmount.
- **Socket.io + Next.js**: Socket.io server must be attached to the underlying Node.js `http.Server`, not to a Next.js API route. Use a custom server (`server.ts`) or the Next.js instrumentation hook (`instrumentation.ts`) for initialization.

---

## Hackathon Rules

- No paid APIs
- No production secrets committed to git
- No real customer data — synthetic seed data only
- Prefer boring stable code over clever fragile code
- All AI prompts used are logged in `PROMPT_LOG.md`
- All costs logged in `COST_LOG.md`
