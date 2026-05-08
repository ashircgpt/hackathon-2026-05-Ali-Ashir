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

**Notes:** Commits cf9ccaa + 4d2017a. Root cause: `gsap.registerPlugin(ScrollTrigger)` fired too late (parent useEffect runs after child useEffects in React), and even after moving it to module scope, GSAP's `gsap.from()` opacity:0 initial state permanently hid cards when ScrollTrigger silently failed (SSR module eval, React Strict Mode double-invoke). Final fix: replaced all scroll-entrance animations across 6 section files with native `IntersectionObserver` + CSS transitions (`.reveal`, `.reveal-scale`, `.reveal-line` utility classes added to globals.css). GSAP retained only for continuous animations (HeroSection rotations, FinalCTASection glow/rotation). LandingPage.tsx now imports nothing from gsap. Model: Sonnet.

---
