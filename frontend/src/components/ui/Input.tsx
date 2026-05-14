import React, { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, hint, className, id, ...rest }, ref) => {
    const inputId = id || Math.random().toString(36).slice(2);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none select-none">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "form-input-base",
              icon && "pl-10",
              error && "error",
              className
            )}
            {...rest}
          />
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}

        {hint && !error && (
          <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
