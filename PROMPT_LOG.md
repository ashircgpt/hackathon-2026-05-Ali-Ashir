# PROMPT_LOG.md — Pizza3.14

Log of all AI-assisted prompts used during the hackathon.

Format:
```
### [YYYY-MM-DD HH:MM] — Brief description
**Prompt:** <prompt text or summary>
**Files affected:** <list of files>
**Notes:** <anything notable>
```

---

### [2026-05-07 15:34] — Initial project planning

**Prompt:** Full hackathon brief including product requirements (10 items), hackathon rules, and request to create a 3-day implementation plan with milestones, routes, DB schema, component structure, test plan, deployment plan, and risks.

**Files affected:** Plan file (`.claude/plans/use-plan-mode-we-graceful-walrus.md`)

**Notes:** Plan mode used. Multiple revision rounds based on user feedback before approval.

---

### [2026-05-07 16:00] — Hackathon Discipline Setup

**Prompt:** Execute Milestone 0 — create SPEC.md, CLAUDE.md, PROMPT_LOG.md, COST_LOG.md, docs/ files, .env.example, .gitignore, and first commit before any app code.

**Files affected:** SPEC.md, CLAUDE.md, PROMPT_LOG.md, COST_LOG.md, docs/PM_BRIEF.md, docs/ARCHITECTURE_OVERVIEW.md, docs/TECHNICAL_DECISIONS.md, docs/POST_HACKATHON_ROADMAP.md, .env.example, .gitignore

**Notes:** Repo was empty (no package.json). Next.js 14 scaffold bootstrapped via create-next-app in temp dir due to capital-letter directory name restriction.

---

### [2026-05-07 16:30] — Path-scoped CLAUDE.md files for key directories

**Prompt:** Before Milestone 1, create path-scoped CLAUDE.md files for src/app/, src/components/, src/lib/, and prisma/. Each file should define layer-specific rules covering: server/client boundaries, route conventions, component size, data fetching discipline, hashing split, nutrition purity, DB rules, seed constraints. Files must complement root CLAUDE.md without repeating it. Keep each under 80 lines.

**Files affected:** src/app/CLAUDE.md, src/components/CLAUDE.md, src/lib/CLAUDE.md, prisma/CLAUDE.md

**Notes:** Good discipline prompt — scoped rules prevent context drift during multi-step code generation. No application code written.

---

### [2026-05-07 17:00] — Milestone 1: App Skeleton and Core Structure

**Prompt:** Create clean scalable app structure with shadcn/ui, placeholder routes (/, /table/[tableId], /kitchen, /admin/*, /login), shared dark futuristic theme, reusable UI primitives (PageContainer, SectionCard, StatusBadge, StatCard), admin sidebar/header layout, health endpoint, src/lib and src/types stubs.

**Files affected:** tailwind.config.ts, globals.css, components.json, src/app/layout.tsx, src/app/page.tsx, src/types/index.ts, src/lib/utils.ts + prisma.ts + hash.ts + hash-browser.ts + nutrition.ts, src/middleware.ts, src/components/ui/* (Button Badge Card Input Textarea Label Tabs Separator), src/components/PageContainer.tsx + SectionCard.tsx + StatusBadge.tsx + StatCard.tsx, src/components/layout/AdminSidebar.tsx + AdminHeader.tsx, all page routes (9), src/app/api/health/route.ts, README.md

**Notes:** Build clean on first pass after fixing two empty-interface ESLint errors. All 12 routes render. No business logic, no DB, no realtime yet.

---

### [2026-05-08] — Milestones 2–5: Data layer, API, pizza builder, UI redesign

**Prompt:** Series of milestone prompts covering: (M2) Prisma schema + Supabase seed with 16 menu items, 8 orders, 2 feedback blocks + PostgreSQL sequence reset fix; (M3) Full API layer — GET/POST orders, PATCH status, GET menu, POST feedback, GET admin/feedback + stats, POST auth/login; (M4) Customer pizza builder UI — PizzaCanvas, LayerPalette, SelectedLayersPanel, NutritionPanel, OrderSummary, PizzaBuilder; (M5) Full-screen tabletop UI redesign — h-screen dark tabletop, 560px hero canvas, orbit-style ingredient tray, glass bottom panel, GSAP pop-in, wheel/pinch size control, DragOverlay, animated landing page at /.

**Files affected:** prisma/schema.prisma, prisma/seed.ts, src/app/api/* (all routes), src/types/index.ts, src/lib/pizza-size.ts, src/lib/layer-rules.ts, src/components/pizza-builder/* (all components), tailwind.config.ts, src/app/globals.css, src/app/page.tsx, src/app/table/[tableId]/page.tsx

**Notes:** P2002 seed collision fixed via pg_get_serial_sequence + setval. Canvas visibility issue fixed with pizza-base-disc warm radial gradient. Two plan rejections before final approval (contradictions in earlier plans). Build clean, lint warnings only (pre-existing img tags).

---

### [2026-05-08] — Product vision sync: GSAP + Socket.io + orbit ring + waiting games

**Prompt:** Documentation and Notion sync task. Full PRD update to reflect expanded product vision: black glass tabletop, ingredient orbit ring replacing bottom tray, GSAP for all animations, Socket.io replacing SSE for real-time bidirectional push, left/right nutrition+bill panels, Most Famous Combo banner, waiting mini games (Tic Tac Toe + Pizza Trivia), expanded kitchen Kanban (today-only, 4 columns), expanded admin (stats charts + menu management + ledger verify).

**Files affected:** SPEC.md, CLAUDE.md, src/components/CLAUDE.md, docs/ARCHITECTURE_OVERVIEW.md, docs/TECHNICAL_DECISIONS.md, PROMPT_LOG.md

**Notes:** Documentation-only task. No application code changed. ADR-007 (GSAP) and ADR-008 (Socket.io) added. ADR-002 (SSE) marked superseded. Notion page updated to reflect new vision. Model: Sonnet.

---

### [2026-05-08] — Phase 0: Repo stabilization and baseline commit

**Prompt:** Full M6-M14 roadmap pasted. User requested to remove irrelevant code, stabilize the repo to a clean baseline, and get a single clean commit of all M4+M5 uncommitted work before starting new milestones.

**Files affected:** .gitignore (added .claude/), SPEC.md, CLAUDE.md, PROMPT_LOG.md, docs/ARCHITECTURE_OVERVIEW.md, docs/TECHNICAL_DECISIONS.md, src/components/pizza-builder/* (PizzaCanvas, IngredientOrbit, NutritionPanel, BillPanel, CombosBanner, SelectedLayersPanel, OrderSummary, PizzaBuilder), src/app/page.tsx

**Notes:** Commit ac2fd19. Phase 0 plan created and approved in plan mode. Cleaned up stale SSE references from src/app/CLAUDE.md. All M4+M5 work committed. Model: Sonnet.

---

### [2026-05-08] — Landing page redesign: narrative scroll experience

**Prompt:** "landing page should not be same like our proposed table ui... Welcome to Pizza 3.14(pi notation), intro to technology, restaurant, problems we are solving... user should get idea in interactive way not text only... color theme like pizza yellow cheesy... story-driven with outstanding UI... after scrolling lets-build button at the end."

**Files affected:**
- `tailwind.config.ts` — added 6 new pizza-warm tokens (cheese, cheese-dim, tomato, crust, basil, cream)
- `src/app/globals.css` — added gradient text utilities (.text-gradient-pizza, .text-gradient-cheese), warm radial backgrounds (.bg-pizza-radial, .bg-tomato-radial), html smooth-scroll
- `src/app/page.tsx` — wired to new LandingPage
- DELETED: src/components/landing/AttractScreen.tsx, IngredientOrbitRing.tsx, ComboTopBanner.tsx, PizzaHeroDisc.tsx, PrimaryCTA.tsx (attract-screen concept replaced)
- NEW: `src/components/landing/LandingPage.tsx` — root, registers GSAP ScrollTrigger plugin
- NEW: `src/components/landing/Navbar.tsx` — sticky transparent → glass on scroll, "Pizza 3.14π" brand, anchor nav, "Start Building" CTA
- NEW: `src/components/landing/sections/HeroSection.tsx` — full-viewport hero with bleeding pizza disc, floating ingredient particles, gradient title
- NEW: `src/components/landing/sections/StorySection.tsx` — vision narrative + animated layered pizza visual
- NEW: `src/components/landing/sections/ProblemSection.tsx` — 6 pain-point cards in tomato accent
- NEW: `src/components/landing/sections/SolutionSection.tsx` — 3-pillar architecture (TABLE / KITCHEN / ADMIN) with gradient connector line
- NEW: `src/components/landing/sections/FeaturesSection.tsx` — 6 feature cards with icon hover scale
- NEW: `src/components/landing/sections/HowItWorksSection.tsx` — 5-step horizontal timeline (Sit → Build → Order → Watch → Verify) with animated gradient fill
- NEW: `src/components/landing/sections/FinalCTASection.tsx` — dramatic close with rotating pizza, glow pulse, "Let's Build Your Pizza" button → /table/1

**Notes:** All animations via GSAP + ScrollTrigger (registered once in LandingPage). Each section uses `gsap.context()` for cleanup. Numbered narrative arc (01–06). Build clean: `/` route is 26.8 kB. Model: Sonnet (under Opus model selection).

---

### [2026-05-08] — M6A + M6B: Landing attract screen + Kitchen Kanban board

**Prompt:** "now lets move to the next... i want to complete the rest like kitchen kanban frontend first then i will move to admin UI... landing page + kitchen frontend"

**Files affected:**
- `tailwind.config.ts` — 11 new design tokens (ember, void, glass, frost, smoke, ash, status-*)
- `src/app/globals.css` — 5 new glow utilities (.glow-ember, .glow-ready, .glow-baking, .glow-new, .text-glow)
- `src/app/page.tsx` — replaced 140-line marketing page with thin shell → AttractScreen
- `src/app/kitchen/page.tsx` — replaced hardcoded placeholder with thin shell → KitchenBoard
- `src/components/landing/AttractScreen.tsx` (new) — h-screen attract screen, GSAP load sequence, idle slowdown
- `src/components/landing/PizzaHeroDisc.tsx` (new) — rotating 380px pizza disc with glow, forwardRef speed control
- `src/components/landing/IngredientOrbitRing.tsx` (new) — 6-ingredient SVG orbit ring, GSAP continuous rotation
- `src/components/landing/ComboTopBanner.tsx` (new) — fetches /api/menu/famous-combo, GSAP slide-in
- `src/components/landing/PrimaryCTA.tsx` (new) — CTA button with glow pulse, disc speed-up on hover
- `src/components/kitchen/KitchenBoard.tsx` (new) — DndContext, 4s polling, drag-to-advance, optimistic updates
- `src/components/kitchen/KitchenHeader.tsx` (new) — live clock, order counts, logout
- `src/components/kitchen/KanbanColumn.tsx` (new) — useDroppable column, status glow on drag-over
- `src/components/kitchen/OrderCard.tsx` (new) — useDraggable card, GSAP entry, urgency bar
- `src/components/kitchen/UrgencyBar.tsx` (new) — time-based progress bar, CSS transition width
- `src/components/kitchen/EmptyColumnState.tsx` (new) — empty placeholder

**Notes:** Framer Motion not installed — all animations via GSAP + CSS transitions. ComboTopBanner uses /api/menu/famous-combo (public) not /api/admin/stats (requires cookie). Build clean, zero TypeScript/lint errors. Model: Sonnet.

---

### [2026-05-08] — M6: Asset audit, seed alignment, GSAP install, DB reset

**Prompt:** "lets move as per M6 — asset audit. There is only one picture in cheese so there should be two at least so add one there."

**Files affected:** public/assets/pizza/cheese/mozzarella.jpg (new — copy of cheddar as placeholder), prisma/seed.ts (imageUrls updated from /layers/*.png → /assets/pizza/…/*.jpg; menu items trimmed to 15 to match actual assets: 3 BASE, 3 SAUCE, 2 CHEESE, 7 TOPPING; removed Pesto/Garlic Cream/Vegan Cheese which had no images; added Chicken Chunks id:17; renamed Bell Peppers→Capsicum, Pineapple→Onions; updated orders 5+6 to use valid item IDs), package.json + package-lock.json (gsap@3.15.0, @gsap/react@2.1.2 installed)

**Notes:** `npm run db:reset` ran successfully — migration reapplied, 15 menu items + 8 orders + 2 feedback blocks seeded. Sequences reset. Famous combo still works (ids 1,4,8,11,12). EPERM DLL rename warning on Windows is a known Prisma/Windows noise — seed completed fine. Model: Sonnet.

---

### [2026-05-08] — Backend build: complete API layer + Socket.io + Swagger

**Prompt:** "First I want you to plan and build the backend first — build all the needed APIs which would be needed by frontend's all three modules. Also add Swagger implementation to the APIs as well."

**Files affected:** server.ts (new), src/lib/socket-server.ts (new), src/lib/socket-client.ts (new), src/lib/combo.ts (new), src/lib/swagger.ts (new), src/middleware.ts (upgraded cookie validation), src/app/api/auth/login/route.ts (new), src/app/api/auth/logout/route.ts (new), src/app/api/menu/route.ts (Swagger added), src/app/api/menu/famous-combo/route.ts (new), src/app/api/admin/menu/route.ts (new), src/app/api/admin/menu/[id]/route.ts (new), src/app/api/orders/route.ts (filters + Socket emit + Swagger), src/app/api/orders/[id]/route.ts (Swagger), src/app/api/orders/[id]/status/route.ts (Socket emits + Swagger), src/app/api/feedback/route.ts (Swagger), src/app/api/admin/feedback/route.ts (Swagger), src/app/api/admin/stats/route.ts (today stats + hourly breakdown + Swagger), src/app/api-doc/page.tsx (new), src/app/api-doc/react-swagger.tsx (new), package.json (dev/start scripts → tsx server.ts)

**Notes:** Commit 36fdab6. Custom server.ts approach chosen for Socket.io persistence (incompatible with Vercel serverless — targets Railway/Render). Middleware upgraded to Web Crypto API (Edge-compatible SHA-256). `computeTopCombo()` extracted to lib/combo.ts to avoid duplication. All Socket emit calls wrapped in try/catch for graceful degradation. Model: Sonnet.

---

### [2026-05-08] — Landing page performance fix: invisible section cards

**Prompt:** "The UI of landing page is perfect But it is taking too much time to load like even near to not loading (for example: cards of problem are invisible, similarly cards of solution are also invisible) ig we need to optimize... optimize it like you are a senior frontend developer."

**Files affected:** src/components/landing/LandingPage.tsx, src/components/landing/sections/StorySection.tsx, src/components/landing/sections/ProblemSection.tsx, src/components/landing/sections/SolutionSection.tsx, src/components/landing/sections/FeaturesSection.tsx, src/components/landing/sections/HowItWorksSection.tsx, src/components/landing/sections/FinalCTASection.tsx

**Notes:** Commits cf9ccaa → b7da16b. Root cause: `gsap.registerPlugin(ScrollTrigger)` fired too late (parent useEffect runs after child useEffects in React), and even after moving it to module scope, GSAP's `gsap.from()` opacity:0 initial state permanently hid cards when ScrollTrigger silently failed (SSR module eval, React Strict Mode double-invoke). Final fix: replaced all scroll-entrance animations across 6 section files with native `IntersectionObserver` + CSS transitions (`.reveal`, `.reveal-scale`, `.reveal-line` utility classes added to globals.css). GSAP retained only for continuous animations (HeroSection rotations, FinalCTASection glow/rotation). LandingPage.tsx now imports nothing from gsap. Model: Sonnet.

---

### [2026-05-08] — Table UI replaced with TestOrderForm (kitchen/admin testing harness)

**Prompt:** "delete the existing table ui... add a simple form type thing for now with the same ui color theme so that i can easily place order... check that weather bills + nutritions are updating or not and then I place order I can get the perfect order tracking notification as per kitchen kaanbaan movement using socket.io"

**Files affected:**
- DELETED: `src/components/pizza-builder/` (8 files — PizzaBuilder, PizzaCanvas, LayerPalette, SelectedLayersPanel, LayerItemCard, PizzaSizeSelector, NutritionPanel, OrderSummary)
- NEW: `src/components/test-order/TestOrderForm.tsx` — two-column dark glass form: ingredient picker (radio per BASE/SAUCE/CHEESE, checkbox for TOPPING), live bill + 4-macro nutrition panel, Place Order → `POST /api/orders`, Socket.io `order-status-update` listener, animated 5-step status bar with ember fill
- MODIFIED: `src/app/table/[tableId]/page.tsx` — now renders TestOrderForm

**Notes:** Zero ESLint warnings. Reuses `computeTotals()`, `getSocket()`, all existing types. No new dependencies. Model: Sonnet.

---

### [2026-05-08] — Admin module: FeedbackSection + SettingsSection + layout fix

**Prompt:** "make sure you complete the admin functionality + also upgrade the UI as per the theme"

**Files affected:**
- NEW: `src/components/admin/FeedbackSection.tsx` — blockchain ledger viewer; fetches `GET /api/admin/feedback`; GSAP stagger timeline (120ms per block) flashes borders green (valid) / red (tampered) on "Verify Chain"; `verifyChain()` from `hash-browser.ts`; truncated hashes (10+8 chars); result banner; block cards with quoted content + 3-col hash grid
- NEW: `src/components/admin/SettingsSection.tsx` — system status panel; live Socket.io connected/disconnected dot via `connect`/`disconnect` events; DB always "Connected"; credential reveal toggles (kitchen_demo / admin_demo); auth config grid (cookie names, routes, middleware runtime)
- NEW: `src/components/admin/AdminSidebar.tsx` — dark-theme nav with correct routes (overview/orders/menu/feedback/settings)
- NEW: `src/components/admin/OverviewSection.tsx` — stats dashboard with Recharts area/bar/pie charts, countUp animation, hourly breakdown, top combo display
- NEW: `src/components/admin/OrdersSection.tsx` — filterable order table with status filter bar, today-only toggle, expandable row detail
- NEW: `src/components/admin/MenuSection.tsx` — menu management table
- NEW: `src/app/admin/overview/page.tsx`, `src/app/admin/settings/page.tsx` — thin page shells
- MODIFIED: `src/app/admin/layout.tsx` — fixed wrong sidebar import (`@/components/layout/AdminSidebar` → `@/components/admin/AdminSidebar`), corrected bg tokens (`bg-background` → `bg-void text-cream`)
- MODIFIED: `src/app/admin/feedback/page.tsx`, `orders/page.tsx`, `menu/page.tsx`, `page.tsx` — refactored to thin shells delegating to section components

**Notes:** Zero ESLint warnings. GSAP cleanup via `tl.kill()` in useEffect return stored in ref. `verifyChain` extended type `FeedbackWithOrder` adds nested `order?: { id, tableId }`. Model: Sonnet.

---

### [2026-05-08] — Kitchen SERVED column added

**Prompt:** "there is no served card on kitchen dashboard? how are you managing this served flow? you dont think that we should have served in kitchen module?"

**Files affected:**
- `src/components/kitchen/KitchenBoard.tsx` — fetch now includes SERVED orders (`?today=true` without exclude); added SERVED to column list and counts; Socket.io `join-kitchen` + `order-new` + `order-advance` event wiring (was completely missing)
- `src/components/kitchen/KanbanColumn.tsx` — SERVED column gets muted visual treatment (bg-void/20, border-ash/40, opacity-80, header text-smoke/60)
- `src/components/kitchen/OrderCard.tsx` — SERVED cards: `useDraggable({ disabled: isServed })`, no listeners/attributes, no Advance button, "✓ Done" label, opacity-50 cursor-default styling; no UrgencyBar
- `src/components/kitchen/KitchenHeader.tsx` — added "Served N" count to stats bar

**Notes:** Kitchen staff marks READY→SERVED by clicking Advance (drag also works). SERVED cards are read-only. Model: Sonnet.

---

### [2026-05-08] — Socket.io audit: hot-reload singleton fix + customer table room rejoin + admin real-time

**Prompt:** "test the socket.io functionality through preview. make it perfectly working on each module and audit it as well." / "I have placed an order from table form — on runtime it gets listed in kitchen kanban but when I switch the state from kitchen module my table didn't update the live status. Also my admin module didn't update the order number or etc on runtime. Maybe socket.io is not working — audit and fix this."

**Root causes found:**
1. **Hot-reload singleton reset** — `let io: SocketIOServer | null = null` in `socket-server.ts` resets to `null` every time Next.js hot-reloads the module (on any file save). All `getIO()` calls then throw; `catch {}` silently swallows them → zero socket events emitted from any API route.
2. **Customer table room lost on reconnect** — `join-table` only emitted once; if socket disconnected/reconnected (server restart, network hiccup), client was no longer in the room.
3. **Admin had no real-time at all** — `OverviewSection` and `OrdersSection` fetched once on mount, never again. No socket, no polling.

**Files affected:**
- `src/lib/socket-server.ts` — applied `global.__socketIO` singleton pattern (same as Prisma) so hot-reload picks up the existing server instance; added `join-admin` room handler; `getIO()` now falls back to `g.__socketIO` before throwing
- `src/app/api/orders/route.ts` — `POST` now also emits `order-new` to `admin` room
- `src/app/api/orders/[id]/status/route.ts` — `PATCH` now also emits `order-advance` to `admin` room
- `src/components/test-order/TestOrderForm.tsx` — replaced single `joinRoom()` call with `joinRoom()` + `socket.on("connect", joinRoom)` so room is re-joined after any reconnect; added `leave-table` on cleanup
- `src/components/kitchen/KitchenBoard.tsx` — same reconnect pattern: `joinKitchen()` + `socket.on("connect", joinKitchen)`
- `src/components/admin/OverviewSection.tsx` — added `join-admin` socket room; listens for `order-new`/`order-advance` → debounced stats refresh (500ms); 15-second polling fallback
- `src/components/admin/OrdersSection.tsx` — added `join-admin` socket room; listens for `order-new`/`order-advance` → debounced order-list refresh (400ms); 8-second polling fallback; `filterRef` pattern avoids stale closures in socket callbacks

**Notes:** Zero ESLint warnings. All three modules now receive real-time updates. Polling fallbacks ensure data stays fresh even if socket misses an event. Model: Sonnet.

---
