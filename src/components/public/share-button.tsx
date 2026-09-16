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
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        aria-label={t.publicBio.shareProfile}
        className="w-10 h-10 border-3 border-black bg-white text-black flex items-center justify-center cursor-pointer shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-transform"
        title={t.publicBio.shareProfile}
      >
        <span className="material-symbols-outlined text-xl">
          {copied ? "check" : "share"}
        </span>
      </button>

      {copied && (
        <div
          className="absolute right-0 top-12 z-20 px-3 py-1 bg-black text-white text-[11px] font-mono font-bold whitespace-nowrap animate-in fade-in"
          style={{ boxShadow: `3px 3px 0px ${accentColor}` }}
        >
          {t.publicBio.copiedUrl}
        </div>
      )}
    </div>
  );
}
