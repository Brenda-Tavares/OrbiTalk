"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuth } from "@/stores/auth";
import { useTheme } from "@/stores/theme";

export default function SettingsPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const { isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    vibration: true,
    language: "pt-BR",
    private: false,
    showOnline: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const themes = [
    { key: "light", label: t("theme.light"), icon: "☀️" },
    { key: "medium", label: t("theme.medium"), icon: "🌤️" },
    { key: "dark", label: t("theme.dark"), icon: "🌙" },
  ];

  const languages = [
    { code: "pt-BR", name: "Português" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "zh", name: "中文" },
    { code: "ko", name: "한국어" },
    { code: "ja", name: "日本語" },
    { code: "ru", name: "Русский" },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-xl font-bold text-[var(--color-text)] mb-6">
        {t("nav.settings")}
      </h1>

      <div className="space-y-6">
        <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">
            {t("settings.theme") || "Tema"}
          </h2>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key as "light" | "medium" | "dark")}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  theme === t.key
                    ? "bg-primary-500 text-white"
                    : "bg-[var(--color-elevated)] text-[var(--color-text)] border border-[var(--color-border)]"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">
            {t("settings.language") || "Idioma"}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code as any)}
                className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                  locale === lang.code
                    ? "bg-primary-500 text-white"
                    : "bg-[var(--color-elevated)] text-[var(--color-text)] border border-[var(--color-border)]"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">
            {t("settings.notifications") || "Notificações"}
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-[var(--color-text)]">
                {t("settings.pushNotifications") || "Notificações push"}
              </span>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  setSettings({ ...settings, notifications: e.target.checked })
                }
                className="w-5 h-5 accent-primary-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[var(--color-text)]">
                {t("settings.sound") || "Som"}
              </span>
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) =>
                  setSettings({ ...settings, sound: e.target.checked })
                }
                className="w-5 h-5 accent-primary-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[var(--color-text)]">
                {t("settings.vibration") || "Vibração"}
              </span>
              <input
                type="checkbox"
                checked={settings.vibration}
                onChange={(e) =>
                  setSettings({ ...settings, vibration: e.target.checked })
                }
                className="w-5 h-5 accent-primary-500"
              />
            </label>
          </div>
        </section>

        <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">
            {t("settings.privacy") || "Privacidade"}
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-[var(--color-text)]">Conta privada</span>
              <input
                type="checkbox"
                checked={settings.private}
                onChange={(e) =>
                  setSettings({ ...settings, private: e.target.checked })
                }
                className="w-5 h-5 accent-primary-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[var(--color-text)]">Mostrar online</span>
              <input
                type="checkbox"
                checked={settings.showOnline}
                onChange={(e) =>
                  setSettings({ ...settings, showOnline: e.target.checked })
                }
                className="w-5 h-5 accent-primary-500"
              />
            </label>
          </div>
        </section>

        <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">
            {t("settings.account") || "Conta"}
          </h2>
          <div className="space-y-2">
            <button className="w-full py-3 text-left text-[var(--color-text)] hover:bg-[var(--color-elevated)] rounded-lg px-3">
              {t("settings.changePassword") || "Alterar senha"}
            </button>
            <button className="w-full py-3 text-left text-[var(--color-text)] hover:bg-[var(--color-elevated)] rounded-lg px-3">
              {t("settings.blockedUsers") || "Usuários bloqueados"}
            </button>
            <button
              className="w-full py-3 text-left text-danger hover:bg-danger/10 rounded-lg px-3"
              onClick={handleLogout}
            >
              {t("common.logout") || "Sair"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
