# Pizza3.14 🍕

Interactive tabletop pizza ordering system. Customers build pizzas by dragging ingredient layers onto a canvas, track live order status, and submit feedback stored in a hash-chain ledger.

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/ashircgpt/hackathon-2026-05-Ali-Ashir.git
cd hackathon-2026-05-Ali-Ashir
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — fill in all 5 required variables (see below)

# 3. Set up database
npm run db:generate   # generate Prisma client
npm run db:migrate    # run migrations against Supabase
npm run db:seed       # load synthetic demo data

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

## Routes

| URL | Who | Notes |
|---|---|---|
| `/table/1` | Customer | Pizza builder (default table) |
| `/kitchen` | Staff | Order board — requires kitchen passphrase |
| `/admin` | Admin | Dashboard — requires admin passphrase |
| `/login` | All | Passphrase login for kitchen/admin |
| `/api/health` | Anyone | Health check endpoint |

## Environment Variables

Copy `.env.example` to `.env` and fill in all 5 required variables. **Never commit `.env`.**

```env
# Supabase free-tier PostgreSQL connection string
# Get from: Supabase Dashboard → Project Settings → Database → Connection String (URI, pooler mode)
DATABASE_URL=postgresql://user:password@host:5432/postgres

# 32-byte hex secret for signing passphrase cookies
# Generate with: openssl rand -hex 32
AUTH_SECRET=replace_with_32_byte_hex_from_openssl_rand_hex_32

# Demo passphrases — change before sharing any public demo URL
KITCHEN_PASSPHRASE=kitchen_demo
ADMIN_PASSPHRASE=admin_demo

# Deployment URL (used for SSE absolute URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note on AUTH_SECRET:** The `/kitchen` and `/admin` routes will let you in without a signed cookie in development if `AUTH_SECRET` is a placeholder, but cookie signing will fail silently. Generate a real secret before demoing auth flows.

## Local DB Setup

Uses **Supabase free tier (PostgreSQL)** with Prisma ORM.

```bash
npm run db:generate   # (re)generate Prisma client after schema changes
npm run db:migrate    # create/apply migrations (prisma migrate dev)
npm run db:seed       # load 16 menu items, 8 demo orders, 2 feedback blocks
npm run db:reset      # wipe and re-seed (local dev only — never in production)
npm run db:studio     # Prisma Studio visual browser at :5555
```

### SQLite Fallback (no Supabase)

If Supabase is unavailable, switch to local SQLite for development:

1. Open `prisma/schema.prisma`
2. Change `provider = "postgresql"` to `provider = "sqlite"`
3. Set `DATABASE_URL=file:./prisma/dev.db` in `.env`
4. Run `npm run db:migrate` and `npm run db:seed`

> **Warning:** SQLite data resets on every Vercel deploy. Acceptable for local dev or emergency demo only.

## Layer Assets

Placeholder PNGs are in `public/layers/` (64×64, colored circles on transparent background).
These will be replaced with real 512×512 top-down transparent ingredient photographs before the final demo.

| File | Ingredient |
|---|---|
| `classic-dough.png` | Classic Dough (BASE) |
| `whole-wheat-crust.png` | Whole Wheat Crust (BASE) |
| `cauliflower-crust.png` | Cauliflower Crust (BASE) |
| `marinara.png` | Marinara (SAUCE) |
| `pesto.png` | Pesto (SAUCE) |
| `bbq-sauce.png` | BBQ Sauce (SAUCE) |
| `garlic-cream.png` | Garlic Cream (SAUCE) |
| `mozzarella.png` | Mozzarella (CHEESE) |
| `vegan-cheese.png` | Vegan Cheese (CHEESE) |
| `double-cheddar.png` | Double Cheddar (CHEESE) |
| `pepperoni.png` | Pepperoni (TOPPING) |
| `mushrooms.png` | Mushrooms (TOPPING) |
| `bell-peppers.png` | Bell Peppers (TOPPING) |
| `olives.png` | Olives (TOPPING) |
| `jalapenos.png` | Jalapeños (TOPPING) |
| `pineapple.png` | Pineapple (TOPPING) |

## Tech Stack

- **Next.js 14** — App Router, TypeScript strict mode
- **Prisma** — ORM + migrations
- **Supabase** — PostgreSQL (free tier)
- **shadcn/ui** + **Tailwind CSS** — UI components
- **@dnd-kit/core** — drag-and-drop pizza builder
- **Server-Sent Events** — live order status

## Docs

- [`SPEC.md`](SPEC.md) — Full product specification
- [`CLAUDE.md`](CLAUDE.md) — Codebase orientation for AI assistants
- [`docs/ARCHITECTURE_OVERVIEW.md`](docs/ARCHITECTURE_OVERVIEW.md) — System diagrams
- [`docs/TECHNICAL_DECISIONS.md`](docs/TECHNICAL_DECISIONS.md) — Architecture decision records
- [`docs/POST_HACKATHON_ROADMAP.md`](docs/POST_HACKATHON_ROADMAP.md) — Future hardening items
