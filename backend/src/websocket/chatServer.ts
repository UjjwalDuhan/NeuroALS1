import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { verifyToken } from "../utils/jwt";
import { GeminiService } from "../services/geminiService";
import { RAGService } from "../services/rag/ragService";
import { ChatMessage, WSIncomingMessage, WSOutgoingMessage, ChatSession } from "../types/chat";

// ── Active sessions per user ──────────────────────────────────────────────────
const sessions = new Map<string, ChatSession>();

// ── Initialize WebSocket Server ───────────────────────────────────────────────
export const initChatWebSocketServer = (httpServer: Server): WebSocketServer => {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/chat" });

  const geminiService = new GeminiService();
  const ragService = new RAGService();

  wss.on("connection", async (ws: WebSocket, req) => {
    let userId: string | null = null;

    // ── Authenticate via token in query string ──────────────────────────────
    try {
      const url = new URL(req.url ?? "", `http://${req.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        sendToClient(ws, { type: "error", message: "Authentication required. Provide token in query string." });
        ws.close(1008, "Unauthorized");
        return;
      }

      const decoded = verifyToken(token);
      userId = decoded.userId;

      // Create or restore session
      if (!sessions.has(userId)) {
        sessions.set(userId, {
          userId,
          history: [],
          connectedAt: new Date(),
        });
      }

      sendToClient(ws, {
        type: "connected",
        message: "Connected to NeuroALS AI Assistant. How can I help you today?",
      });

      console.log(`🔌 WebSocket connected: userId=${userId}`);
    } catch (err) {
      sendToClient(ws, { type: "error", message: "Invalid or expired token." });
      ws.close(1008, "Unauthorized");
      return;
    }

    // ── Message Handler ─────────────────────────────────────────────────────
    ws.on("message", async (rawData) => {
      if (!userId) return;

      let parsed: WSIncomingMessage;
      try {
        parsed = JSON.parse(rawData.toString()) as WSIncomingMessage;
      } catch {
        sendToClient(ws, { type: "error", message: "Invalid message format. Send valid JSON." });
        return;
      }

      const { type, content } = parsed;

      if (type === "ping") {
        sendToClient(ws, { type: "pong" });
        return;
      }

      if (type !== "message" || !content?.trim()) {
        sendToClient(ws, { type: "error", message: "Send { type: 'message', content: '...' }" });
        return;
      }

      const session = sessions.get(userId)!;

      // Push user message to history
      const userMsg: ChatMessage = { role: "user", content: content.trim(), timestamp: new Date() };
      session.history.push(userMsg);

      // Signal typing start
      sendToClient(ws, { type: "typing", isTyping: true });

      try {
        // ── RAG: retrieve relevant context ────────────────────────────────
        const ragContext = await ragService.retrieveContext(content.trim());

        // ── Build prompt with context ─────────────────────────────────────
        const responseText = await geminiService.chat(
          session.history,
          ragContext
        );

        // Push assistant response to history
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
        };
        session.history.push(assistantMsg);

        // Keep history bounded (last 20 messages to manage context window)
        if (session.history.length > 20) {
          session.history = session.history.slice(-20);
        }

        // Send response
        sendToClient(ws, { type: "typing", isTyping: false });
        sendToClient(ws, {
          type: "message",
          content: responseText,
          timestamp: assistantMsg.timestamp.toISOString(),
        });
      } catch (err) {
        const error = err as Error;
        console.error("❌ Gemini error:", error.message);
        sendToClient(ws, { type: "typing", isTyping: false });
        sendToClient(ws, {
          type: "error",
          message: "Sorry, I could not process your request. Please try again.",
        });
      }
    });

    // ── Close Handler ───────────────────────────────────────────────────────
    ws.on("close", () => {
      if (userId) {
        console.log(`🔌 WebSocket disconnected: userId=${userId}`);
        // Keep session history in memory for reconnection within same process lifetime
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err.message);
    });
  });

  console.log("✅ NeuroALS Chat WebSocket server initialized at /ws/chat");
  return wss;
};

// ── Helper: Send typed message to client ─────────────────────────────────────
function sendToClient(ws: WebSocket, payload: WSOutgoingMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}
