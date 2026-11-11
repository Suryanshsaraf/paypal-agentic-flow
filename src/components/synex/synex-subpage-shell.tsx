"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { playSoftClick } from "@/components/interactive/sound-effects";
import { DecryptedText } from "@/components/reactbits/decrypted-text";
import { ShinyText } from "@/components/reactbits/shiny-text";

interface SynexSubpageShellProps {
  badge: string;
  titleLight: string;
  titleBold: string;
  description: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  sidebarExtra?: React.ReactNode;
}

export function SynexSubpageShell({
  badge,
  titleLight,
  titleBold,
  description,
  headerAction,
  children,
  sidebarExtra,
}: SynexSubpageShellProps) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");

  const navLinks = [
    { label: "Dashboard", href: "/app" },
    { label: "Invoices Portfolio", href: "/invoices" },
    { label: "Analytics Subsections", href: "/activity" },
    { label: "AI Copilot Terminal", href: "/assistant" },
    { label: "Clients Directory", href: "/clients" },
    { label: "System Settings", href: "/settings" },
  ];

  return (
    <div className="bg-[#FAFBF9] min-h-screen text-[#0D0E11] font-sans pb-20 selection:bg-[#84CC16]/25 selection:text-inherit">
      {/* ── Subpage Editorial Header ── */}
      <section className="relative pt-12 pb-14 px-6 md:px-12 max-w-7xl mx-auto border-b border-[#E5E7EB]/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAEFE6] text-[#365314] text-xs font-mono uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#84CC16] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#84CC16]"></span>
              </span>
              <span>{badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#9EADB6] leading-[1.1]">
              <span>{titleLight} </span>
              <span className="font-extrabold text-[#0D0E11]">{titleBold}</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
              {description}
            </p>
          </div>

          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      </section>

      {/* ── Main Split-Glass Workspace (Balanced Color Coordination) ── */}
      <section className="px-4 sm:px-8 md:px-12 max-w-[1340px] mx-auto mt-8">
        <div className="rounded-[28px] overflow-hidden border border-[#E2E8F0] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] bg-white grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
          {/* Left Refined Dark Slate Sidebar */}
          <div className="lg:col-span-4 bg-[#11141D] text-white p-6 sm:p-7 flex flex-col justify-between border-r border-white/[0.08] relative">
            <div className="space-y-6">
              {/* Product Identity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#84CC16] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#84CC16] shadow-[0_0_8px_#84CC16]"></span>
                  </span>
                  <span className="font-bold text-sm tracking-wide text-white">GetPaid AR</span>
                </div>
                <span className="text-[11px] font-mono text-[#9CA3AF] bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/[0.08]">
                  v2.4 Live
                </span>
              </div>

              {/* Search Accounts */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#84CC16] transition-colors"
                />
              </div>

              {/* Navigation Menu with Smooth Sliding Indicator */}
              <nav className="space-y-1 relative">
                {navLinks.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => playSoftClick()}
                      className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "text-white"
                          : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="subpage-active-nav-pill"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          className="absolute inset-0 bg-white/[0.12] rounded-xl border border-white/[0.1] -z-0"
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                      {isActive ? (
                        <span className="relative z-10 text-[11px] font-mono text-[#84CC16]">[ Active ]</span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Autonomous Chasing Cadence Protocol */}
              <div className="pt-2 border-t border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] tracking-wider uppercase">
                  <span>Autonomous Chasing</span>
                  <span className="inline-flex items-center gap-1.5 text-[#84CC16]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#84CC16] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#84CC16]"></span>
                    </span>
                    <span>ACTIVE</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#9CA3AF] hover:text-white transition-colors cursor-default">
                    <span>Level 1 Friendly</span>
                    <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                  </div>
                  <div className="flex items-center justify-between text-[#9CA3AF] hover:text-white transition-colors cursor-default">
                    <span>Level 2 Neutral (Pause)</span>
                    <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                  </div>
                  <div className="flex items-center justify-between text-[#9CA3AF] hover:text-white transition-colors cursor-default">
                    <span>Level 3 Firm (Final Notice)</span>
                    <span className="h-2 w-2 rounded-full bg-[#F43F5E]" />
                  </div>
                  <div className="flex items-center justify-between text-[#9CA3AF] hover:text-white transition-colors cursor-default">
                    <span>Level 4 Legal Escalation</span>
                    <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                  </div>
                  <div className="flex items-center justify-between text-[#9CA3AF] hover:text-white transition-colors cursor-default">
                    <span>Human Override</span>
                    <span className="h-2 w-2 rounded-full bg-[#A855F7]" />
                  </div>
                </div>
              </div>

              {sidebarExtra && <div className="pt-2 border-t border-white/[0.08]">{sidebarExtra}</div>}
            </div>

            {/* Bottom Status Tile: Live PayPal Sandbox Connection */}
            <div className="pt-6 border-t border-white/[0.08]">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#9CA3AF] flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span>PAYPAL LIVE SANDBOX</span>
                  </span>
                  <span className="text-[#84CC16] font-bold">100% OK</span>
                </div>
                <div className="text-[11px] text-[#9CA3AF] leading-snug">
                  Connected to <span className="font-mono text-white/90">sb-tgbtt53851838@business.example.com</span>. Webhooks &amp; minor-unit arithmetic synchronized.
                </div>
              </div>
            </div>
          </div>

          {/* Right Clean Crisp Surface */}
          <div className="lg:col-span-8 bg-[#FCFDFE] p-6 sm:p-8 flex flex-col justify-between">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
