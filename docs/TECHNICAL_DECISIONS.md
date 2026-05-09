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

## ADR-002: Server-Sent Events (SSE) for Real-time Status ⚠️ SUPERSEDED

**Status:** Superseded by ADR-008 (Socket.io)

**Context:** Customers need to see order status updates without polling manually. Options: WebSockets, SSE, long-polling, short-polling.

**Original Decision:** Use SSE via Next.js `ReadableStream` route handler with `force-dynamic`. No additional infrastructure.

**Why superseded:** SSE is one-way (server → client only) and cannot push new orders to the kitchen board without a separate SSE stream per kitchen tab. Socket.io's room-based bidirectional model handles both customer table updates and kitchen board live updates with a single shared server instance, eliminating the 60 s Vercel timeout concern via persistent WebSocket connections.

**See ADR-008** for the replacement decision.

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

---

## ADR-007: GSAP for Animations

**Status:** Accepted

**Context:** The new table UI requires orchestrated animations: ingredient fly-in from orbit ring to canvas, layer pop-in stacking effects, orbit ring pulse on hover, combo banner slide-in/out, waiting mode fade transition, and order completion celebration. CSS keyframes alone cannot handle complex, physics-based, chained sequences reliably across browsers.

**Decision:** Use GSAP (GreenSock Animation Platform) for all pizza canvas animations, ingredient transitions, and UI state celebrations. Tailwind `animate-*` utilities are retained only for non-GSAP elements (e.g., loading skeletons, simple button hovers).

**Consequences:**
- (+) Physics-based spring easing (`back.out`, `elastic.out`) not available in CSS
- (+) Timeline control for sequenced multi-element animations
- (+) `gsap.context()` provides clean React integration with automatic cleanup
- (+) Better performance than CSS for transform-heavy animations (uses WAAPI under the hood)
- (-) Additional dependency (~30 KB gzipped for core)
- (-) Must not mix with Tailwind `animate-*` on the same element (conflicts)
- **Gotcha:** Always call `ctx.revert()` or `tween.kill()` in `useEffect` cleanup to prevent memory leaks.

---

## ADR-009: Railway over Vercel for Production Deployment

**Status:** Accepted

**Context:** Socket.io (ADR-008) requires attaching to a persistent Node.js `http.Server`. Vercel serverless functions are stateless and terminate after each request — there is no shared server instance to attach Socket.io to. The workaround (`instrumentation.ts` + custom server) was not reliable on Vercel's infrastructure.

**Decision:** Deploy to Railway free tier. Railway provides a long-running container process that runs `node server.ts`, which attaches Socket.io to the underlying Node.js HTTP server before Next.js begins serving requests.

**Consequences:**
- (+) Socket.io works correctly — no serverless teardown
- (+) Custom `server.ts` pattern is straightforward and well-supported
- (+) Railway free tier is $0 and requires no credit card
- (+) Same env var setup as Vercel (set in Railway dashboard)
- (-) Slightly longer cold start compared to Vercel Edge
- (-) Less global CDN distribution than Vercel's edge network
- **Related fix:** Supabase free-tier session pool (`pool_size: 15`) was exhausted by Next.js hot-reload + Railway long-lived process. Fixed by appending `connection_limit=1` to `DATABASE_URL` in `src/lib/prisma.ts` via `buildClient()`.

---

## ADR-008: Socket.io Replacing SSE for Real-time

**Status:** Accepted (supersedes ADR-002)

**Context:** The expanded product vision requires two-way real-time communication: (1) kitchen status advances must push to the customer table instantly, and (2) new customer orders must appear on the kitchen board without refresh. SSE (ADR-002) only supports server-to-client push on a single connection per client, requiring separate streams for each use case and suffering from Vercel's 60 s serverless timeout.

**Decision:** Use Socket.io with room-based messaging. Kitchen joins room `'kitchen'`; each customer table joins room `table-${tableId}`. Status advances emit `'order-status-update'` to the customer's room; new orders emit `'order-new'` to the kitchen room.

**Consequences:**
- (+) Bidirectional — one connection handles all push scenarios
- (+) Room-based — targeted delivery to customer or kitchen without broadcasting to everyone
- (+) Handles reconnection and transport fallback automatically
- (+) New orders appear on kitchen board in real time (not possible with per-order SSE)
- (-) Requires a persistent Node.js server process — not compatible with pure Vercel serverless by default
- (-) Larger dependency footprint than SSE (~40 KB gzipped)
- **Deployment note:** Socket.io requires attaching to the underlying `http.Server`. On Vercel, use a custom server (`server.ts`) or the `instrumentation.ts` hook. If this proves impractical on Vercel's infrastructure, fall back to the documented polling strategy (3–5 s `setInterval`) and document the decision here.
- **Fallback:** 3–5 s client polling on `GET /api/orders/[id]` if Socket.io connection fails.
