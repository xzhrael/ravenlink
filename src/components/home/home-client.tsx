"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/providers/theme-provider";

interface HomeClientProps {
  isLoggedIn: boolean;
  username: string;
}

export function HomeClient({ isLoggedIn, username }: HomeClientProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8E7] dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#FFF8E7]">
      {/* Top Navbar */}
      <header className="border-b-4 border-black dark:border-[#E2DFD8] bg-white dark:bg-[#1C1B1A] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tight uppercase"
          >
            <span className="material-symbols-outlined text-2xl font-bold p-1 bg-[#FFDE59] text-[#0D0D0D] border-2 border-black">
              dataset
            </span>
            <span>{t.nav.brand}</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="h-8 px-3.5 bg-[#FFDE59] text-[#0D0D0D] brutal-btn font-bold text-xs uppercase inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                <span className="leading-none">{t.home.ctaDashboard}</span>
                <span className="material-symbols-outlined text-sm leading-none">arrow_forward</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="h-8 px-3.5 bg-[#FFDE59] text-[#0D0D0D] brutal-btn font-bold text-xs uppercase inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-base leading-none">login</span>
                <span className="leading-none">{t.home.loginAccount}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 md:py-16 space-y-12 sm:space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Hero Left Content (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFDE59] text-[#0D0D0D] text-xs font-mono font-black uppercase tracking-wider brutal-border-sm shadow-[2px_2px_0px_#0D0D0D]">
              <span className="material-symbols-outlined text-base font-bold">bolt</span>
              <span>{t.home.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.1]">
              {t.home.heroTitle1} <br />
              <span className="underline decoration-4 decoration-[#FFDE59]">
                {t.home.heroHighlight}
              </span>{" "}
              {t.home.heroTitle2}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-neutral-700 dark:text-neutral-300 font-medium max-w-xl leading-relaxed">
              {t.home.heroDesc}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="px-5 sm:px-6 py-3 sm:py-3.5 bg-[#FFDE59] text-[#0D0D0D] brutal-btn font-black text-xs sm:text-sm uppercase flex items-center gap-2"
              >
                <span>{isLoggedIn ? t.home.ctaDashboard : t.home.ctaCreate}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>

              <Link
                href={`/${username}`}
                target="_blank"
                className="px-5 sm:px-6 py-3 sm:py-3.5 bg-[#FFF2CE] dark:bg-[#1A1A1A] text-[#0D0D0D] dark:text-[#FFF8E7] brutal-btn font-mono font-bold text-xs sm:text-sm uppercase flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
                <span>{t.home.ctaPublicDemo}</span>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="pt-3 flex flex-wrap gap-2 text-xs font-mono font-bold">
              <span className="px-3 py-1.5 bg-white dark:bg-[#1C1B1A] brutal-border-sm flex items-center gap-1.5">
                <span className="text-[#06D6A0] font-black">✓</span>
                <span>{t.home.trustPill1}</span>
              </span>
              <span className="px-3 py-1.5 bg-white dark:bg-[#1C1B1A] brutal-border-sm flex items-center gap-1.5">
                <span className="text-[#06D6A0] font-black">✓</span>
                <span>{t.home.trustPill2}</span>
              </span>
              <span className="px-3 py-1.5 bg-white dark:bg-[#1C1B1A] brutal-border-sm flex items-center gap-1.5">
                <span className="text-[#06D6A0] font-black">✓</span>
                <span>{t.home.trustPill3}</span>
              </span>
              <span className="px-3 py-1.5 bg-white dark:bg-[#1C1B1A] brutal-border-sm flex items-center gap-1.5">
                <span className="text-[#06D6A0] font-black">✓</span>
                <span>{t.home.trustPill4}</span>
              </span>
            </div>
          </div>

          {/* Hero Right Visual Mockup (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] bg-white dark:bg-[#1C1B1A] border-4 border-black dark:border-white p-5 shadow-[8px_8px_0px_#0D0D0D] dark:shadow-[8px_8px_0px_#FFF8E7] relative">
              {/* Top badge */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-4">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[#FFDE59] text-[#0D0D0D] border border-black">
                  {t.home.liveDemoBadge}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  /{username}
                </span>
              </div>

              {/* Mock Bio Profile */}
              <div className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-2 border-3 border-black bg-[#FFDE59] flex items-center justify-center font-black text-xl text-[#0D0D0D] shadow-[3px_3px_0px_#000]">
                  R
                </div>
                <h3 className="font-black text-base uppercase text-[#0D0D0D] dark:text-[#FFF8E7]">
                  {t.home.mockTitle}
                </h3>
                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-0.5">
                  {t.home.mockRole}
                </p>
              </div>

              {/* Mock Buttons */}
              <div className="space-y-2.5">
                {[
                  { title: t.home.mockBtn1, icon: "shopping_bag", color: "bg-[#FFDE59] text-[#0D0D0D]" },
                  { title: t.home.mockBtn2, icon: "palette", color: "bg-[#FF5CAA] text-white" },
                  { title: t.home.mockBtn3, icon: "smart_display", color: "bg-[#3772FF] text-white" },
                  { title: t.home.mockBtn4, icon: "mail", color: "bg-[#06D6A0] text-[#0D0D0D]" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 border-3 border-black bg-white dark:bg-[#1A1A1A] flex items-center gap-2.5 shadow-[3px_3px_0px_#000] hover:translate-x-0.5 transition-transform text-[#0D0D0D] dark:text-[#FFF8E7]"
                  >
                    <span className={`material-symbols-outlined text-lg p-1 ${item.color} border border-black flex-shrink-0`}>
                      {item.icon}
                    </span>
                    <span className="font-bold text-xs flex-1 truncate">
                      {item.title}
                    </span>
                    <span className="material-symbols-outlined text-xs flex-shrink-0">
                      arrow_forward
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-5">
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 border border-black bg-[#FFF2CE] text-[#0D0D0D]">
                  ⚡ Powered by Ravenlink
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="space-y-6">
          <div className="border-b-4 border-black dark:border-white pb-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight">
              {t.home.architectureTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 sm:p-6 space-y-2.5">
              <span className="material-symbols-outlined text-3xl p-2 bg-[#FFDE59] text-[#0D0D0D] border-2 border-black inline-block">
                extension
              </span>
              <h3 className="text-base font-black uppercase">
                {t.home.feat1Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                {t.home.feat1Desc}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 sm:p-6 space-y-2.5">
              <span className="material-symbols-outlined text-3xl p-2 bg-[#FF5CAA] text-white border-2 border-black inline-block">
                palette
              </span>
              <h3 className="text-base font-black uppercase">
                {t.home.feat2Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                {t.home.feat2Desc}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 sm:p-6 space-y-2.5">
              <span className="material-symbols-outlined text-3xl p-2 bg-[#3772FF] text-white border-2 border-black inline-block">
                schedule
              </span>
              <h3 className="text-base font-black uppercase">
                {t.home.feat3Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                {t.home.feat3Desc}
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 sm:p-6 space-y-2.5">
              <span className="material-symbols-outlined text-3xl p-2 bg-[#06D6A0] text-[#0D0D0D] border-2 border-black inline-block">
                speed
              </span>
              <h3 className="text-base font-black uppercase">
                {t.home.feat4Title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                {t.home.feat4Desc}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black dark:border-[#E2DFD8] bg-white dark:bg-[#1C1B1A] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600 dark:text-neutral-400">
          <div>
            {t.home.footerCopyright}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:underline">
              {t.home.loginAccount}
            </Link>
            <Link href="/dashboard" className="hover:underline">
              {t.nav.overview}
            </Link>
            <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black font-bold">
              {t.home.standaloneBadge}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
