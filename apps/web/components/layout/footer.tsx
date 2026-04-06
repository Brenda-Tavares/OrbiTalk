"use client";

import * as React from "react";
import Link from "next/link";
import { LogoWithText } from "@/components/ui/logo";
import { useI18n } from "@/components/providers/i18n-provider";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <LogoWithText size="md" className="mb-4" />
            <p className="text-[var(--color-text-secondary)] text-sm max-w-md">
              {t("landing.heroSubtitle")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-4">
              {t("footer.about")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-[var(--color-text-secondary)] hover:text-primary-500 transition-colors text-sm"
                >
                  {t("landing.feature1Title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[var(--color-text-secondary)] hover:text-primary-500 transition-colors text-sm"
                >
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-[var(--color-text-secondary)] hover:text-primary-500 transition-colors text-sm"
                >
                  {t("footer.help")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-4">
              {t("footer.terms")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-[var(--color-text-secondary)] hover:text-primary-500 transition-colors text-sm"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[var(--color-text-secondary)] hover:text-primary-500 transition-colors text-sm"
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[var(--color-text-secondary)] hover:text-primary-500 transition-colors text-sm"
                >
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--color-text-secondary)]">
              © 2026 OrbiTalk. {t("footer.copyright")}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Desenvolvido por{" "}
              <span className="text-primary-500 font-medium">
                Alabaster Developer
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
