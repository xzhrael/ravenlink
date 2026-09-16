import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-bold tracking-tight select-none cursor-pointer transition-transform disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#FFDE59] text-[#0D0D0D] hover:bg-[#FFD738] brutal-btn",
    secondary: "bg-[#FF5CAA] text-white hover:bg-[#F24E9C] brutal-btn",
    accent: "bg-[#3772FF] text-white hover:bg-[#2563EB] brutal-btn",
    danger: "bg-[#E63946] text-white hover:bg-[#D90429] brutal-btn",
    outline:
      "bg-transparent text-[#0D0D0D] dark:text-[#FFF8E7] brutal-border-sm hover:bg-black/5 dark:hover:bg-white/10 active:translate-y-0.5",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      className={twMerge(clsx(base, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="material-symbols-outlined animate-spin text-sm">
          progress_activity
        </span>
      )}
      {children}
    </button>
  );
}
