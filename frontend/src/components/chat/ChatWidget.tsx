import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../hooks/useChat";
import { ChatMessage } from "../../types/chat";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";

interface ChatWidgetProps {
  token: string | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isConnected, isTyping, connectionError, sendMessage, reconnect } =
    useChat({ token, autoConnect: true });

  // ── Auto-scroll to bottom on new messages ──────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Unread badge when chat is closed ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant") setHasUnread(true);
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col w-96 max-w-[calc(100vw-3rem)] h-[580px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden"
          style={{ animation: "slideUp 0.25s ease-out" }}
        >
          {/* Header */}
          <ChatHeader
            isConnected={isConnected}
            onClose={() => setIsOpen(false)}
          />

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.length === 0 && !connectionError && (
              <WelcomeScreen />
            )}

            {connectionError && (
              <div className="text-center py-4">
                <p className="text-xs text-red-500 mb-2">{connectionError}</p>
                <button
                  onClick={reconnect}
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Try reconnecting
                </button>
              </div>
            )}

            {messages.map((msg: ChatMessage) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <ChatInput
            onSend={handleSend}
            disabled={!isConnected}
            placeholder={
              isConnected ? "Ask about ALS, EMG, or this platform..." : "Connecting..."
            }
          />
        </div>
      )}

      {/* ── Floating Action Button ─────────────────────────────────────────── */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label="Toggle NeuroALS AI Assistant"
      >
        {isOpen ? (
          <CloseIcon />
        ) : (
          <>
            <BotIcon />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                !
              </span>
            )}
          </>
        )}
      </button>

      {/* ── Slide-up animation ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const WelcomeScreen: React.FC = () => (
  <div className="text-center py-6 px-4">
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mx-auto mb-3">
      <span className="text-2xl">🧠</span>
    </div>
    <h3 className="text-sm font-semibold text-gray-800 mb-1">NeuroBot</h3>
    <p className="text-xs text-gray-500 leading-relaxed">
      Your AI assistant for ALS information and NeuroALS platform guidance.
    </p>
    <div className="mt-4 space-y-2">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          className="w-full text-left text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
          onClick={() => {
            // Bubble up — handled via custom event for simplicity
            window.dispatchEvent(new CustomEvent("neurobot:suggest", { detail: prompt }));
          }}
        >
          💬 {prompt}
        </button>
      ))}
    </div>
  </div>
);

const SUGGESTED_PROMPTS = [
  "What are early ALS symptoms?",
  "How does EMG help diagnose ALS?",
  "How do I submit a prediction?",
  "What does a High Risk score mean?",
];

const BotIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 2a2 2 0 012 2v1h3a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h3V4a2 2 0 012-2zm-1 9a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2zM8 10v4h8v-1l-2-2-2 1-2-2H8z" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default ChatWidget;
