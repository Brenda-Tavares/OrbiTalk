"use client";

import * as React from "react";
import { translations, Locale } from "@/lib/translations";

export type SupportedLocale = keyof typeof translations;

export const SUPPORTED_LOCALES: Record<
  SupportedLocale,
  { name: string; nativeName: string }
> = {
  "pt-BR": { name: "Portuguese", nativeName: "Português" },
  en: { name: "English", nativeName: "English" },
  zh: { name: "Chinese", nativeName: "中文" },
  es: { name: "Spanish", nativeName: "Español" },
  ko: { name: "Korean", nativeName: "한국어" },
  ja: { name: "Japanese", nativeName: "日本語" },
  ru: { name: "Russian", nativeName: "Русский" },
};

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = React.createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLocale, setCurrentLocale] =
    React.useState<SupportedLocale>("en");

  React.useEffect(() => {
    const saved = localStorage.getItem("orbitalk-locale") as SupportedLocale;
    if (saved && SUPPORTED_LOCALES[saved]) {
      setCurrentLocale(saved);
    }
  }, []);

  const t = React.useCallback(
    (key: string, params?: Record<string, string>): string => {
      const keys = key.split(".");
      let text: string | undefined = translations[
        currentLocale
      ] as unknown as Record<string, unknown>;

      for (const k of keys) {
        text = text?.[k] as string | undefined;
      }

      if (!text) return key;

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text?.replace(`{${k}}`, v);
        });
      }
      return text;
    },
    [currentLocale],
  );

  const setLocale = React.useCallback((newLocale: SupportedLocale) => {
    setCurrentLocale(newLocale);
    localStorage.setItem("orbitalk-locale", newLocale);
  }, []);

  return (
    <I18nContext.Provider value={{ locale: currentLocale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return React.useContext(I18nContext);
}
