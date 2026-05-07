# Technical Decisions — Pizza3.14

Architecture Decision Records (ADRs) for key choices made during the hackathon.

---

## ADR-001: Supabase (PostgreSQL) as Primary Database

**Status:** Accepted

**Context:** Need a database that persists across Vercel deployments, requires zero infrastructure setup, and is free with no credit card.

**Decision:** Use Supabase free tier with PostgreSQL. Connect via Prisma ORM.

**Consequences:**
- (+) Data persists between Vercel deploys
- (+) Prisma supports PostgreSQL natively
- (+) No credit card required for free tier
- (-) Requires a Supabase account and project setup (~15 min)
- **Fallback:** SQLite (`file:./prisma/dev.db`) if Supabase is unavailable. Data resets on each deploy — acceptable for demo only.

---

## ADR-002: Server-Sent Events (SSE) for Real-time Status

**Status:** Accepted (with documented fallback)

**Context:** Customers need to see order status updates without polling manually. Options: WebSockets, SSE, long-polling, short-polling.

**Decision:** Use SSE via Next.js `ReadableStream` route handler with `force-dynamic`. No additional infrastructure.

**Consequences:**
- (+) Works in Next.js App Router with no extra server
- (+) Simpler than WebSockets (one-way, no handshake)
- (-) Vercel free tier has 60 s timeout on serverless functions
- **Fallback:** If SSE is unstable, switch customer page to 3–5 s `setInterval` + `router.refresh()`. Document chosen approach in CLAUDE.md.

---

## ADR-003: @dnd-kit/core for Drag and Drop

**Status:** Accepted

**Context:** Pizza builder requires drag-and-drop from ingredient palette to canvas. Options: @dnd-kit, react-dnd, HTML5 native DnD.

**Decision:** Use @dnd-kit/core.

**Consequences:**
- (+) Better touch/mobile support than react-dnd
- (+) Smaller bundle size
- (+) No HTML5 DnD quirks (broken on touch devices)
- (-) Requires both PointerSensor and TouchSensor to be registered explicitly
- **Gotcha:** Add `activationConstraint: { distance: 8 }` to prevent accidental drags on scroll.

---

## ADR-004: Demo Passphrase Auth (No Real Auth)

**Status:** Accepted (temporary)

**Context:** Kitchen and admin pages must not be publicly accessible. Options: full auth (NextAuth, Supabase Auth), demo passphrase, IP restriction, no auth.

**Decision:** Demo passphrase stored in env vars (`KITCHEN_PASSPHRASE`, `ADMIN_PASSPHRASE`). Set signed HttpOnly cookie using `AUTH_SECRET`. Next.js middleware checks cookie on protected routes.

**Consequences:**
- (+) Zero setup time, no external service
- (+) Works on Vercel with env vars
- (-) Not suitable for production (no user management, shared secret)
- **Post-hackathon:** Replace with NextAuth.js or Supabase Auth.

---

## ADR-005: Append-only Feedback Ledger

**Status:** Accepted

**Context:** Feedback integrity is a product requirement. The ledger must be tamper-evident without requiring a real blockchain network.

**Decision:** Hash-linked chain stored in the `Feedback` table. Each block contains `prevHash`, `contentHash`, `timestamp`, and `blockHash = SHA256(prevHash + timestamp + contentHash)`. Never delete or update rows in `Feedback`.

**Consequences:**
- (+) Simple to implement with Node `crypto`
- (+) Verifiable client-side with Web Crypto API
- (+) No external blockchain dependency
- (-) Only detects tampering — does not prevent it (DBA can still modify the DB)
- **Gotcha:** Read-last-block + write-new-block must be inside a Prisma `$transaction`.

---

## ADR-006: Server-side z-index Assignment

**Status:** Accepted

**Context:** Layer render order must be canonical and consistent across devices.

**Decision:** Server sets `OrderLayer.zIndex` at order creation time: BASE=0, SAUCE=1, CHEESE=2, TOPPING=3+n. Stored in DB. Client uses stored value for rendering.

**Consequences:**
- (+) Single source of truth; client cannot desync render order
- (+) Works correctly even if client sends layers in wrong order
- (-) Slight complexity in seed data (must set zIndex manually)
