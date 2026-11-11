import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Bricolage_Grotesque, Hanken_Grotesk, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Headlines: characterful grotesque with optical sizing
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
// Body copy: warm, highly legible grotesque
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
// Accent words: editorial italic serif
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
// Figures, labels, code
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-ui", display: "swap" });

export const metadata: Metadata = {
  title: "Get Paid — Autonomous Accounts-Receivable Agent",
  description:
    "The AI Copilot that scopes client messages into PayPal invoices, monitors payment, and escalates chasing automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} ${display.variable} ${body.variable} ${serif.variable} ${mono.variable}`}
    >
      <body className="bg-bg-primary text-text-primary font-sans antialiased selection:bg-[#84CC16]/30 selection:text-inherit">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            },
          }}
        />
      </body>
    </html>
  );
}
