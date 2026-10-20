import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitBounty AI - Autonomous Bug Bounty Protocol with PayPal Payouts",
  description:
    "Autonomous open-source bug escrow protocol powered by PayPal Orders v2, PayPal Payouts v1, and Gemini AI code verification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0A0E17] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
