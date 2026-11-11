"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Invoice, EventLog } from "@/lib/types";
import { formatCents } from "@/lib/money";
import {
  playSoftClick,
  playHarmonicSuccess,
  playAlertChime,
} from "@/components/interactive/sound-effects";
import { fireFintechCelebration } from "@/components/interactive/confetti";
import { toast } from "sonner";
import Link from "next/link";
import { TiltedCard } from "@/components/reactbits/tilted-card";
import { DecryptedText } from "@/components/reactbits/decrypted-text";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { MagnetButton } from "@/components/reactbits/magnet-button";
import { LottieCheck } from "@/components/lottie/lottie-animations";

interface SynexMasterProps {
  invoices: Invoice[];
  events: EventLog[];
  stats: any;
  onRefresh: () => Promise<void>;
}

export function SynexMasterExperience({
  invoices,
  events,
  stats,
  onRefresh,
}: SynexMasterProps) {
  const [timeframe, setTimeframe] = useState("Oct 1 - Nov 30, 2026");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Demo Mark Paid
  const handleMarkPaid = async (invoiceId: string) => {
    playSoftClick();
    setActiveActionId(invoiceId);
    try {
      const res = await fetch("/api/demo/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.ok) {
        playHarmonicSuccess();
        fireFintechCelebration();
        toast.success(`Settled via PayPal! ${data.message}`);
        await onRefresh();
      }
    } finally {
      setActiveActionId(null);
    }
  };

  // Demo Simulate Overdue
  const handleSimulateOverdue = async (invoiceId: string) => {
    playSoftClick();
    setActiveActionId(invoiceId);
    try {
      const res = await fetch("/api/demo/simulate-overdue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, autoChase: true }),
      });
      const data = await res.json();
      if (data.ok) {
        playAlertChime();
        toast.success("Time Machine: Invoice backdated! Autonomous agent escalated.");
        await onRefresh();
      }
    } finally {
      setActiveActionId(null);
    }
  };

  const totalOutstanding = stats?.totalOutstandingCents || 530000;
  const totalPaid = stats?.totalPaidCents || 120000;
  const totalVolume = totalOutstanding + totalPaid;

  return (
    <div className="space-y-0">
      {/* ── 1. Hero Section: A New Standard in Accounts Receivable ── */}
      <section className="relative pt-16 pb-12 px-6 md:px-12 lg:px-20 overflow-hidden bg-gradient-to-b from-white via-[#F9FAFB] to-[#F3F4F6]">
        {/* Alpine Rocky Moss Accents */}
        <div
          className="pointer-events-none absolute -left-20 bottom-0 w-80 h-96 opacity-30 bg-contain bg-no-repeat bg-bottom"
          style={{ backgroundImage: `url('/images/synex-hero-bg.png')` }}
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 w-80 h-96 opacity-30 bg-contain bg-no-repeat bg-bottom"
          style={{ backgroundImage: `url('/images/synex-hero-bg.png')` }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6B7280]">
            FINANCE REIMAGINED
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-[-0.03em] leading-[1.08]">
            <span className="block text-[#9EADB6] font-semibold">
              <DecryptedText text="A New Standard" speed={30} animateOn="view" />
            </span>
            <span className="block text-[#0D0E11] font-black">
              in Accounts Receivable
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed pt-1">
            Take full control of your receivables with a unified autonomous platform for scoping,
            tracking, and growing your cash flow in real time.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/invoices">
              <MagnetButton className="px-5 py-2.5 rounded-full bg-[#0D0E11] text-white text-xs font-bold hover:bg-[#27272A] transition-all shadow-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                <span>Deploy Autonomous Scoper</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </MagnetButton>
            </Link>
          </div>
        </div>

        {/* ── Embedded Split-Glass Dashboard Card ── */}
        <div className="relative z-10 mt-12 max-w-5xl mx-auto rounded-[20px] overflow-hidden border border-white/[0.3] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] flex flex-col md:flex-row bg-[#1A1C1E]/90 backdrop-blur-2xl">
          {/* Left Sidebar (Dark Translucent Smoke Glass) */}
          <div className="w-full md:w-64 p-5 border-b md:border-b-0 md:border-r border-white/[0.08] text-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                  GetPaid AR
                </span>
                <span className="text-[10px] text-[#9CA3AF] font-mono">v2.4</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-white/[0.06] border border-white/[0.08] rounded-md text-white placeholder-[#6B7280] focus:outline-none"
                />
              </div>

              {/* Navigation List */}
              <div className="space-y-1 text-xs">
                <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white/[0.12] text-white font-medium">
                  <span>Dashboard</span>
                  <span className="text-[10px] text-[#9CA3AF] font-mono">[ 2 ]</span>
                </div>
                <Link
                  href="/invoices"
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[#9CA3AF] hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <span>Invoices Portfolio</span>
                  <span className="text-[10px] text-[#6B7280] font-mono">3</span>
                </Link>
                <Link
                  href="/activity"
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[#9CA3AF] hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <span>Analytics Subsections</span>
                </Link>

                {/* Goals Expandable Tree */}
                <div className="pt-2">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider flex items-center justify-between">
                    <span>Autonomous Chasing</span>
                    <ChevronRight className="w-3 h-3 rotate-90 text-[#6B7280]" />
                  </div>
                  <div className="pl-4 space-y-1 mt-1 text-[11px] text-[#9CA3AF]">
                    <div className="flex items-center justify-between py-0.5 hover:text-white cursor-pointer">
                      <span>Level 1 Friendly</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    </div>
                    <div className="flex items-center justify-between py-0.5 hover:text-white cursor-pointer">
                      <span>Level 2 Neutral (Pause)</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    </div>
                    <div className="flex items-center justify-between py-0.5 hover:text-white cursor-pointer">
                      <span>Level 3 Firm (Late Fee)</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] text-[11px] text-[#9CA3AF] flex items-center justify-between">
              <span>PayPal Live Sandbox</span>
              <span className="text-emerald-400 font-bold">100% OK</span>
            </div>
          </div>

          {/* Right Main Content Area (Crisp White Glass Surface) */}
          <div className="flex-1 bg-white p-6 md:p-8 space-y-6">
            {/* Header Profile Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#0D0E11] to-[#374151] text-white font-bold text-xs flex items-center justify-center">
                  AM
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#0D0E11]">Alex Morgan</span>
                    <span className="text-[10px] font-semibold bg-[#F3F4F6] text-[#4B5563] px-1.5 py-0.5 rounded">Pro</span>
                  </div>
                  <span className="text-xs text-[#6B7280]">@alex_freelance</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] text-xs font-medium text-[#374151]">
                  <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                  <span>Timeframe: {timeframe}</span>
                </div>
                <button
                  onClick={onRefresh}
                  className="p-1.5 rounded-full hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
                  title="Sync records"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Capital Under Control Metric */}
            <div>
              <div className="text-[11px] font-bold text-[#6B7280] tracking-wider uppercase flex items-center gap-1 mb-1">
                <Zap className="w-3 h-3 text-[#84CC16]" />
                <span>Capital Under Management</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-[#0D0E11] tracking-tight tabular-nums">
                  $ {((totalOutstanding) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <span>Overdue ({formatCents(totalOutstanding)})</span>
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  vs. previous period $ 345,398.34 - Feb - Mar 2026
                </span>
              </div>
            </div>

            {/* Asset Breakdown Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="px-3 py-1.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-xs flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-medium text-[#374151]">Acme Corp:</span>
                <span className="font-bold text-[#0D0E11] tabular-nums">$3,500.00</span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-xs flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-medium text-[#374151]">Fintech Labs:</span>
                <span className="font-bold text-[#0D0E11] tabular-nums">$1,800.00</span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-xs flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-[#374151]">HyperGrowth:</span>
                <span className="font-bold text-emerald-600 tabular-nums">$1,200.00 (Settled ✓)</span>
              </div>

              <div className="ml-auto text-[11px] font-mono text-[#6B7280]">
                24h delta <strong className="text-emerald-600">+2.48%</strong> • 14d return <strong className="text-emerald-600">+6.81%</strong>
              </div>
            </div>

            {/* High-Density Vertical Bar Pinstripe Chart */}
            <div className="pt-2">
              <div className="h-28 w-full flex items-end justify-between gap-1 p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] relative overflow-hidden">
                {Array.from({ length: 48 }).map((_, idx) => {
                  const h = 25 + Math.sin(idx * 0.3) * 20 + ((idx * 7) % 35);
                  const isHighlighted = idx >= 18 && idx <= 30;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col justify-end h-full"
                    >
                      <div
                        style={{ height: `${h}%` }}
                        className={`w-full rounded-t-[1px] transition-all ${
                          isHighlighted ? "bg-[#0D0E11]" : "bg-[#D1D5DB]"
                        }`}
                      />
                    </div>
                  );
                })}

                <div className="absolute left-[36%] top-2 bottom-2 w-[28%] border-2 border-[#0D0E11] bg-black/[0.04] rounded-md pointer-events-none flex items-start justify-center pt-1">
                  <span className="text-[9px] font-mono font-bold bg-[#0D0E11] text-white px-1.5 rounded">
                    Active Chasing Range
                  </span>
                </div>
              </div>

              {/* Chart Footer Meta */}
              <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-mono pt-3 border-t border-[#E5E7EB] mt-3">
                <div>Position Entry: <strong className="text-[#0D0E11]">$28.00</strong></div>
                <div>Gas Fees / Escrow: <strong className="text-[#0D0E11]">$45.00</strong></div>
                <Link href="/invoices" className="text-accent font-semibold flex items-center gap-1 hover:underline">
                  <span>✦ View full active ledger</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Three-Column Feature Cards: Clarity and Control ── */}
      <section className="py-20 px-6 md:px-12 lg:px-20 border-t border-[#E5E7EB] bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0D0E11] tracking-tight max-w-xl">
                Clarity and control for every part of your receivables
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#6B7280] max-w-sm leading-relaxed">
              Get a clear, structured view of your capital — from invoice scoping to automated chasing and instant PayPal settlements.
            </p>
          </div>

          {/* 3 Columns with React Bits TiltedCard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column [ 1 ]: Total Receivables Visibility (Slate-Blue Card) */}
            <TiltedCard className="space-y-4">
              <div className="text-xs font-mono font-bold text-[#6B7280]">[ 1 ]</div>
              <h3 className="text-lg font-bold text-[#0D0E11]">Total receivables visibility</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Every agreement, every milestone — clearly structured in one system. Get a unified view of your entire portfolio across all client accounts.
              </p>

              <div className="rounded-2xl p-5 bg-gradient-to-br from-[#3B4A61] to-[#1E2530] text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.1]">
                  <span className="text-xs font-semibold text-white/90">Portfolio Overview</span>
                  <span className="text-[10px] text-white/60 font-mono">28 items</span>
                </div>

                <div>
                  <span className="text-[10px] text-white/60 uppercase block">Total Active</span>
                  <span className="text-2xl font-black tracking-tight tabular-nums">$ 5,300.00</span>
                </div>

                <div className="h-2 w-full rounded-full bg-white/[0.15] overflow-hidden flex">
                  <div style={{ width: "66%" }} className="bg-blue-400 h-full" />
                  <div style={{ width: "34%" }} className="bg-amber-400 h-full" />
                </div>

                <div className="space-y-1.5 text-xs text-white/80 pt-1">
                  <div className="flex justify-between">
                    <span>Acme Corp (Design Sprint)</span>
                    <span className="font-bold tabular-nums">$3,500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fintech Labs (API Redesign)</span>
                    <span className="font-bold tabular-nums">$1,800.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-300">
                    <span>HyperGrowth (Paid ✓)</span>
                    <span className="font-bold tabular-nums">$1,200.00</span>
                  </div>
                </div>
              </div>
            </TiltedCard>

            {/* Column [ 2 ]: Precision Performance Tracking (Moss-Green Card) */}
            <TiltedCard className="space-y-4">
              <div className="text-xs font-mono font-bold text-[#6B7280]">[ 2 ]</div>
              <h3 className="text-lg font-bold text-[#0D0E11]">Precision chase performance</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Autonomous tone escalation algorithms to monitor payment delays, pause deliverables, and apply late fees without awkward human confrontation.
              </p>

              <div className="rounded-2xl p-5 bg-gradient-to-br from-[#283622] to-[#161F13] text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.1]">
                  <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#84CC16]" />
                    Performance
                  </span>
                  <span className="text-[10px] font-mono text-[#84CC16] bg-[#84CC16]/20 px-1.5 py-0.5 rounded">
                    Active ↗
                  </span>
                </div>

                <div>
                  <div className="text-4xl font-black text-[#84CC16] tracking-tight">100% ↗</div>
                  <span className="text-xs font-bold text-white block mt-1">Precision Data Insights</span>
                  <p className="text-[11px] text-white/60 leading-relaxed mt-0.5">
                    100% deterministic queries. Zero float rounding errors. Zero LLM hallucinations.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.1] text-center">
                  <div className="bg-white/[0.05] p-2 rounded">
                    <span className="text-[9px] text-white/60 block">Growth</span>
                    <span className="text-xs font-bold text-[#84CC16]">+100% ↗</span>
                  </div>
                  <div className="bg-white/[0.05] p-2 rounded">
                    <span className="text-[9px] text-white/60 block">Latency</span>
                    <span className="text-xs font-bold text-blue-300">1ms ↘</span>
                  </div>
                  <div className="bg-white/[0.05] p-2 rounded">
                    <span className="text-[9px] text-white/60 block">Efficiency</span>
                    <span className="text-xs font-bold text-emerald-300">+8% ↗</span>
                  </div>
                </div>
              </div>
            </TiltedCard>

            {/* Column [ 3 ]: Global Allocation Intelligence (Warm Bronze Card) */}
            <TiltedCard className="space-y-4">
              <div className="text-xs font-mono font-bold text-[#6B7280]">[ 3 ]</div>
              <h3 className="text-lg font-bold text-[#0D0E11]">Global capital flow</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Real-time capital distribution and PayPal webhook verification. Track settlements, regional currency conversions, and liquidity flows in one view.
              </p>

              <div className="rounded-2xl p-5 bg-gradient-to-br from-[#4A3C2E] to-[#241C15] text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.1]">
                  <span className="text-xs font-semibold text-white/90">Global Capital Flow</span>
                  <span className="text-[10px] text-white/60 font-mono">USD Rail</span>
                </div>

                <div>
                  <span className="text-3xl font-black tracking-tight tabular-nums text-white">
                    $ {((totalVolume) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-white/60 block mt-0.5">Total lifetime volume processed</span>
                </div>

                <div className="h-24 w-full rounded-xl bg-black/30 border border-white/[0.08] p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/70">
                    <span>● US-EAST (PAYPAL)</span>
                    <span>● EU-WEST (CLIENT)</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-[10px] tracking-wider">
                      WEBHOOK DEDUPLICATED · IDEMPOTENT OK
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300">
                    <span>p95: 0.8ms</span>
                    <span>0 Cents Drift</span>
                  </div>
                </div>
              </div>
            </TiltedCard>
          </div>
        </div>
      </section>

      {/* ── 3. Why Get Paid / Comparison Matrix ── */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-[#F9FAFB] border-t border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#6B7280]">
              WHY GET PAID
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0D0E11] tracking-tight">
              Built for modern freelancers. <br />
              <span className="text-[#9CA3AF]">Not legacy systems.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] max-w-xl mx-auto">
              Connect chat agreements, automated escalation, and PayPal payment rails — all synchronized in one unified system for real-time visibility and control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Traditional Setup */}
            <div className="md:col-span-7 rounded-2xl p-6 md:p-8 bg-[#1A1C1E] text-white border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-[#6B7280] tracking-wider block mb-4">
                  Legacy Accounting & Invoicing
                </span>
                <div className="space-y-3 text-sm text-[#9CA3AF]">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <span>Manual invoice creation & line-item typing</span>
                    <span className="text-rose-400 font-bold">Painful</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <span>Awkward manual reminder emails to overdue clients</span>
                    <span className="text-rose-400 font-bold">Uncomfortable</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <span>Disconnected PayPal webhooks & manual reconciliation</span>
                    <span className="text-rose-400 font-bold">Fragmented</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <span>Complex spreadsheets to answer 'who still owes me?'</span>
                    <span className="text-rose-400 font-bold">Slow</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Work continues while client is 14 days overdue</span>
                    <span className="text-rose-400 font-bold">Unprotected</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#6B7280] pt-4 border-t border-white/[0.08]">
                Typical operational overhead: ~8-12 hours monthly lost to administrative nagging.
              </div>
            </div>

            {/* Get Paid Highlighted Matcha-Cream Card */}
            <div className="md:col-span-5 rounded-2xl p-6 md:p-8 bg-[#EFF3E4] text-[#0D0E11] border border-[#D5DEC0] shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-black tracking-tight flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                    getpaid.
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-full">
                    Autonomous
                  </span>
                </div>

                <div className="space-y-3 text-sm font-medium">
                  <div className="flex items-center justify-between py-2 border-b border-black/[0.08]">
                    <span>Message Scoping in 1-Click</span>
                    <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-black/[0.08]">
                    <span>Automated Chasing Escalation (L1-L4)</span>
                    <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-black/[0.08]">
                    <span>Real-Time PayPal Webhook Verification</span>
                    <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-black/[0.08]">
                    <span>Deterministic Financial Q&A</span>
                    <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Automatic Sprint Deliverables Pausing</span>
                    <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#4B5563] block">PLATFORM ACCESS</span>
                  <span className="text-xl font-black text-[#0D0E11]">$0 / Free Demo</span>
                </div>
                <Link href="/invoices">
                  <MagnetButton className="px-4 py-2 rounded-full bg-[#0D0E11] text-white text-xs font-bold hover:bg-[#27272A] transition-colors">
                    Try It Now →
                  </MagnetButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Interactive Action Deck: Test Time Machine & Webhook ── */}
      <section className="py-16 px-6 md:px-12 lg:px-20 border-t border-[#E5E7EB] bg-white">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#0D0E11]">Interactive Action Deck</h3>
              <p className="text-xs text-[#6B7280]">
                Test the real autonomous engine paths directly with live PayPal sandbox controls.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-sm">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0D0E11]">
                      {inv.client?.name || "Client"}
                    </span>
                    {inv.client?.company && (
                      <span className="text-xs text-[#6B7280]">({inv.client.company})</span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        inv.status === "PAID"
                          ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                          : inv.status === "NEEDS_REVIEW"
                          ? "bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]"
                          : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          inv.status === "PAID"
                            ? "bg-[#10B981]"
                            : inv.status === "NEEDS_REVIEW"
                            ? "bg-[#DC2626]"
                            : "bg-[#F59E0B]"
                        }`}
                      />
                      <span>{inv.status}</span>
                    </span>
                  </div>
                  <div className="text-xs text-[#6B7280] font-mono mt-0.5 flex items-center gap-2">
                    <span className="font-semibold text-[#374151] whitespace-nowrap">{inv.invoiceNumber}</span>
                    <span className="text-[#D1D5DB]">•</span>
                    <span className="whitespace-nowrap">Due {inv.dueDate}</span>
                    <span className="text-[#D1D5DB]">•</span>
                    <span className="text-[#4B5563]">Lvl {inv.reminderLevel} ({inv.workStatus})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right whitespace-nowrap">
                    <span className="text-base font-bold text-[#0D0E11] tabular-nums tracking-tight">
                      {formatCents(inv.amountTotalCents)}
                    </span>
                    <span className="text-[10px] font-mono text-[#9CA3AF] ml-1">USD</span>
                  </div>

                  {inv.status === "SENT" && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSimulateOverdue(inv.id)}
                        disabled={activeActionId === inv.id}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] hover:text-[#0D0E11] text-xs font-medium transition-colors shadow-2xs whitespace-nowrap"
                      >
                        Simulate Overdue
                      </button>
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        disabled={activeActionId === inv.id}
                        className="px-3 py-1.5 rounded-lg bg-[#0D0E11] hover:bg-[#232529] text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16]" />
                        <span>Mark Paid</span>
                      </button>
                    </div>
                  )}

                  {inv.paypalPaymentUrl && (
                    <a
                      href={inv.paypalPaymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#9CA3AF] hover:text-[#0D0E11] transition-colors p-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
