// ── Chat Message (internal history) ──────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── Per-user session ──────────────────────────────────────────────────────────
export interface ChatSession {
  userId: string;
  history: ChatMessage[];
  connectedAt: Date;
}

// ── WebSocket: Incoming from client ──────────────────────────────────────────
export interface WSIncomingMessage {
  type: "message" | "ping" | "clear_history";
  content?: string;
}

// ── WebSocket: Outgoing to client ─────────────────────────────────────────────
export type WSOutgoingMessage =
  | { type: "connected"; message: string }
  | { type: "message"; content: string; timestamp: string }
  | { type: "typing"; isTyping: boolean }
  | { type: "pong" }
  | { type: "error"; message: string };
