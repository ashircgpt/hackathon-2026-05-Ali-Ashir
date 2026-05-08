// Socket.io server singleton.
// SERVER-ONLY — do not import in Client Components.
// Initialized once via initSocketServer() called from server.ts.
// API routes call getIO() to emit events.
//
// Uses global cache (same pattern as Prisma singleton) so hot-reload in Next.js
// dev mode does NOT reset the instance — if the module is re-evaluated, we pick
// up the already-running Socket.io server from `global` instead of creating a
// new one or throwing.

import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

// Module-level ref (fast path within the same require cycle)
let io: SocketIOServer | null = null;

// Global cache that survives Next.js hot-module replacement
const g = global as unknown as { __socketIO?: SocketIOServer };

/** Initialize Socket.io and attach to the Node HTTP server. Call once from server.ts. */
export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  // Reuse if already running (guard against hot-reload re-initialization)
  if (g.__socketIO) {
    io = g.__socketIO;
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "*",
      methods: ["GET", "POST"],
    },
    // Default path /socket.io — no custom path needed since we use a custom server
  });

  // Persist on global so hot-reload picks it up without re-attaching
  g.__socketIO = io;

  io.on("connection", (socket) => {
    // Customer table joins its own room
    socket.on("join-table", (tableId: string | number) => {
      const room = `table-${tableId}`;
      socket.join(room);
    });

    // Kitchen staff joins the shared kitchen room
    socket.on("join-kitchen", () => {
      socket.join("kitchen");
    });

    // Admin dashboard joins the shared admin room
    socket.on("join-admin", () => {
      socket.join("admin");
    });

    // Explicit leave (optional — Socket.io auto-cleans on disconnect)
    socket.on("leave-table", (tableId: string | number) => {
      socket.leave(`table-${tableId}`);
    });

    socket.on("disconnect", () => {
      // No-op: Socket.io auto-removes socket from all rooms on disconnect
    });
  });

  console.log("[socket-server] Socket.io initialized");
  return io;
}

/**
 * Get the shared Socket.io server instance.
 * Falls back to the global cache so hot-reloaded modules still work.
 */
export function getIO(): SocketIOServer {
  const instance = io ?? g.__socketIO;
  if (!instance) {
    throw new Error(
      "Socket.io not initialized. Did you start the app via server.ts?",
    );
  }
  // Refresh module-level ref from global in case this module was hot-reloaded
  if (!io) io = instance;
  return instance;
}
