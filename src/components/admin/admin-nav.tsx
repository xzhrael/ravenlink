"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ThemeToggle } from "@/components/providers/theme-provider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { RavenlinkLogo } from "@/components/ui/ravenlink-logo";

interface AdminNavProps {
  userName: string;
  userImage?: string | null;
  signOutAction: () => Promise<void>;
}

export function AdminNav({ userName, userImage, signOutAction }: AdminNavProps) {
  const { t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b-4 border-black dark:border-[#E2DFD8] bg-white dark:bg-[#1C1B1A] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Brand + Admin Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/admin"
            prefetch={true}
            className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tight uppercase shrink-0"
          >
            <RavenlinkLogo size="md" />
            <span className="truncate">{t.nav.brand}</span>
          </Link>

          <span className="inline-flex items-center px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider brutal-border-sm shrink-0">
            {t.admin.badge}
          </span>
        </div>

        {/* Desktop Controls (Visible on md: and up) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Switch to User Dashboard Button */}
          <Link
            href="/dashboard"
            prefetch={true}
            className="h-8 px-2.5 sm:px-3 bg-[#FFDE59] text-[#0D0D0D] brutal-border-sm text-xs font-mono font-bold inline-flex items-center gap-1.5 hover:bg-[#FFD738] transition-colors select-none"
            title="Dashboard"
          >
            <span className="material-symbols-outlined text-sm leading-none">dashboard</span>
            <span className="leading-none">{t.admin.backToUserDashboard}</span>
          </Link>

          <LanguageSwitcher />
          <ThemeToggle />

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-1 border-l-2 border-neutral-300 dark:border-neutral-700 shrink-0">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt={userName}
                className="w-8 h-8 border-2 border-black dark:border-white object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-[#FFDE59] text-[#0D0D0D] border-2 border-black dark:border-white flex items-center justify-center font-bold text-xs shrink-0">
                {userName[0]?.toUpperCase()}
              </div>
            )}
            <span className="font-mono text-xs font-bold text-black dark:text-white truncate max-w-[100px] leading-none">
              {userName}
            </span>

            {/* Logout button */}
            <button
              type="button"
              onClick={() => signOutAction()}
              className="h-8 px-2.5 bg-black text-white dark:bg-white dark:text-black brutal-border-sm text-xs font-bold cursor-pointer hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors inline-flex items-center justify-center shrink-0 select-none"
              title={t.nav.logout}
              aria-label={t.nav.logout}
            >
              <span className="material-symbols-outlined text-sm leading-none">
                logout
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Controls (< md) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-8 px-2.5 bg-[#FFDE59] text-[#0D0D0D] brutal-border-sm inline-flex items-center justify-center cursor-pointer select-none"
            aria-label={isMobileMenuOpen ? t.common.close : t.nav.openMenu}
          >
            <span className="material-symbols-outlined text-xl font-bold leading-none">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black dark:border-white bg-[#FFF8E7] dark:bg-[#141414] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black">
              {t.admin.badge}
            </span>
          </div>

          <Link
            href="/dashboard"
            prefetch={true}
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full p-3 bg-white dark:bg-[#1C1B1A] brutal-border-sm flex items-center justify-between text-xs font-bold uppercase"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span>{t.admin.backToUserDashboard}</span>
            </span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>

          <button
            type="button"
            onClick={() => signOutAction()}
            className="w-full py-2.5 bg-rose-600 text-white brutal-border-sm text-xs font-mono font-bold uppercase flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>{t.nav.logout}</span>
          </button>
        </div>
      )}
    </header>
  );
}
