"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShareButton } from "@/components/public/share-button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useI18n } from "@/lib/i18n/context";

interface PublicBioClientProps {
  user: {
    username: string | null;
    name: string | null;
    bio: string | null;
    image: string | null;
    themeBackground: string;
    themeButtonColor: string;
    themeButtonTextColor: string;
    themeAccent: string;
    themeTextColor: string;
    themeCardStyle: string;
    themeFont: string;
  };
  visibleLinks: Array<{
    id: string;
    title: string;
    url: string;
    icon: string | null;
    subtitle: string | null;
    customThumbnail: string | null;
  }>;
  pageUrl: string;
}

export function PublicBioClient({ user, visibleLinks, pageUrl }: PublicBioClientProps) {
  const { t } = useI18n();

  const username = user.username || "creator";
  const bgColor = user.themeBackground || "#FFF8E7";
  const textColor = user.themeTextColor || "#0D0D0D";
  const btnColor = user.themeButtonColor || "#FFDE59";
  const btnTextColor = user.themeButtonTextColor || "#0D0D0D";
  const accentColor = user.themeAccent || "#3772FF";
  const fontClass =
    user.themeFont === "jetbrains-mono" ? "font-mono-brutal" : "font-sans";

  const cardShadow =
    user.themeCardStyle === "brutal-solid"
      ? "5px 5px 0px #000000"
      : user.themeCardStyle === "brutal-outline"
      ? "3px 3px 0px #000000"
      : "none";

  return (
    <main
      className={`min-h-screen py-6 sm:py-10 px-4 flex flex-col justify-between items-center transition-colors ${fontClass}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Top Right Action Bar (Lang & Share) */}
        <div className="w-full flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider opacity-80 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-base">dataset</span>
            <span>Ravenlink</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ShareButton
              title={user.name || username}
              url={pageUrl}
              accentColor={accentColor}
            />
          </div>
        </div>

        {/* Profile Card Header */}
        <header className="text-center w-full mb-6 sm:mb-8 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-3 sm:mb-4">
            {user.image ? (
              <div
                className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-black relative overflow-hidden bg-white"
                style={{ boxShadow: "5px 5px 0px #000000" }}
              >
                <Image
                  src={user.image}
                  alt={user.name || username}
                  fill
                  sizes="(max-width: 640px) 80px, 112px"
                  priority
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-black bg-neutral-200 flex items-center justify-center font-black text-2xl sm:text-4xl text-black"
                style={{ boxShadow: "5px 5px 0px #000000" }}
              >
                {(user.name || username)[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Name & Username badge */}
          <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight mb-1">
            {user.name || username}
          </h1>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 border-2 border-black bg-white text-black text-xs font-mono font-bold mb-3 shadow-[2px_2px_0px_#000]">
            <span>@{username}</span>
          </div>

          {/* Bio text */}
          {user.bio && (
            <p className="max-w-md text-xs sm:text-sm font-medium leading-relaxed opacity-90 px-2">
              {user.bio}
            </p>
          )}
        </header>

        {/* Public Links List */}
        <section className="w-full space-y-3 sm:space-y-3.5">
          {visibleLinks.length === 0 ? (
            <div
              className="p-8 text-center border-3 border-dashed border-black bg-white text-black font-mono text-xs"
              style={{ boxShadow: "4px 4px 0px #000" }}
            >
              <span className="material-symbols-outlined text-3xl mb-1 block">
                link_off
              </span>
              {t.publicBio.noLinks}
            </div>
          ) : (
            visibleLinks.map((link) => (
              <a
                key={link.id}
                href={`/r/${link.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full p-3 sm:p-4 border-3 border-black flex items-center gap-3 sm:gap-3.5 transition-all transform hover:-translate-y-0.5 active:translate-y-1 block cursor-pointer select-none"
                style={{
                  backgroundColor: btnColor,
                  color: btnTextColor,
                  boxShadow: cardShadow,
                }}
              >
                {/* Icon or Custom Thumbnail */}
                {link.customThumbnail ? (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-black overflow-hidden relative flex-shrink-0">
                    <Image
                      src={link.customThumbnail}
                      alt={link.title}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span
                    className="material-symbols-outlined text-xl sm:text-2xl p-1.5 sm:p-2 border-2 border-black flex-shrink-0"
                    style={{
                      backgroundColor: accentColor,
                      color: "#FFFFFF",
                    }}
                    aria-hidden="true"
                  >
                    {link.icon || "link"}
                  </span>
                )}

                {/* Content Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs sm:text-base uppercase tracking-tight leading-snug truncate">
                    {link.title}
                  </div>
                  {link.subtitle && (
                    <div className="text-[11px] sm:text-xs opacity-75 font-mono truncate mt-0.5">
                      {link.subtitle}
                    </div>
                  )}
                </div>

                {/* Arrow Action indicator */}
                <span
                  className="material-symbols-outlined text-base sm:text-lg opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-transform flex-shrink-0"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </a>
            ))
          )}
        </section>
      </div>

      {/* Footer Branding */}
      <footer className="mt-10 sm:mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white text-black text-xs font-mono font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
        >
          <span className="material-symbols-outlined text-sm">bolt</span>
          <span>{t.publicBio.poweredBy}</span>
        </Link>
      </footer>
    </main>
  );
}
