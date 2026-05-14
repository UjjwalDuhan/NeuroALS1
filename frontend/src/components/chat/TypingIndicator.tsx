import React from "react";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
        N
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400"
              style={{
                animation: "typing-bounce 1.2s infinite ease-in-out",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
