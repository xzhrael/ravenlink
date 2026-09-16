"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/providers/theme-provider";
import { RavenlinkLogo } from "@/components/ui/ravenlink-logo";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-[#FFF8E7] dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#FFF8E7]">
      {/* Top Bar */}
      <header className="flex justify-between items-center max-w-4xl w-full mx-auto">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-black text-xl tracking-tight uppercase"
        >
          <RavenlinkLogo size="md" />
          <span className="group-hover:underline">RAVENLINK</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* 404 Center Card */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#1C1B1A] brutal-card p-8 text-center space-y-4">
          <div className="inline-block px-3 py-1 bg-[#FFDE59] text-[#0D0D0D] border-2 border-black font-mono font-black text-lg">
            ERROR 404
          </div>

          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            {t.notFound.title}
          </h1>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
            {t.notFound.desc}
          </p>

          <div className="pt-4 border-t-2 border-black dark:border-white flex flex-col gap-2">
            <Link
              href="/"
              className="w-full py-2.5 bg-[#FFDE59] text-[#0D0D0D] brutal-btn font-bold text-sm block"
            >
              {t.notFound.backHome}
            </Link>
            <Link
              href="/login"
              className="w-full py-2 bg-transparent brutal-border-sm font-bold text-xs block hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {t.notFound.claimPrompt}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs font-mono text-neutral-500 max-w-4xl w-full mx-auto py-2">
        © {new Date().getFullYear()} Ravenlink
      </footer>
    </main>
  );
}

