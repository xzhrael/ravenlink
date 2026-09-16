"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/context";

interface ShareButtonProps {
  title: string;
  url: string;
  accentColor?: string;
}

export function ShareButton({ title, url, accentColor = "#3772FF" }: ShareButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${t.publicBio.sharePrompt} ${title}`,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative inline-flex items-center shrink-0">
      <button
        type="button"
        onClick={handleShare}
        aria-label={t.publicBio.shareProfile}
        className="h-8 w-8 brutal-border-sm bg-white dark:bg-[#1C1B1A] text-black dark:text-white flex items-center justify-center cursor-pointer shrink-0 select-none hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
        title={t.publicBio.shareProfile}
      >
        <span className="material-symbols-outlined text-base leading-none">
          {copied ? "check" : "share"}
        </span>
      </button>

      {copied && (
        <div
          className="absolute right-0 top-10 z-20 px-2.5 py-1 bg-black text-white text-[11px] font-mono font-bold whitespace-nowrap brutal-border-sm shadow-[2px_2px_0px_#000] animate-in fade-in"
          style={{ borderColor: accentColor }}
        >
          {t.publicBio.copiedUrl}
        </div>
      )}
    </div>
  );
}
