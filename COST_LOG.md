# COST_LOG.md — Pizza3.14

Log of all service costs incurred during the hackathon.

Hackathon rule: No paid APIs. All services must be on free tiers.

---

## Services In Use

| Service | Plan | Cost | Notes |
|---|---|---|---|
| Railway | Free tier | $0 | Production deployment (custom server for Socket.io) |
| Supabase | Free tier | $0 | PostgreSQL database, 500 MB storage |
| GitHub | Free | $0 | Source control |

## AI Tools

| Tool | Cost | Notes |
|---|---|---|
| Claude Code (Anthropic) | Hackathon-provided (~$52 estimated) | See breakdown below |

### Claude Code Spend Estimate (May 7–9)

Estimated from session count and complexity in `PROMPT_LOG.md`. Model: Claude Sonnet throughout.

| Date | Sessions | Work done | Est. tokens | Est. cost |
|------|----------|-----------|-------------|-----------|
| May 7 | 4 | Project planning, discipline setup, path-scoped CLAUDE.md files, app skeleton | ~1.2M | ~$6 |
| May 8 | 12 | M2–M5 (DB + API + pizza builder + UI), landing page, kitchen Kanban, backend + Socket.io, admin module, Socket.io audit | ~7.2M | ~$28 |
| May 9 | 10 | Full pizza builder rebuild, canvas gestures + orbit ring, layer sizing fix, docs sync, PostHog/Sentry, checklist audit, skills, Notion PRD | ~5.1M | ~$18 |
| **Total** | **26** | | **~13.5M tokens** | **~$52** |

**Pricing basis:** Claude Sonnet — $3.00/M input tokens, $15.00/M output tokens, ~60% of input cached at $0.30/M (prompt cache).

**$/feature ratio:** 18 features shipped → **~$2.89 per feature**

> Note: Actual spend was covered by hackathon-provided Anthropic credits. The $52 figure is a token-based estimate for reporting purposes. Verify exact amount at console.anthropic.com → Usage → May 7–9.

---

## Incident Log

_No cost incidents yet._

---

> Last updated: 2026-05-09
