import React from "react";
import clsx from "clsx";
import { UserRole, ROLES } from "@/types";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  error?: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, error }) => {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-2 tracking-wide">
        Select Role
      </label>
      <div className="flex gap-2">
        {ROLES.map((role) => (
          <button
            key={role.key}
            type="button"
            onClick={() => onChange(role.key)}
            className={clsx(
              "flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 px-2",
              "border transition-all duration-200 cursor-pointer",
              value === role.key
                ? "bg-sky-500/15 border-sky-400 shadow-sm shadow-sky-500/20"
                : "bg-transparent border-white/10 hover:border-sky-500/40 hover:bg-sky-500/5"
            )}
          >
            <span className="text-xl">{role.icon}</span>
            <span
              className={clsx(
                "text-xs font-semibold tracking-wide",
                value === role.key ? "text-sky-400" : "text-slate-300"
              )}
            >
              {role.label}
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:block">
              {role.description}
            </span>
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default RoleSelector;
