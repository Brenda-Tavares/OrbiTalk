"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useI18n } from "@/components/providers/i18n-provider";

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary-500 to-accent-purple bg-clip-text text-transparent">
              {t("footer.terms")}
            </span>
          </h1>

          <div className="space-y-8 text-[var(--color-text-secondary)]">
            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Aceitação dos Termos
              </h2>
              <p>
                Ao se cadastrar no OrbiTalk, você concorda em cumprir estes
                termos e condições. Se você não concordar com algum destes
                termos, não deve usar o aplicativo.
              </p>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Requisitos de Uso
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Ter 18 anos ou mais</li>
                <li>Completar verificação de identidade</li>
                <li>Fornecer informações verdadeiras</li>
                <li>Manter uma conta por pessoa</li>
                <li>Não compartilhar credenciais de acesso</li>
              </ul>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Conduta Proibida
              </h2>
              <p className="mb-2">Os seguintes comportamentos são proibidos:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Assédio, bullying ou ameaças</li>
                <li>Conteúdo sexual explícito não consentido</li>
                <li>Spam ou mensagens indesejadas</li>
                <li>Scams ou tentativas de phishing</li>
                <li>Atividade ilegal</li>
                <li>Criação de contas falsas</li>
                <li>Conteúdo envolvendo menores</li>
              </ul>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Consequências
              </h2>
              <p>Violações destes termos podem resultar em:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Advertência</li>
                <li>Suspensão temporária</li>
                <li>Banimento permanente</li>
                <li>Report às autoridades (se necessário)</li>
              </ul>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Modificações
              </h2>
              <p>
                Podemos modificar estes termos a qualquer tempo. Você será
                notificado sobre mudanças significativas. O uso contínuo do
                aplicativo após modificações constitui aceitação dos novos
                termos.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
