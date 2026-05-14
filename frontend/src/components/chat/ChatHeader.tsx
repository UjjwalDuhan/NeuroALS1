import React from "react";

interface ChatHeaderProps {
  isConnected: boolean;
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isConnected, onClose }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg shadow-inner">
          🧠
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              isConnected ? "bg-green-400" : "bg-yellow-400"
            }`}
            title={isConnected ? "Connected" : "Connecting..."}
          />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">NeuroBot</p>
          <p className="text-[11px] text-blue-200 mt-0.5">
            {isConnected ? "AI Medical Assistant • Online" : "Connecting..."}
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
        aria-label="Close chat"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default ChatHeader;
