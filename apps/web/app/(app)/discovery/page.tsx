"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuth } from "@/stores/auth";
import { discoveryApi, type User } from "@/lib/api";

export default function DiscoveryPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ language: "" });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const response = await discoveryApi.getUsers({
        language: filters.language || undefined,
      });
      if (response.success && response.data) {
        setUsers(response.data.users || []);
      }
      setLoading(false);
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, filters.language]);

  const filteredUsers = users;

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-4">
          {t("nav.discovery")}
        </h1>

        <div className="flex gap-2 flex-wrap">
          {[
            "Português",
            "Español",
            "English",
            "日本語",
            "中文",
            "한국어",
            "Русский",
          ].map((lang) => (
            <button
              key={lang}
              onClick={() =>
                setFilters({
                  ...filters,
                  language: filters.language === lang ? "" : lang,
                })
              }
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                filters.language === lang
                  ? "bg-primary-500 text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-[var(--color-text-secondary)]">
            <p>{t("discovery.empty") || "Nenhum usuário encontrado"}</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:border-primary-500 transition-colors"
            >
              <div className="h-24 bg-gradient-to-br from-primary-500 to-accent-pink relative" />
              <div className="p-4 -mt-8">
                <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                  {user.name?.charAt(0) || "?"}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <h3 className="font-semibold text-[var(--color-text)] text-center">
                    {user.nickname}
                  </h3>
                  {user.isVerified && (
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] text-center mb-2">
                  {user.country || user.countryCode}
                </p>

                <div className="flex flex-wrap gap-1 justify-center mb-2">
                  {user.languages?.map((lang) => (
                    <span
                      key={lang}
                      className="text-xs bg-primary-500/20 text-primary-500 px-2 py-0.5 rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>

                <button className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors">
                  {t("discovery.connect") || "Conectar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
