# CLAUDE.md — Pizza3.14

## Project Overview

Pizza3.14 is a Next.js 14 App Router application for tabletop pizza ordering. Customers drag transparent PNG ingredient layers onto a canvas, place orders, track live status, and submit feedback. Full product spec: see `SPEC.md`.

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
│   └── layers/                     — Transparent PNG ingredient images
├── docs/
│   ├── PM_BRIEF.md
│   ├── ARCHITECTURE_OVERVIEW.md
│   ├── TECHNICAL_DECISIONS.md
│   └── POST_HACKATHON_ROADMAP.md
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                — Redirect → /table/1
    │   ├── globals.css
    │   ├── table/[tableId]/
    │   │   └── page.tsx            — Customer pizza builder
    │   ├── kitchen/
    │   │   └── page.tsx            — Kitchen order board
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
    │       ├── orders/stream/[id]/route.ts
    │       ├── feedback/route.ts
    │       ├── admin/
    │       │   ├── feedback/route.ts
    │       │   └── stats/route.ts
    │       └── auth/login/route.ts
    ├── components/
    │   ├── pizza-builder/
    │   │   ├── PizzaCanvas.tsx
    │   │   ├── LayerPalette.tsx
    │   │   ├── DraggableLayerItem.tsx
    │   │   └── StackedLayerImage.tsx
    │   ├── order/
    │   │   ├── NutritionPanel.tsx
    │   │   ├── OrderButton.tsx
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
    │   └── nutrition.ts            — Nutrition calculation helpers
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

### 2. SSE for real-time status
`/api/orders/stream/[id]` uses a `ReadableStream` with polling every 2 s internally. The route must have `export const dynamic = 'force-dynamic'` to prevent Next.js caching. If SSE proves unstable on Vercel (60 s timeout), the client falls back to 3–5 s `setInterval` + `router.refresh()`.

**Current real-time strategy in use:** SSE (update this note if switched to polling).

### 3. @dnd-kit over react-dnd
Better touch support. Smaller bundle. Works without HTML5 DnD quirks. Both `PointerSensor` and `TouchSensor` must be registered — default PointerSensor alone breaks on mobile.

### 4. Demo passphrase auth
Signed cookie using `AUTH_SECRET` env var. No user table, no JWT, no OAuth. Kitchen and admin have separate cookies. Customer routes are fully public. Documented as temporary — see Post-Hackathon Roadmap.

### 5. Blockchain ledger is append-only
The `Feedback` table is never updated or deleted. Each block's `blockHash = SHA256(prevHash + timestamp + contentHash)`. The read-last-block + write-new-block must be inside a Prisma `$transaction` to prevent concurrent submissions from colliding on `prevHash`.

### 6. Server-side z-index assignment
`OrderLayer.zIndex` is set by the server on order creation based on `LayerType`: BASE=0, SAUCE=1, CHEESE=2, TOPPING=3+n where n increments per additional topping. This is the canonical render order; the client must respect it.

---

## Gotchas

- **Prisma singleton**: `src/lib/prisma.ts` must use the global singleton pattern to avoid "too many connections" in Next.js hot-reload dev mode.
- **SSE route**: Must include `export const dynamic = 'force-dynamic'` — without it Next.js may cache or skip the handler.
- **SHA-256 split**: Server uses Node `crypto.createHash('sha256')` (sync). Browser chain verifier uses `crypto.subtle.digest` (async, returns Promise). These are in separate files (`hash.ts` vs `hash-browser.ts`). Do not mix them.
- **@dnd-kit sensors**: Register both `PointerSensor` and `TouchSensor`. Use `activationConstraint: { distance: 8 }` to prevent accidental drags.
- **Layer type enforcement**: BASE must be exactly 1; the client enforces this before enabling "Place Order". The server also validates: reject orders with no BASE layer.
- **Feedback gate**: `POST /api/feedback` must check `order.status === 'SERVED'` before writing. Return 400 if not SERVED.
- **Cookie names**: Kitchen cookie = `pizza314_kitchen_auth`, Admin cookie = `pizza314_admin_auth`. Using distinct names prevents role confusion in middleware.

---

## Hackathon Rules

- No paid APIs
- No production secrets committed to git
- No real customer data — synthetic seed data only
- Prefer boring stable code over clever fragile code
- All AI prompts used are logged in `PROMPT_LOG.md`
- All costs logged in `COST_LOG.md`
