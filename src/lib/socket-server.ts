// Socket.io server singleton.
// SERVER-ONLY — do not import in Client Components.
// Initialized once via initSocketServer() called from server.ts.
// API routes call getIO() to emit events.

import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

/** Initialize Socket.io and attach to the Node HTTP server. Call once from server.ts. */
export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "*",
      methods: ["GET", "POST"],
    },
    // Default path /socket.io — no custom path needed since we use a custom server
  });

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
 * Throws if called before initSocketServer() — guards against accidental use
 * without the custom server (e.g., in test environments).
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error(
      "Socket.io not initialized. Did you start the app via server.ts?",
    );
  }
  return io;
}
