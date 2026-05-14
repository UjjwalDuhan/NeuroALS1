import React, { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  // Listen for suggested prompt events from welcome screen
  useEffect(() => {
    const handler = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail;
      setInput(prompt);
      textareaRef.current?.focus();
    };
    window.addEventListener("neurobot:suggest", handler);
    return () => window.removeEventListener("neurobot:suggest", handler);
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-100 bg-white px-3 py-2">
      <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none leading-relaxed min-h-[22px] max-h-[120px]"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all shadow-sm"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-gray-400 text-center mt-1.5">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;
