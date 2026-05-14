import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage, WSIncomingMessage, WSOutgoingMessage } from "../types/chat";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5001/ws/chat";
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

interface UseChatOptions {
  token: string | null;
  autoConnect?: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  connectionError: string | null;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  reconnect: () => void;
}

export function useChat({ token, autoConnect = true }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnect = useRef(true);

  const connect = useCallback(() => {
    if (!token) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = `${WS_URL}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSOutgoingMessage;

        switch (data.type) {
          case "connected":
            setMessages([
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.message,
                timestamp: new Date().toISOString(),
              },
            ]);
            break;

          case "message":
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.content,
                timestamp: data.timestamp,
              },
            ]);
            break;

          case "typing":
            setIsTyping(data.isTyping);
            break;

          case "error":
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "error",
                content: data.message,
                timestamp: new Date().toISOString(),
              },
            ]);
            break;

          case "pong":
            // Heartbeat acknowledged — connection is alive
            break;
        }
      } catch {
        console.error("Failed to parse WebSocket message");
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setIsTyping(false);

      if (!shouldReconnect.current) return;

      if (event.code === 1008) {
        // Auth failure — do not reconnect
        setConnectionError("Authentication failed. Please log in again.");
        return;
      }

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        setConnectionError(
          `Connection lost. Reconnecting... (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`
        );
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      } else {
        setConnectionError("Unable to connect to chat server. Please refresh the page.");
      }
    };

    ws.onerror = () => {
      setConnectionError("WebSocket error. Retrying...");
    };
  }, [token]);

  // ── Connect on mount / token change ────────────────────────────────────────
  useEffect(() => {
    if (!token || !autoConnect) return;

    shouldReconnect.current = true;
    connect();

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close(1000, "Component unmounted");
    };
  }, [token, autoConnect, connect]);

  // ── Heartbeat ping every 30s ────────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" } as WSIncomingMessage));
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setConnectionError("Not connected. Please wait...");
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) return;

    // Optimistically add user message
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      },
    ]);

    wsRef.current.send(
      JSON.stringify({ type: "message", content: trimmed } as WSIncomingMessage)
    );
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectAttempts.current = 0;
    setConnectionError(null);
    connect();
  }, [connect]);

  return {
    messages,
    isConnected,
    isTyping,
    connectionError,
    sendMessage,
    clearMessages,
    reconnect,
  };
}
