// src/services/socketService.ts
import { io as socketIOClient, Socket } from "socket.io-client";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket: Socket | null = null;

/**
 * Connects socket (idempotent). You can pass auth token if your server expects it.
 * We prefer to emit a separate 'register' event (your server expects that).
 */
export function connectSocket(options?: { token?: string }) {
  if (socket && socket.connected) return socket;

  // include token in auth if required, or connect plainly and emit register
  socket = socketIOClient(BASE_URL, {
    transports: ["websocket"],
    auth: options?.token ? { token: options.token } : undefined,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("Socket connected", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connect_error", err);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected", reason);
  });

  return socket;
}

export function registerUserOnSocket(userId: string | number, role?: string) {
  if (!socket) connectSocket();
  if (!socket) return;
  socket.emit("register", { userId, role });
  console.log("socket register emitted", userId, role);
}

/**
 * Global helpers
 */
export function onSocket(event: string, cb: (...args: any[]) => void) {
  socket?.on(event, cb);
}

export function offSocket(event: string, cb?: (...args: any[]) => void) {
  if (!socket) return;
  if (cb) socket.off(event, cb);
  else socket.off(event);
}

export function emitSocket(event: string, payload?: any) {
  socket?.emit(event, payload);
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
export default {
  connectSocket,
  registerUserOnSocket,
  onSocket,
  offSocket,
  emitSocket,
  disconnectSocket,
};