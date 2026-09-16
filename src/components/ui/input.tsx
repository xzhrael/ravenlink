import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-mono font-bold uppercase tracking-wide text-neutral-800 dark:text-neutral-200"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              "w-full px-3.5 py-2.5 text-sm font-medium bg-white dark:bg-[#1C1B1A] text-black dark:text-white brutal-border-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all",
              error && "border-rose-600 dark:border-rose-500",
              className
            )
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
        {error && (
          <p className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">error</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
