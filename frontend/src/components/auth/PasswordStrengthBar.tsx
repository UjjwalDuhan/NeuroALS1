import React from "react";
import clsx from "clsx";
import { getPasswordStrength, PasswordStrength } from "@/utils/validators";

interface PasswordStrengthBarProps {
  password: string;
}

const strengthConfig: Record<
  Exclude<PasswordStrength, "empty">,
  { label: string; color: string; bars: number }
> = {
  weak:   { label: "Weak",   color: "bg-red-500",    bars: 1 },
  fair:   { label: "Fair",   color: "bg-amber-400",  bars: 2 },
  strong: { label: "Strong", color: "bg-teal-400",   bars: 3 },
};

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const strength = getPasswordStrength(password);

  if (strength === "empty") return null;

  const config = strengthConfig[strength];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={clsx(
              "flex-1 h-1 rounded-full transition-all duration-300",
              i <= config.bars ? config.color : "bg-white/10"
            )}
          />
        ))}
      </div>
      <p
        className={clsx("text-[10px] font-medium", {
          "text-red-400":   strength === "weak",
          "text-amber-400": strength === "fair",
          "text-teal-400":  strength === "strong",
        })}
      >
        {config.label} password
      </p>
    </div>
  );
};

export default PasswordStrengthBar;
