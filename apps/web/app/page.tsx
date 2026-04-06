"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/ui/logo";
import { useI18n } from "@/components/providers/i18n-provider";
import { useTheme } from "@/stores/theme";

export default function HomePage() {
  const { t } = useI18n();
  const { theme } = useTheme();

  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t("landing.feature1Title"),
      desc: t("landing.feature1Desc"),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: t("landing.feature2Title"),
      desc: t("landing.feature2Desc"),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("landing.feature3Title"),
      desc: t("landing.feature3Desc"),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t("landing.feature4Title"),
      desc: t("landing.feature4Desc"),
    },
  ];

  const languageData = [
    { code: "pt-BR", name: "Português" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "zh", name: "中文" },
    { code: "ko", name: "한국어" },
    { code: "ja", name: "日本語" },
    { code: "ru", name: "Русский" },
  ];

  return (
    <div
      className={`min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] ${theme === "dark" ? "dark" : ""}`}
    >
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-pink/20" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-pulse-slow" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/30 rounded-full blur-3xl animate-pulse-slow"
              style={{ animationDelay: "1s" }}
            />
          </div>

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />

          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center animate-float">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 blur-xl opacity-50 rounded-full" />
                <Logo size="xl" className="relative" />
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight">
              <span
                className="bg-gradient-to-r from-[#818cf8] via-[#a855f7] to-[#f472b6] bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #818cf8, #a855f7, #f472b6)",
                }}
              >
                {t("landing.heroTitle")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mb-8 text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t("landing.heroSubtitle")}
            </p>

            {/* Safety Badge */}
            <div className="mb-10 inline-flex items-center gap-3 rounded-full bg-success/10 border border-success/20 px-5 py-2.5">
              <svg
                className="w-5 h-5 text-success"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-success font-medium">
                {t("landing.badge") ||
                  "18+ • Identity Verified • Safe Community"}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all hover:shadow-glow-lg hover:scale-105"
              >
                {t("landing.ctaButton")}
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-primary-500 text-[var(--color-text)] font-semibold rounded-xl transition-all"
              >
                {t("common.login")}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div>
                <div className="text-3xl font-bold text-primary-500">7+</div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {t("landing.statsLanguages")}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent-cyan">AI</div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {t("landing.statsAIPowered")}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent-pink">Safe</div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {t("landing.statsSafeVerified")}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer hover:text-primary-500 transition-colors"
            aria-label="Scroll down"
          >
            <svg
              className="w-6 h-6 text-[var(--color-text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-[var(--color-surface)]">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-primary-500 to-accent-purple bg-clip-text text-transparent">
                {t("landing.featuresTitle") ||
                  (t("landing.feature1Title").includes("Segurança")
                    ? "Por que OrbiTalk?"
                    : "Why OrbiTalk?")}
              </span>
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-16 max-w-2xl mx-auto">
              {t("landing.featuresSubtitle") ||
                (t("landing.feature1Title").includes("Segurança")
                  ? "Uma plataforma feita para quem busca conexões reais em um ambiente seguro e moderno."
                  : "A platform built for those seeking real connections in a safe and modern environment.")}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] hover:border-primary-500/50 transition-all hover:shadow-glow"
                >
                  <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Languages Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">
              <span className="bg-gradient-to-r from-primary-500 to-accent-cyan bg-clip-text text-transparent">
                {t("landing.languagesTitle") ||
                  (t("landing.feature2Title").includes("Aprenda")
                    ? "Idiomas Suportados"
                    : "Supported Languages")}
              </span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {languageData.map((lang) => (
                <div
                  key={lang.name}
                  className="px-5 py-3 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] hover:border-primary-500 transition-all hover:scale-105 cursor-pointer"
                >
                  <span className="font-medium">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary-500/20 via-[var(--color-surface)] to-accent-pink/20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">{t("landing.ctaTitle")}</h2>
            <p className="text-xl text-[var(--color-text-secondary)] mb-8">
              {t("landing.ctaSubtitle")}
            </p>
            <Link
              href="/register"
              className="inline-block px-10 py-5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all hover:shadow-glow-lg hover:scale-105"
            >
              {t("landing.ctaButton")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
