# src/app — Next.js App Router Rules

Covers pages, layouts, and API routes under `src/app/`.
Root conventions in `/CLAUDE.md`. This file adds app-layer specifics.

---

## Server vs Client Components

- **Default to Server Components.** Only add `'use client'` when the component needs:
  - `useState` / `useEffect` / event handlers
  - Browser APIs (EventSource, localStorage)
  - @dnd-kit drag-and-drop context
- Never use `'use client'` in a file that imports Prisma or calls DB directly.
- Pass server-fetched data down as props to Client Components — do not re-fetch in the client what the server already has.

## Page Components

- Page files (`page.tsx`) are thin shells — no business logic.
- Pages fetch data (via `async` server components or API calls) and hand it to named components.
- Keep each page under ~50 lines. Move everything else to `src/components/`.

## API Routes (`src/app/api/`)

**Response conventions — always return JSON:**
```ts
// Success
return NextResponse.json(data, { status: 200 | 201 })

// Client error
return NextResponse.json({ error: 'Reason' }, { status: 400 | 404 | 409 })

// Unauthorized
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

- Validate request body before touching the DB. Return 400 for missing/invalid fields.
- No business logic in route files — import helpers from `src/lib/`.
- SSE route (`orders/stream/[id]/route.ts`) **must** export `export const dynamic = 'force-dynamic'`.
- Any route that reads from DB without caching should also have `force-dynamic`.

## Auth Middleware (`src/middleware.ts`)

- Protects `/kitchen` and `/admin` only. Customer routes (`/table/[id]`) are public.
- Cookie names: `pizza314_kitchen_auth` (kitchen), `pizza314_admin_auth` (admin).
- On missing/invalid cookie: redirect to `/login?from=<original-path>`.
- Middleware must NOT import Prisma — it runs on the Edge runtime.

## Route Organization

```
src/app/
  page.tsx                   ← redirect only
  layout.tsx                 ← global layout + fonts
  table/[tableId]/page.tsx   ← customer builder (public)
  kitchen/page.tsx           ← kitchen board (cookie-protected)
  admin/page.tsx             ← admin dashboard (cookie-protected)
  login/page.tsx             ← passphrase form (public)
  api/
    menu/route.ts
    orders/route.ts
    orders/[id]/route.ts
    orders/[id]/status/route.ts
    orders/stream/[id]/route.ts   ← SSE, force-dynamic
    feedback/route.ts
    admin/feedback/route.ts
    admin/stats/route.ts
    auth/login/route.ts
```

## Do Not

- Do not put `prisma` calls directly in page components — use API routes or server actions.
- Do not use `export const dynamic = 'force-static'` on any route that reads live DB data.
- Do not share auth cookies between kitchen and admin — they use separate cookie names.
