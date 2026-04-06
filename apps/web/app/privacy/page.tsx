"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useI18n } from "@/components/providers/i18n-provider";

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary-500 to-accent-pink bg-clip-text text-transparent">
              {t("footer.privacy")}
            </span>
          </h1>

          <div className="space-y-8 text-[var(--color-text-secondary)]">
            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Coleta de Dados
              </h2>
              <p>
                Coletamos apenas os dados necessários para fornecer nossos
                serviços:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Informações de cadastro (nome, email, telefone)</li>
                <li>
                  Documentos de verificação de identidade (criptografados e
                  excluídos após verificação)
                </li>
                <li>Dados de uso e preferências</li>
                <li>Comunicações entre usuários (criptografadas)</li>
              </ul>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Uso dos Dados
              </h2>
              <p>Seus dados são usados para:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Fornecer serviços de comunicação</li>
                <li>Verificação de identidade</li>
                <li>Melhorar a experiência do usuário</li>
                <li>Prevenir comportamento inadequado</li>
                <li>Suporte técnico</li>
              </ul>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Proteção de Dados
              </h2>
              <p>Implementamos medidas de segurança robustas:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Criptografia de ponta a ponta</li>
                <li>Armazenamento seguro com criptografia</li>
                <li>Acesso restrito a dados pessoais</li>
                <li>Monitoramento contínuo de segurança</li>
              </ul>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Seus Direitos
              </h2>
              <p>Você tem direito a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar exclusão de dados</li>
                <li>Revogar consentimento</li>
                <li>Exportar seus dados</li>
              </ul>
            </section>

            <section className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Contato
              </h2>
              <p>
                Para dúvidas sobre privacidade, entre em contato através da
                página de contato.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
