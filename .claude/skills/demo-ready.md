# demo-ready

Pre-demo health check for Pizza3.14. Run this before every demo to confirm all systems are go.

## What to do

Run the following checks in order. For each one, report PASS ✓ or FAIL ✗ with a one-line reason. At the end, print a summary: "X/Y checks passed" and list any FAIL items as action items.

### 1. Dev server reachable
Use Bash to run: `curl -s http://localhost:3000/api/health`
Expected: `{"success":true,"data":{"status":"ok"}}`

### 2. Menu loaded (15 items)
Use Bash to run: `curl -s http://localhost:3000/api/menu`
Expected: `success: true` and exactly 15 items in the `data` array.
Check: `echo "..." | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.data.length)"`
Or use PowerShell: parse JSON, count data array length, assert === 15.

### 3. Famous combo endpoint returns data
Use Bash: `curl -s http://localhost:3000/api/menu/famous-combo`
Expected: `success: true` and `data` is not null.

### 4. Orders endpoint responds
Use Bash: `curl -s "http://localhost:3000/api/orders?today=true"`
Expected: `success: true`.

### 5. Feedback endpoint responds
Use Bash: `curl -s http://localhost:3000/api/admin/feedback` — expect a 401 (no cookie) not a 500. A 401 means the route is alive.

### 6. Swagger docs reachable
Use Bash: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api-doc`
Expected: 200.

### 7. Socket.io handshake
Use Bash: `curl -s "http://localhost:3000/socket.io/?EIO=4&transport=polling"`
Expected: response starts with `0{` (Socket.io EIO4 handshake).

### 8. Seed data: at least 1 order in DB
Use Bash: `curl -s "http://localhost:3000/api/orders"` and check `data.length > 0`.

### 9. Asset images reachable
Use Bash: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/assets/pizza/bases/1.jpg`
Expected: 200.

### 10. Kitchen route redirects without cookie
Use Bash: `curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/kitchen`
Expected: final URL contains `/login` OR status is 200 with login page content.

## After all checks

- Print the full summary table (check name | PASS/FAIL | note)
- If any FAIL: list the exact fix needed (e.g. "Run `npm run db:seed`", "Restart server", "Check DATABASE_URL")
- If all pass: print "🟢 Demo ready. All systems go."
