# Reflection — Pizza3.14 Hackathon

**Author:** Ali Ashir  
**Dates:** 2026-05-07 to 2026-05-09  
**Model used:** Claude Sonnet 4.6 via Claude Code CLI

---

## What We Built

Pizza3.14 is a full-stack interactive tabletop pizza ordering system. In 3 days we shipped:

- A full-screen black-glass pizza builder with a rotating GSAP ingredient orbit ring, per-layer stacking canvas, live nutrition + bill panels, and guided 6-step build flow
- Socket.io real-time bidirectional push — new orders appear on the kitchen board instantly; status advances push toast notifications to the customer table
- A blockchain-style feedback ledger with SHA-256 hash chain verified client-side
- Kitchen Kanban board with 5 columns (NEW → PREPARING → BAKING → READY → SERVED) and drag-to-advance
- Admin dashboard with Recharts analytics, menu management, and chain verifier
- A narrative landing page with GSAP ScrollTrigger sections and a rotating pizza hero
- Full Swagger/OpenAPI docs at `/api-doc`
- Railway deployment with a custom Node.js server for Socket.io persistence

---

## What Worked Well

### 1. Scoped CLAUDE.md files were a multiplier
Creating path-scoped `CLAUDE.md` files for `src/app/`, `src/components/`, `src/lib/`, and `prisma/` before writing any application code was the single best decision of the hackathon. Every subsequent prompt landed correctly without repeating constraints. Claude never imported Prisma into a client component, never put business logic in page files, and never mixed SHA-256 implementations across the server/browser boundary — because each file's CLAUDE.md made the invariants explicit in context.

### 2. Claude Code for structural scaffolding is exceptional
Milestones 1–3 (app skeleton, Prisma schema, full API layer with Swagger) were delivered faster than any manual approach would allow. Describing the data model once in natural language produced correct Prisma schema, migration, seed script, and typed API routes in a single session.

### 3. GSAP + Socket.io integration was smoother than expected
The combination of GSAP animations with Socket.io real-time events required careful cleanup discipline (`tween.kill()` on unmount, room re-join on reconnect). Claude Code correctly applied these patterns once they were documented in CLAUDE.md, and the `pizza-qa` custom skill now audits for regressions automatically.

### 4. Per-layer CSS config for pizza canvas
The insight to use percentage-based insets per `LayerType` (`LAYER_CONFIG` in `PizzaCanvas.tsx`) rather than trying to pre-process images was a clean, maintainable solution. Sauce covers 90% of the canvas (5% inset), toppings render at ~53% effective size (12% inset + 0.75 scale). This was found through iterative browser testing, not upfront design.

---

## What Didn't Work / Required Recovery

### 1. Vercel serverless + Socket.io is a hard incompatibility
**What happened:** Three sessions were spent trying to make Socket.io work on Vercel via `instrumentation.ts` and custom server workarounds. The Vercel serverless runtime tears down the server context between requests — there is no persistent `http.Server` to attach Socket.io to.  
**Recovery:** Migrated to Railway. A long-running container gives Socket.io exactly what it needs. In hindsight, Railway should have been the first choice given Socket.io was in the architecture from day 1.  
**Lesson:** Match your infrastructure choice to your real-time strategy before writing a line of code.

### 2. Supabase free-tier connection pool exhaustion
**What happened:** The admin page crashed with `EMAXCONNSESSION: max clients reached, pool_size: 15` because Next.js hot-reload creates new Prisma client instances and the Supabase session-mode pooler has a hard 15-connection limit.  
**Recovery:** Added `connection_limit=1` to `DATABASE_URL` in `prisma.ts` via `buildClient()`. Requires a full server restart (not hot-reload) because the Prisma singleton is cached in `global`.  
**Lesson:** Set `connection_limit=1` from the very first commit when using Supabase free tier. Document it in CLAUDE.md immediately.

### 3. TestOrderForm dead-end sprint
**What happened:** To unblock testing of the kitchen/admin modules early, a simplified `TestOrderForm` replaced the pizza builder UI entirely. This was later thrown away when the full builder was built — two sessions of rework.  
**Recovery:** Both UIs were built, but the TestOrderForm phase added ~4 hours of churn.  
**Lesson:** Build a minimal-but-correct version of the primary UI first. A form placeholder that exercises the same API is fine, but deleting the pizza builder components was too destructive.

### 4. GSAP ScrollTrigger invisible cards on landing page
**What happened:** All cards in the Problem, Solution, Features, and How It Works sections were invisible on load. Root cause: `gsap.registerPlugin(ScrollTrigger)` was called in a child `useEffect` that ran after GSAP had already set `opacity: 0` as the initial state. React Strict Mode double-invocation compounded this.  
**Recovery:** Replaced all scroll-entrance animations with native `IntersectionObserver` + CSS transitions. GSAP retained only for continuous animations (rotations, glow pulses). The landing page became more reliable and loaded faster.  
**Lesson:** GSAP ScrollTrigger + React Strict Mode is a known hazard. Use IntersectionObserver for scroll reveals; reserve GSAP for animations that need timeline control or physics easing.

---

## Claude Code Usage Patterns That Moved the Needle

| Pattern | Impact |
|---|---|
| Scoped `CLAUDE.md` per directory | Eliminated 90% of cross-boundary mistakes |
| "Build this milestone, no more" | Kept scope tight; prevented feature creep mid-session |
| Describing invariants explicitly ("never delete from Feedback table") | Claude respected them across all 30 commits |
| Asking for a diff summary before accepting | Caught 3 subtle bugs before they were committed |
| Custom skills (`/demo-ready`, `/pizza-qa`) | Codified project-specific checklists that any team member can run |
| Plan mode for 30+ min tasks | The Socket.io audit and admin module used plan mode; both came out cleaner |

---

## What I Would Do Differently

1. **Railway from day 1** — never attempt Socket.io on Vercel serverless
2. **`connection_limit=1` in the initial `prisma.ts`** — save 2 hours of debugging
3. **Keep the pizza builder UI from the start** — don't replace it with a test form
4. **Use IntersectionObserver for all scroll reveals** — don't rely on GSAP ScrollTrigger + React
5. **PostHog/Sentry from milestone 1** — observability during the hackathon itself would have surfaced the connection pool issue immediately instead of hours later

---

## Final State

The app is fully functional and deployed on Railway. All three user roles (customer, kitchen, admin) work end-to-end. The Socket.io real-time pipeline is live. The feedback ledger hash chain is intact and verifiable. Thirty commits, zero secrets in git, all costs at $0.

The most interesting technical outcome: the hash-chain ledger pattern (SHA-256 linked blocks, server-written, client-verified) is production-quality and could be lifted into any system that needs tamper-evident audit logs without a real blockchain.
