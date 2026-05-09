/**
 * Custom Next.js server with Socket.io attached to the same HTTP server.
 * Required for bidirectional real-time push (Socket.io cannot run on
 * Vercel serverless — use Railway/Render free tier which supports long-lived
 * Node processes).
 *
 * Usage:
 *   dev:   npm run dev     (tsx server.ts)
 *   prod:  npm run start   (tsx server.ts with NODE_ENV=production)
 */

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocketServer } from "./src/lib/socket-server";

const dev      = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port     = parseInt(process.env.PORT ?? "3000", 10);

const app    = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Attach Socket.io before listening
  initSocketServer(httpServer);

  httpServer.listen(port, hostname, () => {
    console.log(`> Pizza3.14 ready on http://${hostname}:${port}`);
    console.log(`> Mode: ${dev ? "development" : "production"}`);
  });
});
