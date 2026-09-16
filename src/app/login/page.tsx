import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Metadata } from "next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Masuk - Ravenlink",
  description: "Masuk ke akun Ravenlink untuk mengelola halaman bio-link Anda.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-[#FFF8E7] dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#FFF8E7]">
      {/* Top Bar */}
      <header className="flex justify-between items-center max-w-6xl w-full mx-auto">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-black text-xl tracking-tight uppercase"
        >
          <span className="material-symbols-outlined text-2xl font-bold leading-none select-none">
            terminal
          </span>
          <span className="group-hover:underline">RAVENLINK</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Login Box Center */}
      <section className="flex-1 flex items-center justify-center py-12">
        <Suspense
          fallback={
            <div className="p-8 brutal-card font-mono text-center">
              Memuat formulir autentikasi...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs font-mono text-neutral-500 max-w-6xl w-full mx-auto py-2">
        © {new Date().getFullYear()} Ravenlink
      </footer>
    </main>
  );
}
