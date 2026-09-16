"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { ThemeToggle } from "@/components/providers/theme-provider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { RavenlinkLogo } from "@/components/ui/ravenlink-logo";

interface DashboardNavProps {
  username: string;
  userName: string;
  userRole?: string;
  userImage?: string | null;
  signOutAction: () => Promise<void>;
}

export function DashboardNav({
  username: initialUsername,
  userName: initialUserName,
  userRole: initialUserRole,
  userImage: initialUserImage,
  signOutAction,
}: DashboardNavProps) {
  const { data: session } = useSession();
  const username = session?.user?.username || initialUsername;
  const userName = session?.user?.name || initialUserName;
  const userRole = session?.user?.role || initialUserRole;
  const userImage = session?.user?.image !== undefined ? session.user.image : initialUserImage;

  const { t } = useI18n();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu automatically on navigation change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when full-page sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close full-page sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: t.nav.overview, icon: "dashboard" },
    { href: "/dashboard/links", label: t.nav.links, icon: "link" },
    {
      href: "/dashboard/builder",
      label: t.nav.builder,
      icon: "extension",
      accent: true,
    },
    { href: "/dashboard/theme", label: t.nav.theme, icon: "palette" },
    { href: "/dashboard/settings", label: t.nav.settings, icon: "person" },
  ];

  return (
    <>
      <header className="border-b-4 border-black dark:border-[#E2DFD8] bg-white dark:bg-[#1C1B1A] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand Logo & Public Link */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tight uppercase shrink-0"
            >
              <RavenlinkLogo size="md" />
              <span className="truncate">{t.nav.brand}</span>
            </Link>

            <Link
              href={`/${username}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex lg:hidden xl:inline-flex items-center gap-1 h-8 px-2.5 bg-[#FFF8E7] dark:bg-[#1A1A1A] brutal-border-sm text-xs font-mono font-bold hover:bg-[#FFF2CE] transition-colors text-[#0D0D0D] dark:text-[#FFF8E7] shrink-0 select-none"
              title="Buka bio-link publik di tab baru"
            >
              <span className="material-symbols-outlined text-xs leading-none">open_in_new</span>
              <span className="leading-none">/{username}</span>
            </Link>
          </div>

          {/* Desktop Navigation Tabs (Visible only on lg: 1024px and up to prevent side-by-side collisions) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-bold uppercase overflow-x-auto py-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-8 px-2.5 xl:px-3 brutal-border-sm transition-transform active:translate-y-0.5 inline-flex items-center gap-1.5 shrink-0 select-none ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : link.accent
                      ? "bg-[#FFDE59] text-[#0D0D0D] font-black hover:bg-[#FFD738]"
                      : "bg-white dark:bg-[#1A1A1A] text-[#0D0D0D] dark:text-[#FFF8E7] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm leading-none">
                    {link.icon}
                  </span>
                  <span className="leading-none">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Utilities: Lang, Theme, User Badge, SignOut (Visible on lg and up) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {userRole === "SUPER_ADMIN" && (
              <Link
                href="/admin"
                className="h-8 px-2.5 bg-[#FFDE59] text-[#0D0D0D] brutal-border-sm text-xs font-mono font-bold inline-flex items-center gap-1 hover:bg-[#FFD738] transition-colors shrink-0 select-none"
                title="Admin Dashboard"
              >
                <span className="material-symbols-outlined text-sm leading-none">
                  shield
                </span>
                <span className="leading-none">Admin</span>
              </Link>
            )}
            <LanguageSwitcher />
            <ThemeToggle />

            {/* User badge */}
            <div className="flex items-center gap-2 pl-1 border-l-2 border-neutral-300 dark:border-neutral-700 shrink-0">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userImage}
                  alt={userName}
                  className="w-8 h-8 border-2 border-black dark:border-white object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white border-2 border-black dark:border-white flex items-center justify-center font-bold text-xs shrink-0">
                  {userName[0]?.toUpperCase()}
                </div>
              )}
              {/* Only show username text on extra large screens to preserve spacing */}
              <span className="hidden xl:inline-block font-mono text-xs font-bold text-black dark:text-white truncate max-w-[100px] leading-none">
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

          {/* Split-Screen & Mobile Controls (< lg: 1024px) */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-8 px-2.5 bg-[#FFDE59] text-[#0D0D0D] brutal-border-sm inline-flex items-center justify-center cursor-pointer transition-transform active:translate-y-0.5 shrink-0 select-none"
              aria-label={t.nav.openMenu}
              title={t.nav.openMenu}
            >
              <span className="material-symbols-outlined text-xl font-bold leading-none">
                menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* FULL-PAGE SIDEBAR OVERLAY (Replaces dropdown to completely isolate navigation from page content) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#FFF8E7] dark:bg-[#0D0D0D] flex flex-col justify-between p-4 sm:p-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar inside Sidebar */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white">
              <div className="flex items-center gap-2 font-black text-xl tracking-tight uppercase">
                <RavenlinkLogo size="md" />
                <span>{t.nav.brand}</span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-1.5 bg-[#FFDE59] text-[#0D0D0D] brutal-btn font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                aria-label={t.common.close}
              >
                <span className="material-symbols-outlined text-base font-bold">
                  close
                </span>
                <span>{t.common.close}</span>
              </button>
            </div>

            {/* User Account Card */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 my-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userImage}
                    alt={userName}
                    className="w-12 h-12 border-2 border-black dark:border-white object-cover shadow-[2px_2px_0px_#000]"
                  />
                ) : (
                  <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white border-2 border-black dark:border-white flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#000]">
                    {userName[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-black text-sm uppercase truncate text-[#0D0D0D] dark:text-[#FFF8E7]">
                    {userName}
                  </div>
                  <Link
                    href={`/${username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group text-xs font-mono text-[#3772FF] inline-flex items-center gap-1 font-bold mt-0.5 select-none"
                  >
                    <span className="group-hover:underline">/{username}</span>
                    <span className="material-symbols-outlined text-xs leading-none">open_in_new</span>
                  </Link>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-[#06D6A0] text-[#0D0D0D] text-[10px] font-mono font-bold uppercase border border-black shadow-[2px_2px_0px_#000]">
                Active
              </span>
            </div>

            {/* Full-Page Navigation Links */}
            <nav className="space-y-2.5 my-4">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full p-4 brutal-card flex items-center justify-between font-mono text-sm font-black uppercase transition-transform active:translate-y-0.5 ${
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-none border-3"
                        : link.accent
                        ? "bg-[#FFDE59] text-[#0D0D0D] hover:bg-[#FFD738]"
                        : "bg-white dark:bg-[#1C1B1A] text-[#0D0D0D] dark:text-[#FFF8E7] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl">
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                    </span>
                    <span className="material-symbols-outlined text-base opacity-70">
                      arrow_forward
                    </span>
                  </Link>
                );
              })}

              {/* Admin Link in Mobile Menu */}
              {userRole === "SUPER_ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full p-4 brutal-card flex items-center justify-between font-mono text-sm font-black uppercase bg-[#FFDE59] text-[#0D0D0D] hover:bg-[#FFD738] transition-transform active:translate-y-0.5 mt-2"
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">
                      shield
                    </span>
                    <span>Admin</span>
                  </span>
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </Link>
              )}
            </nav>
          </div>

          {/* Bottom Actions & Sign Out */}
          <div className="pt-4 border-t-2 border-black dark:border-white space-y-3 mt-4">
            <button
              type="button"
              onClick={() => signOutAction()}
              className="w-full py-3.5 px-4 bg-rose-600 text-white brutal-btn text-xs font-mono font-black uppercase flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>{t.nav.logout}</span>
            </button>

            <div className="text-center text-xs font-mono text-neutral-500">
              © 2026 Ravenlink
            </div>
          </div>
        </div>
      )}
    </>
  );
}
