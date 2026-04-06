"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/ui/logo";
import { useI18n } from "@/components/providers/i18n-provider";

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary-500 to-accent-purple bg-clip-text text-transparent">
              {t("footer.about")}
            </span>
          </h1>

          <div className="space-y-8 text-[var(--color-text-secondary)]">
            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                O que é OrbiTalk?
              </h2>
              <p>{t("landing.heroSubtitle")}</p>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Nossa Missão
              </h2>
              <p>
                Criar um espaço seguro para conexão global, onde pessoas de
                diferentes culturas podem se comunicar livremente, aprender
                idiomas e fazer amizades duradouras. Priorizamos a segurança,
                especialmente para mulheres, com verificação de identidade e
                proteção contra assédio.
              </p>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Características Principais
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Verificação de identidade com IA</li>
                <li>Tutor de idiomas com IA</li>
                <li>Tradução em tempo real</li>
                <li>Jogos sociais (gamão, xadrez, damas)</li>
                <li>Chat texto, voz e vídeo</li>
                <li>Proteção contra conteúdo impróprio</li>
              </ul>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center gap-4">
                <Logo size="lg" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    OrbiTalk
                  </h3>
                  <p className="text-sm">Versão 1.0.0</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
