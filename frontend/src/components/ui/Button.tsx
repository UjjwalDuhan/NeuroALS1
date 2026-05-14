import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "teal" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: `bg-gradient-to-r from-blue-700 to-sky-500 text-white
            hover:brightness-110 hover:-translate-y-0.5
            shadow-lg shadow-sky-500/20`,
  teal: `bg-gradient-to-r from-teal-500 to-teal-400 text-navy font-bold
         hover:brightness-110 hover:-translate-y-0.5
         shadow-lg shadow-teal-500/25`,
  outline: `bg-transparent text-slate-200 border border-white/15
            hover:bg-white/5 hover:border-white/30 hover:-translate-y-0.5`,
  ghost: `bg-sky-500/10 text-sky-400 border border-sky-500/25
          hover:bg-sky-500/20`,
  danger: `bg-red-500/15 text-red-400 border border-red-500/30
           hover:bg-red-500/25`,
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs rounded-lg",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-4 text-base rounded-xl",
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  ...rest
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        // Base
        "inline-flex items-center justify-center gap-2 font-body font-semibold",
        "transition-all duration-200 cursor-pointer select-none",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
        // Variant
        variantClasses[variant],
        // Size
        sizeClasses[size],
        // Full width
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {isLoading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
