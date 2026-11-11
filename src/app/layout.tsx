import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Paid — Autonomous Accounts-Receivable Agent",
  description: "The AI Copilot that scopes client messages into PayPal invoices, monitors payment, and escalates chasing automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
