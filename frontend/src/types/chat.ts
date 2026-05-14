// ── Chat Message (local state) ────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: string; // ISO string
}

// ── WebSocket: Messages sent FROM client TO server ────────────────────────────
export interface WSIncomingMessage {
  type: "message" | "ping" | "clear_history";
  content?: string;
}

// ── WebSocket: Messages received FROM server TO client ────────────────────────
export type WSOutgoingMessage =
  | { type: "connected"; message: string }
  | { type: "message"; content: string; timestamp: string }
  | { type: "typing"; isTyping: boolean }
  | { type: "pong" }
  | { type: "error"; message: string };
