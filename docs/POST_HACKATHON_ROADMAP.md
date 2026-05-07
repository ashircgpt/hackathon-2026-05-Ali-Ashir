# Post-Hackathon Roadmap — Pizza3.14

Items explicitly out of scope for the 3-day build, documented here for future development.

---

## Security Hardening

### Replace Demo Passphrase Auth
- Implement proper authentication with NextAuth.js or Supabase Auth
- Add per-user accounts for kitchen staff and admins
- Role-based access control (RBAC) — kitchen staff cannot access admin reports
- Session expiry and refresh token rotation

### Rate Limiting
- Limit `POST /api/feedback` to 1 submission per order (already enforced) + IP-based throttle
- Limit `POST /api/orders` to prevent order spam per table
- Add CSRF protection to all mutation endpoints

### API Security
- Move kitchen/admin API routes behind auth middleware (currently only pages are gated)
- Validate and sanitize all user inputs at API boundaries
- Add request size limits to feedback endpoint

---

## Product Features

### Table Management
- Admin UI to create/rename/archive tables
- Table QR code generation (links to `/table/{id}`)
- Replace hardcoded `/table/1` root redirect with table selection

### Order History
- Customer can see past orders at their table for the current session
- Kitchen can view completed orders (currently hidden after SERVED)

### Real Pizza Assets
- Commission or create top-down 512×512 transparent PNG ingredients
- Follow asset rules in `SPEC.md` (no third-party branding)

### Nutrition Improvements
- Per-serving vs. whole-pizza toggle
- Dietary flags (vegetarian, vegan, gluten-free)
- Allergen information per ingredient

### Kitchen Improvements
- Audio alert when a new order arrives
- Estimated time remaining per order (based on typical prep time)
- Order age color-coding (yellow → red as time passes)

---

## Infrastructure

### Database
- Add connection pooling (PgBouncer or Supabase's built-in pooler) for production load
- Database backups
- Migration CI checks (prevent breaking schema changes)

### Real-time
- Replace SSE polling fallback with proper WebSockets if scale requires it
- Consider Supabase Realtime for push-based updates instead of pull

### Deployment
- Staging environment (Vercel Preview + Supabase staging project)
- Environment promotion workflow (dev → staging → prod)
- Secrets management (not just Vercel env vars)

### Observability
- Add error tracking (Sentry free tier)
- Add basic analytics (order counts, peak hours)
- Health check endpoint

---

## Scalability

### Multi-restaurant
- Add `Restaurant` model; scope all tables, menus, and orders per restaurant
- Subdomain or path routing per restaurant (`restaurant-slug.pizza314.app`)

### Menu Management
- Admin UI to add/remove/edit menu items
- Seasonal/limited-time offerings with availability windows
- Pricing tiers

### Payment Integration
- Stripe (or equivalent) for table payment
- Split-bill support
- Receipt generation

---

## Compliance

### Privacy
- GDPR-compliant data retention policy for orders and feedback
- Customer data deletion request flow
- Cookie consent banner (currently all cookies are functional/auth-only)

### Accessibility
- Full keyboard navigation for pizza builder (drag-and-drop alternative)
- Screen reader labels on all interactive elements
- WCAG AA compliance audit
