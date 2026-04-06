"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useI18n } from "@/components/providers/i18n-provider";

export default function HelpPage() {
  const { t } = useI18n();

  const faqs = [
    {
      question: "Como funciona a verificação de identidade?",
      answer:
        "Após o cadastro, você precisará enviar uma foto segurando seu documento de identidade. Nossa IA verifica se a pessoa no documento corresponde à foto enviada. O processo é rápido e seus dados são criptografados e excluídos após a verificação.",
    },
    {
      question: "Quais idiomas são suportados?",
      answer:
        "Supports: Português, English, Español, 中文, 한국어, 日本語, Русский",
    },
    {
      question: "Como funciona o tutor de idiomas com IA?",
      answer:
        "O tutor de IA está integrado ao aplicativo. Você pode praticar conversas, enviar mensagens de voz para correção de pronúncia, e receber feedback em tempo real. O serviço tem limite diário gratuito de 10 transcrições.",
    },
    {
      question: "Como posso reportar comportamento inadequado?",
      answer:
        "Em qualquer chat ou perfil, clique no botão de report (bandeira). Nossa IA analisará o relatório com prioridade e we'll take appropriate action. Para emergências, você pode usar o botão de emergência para contato direto com nossa equipe.",
    },
    {
      question: "Os dados são protegidos?",
      answer:
        "Sim. Seguimos LGPD (Brasil), GDPR (Europa) e outras leis de proteção de dados. Seus dados pessoais são criptografados e você pode solicitar exclusão a qualquer momento.",
    },
    {
      question: "Como funciona a proteção contra assédio?",
      answer:
        "Nossa IA detecta padrões de assédio em tempo real. Se alguém enviar mensagens impróprias, você será notificado e poderemos bloquear automaticamente o usuário. Mulheres têm acesso a recursos adicionais de proteção.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary-500 to-accent-cyan bg-clip-text text-transparent">
              {t("footer.help")}
            </span>
          </h1>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-[var(--color-text)]">
                  <span>{faq.question}</span>
                  <svg
                    className="w-5 h-5 text-[var(--color-text-secondary)] group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-[var(--color-text-secondary)]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 p-6 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              Precisa de mais ajuda?
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Entre em contato conosco e responderemos em 24 horas.
            </p>
            <Link
              href="/contact"
              className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {t("footer.contact")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
