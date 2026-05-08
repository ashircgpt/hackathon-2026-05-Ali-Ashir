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
