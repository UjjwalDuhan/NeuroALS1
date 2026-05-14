import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  /** Content for the left branding panel */
  leftPanel: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, leftPanel }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid md:grid-cols-2 relative">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="orb opacity-50"
          style={{
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(15,75,160,0.7), transparent 70%)",
            top: -150, right: -100,
          }}
        />
        <div
          className="orb opacity-40"
          style={{
            width: 450, height: 450,
            background: "radial-gradient(circle, rgba(0,180,150,0.45), transparent 70%)",
            bottom: -100, left: -80,
            animationDelay: "-7s",
          }}
        />
        <div className="fixed inset-0 grid-bg z-0 pointer-events-none" />
      </div>

      {/* Left Branding Panel */}
      <div className="hidden md:flex flex-col relative z-10 bg-navy-2 border-r border-white/5 p-12 overflow-hidden">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer mb-auto"
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-teal-400 flex items-center justify-center text-lg shadow-lg shadow-teal-500/25">
            ⚡
          </div>
          <span className="font-display text-xl font-bold">
            Neuro<span className="text-teal-400">ALS</span>
          </span>
        </div>

        {leftPanel}
      </div>

      {/* Right Form Panel */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 md:p-14 overflow-y-auto">
        {/* Mobile logo */}
        <div
          className="flex md:hidden items-center gap-2 cursor-pointer mb-10 self-start"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-teal-400 flex items-center justify-center text-base">⚡</div>
          <span className="font-display text-lg font-bold">Neuro<span className="text-teal-400">ALS</span></span>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
