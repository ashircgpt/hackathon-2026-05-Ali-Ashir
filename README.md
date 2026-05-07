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
# Fill in .env with your Supabase connection string and passphrases

# 3. Run dev server
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

Copy `.env.example` to `.env` (never commit `.env`):

```env
DATABASE_URL=postgresql://...     # Supabase connection string
AUTH_SECRET=<32-byte hex>         # openssl rand -hex 32
KITCHEN_PASSPHRASE=kitchen_demo
ADMIN_PASSPHRASE=admin_demo
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database

Uses **Supabase free tier (PostgreSQL)** with Prisma ORM.

```bash
npm run db:migrate   # run migrations
npm run db:seed      # load synthetic seed data
npm run db:reset     # wipe and re-seed (local dev only)
npm run db:studio    # Prisma Studio at :5555
```

SQLite fallback (no infra): change `provider` in `prisma/schema.prisma` to `sqlite` and set `DATABASE_URL=file:./prisma/dev.db`.

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
