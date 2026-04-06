"use client";

import * as React from "react";
import {
  useI18n,
  SUPPORTED_LOCALES,
  SupportedLocale,
} from "@/components/providers/i18n-provider";

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLocale = SUPPORTED_LOCALES[locale];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-primary-500 transition-colors"
      >
        <span className="text-sm text-[var(--color-text)]">
          {currentLocale.nativeName}
        </span>
        <svg
          className="w-4 h-4 text-[var(--color-text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-50">
          {Object.entries(SUPPORTED_LOCALES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setLocale(key as SupportedLocale);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-2 hover:bg-[var(--color-elevated)] transition-colors ${
                locale === key ? "text-primary-500" : "text-[var(--color-text)]"
              }`}
            >
              <span className="text-sm">{value.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
