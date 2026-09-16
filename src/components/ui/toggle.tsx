"use client";

import React from "react";
import { clsx } from "clsx";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <div
        className={clsx(
          "w-12 h-6 p-0.5 brutal-border-sm transition-colors relative",
          checked
            ? "bg-black dark:bg-white"
            : "bg-neutral-200 dark:bg-neutral-700",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          className={clsx(
            "w-4 h-4 bg-white dark:bg-black transition-transform",
            checked
              ? "translate-x-6 bg-white dark:bg-black"
              : "translate-x-0 bg-black dark:bg-white"
          )}
        />
      </div>
      {label && (
        <span className="text-xs font-mono font-bold uppercase text-neutral-800 dark:text-neutral-200">
          {label}
        </span>
      )}
    </label>
  );
}
