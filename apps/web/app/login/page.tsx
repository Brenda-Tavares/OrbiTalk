"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuth } from "@/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { isAuthenticated, setUser, setTokens } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/chat");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setTokens(data.data.accessToken, data.data.refreshToken);
        router.push("/chat");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <span className="text-3xl font-bold bg-gradient-to-r from-primary-500 via-accent-purple to-accent-pink bg-clip-text text-transparent">
            OrbiTalk
          </span>
        </Link>

        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)] text-center mb-2">
            {t("auth.loginTitle")}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-center mb-6">
            {t("auth.loginSubtitle")}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)]"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                {t("auth.password")}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)]"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? t("common.loading") : t("common.login")}
            </button>
          </form>

          <p className="text-center text-[var(--color-text-secondary)] mt-6">
            {t("auth.registerSubtitle")}{" "}
            <Link href="/register" className="text-primary-500 hover:underline">
              {t("common.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
