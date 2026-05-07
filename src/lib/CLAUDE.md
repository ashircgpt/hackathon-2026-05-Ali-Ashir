# src/lib — Business Logic Rules

Covers utility modules: Prisma client, hashing, nutrition.
Root conventions in `/CLAUDE.md`. This file adds lib-layer specifics.

---

## General Rules

- All functions here are **pure utilities or singleton accessors** — no HTTP, no React, no UI.
- Server-only modules (Prisma, Node crypto) must never be imported by Client Components.
- Browser-only modules (`hash-browser.ts`) must never be imported in API routes or server code.

---

## prisma.ts — Singleton Client

- Export a single `prisma` instance using the global singleton pattern:
  ```ts
  const globalForPrisma = global as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
- Never call `new PrismaClient()` anywhere else in the codebase.
- Never call `prisma.$disconnect()` in hot paths — only in scripts.

---

## hash.ts — Server-side SHA-256

- Uses Node `crypto.createHash('sha256')` — synchronous, server-only.
- Export a single function: `sha256(input: string): string`
- Used by: `POST /api/feedback` to build ledger blocks.
- Do not import this file in any Client Component or browser-facing code.

## hash-browser.ts — Client-side SHA-256

- Uses `crypto.subtle.digest` — async, browser-only (Web Crypto API).
- Export a single async function: `sha256(input: string): Promise<string>`
- Used by: `<ChainVerifier>` to re-verify the ledger client-side.
- Same output as `hash.ts` for the same input — verified in tests.
- Do not import this file in API routes or any server code.

---

## nutrition.ts — Pricing and Macro Calculations

- Pure functions only — take `MenuItem[]` arrays, return computed totals.
- No DB calls, no side effects.
- Exported interface:
  ```ts
  computeTotals(layers: MenuItem[]): {
    price: number      // sum of layer prices, rounded to 2 dp
    calories: number   // sum of calories
    protein: number    // sum in grams
    fats: number       // sum in grams
    carbs: number      // sum in grams
  }
  ```
- **Tests expected** for this function: zero layers, single layer, multiple layers, rounding edge cases.
- Used by both the client (live nutrition panel) and the server (storing `totalPrice` + `totalCals` on Order).

---

## Testing Expectations

Key functions that require test coverage before shipping:

| File | Function | Why |
|---|---|---|
| `nutrition.ts` | `computeTotals` | Price/calorie correctness is customer-facing |
| `hash.ts` | `sha256` | Ledger integrity depends on hash consistency |
| `hash-browser.ts` | `sha256` | Must produce identical output to `hash.ts` |

Tests live in `src/lib/__tests__/`. Use Node's built-in test runner or Jest — keep it simple.

---

## Do Not

- Do not add HTTP fetch calls to any file in `src/lib/`.
- Do not add React imports or hooks here.
- Do not create a new Prisma client outside `prisma.ts`.
- Do not use `Math.random()` or `Date.now()` inside `nutrition.ts` — keep it deterministic.
