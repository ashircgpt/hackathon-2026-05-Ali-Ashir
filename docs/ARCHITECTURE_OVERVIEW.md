# Architecture Overview — Pizza3.14

## System Diagram

```
Browser (Customer)       Browser (Kitchen)     Browser (Admin)
       |                        |                      |
  HTTP + SSE              HTTP polling             HTTP
       |                        |                      |
       +------------------------+----------------------+
                                |
                    +-----------v-----------+
                    |  Next.js 14 App       |
                    |  (Vercel Serverless)  |
                    |                       |
                    |  Pages:               |
                    |   /table/[tableId]    |
                    |   /kitchen            |
                    |   /admin              |
                    |   /login              |
                    |                       |
                    |  API Routes:          |
                    |   /api/menu           |
                    |   /api/orders         |
                    |   /api/orders/[id]    |
                    |   /api/orders/[id]/   |
                    |     status            |
                    |   /api/orders/        |
                    |     stream/[id] (SSE) |
                    |   /api/feedback       |
                    |   /api/admin/feedback |
                    |   /api/admin/stats    |
                    |   /api/auth/login     |
                    |                       |
                    |  Middleware:          |
                    |   /kitchen → cookie   |
                    |   /admin   → cookie   |
                    +-----------+-----------+
                                |
                         Prisma ORM
                                |
                    +-----------v-----------+
                    |  Supabase PostgreSQL  |
                    |  (Free Tier)          |
                    |                       |
                    |  MenuItem             |
                    |  Order                |
                    |  OrderLayer           |
                    |  Feedback (chain)     |
                    +-----------------------+
```

## Data Flow: Customer Places Order

```
1. GET /table/1  →  Next.js renders page
2. GET /api/menu  →  DB returns 16 MenuItem rows
3. Customer drags layers  →  NutritionPanel updates client-side
4. POST /api/orders { tableId, layers: [id...] }
5. Server creates Order + OrderLayer rows; returns { id, status: "NEW" }
6. Client opens EventSource → GET /api/orders/stream/{id}
7. Kitchen advances status → PATCH /api/orders/{id}/status
8. SSE route detects change → sends event to client
9. Client updates StatusProgressBar
10. Status = SERVED → FeedbackForm appears
11. POST /api/feedback { orderId, content }
12. Server writes hash-chain block to Feedback table
```

## Real-time

Primary: SSE via `ReadableStream` with `force-dynamic`. Polls DB every 2 s internally.

Fallback: Client `setInterval(3000)` + `router.refresh()` if SSE is unstable on Vercel.

## Auth Flow

```
/kitchen or /admin → middleware checks signed cookie
  No cookie → redirect /login?from=...
  
POST /api/auth/login { passphrase, role }
  Match env var → set signed HttpOnly cookie → redirect back
  No match → 401
```

Cookie names: `pizza314_kitchen_auth` and `pizza314_admin_auth` (distinct to prevent role confusion).

## Feedback Hash Chain

```
Block 0:  prevHash="0",  blockHash = SHA256("0" + ts + SHA256(content))
Block N:  prevHash=blockHash[N-1],  blockHash = SHA256(prev + ts + SHA256(content))
```

Admin UI re-computes hashes client-side using Web Crypto API to verify chain integrity.

## Deployment

```
git push → Vercel CI
  prisma generate
  prisma migrate deploy
  npm run db:seed
  next build
  → deploy to Vercel Edge Network
```

All env secrets in Vercel dashboard only — never in source.
