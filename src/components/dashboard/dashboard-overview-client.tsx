"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

interface DashboardOverviewClientProps {
  user: {
    name: string | null;
    username: string;
    themeAccent: string;
    themeCardStyle: string;
  };
  links: Array<{
    id: string;
    title: string;
    url: string;
    icon: string | null;
    clicks: number;
    isActive: boolean;
  }>;
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
}

export function DashboardOverviewClient({
  user,
  links,
  totalLinks,
  activeLinks,
  totalClicks,
}: DashboardOverviewClientProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Top Banner with Public Link */}
      <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 bg-[#FFDE59] text-[#0D0D0D] border border-black">
              {t.dashboard.bannerBadge}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
            {t.dashboard.welcome} {user.name || t.dashboard.creatorDefault}!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-mono mt-1">
            {t.dashboard.publicUrl}{" "}
            <span className="font-bold underline text-black dark:text-white">
              /{user.username}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href={`/${user.username}`}
            target="_blank"
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-black text-white dark:bg-white dark:text-black brutal-btn font-bold text-xs sm:text-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            <span>{t.dashboard.openPublic}</span>
          </Link>
          <Link
            href="/dashboard/builder"
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#FFDE59] text-[#0D0D0D] brutal-btn font-bold text-xs sm:text-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">extension</span>
            <span>{t.dashboard.openBuilder}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Links */}
        <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">
              {t.dashboard.totalLinks}
            </span>
            <span className="material-symbols-outlined text-xl">link</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-black dark:text-white">
            {totalLinks}
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-mono">
            {activeLinks} {t.dashboard.activeLinksSub}
          </p>
        </div>

        {/* Metric 2: Total Clicks */}
        <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">
              {t.dashboard.totalClicks}
            </span>
            <span className="material-symbols-outlined text-xl">ads_click</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-black dark:text-white">
            {totalClicks}
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-mono">
            {t.dashboard.clicksSub}
          </p>
        </div>

        {/* Metric 3: Theme Status */}
        <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">
              {t.dashboard.themeStatus}
            </span>
            <span className="material-symbols-outlined text-xl">palette</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="w-6 h-6 brutal-border-sm flex-shrink-0"
              style={{ backgroundColor: user.themeAccent }}
            />
            <span className="font-mono text-xs sm:text-sm font-bold uppercase truncate">
              {user.themeCardStyle}
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-mono">
            {t.dashboard.paletteSub}
          </p>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Quick links */}
        <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-4">
            <h2 className="text-base sm:text-lg font-black uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">list</span>
              <span>{t.dashboard.topContent}</span>
            </h2>
            <Link
              href="/dashboard/links"
              className="text-xs font-bold font-mono underline hover:no-underline"
            >
              {t.dashboard.manageAll}
            </Link>
          </div>

          {links.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 font-mono text-xs">
              <span className="material-symbols-outlined text-3xl mb-1 block">
                folder_open
              </span>
              {t.dashboard.noLinksYet}
              <div className="mt-3">
                <Link
                  href="/dashboard/links"
                  className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black brutal-btn font-bold text-xs inline-block"
                >
                  {t.dashboard.createFirst}
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {links.slice(0, 4).map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 brutal-border-sm bg-[#FFF8E7] dark:bg-[#1A1A1A] gap-2"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="material-symbols-outlined text-lg flex-shrink-0">
                      {link.icon || "link"}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm leading-tight text-black dark:text-white truncate">
                        {link.title}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500 truncate max-w-[160px] sm:max-w-[260px]">
                        {link.url}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono flex-shrink-0">
                    <span className="px-1.5 sm:px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 brutal-border-sm font-bold text-[11px]">
                      {link.clicks} {t.dashboard.clicks}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full border border-black ${
                        link.isActive ? "bg-emerald-500" : "bg-neutral-400"
                      }`}
                      title={link.isActive ? t.dashboard.active : t.dashboard.inactive}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Drag-and-Drop Puzzle Concept preview */}
        <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-4">
              <h2 className="text-base sm:text-lg font-black uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">extension</span>
                <span>{t.dashboard.builderCardTitle}</span>
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 bg-[#FFDE59] text-[#0D0D0D] border border-black font-bold uppercase">
                dnd-kit
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-4 leading-relaxed">
              {t.dashboard.builderCardDesc}
            </p>

            <div className="p-3.5 sm:p-4 bg-[#FFF2CE] dark:bg-[#1A1A1A] brutal-border-sm mb-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold">{t.dashboard.slotFilled}</span>
                <span className="font-bold">
                  {activeLinks} / {totalLinks}
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 brutal-border-sm overflow-hidden">
                <div
                  className="bg-[#0D0D0D] dark:bg-[#FFF8E7] h-full transition-all"
                  style={{
                    width: `${totalLinks > 0 ? (activeLinks / totalLinks) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/builder"
            className="w-full text-center px-4 py-3 bg-[#0D0D0D] text-white dark:bg-white dark:text-black brutal-btn font-bold text-xs sm:text-sm block"
          >
            {t.dashboard.startBuilding}
          </Link>
        </div>
      </div>
    </div>
  );
}
