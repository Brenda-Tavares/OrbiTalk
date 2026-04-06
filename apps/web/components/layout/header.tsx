"use client";

import * as React from "react";
import Link from "next/link";
import { LogoWithText } from "@/components/ui/logo";
import { LanguageSelector } from "@/components/ui/language-selector";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useI18n } from "@/components/providers/i18n-provider";

export function Header() {
  const { t } = useI18n();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <LogoWithText size="sm" className="opacity-100" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/features"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {t("landing.feature1Title")}
            </Link>
            <Link
              href="/about"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {t("footer.about")}
            </Link>
            <Link
              href="/help"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {t("footer.help")}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeSelector />
            <LanguageSelector />
            <Link
              href="/register"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              {t("common.register")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
