import React from "react";
import clsx from "clsx";

type AlertType = "error" | "success" | "warning" | "info";

interface AlertProps {
  type?: AlertType;
  message: string;
  className?: string;
}

const config: Record<AlertType, { bg: string; border: string; text: string; icon: string }> = {
  error:   { bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-400",    icon: "⚠" },
  success: { bg: "bg-teal-500/10",   border: "border-teal-500/30",   text: "text-teal-400",   icon: "✓" },
  warning: { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-400",  icon: "⚠" },
  info:    { bg: "bg-sky-500/10",    border: "border-sky-500/30",    text: "text-sky-400",    icon: "ℹ" },
};

const Alert: React.FC<AlertProps> = ({ type = "error", message, className }) => {
  const c = config[type];
  return (
    <div
      className={clsx(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        c.bg, c.border, c.text, className
      )}
    >
      <span className="mt-0.5 flex-shrink-0">{c.icon}</span>
      <span>{message}</span>
    </div>
  );
};

export default Alert;
