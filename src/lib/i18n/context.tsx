"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dictionaries, Locale } from "./dictionaries";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof dictionaries["id"];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    const saved = localStorage.getItem("ravenlink_locale") as Locale;
    if (saved && (saved === "id" || saved === "en")) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    } else {
      const browserLang = navigator.language.startsWith("id") ? "id" : "en";
      setLocaleState(browserLang);
      document.documentElement.lang = browserLang;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("ravenlink_locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = dictionaries[locale] || dictionaries.id;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
