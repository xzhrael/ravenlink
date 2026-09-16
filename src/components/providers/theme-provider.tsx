"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default is explicitly LIGHT mode
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("ravenlink_theme") as ThemeMode | null;
    const root = document.documentElement;

    if (saved === "dark") {
      setThemeState("dark");
      setResolvedTheme("dark");
      root.classList.add("dark");
    } else {
      // DEFAULT TO LIGHT MODE
      setThemeState("light");
      setResolvedTheme("light");
      root.classList.remove("dark");
      if (!saved) {
        localStorage.setItem("ravenlink_theme", "light");
      }
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    const root = document.documentElement;
    setThemeState(newTheme);
    setResolvedTheme(newTheme);
    localStorage.setItem("ravenlink_theme", newTheme);

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="h-8 px-2.5 bg-white dark:bg-[#1C1B1A] text-[#0D0D0D] dark:text-[#FFF8E7] brutal-border-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-transform active:translate-y-0.5 cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs font-mono font-bold shrink-0 select-none"
      title={`Beralih ke mode ${resolvedTheme === "dark" ? "terang" : "gelap"}`}
      aria-label="Toggle dark mode"
    >
      <span className="material-symbols-outlined text-base leading-none">
        {resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
      </span>
      <span className="uppercase text-[11px] leading-none">
        {resolvedTheme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}
