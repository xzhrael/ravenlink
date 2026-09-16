"use client";

import React, { useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxW = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={twMerge(
          clsx(
            "w-full bg-white dark:bg-[#1C1B1A] brutal-card p-6 shadow-2xl relative max-h-[90vh] flex flex-col",
            maxW[maxWidth]
          )
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-4">
          <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-[#F4F0EA] dark:bg-[#2A2928] brutal-border-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
            aria-label="Tutup modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
}
