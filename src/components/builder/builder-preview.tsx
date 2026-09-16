"use client";

import React from "react";
import { LinkData } from "@/components/links/link-form-modal";
import { useI18n } from "@/lib/i18n/context";

interface BuilderPreviewProps {
  username: string;
  userName: string;
  userBio?: string | null;
  userImage?: string | null;
  theme: {
    themeBackground: string;
    themeButtonColor: string;
    themeButtonTextColor: string;
    themeAccent: string;
    themeTextColor: string;
    themeCardStyle: string;
    themeFont: string;
  };
  slotLinks: LinkData[];
}

export function BuilderPreview({
  username,
  userName,
  userBio,
  userImage,
  theme,
  slotLinks,
}: BuilderPreviewProps) {
  const { t } = useI18n();

  return (
    <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-4">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase">
          <span className="material-symbols-outlined text-sm">visibility</span>
          <span>{t.builder.livePreviewTitle}</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-500 font-bold">
          {slotLinks.length} {t.builder.activeSlotsCount}
        </span>
      </div>

      {/* Simulator Device Frame */}
      <div
        className="w-full max-w-[320px] mx-auto border-4 border-black dark:border-white p-4 min-h-[460px] flex flex-col justify-between transition-colors shadow-[5px_5px_0px_#0D0D0D] dark:shadow-[5px_5px_0px_#FFF8E7]"
        style={{
          backgroundColor: theme.themeBackground || "#FFF8E7",
          color: theme.themeTextColor || "#0D0D0D",
          fontFamily:
            theme.themeFont === "jetbrains-mono"
              ? '"JetBrains Mono", monospace'
              : '"Space Grotesk", sans-serif',
        }}
      >
        {/* Profile Header */}
        <div className="text-center pt-2 pb-4">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImage}
              alt={userName}
              className="w-16 h-16 mx-auto mb-2 border-3 border-black object-cover shadow-[3px_3px_0px_#000]"
            />
          ) : (
            <div className="w-16 h-16 mx-auto mb-2 bg-neutral-300 border-3 border-black flex items-center justify-center font-black text-xl text-black shadow-[3px_3px_0px_#000]">
              {userName[0]?.toUpperCase() || "U"}
            </div>
          )}
          <h2 className="font-black text-base uppercase tracking-tight">
            {userName}
          </h2>
          <p className="text-xs opacity-75 font-mono mt-0.5 line-clamp-2">
            {userBio || "Bio belum diisi."}
          </p>
        </div>

        {/* Links Preview in Real-time Order */}
        <div className="space-y-2.5 flex-1 px-1">
          {slotLinks.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono opacity-60 border-2 border-dashed border-current p-4">
              {t.builder.noSlotsFilled}
            </div>
          ) : (
            slotLinks.map((link, idx) => (
              <div
                key={link.id || idx}
                className="p-2.5 border-3 border-black flex items-center gap-2.5 transition-transform"
                style={{
                  backgroundColor: theme.themeButtonColor || "#FFDE59",
                  color: theme.themeButtonTextColor || "#0D0D0D",
                  boxShadow:
                    theme.themeCardStyle === "brutal-solid"
                      ? "3px 3px 0px #000"
                      : theme.themeCardStyle === "brutal-outline"
                      ? "2px 2px 0px #000"
                      : "none",
                }}
              >
                {link.customThumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={link.customThumbnail}
                    alt={link.title}
                    className="w-8 h-8 object-cover border border-black flex-shrink-0"
                  />
                ) : (
                  <span
                    className="material-symbols-outlined text-lg p-1 border border-black flex-shrink-0"
                    style={{
                      backgroundColor: theme.themeAccent || "#3772FF",
                      color: "#FFFFFF",
                    }}
                  >
                    {link.icon || "link"}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs leading-tight truncate">
                    {link.title}
                  </div>
                  {link.subtitle && (
                    <div className="text-[10px] opacity-70 font-mono truncate">
                      {link.subtitle}
                    </div>
                  )}
                </div>

                <span className="material-symbols-outlined text-xs">
                  arrow_forward
                </span>
              </div>
            ))
          )}
        </div>

        {/* Branding Footer */}
        <div className="text-center pt-6 pb-1">
          <span className="inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000]">
            ⚡ Ravenlink / {username}
          </span>
        </div>
      </div>
    </div>
  );
}
