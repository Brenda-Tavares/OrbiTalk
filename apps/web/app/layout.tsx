import type { Metadata, Viewport } from "next";
import {
  Inter,
  Noto_Sans_SC,
  Noto_Sans_JP,
  Noto_Sans_KR,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});
const notoSc = Noto_Sans_SC({ subsets: ["latin"], display: "swap" });
const notoJp = Noto_Sans_JP({ subsets: ["latin"], display: "swap" });
const notoKr = Noto_Sans_KR({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "OrbiTalk - Connect with the World",
  description:
    "Global social network for worldwide communication with text, voice, video chat and integrated games.",
  keywords: [
    "social network",
    "global chat",
    "video call",
    "language exchange",
    "international friends",
  ],
  authors: [{ name: "OrbiTalk Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OrbiTalk",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "OrbiTalk",
    title: "OrbiTalk - Connect with the World",
    description: "Global social network for worldwide communication.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6C63FF" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.className} ${notoSc.className} ${notoJp.className} ${notoKr.className}`}
        style={{
          fontFamily:
            "Inter, Noto Sans SC, Noto Sans JP, Noto Sans KR, system-ui, sans-serif",
        }}
      >
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "bg-[var(--color-surface)] text-[var(--color-text)]",
              }}
            />
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
