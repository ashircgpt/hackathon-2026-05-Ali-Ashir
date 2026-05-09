# pizza-qa

Targeted code quality audit for Pizza3.14. Checks the three patterns that most commonly break this app: GSAP cleanup, Socket.io room lifecycle, and API error boundaries.

## What to do

Run all three audits below. For each finding, report file path + line number. At the end summarise: total issues found and severity.

---

## Audit 1: GSAP tween cleanup

Search all files under `src/` for GSAP tween or timeline creation that may be missing cleanup.

Patterns to find:
- `gsap.to(`, `gsap.from(`, `gsap.fromTo(`, `gsap.timeline(` inside a `useEffect` or `useLayoutEffect`
- For each match: check if the enclosing `useEffect` has a `return () =>` cleanup that calls `.kill()` or `ctx.revert()`
- Flag any `gsap.*` calls inside effects that have NO cleanup return

Use Grep to search `src/**/*.tsx` for `gsap\.(to|from|fromTo|timeline)` then read the surrounding context (±20 lines) to check for cleanup.

Report: file, line number, tween target, whether cleanup exists.

---

## Audit 2: Socket.io room join/leave lifecycle

Search `src/components/**/*.tsx` for Socket.io room joins to verify they are re-joined on reconnect and cleaned up on unmount.

Patterns to check:
- `socket.emit('join-` — verify this is also inside a `socket.on('connect', ...)` handler (reconnect safety)
- `useEffect` blocks that call `getSocket()` — verify they return a cleanup that calls `socket.off(...)` for every `socket.on(...)` registered
- `socket.on(` calls — every listener should have a matching `socket.off(` in the cleanup

Use Grep on `src/components/**/*.tsx` for `socket\.emit\('join` and `socket\.on\(` and `socket\.off\(`.

Report: file, event name, whether reconnect join exists, whether off() cleanup exists.

---

## Audit 3: API route error boundaries

Search all files under `src/app/api/` for exported `GET`, `POST`, `PATCH`, `DELETE` functions that contain Prisma calls (`prisma.`) but lack a `try {` wrapper.

Use Grep on `src/app/api/**/*.ts` for `prisma\.` — for each match, read the surrounding function to check if it is wrapped in try/catch.

Also verify every route file either:
- imports `fail` from `@/lib/api-response` and uses it in catch blocks, OR
- has an explicit `return NextResponse.json({ error: ... }, { status: 500 })`

Report: file, route method, Prisma call, whether try/catch wraps it.

---

## Summary format

After all three audits:

```
GSAP cleanup issues:    X  (Y files)
Socket.io lifecycle:    X  (Y files)  
API error boundaries:   X  (Y files)
Total issues:           X
```

Severity: CRITICAL (data loss / app crash risk) | WARN (UX degradation) | INFO (best practice)

For each issue, suggest the exact fix (one line of code if possible).
