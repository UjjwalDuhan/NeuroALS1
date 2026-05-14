import React from "react";
import { ChatMessage } from "../../types/chat";

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const time = formatTime(message.timestamp);

  if (isError) {
    return (
      <div className="flex justify-center">
        <div className="bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2 max-w-[85%] border border-red-100">
          ⚠️ {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}>
      {/* Bot avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          N
        </div>
      )}

      <div className={`group flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        <div
          className={`
            relative px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser
              ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-sm"
              : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
            }
          `}
        >
          {/* Render assistant messages with basic markdown formatting */}
          {isUser ? (
            <span>{message.content}</span>
          ) : (
            <FormattedContent content={message.content} />
          )}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {time}
        </span>
      </div>
    </div>
  );
};

// ── Very lightweight Markdown-ish formatter ───────────────────────────────────
// Handles: **bold**, `code`, # headers, - lists, newlines
const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Heading: ### or ##
        if (line.startsWith("### ")) {
          return <p key={i} className="font-semibold text-sm text-gray-900">{line.slice(4)}</p>;
        }
        if (line.startsWith("## ")) {
          return <p key={i} className="font-bold text-sm text-gray-900">{line.slice(3)}</p>;
        }

        // Bullet list item
        if (line.match(/^[-*•]\s/)) {
          return (
            <div key={i} className="flex gap-1.5 items-start">
              <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
              <span>{inlineFormat(line.slice(2))}</span>
            </div>
          );
        }

        // Numbered list
        if (line.match(/^\d+\.\s/)) {
          const match = line.match(/^(\d+)\.\s(.*)/)!;
          return (
            <div key={i} className="flex gap-1.5 items-start">
              <span className="text-blue-500 font-medium flex-shrink-0 min-w-[1.2rem]">{match[1]}.</span>
              <span>{inlineFormat(match[2])}</span>
            </div>
          );
        }

        return <p key={i}>{inlineFormat(line)}</p>;
      })}
    </div>
  );
};

// Apply **bold** and `code` inline
function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="bg-gray-100 text-blue-700 text-xs px-1 py-0.5 rounded font-mono">{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default ChatBubble;
