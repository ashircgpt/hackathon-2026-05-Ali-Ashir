# PM Brief — Pizza3.14

## Product Vision

Pizza3.14 is a modern tabletop pizza ordering experience. It replaces paper menus and verbal orders with an interactive table-side interface where customers compose their perfect pizza visually and place orders directly — no waiter required for ordering.

## Problem Statement

Traditional restaurant ordering has friction:
- Customers can't visualize what they're ordering
- Waitstaff spend time relaying orders verbally, introducing errors
- Customers have no visibility into order status after placing
- Feedback is collected inconsistently (paper slips, verbal) with no integrity guarantees

## Solution

A web app accessible by scanning a QR code at the table:

1. **Visual pizza builder** — drag ingredient layers onto a canvas; see what you're building
2. **Live nutrition data** — price, calories, and macros update as you build
3. **Direct order placement** — order goes straight to the kitchen
4. **Live status tracking** — watch your order move from NEW to SERVED in real time
5. **Verified feedback** — post-delivery review stored in a tamper-evident chain

## Target Users

- **Customers** at the table: anyone comfortable with a touch screen
- **Kitchen staff**: cooks who need a clear, simple queue to work from
- **Restaurant admin**: managers who want verified feedback and order analytics

## Success Metrics (Hackathon Demo)

- Customer can build and place a pizza in under 2 minutes
- Kitchen can advance an order through all 5 statuses
- Customer sees status change in real time (within 5 s)
- Feedback ledger shows VALID after submissions
- Admin can identify the Most Famous Combo

## Constraints

- 3-day hackathon build
- No paid APIs
- No real customer data
- Demo passphrase auth only (not production-ready)
- Synthetic seed data only

## Out of Scope

See `SPEC.md` → Out of Scope section.
