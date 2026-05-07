# src/components — React Component Rules

Covers all reusable UI components.
Root conventions in `/CLAUDE.md`. This file adds component-layer specifics.

---

## File Naming

- PascalCase filenames matching the exported component: `PizzaCanvas.tsx`, `KitchenOrderCard.tsx`.
- One component per file. Co-locate sub-components only if they are never used elsewhere.
- Group by domain: `pizza-builder/`, `order/`, `kitchen/`, `admin/`.

## Component Size

- Keep components under ~100 lines. If longer, extract a named sub-component.
- Prefer composition over a single large component with many conditionals.

## Server vs Client

- Components in this folder are **Client Components by default** (they render UI).
- Add `'use client'` at the top of any file that uses hooks or browser APIs.
- Never import Prisma, `src/lib/hash.ts`, or Node-only modules inside components.

## Data Fetching

- **Dumb UI components do not fetch data.** Accept data as props.
- Data flows from: `page.tsx` (server fetch) → Client page wrapper → component props.
- Exception: components that poll (e.g. `KitchenOrderBoard`) may call `fetch('/api/...')` inside a `useEffect` with `setInterval`. Keep fetch logic in a custom hook if it grows beyond ~10 lines.

## Pizza Builder Conventions

- `PizzaCanvas` owns the list of currently-placed layers as state.
- `LayerPalette` is a read-only list of draggable items — it does not manage canvas state.
- `DraggableLayerItem` wraps a single palette item in a `@dnd-kit` `Draggable`.
- Layer z-index for rendering comes from `OrderLayer.zIndex` (server-assigned). The client must not re-compute or override z-index values.
- Remove-from-canvas (click ✕) is handled inside `PizzaCanvas`, not inside individual layer images.

## UI Consistency

- Use Tailwind utility classes only — no inline `style={}` except for dynamic z-index values on layer images.
- Color palette: warm ambers, reds, and cream (defined in `tailwind.config.ts`).
- All interactive elements must have a visible focus ring (`focus:ring-2`).
- Loading states: use a skeleton `<div>` with `animate-pulse` — do not leave blank space.
- Error states: render an inline error message in red, not a full-page crash.

## Accessibility

- All `<img>` tags must have descriptive `alt` text (e.g. `alt="Pepperoni layer"`).
- Buttons must have accessible labels. Icon-only buttons need `aria-label`.
- `<FeedbackForm>` textarea must have an associated `<label>`.
- Do not rely on color alone to convey status — pair color badges with text.

## Do Not

- Do not import from `src/app/` — components do not depend on page-layer files.
- Do not use `useRouter` for data mutations — call API endpoints with `fetch` instead.
- Do not hard-code ingredient names or prices — always use data from the API.
