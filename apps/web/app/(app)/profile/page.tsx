"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuth } from "@/stores/auth";
import {
  VerifiedBadge,
  VerificationShield,
} from "@/components/ui/verified-badge";
import { useTheme } from "@/stores/theme";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const userData = {
    name: user?.nickname || user?.name || "Usuário",
    bio: user?.description || user?.bio || "",
  };

  const tabs = [
    { id: "posts", label: t("nav.posts") || "Publicações", count: 0 },
    { id: "friends", label: t("profile.friends") || "Amigos", count: 0 },
    { id: "media", label: t("profile.media") || "Mídia", count: 0 },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-primary-500 via-accent-purple to-accent-pink" />
        <div className="absolute -bottom-12 left-4">
          <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-[var(--color-bg)]">
            {userData.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="p-4 pt-16">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {userData.name}
            </h1>
            {user?.isVerified && <VerifiedBadge />}
          </div>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium">
            {t("profile.edit") || "Editar Perfil"}
          </button>
        </div>

        {userData.bio && (
          <p className="text-[var(--color-text-secondary)] mb-4">
            {userData.bio}
          </p>
        )}

        <div className="flex gap-4 border-b border-[var(--color-border)] mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-sm">({tab.count})</span>
            </button>
          ))}
        </div>

        {activeTab === "posts" && (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
              <p className="text-[var(--color-text)]">
                Bem-vindo ao meu perfil! 🎉
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                2 dias atrás
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
