"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="h-8 inline-flex items-stretch brutal-border-sm bg-white dark:bg-[#1C1B1A] text-xs font-mono font-bold shrink-0 overflow-hidden select-none">
      <button
        type="button"
        onClick={() => setLocale("id")}
        className={`h-full px-2.5 flex items-center justify-center transition-colors leading-none ${
          locale === "id"
            ? "bg-black text-white dark:bg-white dark:text-black font-black"
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`}
        title="Ganti ke Bahasa Indonesia"
      >
        ID
      </button>
      <div className="w-[2px] bg-black dark:bg-[#E2DFD8]" />
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`h-full px-2.5 flex items-center justify-center transition-colors leading-none ${
          locale === "en"
            ? "bg-black text-white dark:bg-white dark:text-black font-black"
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`}
        title="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
