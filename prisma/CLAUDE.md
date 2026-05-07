# prisma/ — Schema, Migrations, and Seed Rules

Covers `schema.prisma`, `seed.ts`, and `migrations/`.
Root conventions in `/CLAUDE.md`. This file adds database-layer specifics.

---

## Database

- **Default:** Supabase free tier (PostgreSQL). Provider = `postgresql`.
- **Emergency fallback only:** SQLite (`file:./prisma/dev.db`). Switch provider to `sqlite` if Supabase is unavailable. Data resets on every Vercel deploy — acceptable for demo only.
- Never commit `prisma/dev.db` — it is git-ignored.
- Connection string lives in `.env` (`DATABASE_URL`). Never hardcode it.

---

## Schema Rules

- Keep all models in `schema.prisma`. Do not split into multiple schema files.
- Every model must have an `@id` field and a `createdAt DateTime @default(now())`.
- Use enums for finite status sets (`LayerType`, `OrderStatus`) — not plain strings.
- `OrderLayer.zIndex` is **server-assigned** at order creation, not client-supplied. BASE=0, SAUCE=1, CHEESE=2, TOPPING=3+n.
- The `Feedback` table is **append-only**. Never add `UPDATE` or `DELETE` operations on it.
- Snapshot pricing: `Order.totalPrice` and `Order.totalCals` store the totals at the time of order. Do not re-compute from current `MenuItem` prices — menu prices can change.

---

## Migrations

- Create migrations with `prisma migrate dev --name <description>`.
- Never manually edit migration SQL files after they are committed.
- Run `prisma migrate deploy` in CI/Vercel build — never `migrate dev` in production.
- After changing `schema.prisma`, always run `prisma generate` before running the app.

---

## Seed Data (`seed.ts`)

- **Synthetic data only.** No real names, emails, addresses, or production values.
- Seed script is idempotent-friendly: use `upsert` or wipe+reinsert, not raw `create` (avoids duplicate-key errors on re-seed).
- Required seed content:
  - 16 `MenuItem` rows (3 BASE, 4 SAUCE, 3 CHEESE, 6 TOPPING) with full nutrition fields
  - 8 `Order` rows across all statuses (NEW, PREPARING, BAKING, READY, SERVED ×2)
  - 5 `OrderLayer` rows per order minimum
  - 2 `Feedback` rows to seed the genesis + block-1 of the chain
  - "Most Famous Combo" repeated in at least 3 orders for `GET /api/admin/stats` to work
- Set `zIndex` correctly in seed data — match the server-assignment rules above.
- Run with: `npm run db:seed` (calls `npx prisma db seed`).

---

## Do Not

- Do not put business logic in migration files — migrations are schema-only.
- Do not seed real customer reviews, real prices from live menus, or any PII.
- Do not use `prisma migrate reset` in production — only in local dev or CI resets.
- Do not create a second Prisma client in seed scripts — import from `src/lib/prisma.ts` or use a local `new PrismaClient()` scoped to the seed file only.
