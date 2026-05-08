# src/components — React Component Rules

Covers all reusable UI components.
Root conventions in `/CLAUDE.md`. This file adds component-layer specifics.

---

## File Naming

- PascalCase filenames matching the exported component: `PizzaCanvas.tsx`, `KitchenOrderCard.tsx`.
- One component per file. Co-locate sub-components only if they are never used elsewhere.
- Group by domain: `pizza-builder/`, `waiting/`, `order/`, `kitchen/`, `admin/`.

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

---

## Pizza Builder Conventions

### PizzaCanvas
- Renders a stack of absolutely positioned `<img>` elements inside a `relative` circular container.
- Each layer image is positioned `absolute inset-0 w-full h-full object-contain`.
- Layer z-index for rendering comes from the layer's `zIndex` field (server-assigned). The client must not re-compute or override z-index values.
- The canvas container itself is the @dnd-kit drop zone (`useDroppable`).
- GSAP handles layer pop-in animation — do not use `animate-pop-in` CSS class when GSAP is managing the element.

### IngredientOrbit (replaces LayerPalette)
- Renders ingredient items in an orbit ring around the pizza canvas.
- Items are arranged in a circular arc using CSS or JS-computed `transform: translate` positions.
- Selecting/tapping an ingredient triggers a GSAP fly-in animation to the canvas center.
- `IngredientOrbit` does not manage canvas state — it emits `onAdd(item)` and parent handles state.
- Hovering an orbit item triggers a GSAP scale pulse (see GSAP conventions in `/CLAUDE.md`).

### NutritionPanel (left edge)
- Shows live nutrition totals: calories, protein, fat, carbs.
- Positioned fixed to the left side of the table surface.
- Pure display component — receives `layers: MenuItem[]` and `size: PizzaSize` as props.
- Uses `computeTotals()` from `src/lib/nutrition.ts`.

### BillPanel (right edge)
- Shows per-item price breakdown + running total.
- Contains the Place Order button (disabled until BASE layer is present).
- Positioned fixed to the right side of the table surface.
- Emits `onPlaceOrder()` upward; does not call the API directly.

### CombosBanner (top)
- Dismissible banner showing the Most Famous Combo.
- On mount: auto-populates the pizza with the combo ingredients (calls `onAdd` for each).
- Dismisses via a close button; GSAP slide-out animation on dismiss.
- Does not fetch data itself — receives `combo: MenuItem[]` as a prop from `PizzaBuilder`.

### WaitingGames (post-order)
- Shown after order is placed, while status is not yet SERVED.
- Client-only. No backend. No score persistence.
- Contains `TicTacToe` and `PizzaTrivia` sub-components.
- GSAP fade-in when entering waiting mode; fade-out when SERVED.

---

## GSAP Usage Rules

- Use GSAP for all pizza canvas animations, ingredient transitions, orbit interactions, banner animations, and status celebrations.
- Do not mix GSAP with Tailwind `animate-*` utilities on the same element — they conflict.
- Always clean up tweens on unmount: call `tween.kill()` or `ctx.revert()` in `useEffect` return.
- Prefer `gsap.context()` for scoped animations inside React components to simplify cleanup.
- Do not animate layout properties (width/height/margin) with GSAP — use transform/opacity for performance.

---

## Socket.io Usage Rules

- Socket connection is initialized once in `PizzaBuilder` (customer) or `KitchenOrderBoard` (kitchen).
- Customer table: join room `table-${tableId}` on mount, leave on unmount.
- Kitchen: join room `'kitchen'` on mount, leave on unmount.
- Listen for `'order-status-update'` event on customer table → show toast + update status bar.
- Listen for `'order-new'` event on kitchen board → prepend card to NEW column.
- Always call `socket.disconnect()` in `useEffect` cleanup.
- Do not import the Socket.io server instance in components — components use the Socket.io client only.

---

## UI Consistency

- Use Tailwind utility classes only — no inline `style={}` except for dynamic z-index values on layer images and GSAP-controlled transforms.
- Color palette: black glass tabletop (`#0a0a0a`), pizza-orange primary (`hsl(24 95% 53%)`), defined in `tailwind.config.ts`.
- All interactive elements must have a visible focus ring (`focus:ring-2`).
- Loading states: use a skeleton `<div>` with `animate-pulse` — do not leave blank space.
- Error states: render an inline error message in red, not a full-page crash.

## Accessibility

- All `<img>` tags must have descriptive `alt` text (e.g. `alt="Pepperoni layer"`).
- Buttons must have accessible labels. Icon-only buttons need `aria-label`.
- `<FeedbackForm>` textarea must have an associated `<label>`.
- Do not rely on color alone to convey status — pair color badges with text.
- Provide a non-GSAP-dependent fallback for reduced-motion users (`prefers-reduced-motion`): skip or shorten animations.

## Do Not

- Do not import from `src/app/` — components do not depend on page-layer files.
- Do not use `useRouter` for data mutations — call API endpoints with `fetch` instead.
- Do not hard-code ingredient names or prices — always use data from the API.
- Do not import Prisma or Node-only modules (`hash.ts`, `crypto`) in any component.
- Do not manage Socket.io server-side logic in components — server-side emit logic lives in API routes or the Socket.io server initializer.
