"use client";

// Socket.io browser-side singleton.
// BROWSER-ONLY — never import on the server.
// Components call getSocket() once and reuse the same connection.

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/** Returns the shared Socket.io client socket, creating it on first call. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      // Connects to the same origin — the custom server handles the upgrade
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

/** Disconnect and clear the singleton (call in top-level cleanup). */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
