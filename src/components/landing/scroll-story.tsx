"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Bot,
  Zap,
  ChevronDown,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Lock,
} from "lucide-react";
import {
  LottieCheck,
  LottieAutonomousBot,
  LottieGrowthChart,
  LottieCoins,
} from "@/components/lottie/lottie-animations";
import { MagnetButton } from "@/components/reactbits/magnet-button";
import GradientASCII from "@/components/reactbits/gradient-ascii";

// ── Shared Motion Tokens ──
const transitionEase = [0.16, 1, 0.3, 1] as const; // Premium cubic-bezier

export function ScrollStory() {
  const prefersReducedMotion = useReducedMotion();

  // Sticky Header Scroll State
  const [headerCompacted, setHeaderCompacted] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setHeaderCompacted(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section 2 Wrapper: Pinned Time Passes Timeline
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineWrapperRef,
    offset: ["start end", "end center"],
  });

  // Section 4 Wrapper: Ask It Anything
  const askWrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: askProgress } = useScroll({
    target: askWrapperRef,
    offset: ["start end", "center center"],
  });

  // ── Timeline Normalized Transforms (0 to 1 across 350vh) ──
  // Day 0: 0.0 - 0.20 | Day 7: 0.20 - 0.40 | Day 10: 0.40 - 0.60 | Day 14: 0.60 - 0.80 | Day 18+: 0.80 - 1.0
  const timelinePlayheadX = useTransform(timelineProgress, [0, 1], ["0%", "100%"]);
  const activeDayIndex = useTransform(timelineProgress, [0, 0.22, 0.45, 0.70, 0.90], [0, 1, 2, 3, 4]);

  // Terminal Typing Transform
  const typedTextWidth = useTransform(askProgress, [0.3, 0.8], ["0%", "100%"]);
  const answerOpacity = useTransform(askProgress, [0.75, 1], [0, 1]);
  const answerY = useTransform(askProgress, [0.75, 1], [15, 0]);

  return (
    <div className="bg-[#080B14] text-[#F8FAFC] min-h-screen font-sans selection:bg-[#84CC16] selection:text-black antialiased relative overflow-hidden">
      {/* ── Ambient Interactive GradientASCII Background (React Bits) ── */}
      <div className="absolute top-0 left-0 right-0 h-[720px] overflow-hidden pointer-events-auto opacity-35 z-0">
        <GradientASCII
          colors={["#080B14", "#172554", "#0284C7", "#84CC16"]}
          shape="horizon"
          characters=" =+xX0S8#@"
          cellSize={18}
          density={0.8}
          glow={0.35}
          speed={0.65}
          flow={0.5}
          mouseInteraction={true}
          clickEffect="wave"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080B14]/40 to-[#080B14] pointer-events-none" />
      </div>

      {/* ── Sticky Minimal Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          headerCompacted
            ? "py-3 bg-[#080B14]/90 backdrop-blur-md border-b border-white/[0.08] shadow-lg"
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white flex items-center gap-1 group"
          >
            <span>getpaid</span>
            <span className="text-[#84CC16] group-hover:scale-125 transition-transform">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#94A3B8]">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#timeline" className="hover:text-white transition-colors">
              Chasing story
            </a>
            <a href="#assistant" className="hover:text-white transition-colors">
              Financial query
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/app">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#080B14] text-xs font-semibold hover:bg-[#F1F5F9] transition-all shadow-sm active:scale-95">
                <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16]" />
                <span>Open app</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── 1. Hero: The Message Becomes an Invoice ── */}
      <section className="relative pt-32 md:pt-40 pb-20 px-6 max-w-6xl mx-auto space-y-12">
        {/* Header Copy */}
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Tell it about the job. It handles the money.
          </h1>
          <p className="text-base sm:text-lg text-[#94A3B8] max-w-xl leading-relaxed">
            Paste any casual client message. The agent scopes line items, delivers a PayPal invoice, and watches the due date for you.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link href="/app">
              <button className="px-5 py-2.5 rounded-full bg-[#84CC16] text-black text-xs font-bold hover:bg-[#9BE329] transition-all shadow-sm active:scale-95">
                Open the app
              </button>
            </Link>
            <a
              href="#timeline"
              className="px-5 py-2.5 rounded-full bg-[#111827] border border-[#202B3D] text-[#94A3B8] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Watch it chase</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Interactive Scoping Visual */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch pt-2">
          {/* Left: Chat Message in Client Bubble */}
          <div className="md:col-span-5 p-6 rounded-2xl bg-[#0D1220] border border-[#202B3D] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-mono">WhatsApp message</span>
                <span>10:24 AM</span>
              </div>

              <div className="p-4 rounded-xl bg-[#172033] border border-[#202B3D] text-sm text-[#F8FAFC] leading-relaxed space-y-2">
                <div className="text-xs text-[#94A3B8] font-semibold">Sarah Chen (Acme Studio)</div>
                <p>
                  Hey Alex! Go ahead with the{" "}
                  <span className="bg-[#84CC16]/20 text-[#84CC16] px-1 py-0.5 rounded font-medium border border-[#84CC16]/40">
                    logo + 3 banners
                  </span>
                  . Agreed price{" "}
                  <span className="bg-[#84CC16]/20 text-[#84CC16] px-1 py-0.5 rounded font-medium border border-[#84CC16]/40">
                    $500 flat
                  </span>
                  . Send over the invoice when you can!
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16] animate-pulse" />
              <span>Autonomous invoice generated instantly</span>
            </div>
          </div>

          {/* Right: The Structured PayPal Invoice Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: transitionEase }}
            className="md:col-span-7 p-6 rounded-2xl bg-[#111827] border border-[#202B3D] shadow-2xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#202B3D]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                  <span className="font-bold text-sm text-white">PayPal Invoice Preview</span>
                </div>
                <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/20">
                  Drafted in 0.2s
                </span>
              </div>

              {/* Recipient */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-mono mb-0.5">Billed to</span>
                  <span className="font-semibold text-white">Sarah Chen · Acme Studio</span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] block text-[10px] uppercase font-mono mb-0.5">Terms</span>
                  <span className="font-mono text-white">Net 7 Days</span>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-2">
                <span className="text-[#64748B] block text-[10px] uppercase font-mono">Scoped line items</span>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-lg bg-[#0D1220] border border-[#202B3D] flex items-center justify-between text-xs">
                    <span className="text-[#F8FAFC]">Brand identity & primary logo design</span>
                    <span className="font-mono font-semibold text-white">$350.00</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0D1220] border border-[#202B3D] flex items-center justify-between text-xs">
                    <span className="text-[#F8FAFC]">3 social marketing banners</span>
                    <span className="font-mono font-semibold text-white">$150.00</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-[#202B3D]">
                <span className="text-xs text-[#94A3B8]">Total amount</span>
                <span className="text-xl font-bold text-white tabular-nums">$500.00 USD</span>
              </div>
            </div>

            {/* Status footer */}
            <div className="pt-3 border-t border-[#202B3D] flex items-center justify-between text-xs">
              <span className="text-[#10B981] flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sent via PayPal Sandbox Rails</span>
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">Example invoice</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Time Passes (The Bold Pinned Moment) ── */}
      <section
        id="timeline"
        ref={timelineWrapperRef}
        className="relative py-12 md:py-16 px-6 max-w-6xl mx-auto"
      >
        <div className="space-y-8">
          {/* Header Section */}
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#202B3D] text-[#94A3B8] text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span>THE CHASE LIFECYCLE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Time passes. The agent remembers so you don&apos;t have to.
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Example. Your agent monitors PayPal payment webhooks automatically, even when your computer is off.
            </p>
          </div>

          {/* Horizontal Calendar Timeline Bar */}
          <div className="p-6 rounded-2xl bg-[#0D1220] border border-[#202B3D] space-y-6">
            <div className="relative pt-6 pb-2">
              {/* Background Track */}
              <div className="h-1 w-full bg-[#1E293B] rounded-full overflow-hidden relative">
                {/* Active Playhead Fill */}
                <motion.div
                  style={{ width: prefersReducedMotion ? "75%" : timelinePlayheadX }}
                  className="h-full bg-[#84CC16]"
                />
              </div>

              {/* Day Markers */}
              <div className="flex justify-between pt-4 text-xs font-mono">
                <div className="text-center">
                  <span className="block font-bold text-white">Day 0</span>
                  <span className="text-[10px] text-[#64748B]">Sent</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-[#F59E0B]">Day 7</span>
                  <span className="text-[10px] text-[#F59E0B]">Due</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-white">Day 10</span>
                  <span className="text-[10px] text-[#64748B]">Friendly</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-[#F59E0B]">Day 14</span>
                  <span className="text-[10px] text-[#F59E0B]">Pause work</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-[#DC2626]">Day 18</span>
                  <span className="text-[10px] text-[#DC2626]">Firm notice</span>
                </div>
              </div>
            </div>

            {/* Stage Content: Dynamic Escalation Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
              {/* Drafted Email Card */}
              <div className="md:col-span-7 p-5 rounded-xl bg-[#111827] border border-[#202B3D] space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#202B3D]">
                  <span className="text-[#94A3B8] font-mono">Autonomous follow-up draft</span>
                  <span className="text-[11px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full border border-[#F59E0B]/20">
                    Level 2 Neutral
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[10px] font-mono uppercase">Subject</span>
                    <span className="font-semibold text-white">
                      Overdue Notice: Invoice INV-2024-001 (7 days overdue)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px] font-mono uppercase">Message</span>
                    <p className="text-[#94A3B8] leading-relaxed pt-1 bg-[#080B14] p-3 rounded-lg border border-[#202B3D]">
                      &quot;Hi Sarah, following up on invoice INV-2024-001 ($500.00) which was due on Nov 5. Please remit payment via PayPal. Active milestone deliverables are currently paused pending receipt.&quot;
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#64748B] font-mono flex items-center justify-between">
                  <span>Sent automatically via PayPal notification rail</span>
                  <span>Zero awkwardness</span>
                </div>
              </div>

              {/* Reasoning & Activity Ledger Feed */}
              <div className="md:col-span-5 p-5 rounded-xl bg-[#111827] border border-[#202B3D] space-y-4">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#202B3D]">
                  <span className="font-bold text-white flex items-center gap-2">
                    <LottieAutonomousBot size={28} className="shrink-0" />
                    <span>Autonomous Agent Logic</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#84CC16] bg-[#84CC16]/10 px-2 py-0.5 rounded-full border border-[#84CC16]/20">
                    Live Audit
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0D1220] border border-[#202B3D] space-y-1">
                    <span className="text-[10px] font-mono text-[#F59E0B]">DAY 14 AUDIT RECORD</span>
                    <p className="text-[#F8FAFC]">
                      Sent reminder 2 because the invoice is 7 days overdue and reminder 1 received no payment event.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0D1220] border border-[#202B3D] space-y-1">
                    <span className="text-[10px] font-mono text-[#EF4444]">DELIVERABLE GUARDRAIL</span>
                    <p className="text-[#94A3B8]">
                      Work status transitioned to PAUSED_DUE_TO_NON_PAYMENT to protect freelancer time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Payment Lands (The Settlement Beat) ── */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0D1220] border border-[#10B981]/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center space-y-6 relative overflow-hidden">
          <div className="mx-auto flex items-center justify-center gap-3">
            {/* Circle 1: Official PayPal Monogram */}
            <div
              className="h-14 w-14 rounded-full bg-gradient-to-br from-[#003087]/30 via-[#0079C1]/20 to-[#0D1220] border border-[#0079C1]/50 flex items-center justify-center shadow-[0_0_25px_rgba(0,121,193,0.35)] transition-transform hover:scale-105"
              title="PayPal Webhook Verified"
            >
              <svg className="w-6 h-6" viewBox="0 0 34 32" fill="none">
                <path
                  d="M10.8 3.5H3.9C3.5 3.5 3.2 3.8 3.1 4.2L0 26C-0.03 26.3 0.2 26.6 0.5 26.6H4.2C4.6 26.6 4.9 26.3 5 25.9L6.1 18.6C6.2 18.2 6.5 17.9 6.9 17.9H9.3C14.6 17.9 17.6 15.3 18.4 10.4C18.7 8.3 18.3 6.6 17.1 5.4C15.9 4.1 13.9 3.5 10.8 3.5Z"
                  fill="#0079C1"
                />
                <path
                  d="M26.8 10.5H19.9C19.5 10.5 19.2 10.8 19.1 11.2L16.8 25.6C16.7 26 17 26.3 17.4 26.3H21.1C21.5 26.3 21.8 26 21.9 25.6L22.7 20.2C22.8 19.8 23.1 19.5 23.5 19.5H24.9C30.2 19.5 33.2 16.9 34 12C34.3 9.9 33.9 8.2 32.7 7C31.5 5.7 29.5 5.1 26.8 5.1"
                  fill="#00457C"
                />
                <path
                  d="M18.4 10.4C17.6 15.3 14.6 17.9 9.3 17.9H6.9C6.5 17.9 6.2 18.2 6.1 18.6L5 25.9C4.9 26.3 4.6 26.6 4.2 26.6H0.5C0.2 26.6 -0.03 26.3 0 26L3.1 4.2C3.2 3.8 3.5 3.5 3.9 3.5H10.8C13.9 3.5 15.9 4.1 17.1 5.4C18.3 6.6 18.7 8.3 18.4 10.4Z"
                  fill="#0079C1"
                />
              </svg>
            </div>

            {/* Glowing Connector Track */}
            <div className="flex items-center gap-1 px-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0079C1] animate-ping" />
              <span className="h-0.5 w-8 bg-gradient-to-r from-[#0079C1] to-[#84CC16]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16] animate-pulse" />
            </div>

            {/* Circle 2: High-Def Currency Settlement Symbol ($) */}
            <div
              className="h-14 w-14 rounded-full bg-gradient-to-br from-[#84CC16]/30 via-[#10B981]/20 to-[#0D1220] border border-[#84CC16]/50 flex items-center justify-center shadow-[0_0_25px_rgba(132,204,22,0.35)] transition-transform hover:scale-105"
              title="Instant Cash Flow Settlement"
            >
              <span className="text-2xl font-black text-[#84CC16] font-mono leading-none flex items-center justify-center">
                $
              </span>
            </div>
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Payment lands. The chase halts instantly.
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              When Sarah pays through PayPal, the webhook notifies the agent in milliseconds. Reminders stop, deliverables unpause, and an autonomous thank-you note is sent.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111827] border border-[#202B3D] text-xs font-mono text-[#10B981]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Payment confirmed by PayPal · Zero guesswork</span>
          </div>
        </div>
      </section>

      {/* ── 4. Ask It Anything (Financial Terminal) ── */}
      <section id="assistant" ref={askWrapperRef} className="py-20 px-6 max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#202B3D] text-[#94A3B8] text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>FINANCIAL INTELLIGENCE</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ask it anything about your money.
          </h3>
          <p className="text-sm text-[#94A3B8]">
            Answers come strictly from your real PayPal records. The agent never hallucinates numbers or sees outside personal transactions.
          </p>
        </div>

        {/* Command Box Visual */}
        <div className="p-6 rounded-2xl bg-[#0D1220] border border-[#202B3D] space-y-4">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#172033] border border-[#202B3D] text-sm font-mono text-white">
            <span className="text-[#84CC16]">&gt;</span>
            <span>Who still owes me?</span>
            <span className="h-4 w-2 bg-[#84CC16] animate-pulse ml-0.5" />
          </div>

          {/* Structured Result */}
          <motion.div
            style={{
              opacity: prefersReducedMotion ? 1 : answerOpacity,
              y: prefersReducedMotion ? 0 : answerY,
            }}
            className="p-5 rounded-xl bg-[#111827] border border-[#202B3D] space-y-3"
          >
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#202B3D]">
              <span className="text-[#94A3B8] font-mono uppercase">Outstanding debtor breakdown</span>
              <span className="text-xs font-bold text-white tabular-nums">$5,300.00 Total</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D1220]">
                <div>
                  <span className="font-semibold text-white block">Sarah Chen (Acme Corporation)</span>
                  <span className="text-[10px] text-[#64748B] font-mono">INV-2024-001 · Due 6 days ago</span>
                </div>
                <span className="font-mono font-bold text-[#F59E0B]">$3,500.00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D1220]">
                <div>
                  <span className="font-semibold text-white block">David Miller (Fintech Labs)</span>
                  <span className="text-[10px] text-[#64748B] font-mono">INV-2024-002 · Due 15 days ago</span>
                </div>
                <span className="font-mono font-bold text-[#F59E0B]">$1,800.00</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#64748B] pt-2">
              Example. Only accounts created within your Get Paid workspace are aggregated.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. How It Works, Briefly (3 Statements, Not a Generic Grid) ── */}
      <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto border-t border-white/[0.08] space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How it works, in three steps.
            </h3>
            <p className="text-sm text-[#94A3B8]">
              Simple mechanics designed to protect freelancer time and relationships.
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#0D1220] border border-[#202B3D] flex items-center gap-3 px-4">
            <LottieGrowthChart size={40} />
            <div className="text-xs">
              <span className="block font-bold text-white tabular-nums">+100% Cash Flow</span>
              <span className="text-[10px] text-[#64748B]">Automated recovery</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 p-6 rounded-2xl bg-[#0D1220] border border-[#202B3D]">
            <div className="h-8 w-8 rounded-lg bg-[#84CC16]/10 text-[#84CC16] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-base font-bold text-white">It bills</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Paste any client message or email thread. The agent scopes line items, calculates exact minor units, and creates a legitimate PayPal invoice.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-[#0D1220] border border-[#202B3D]">
            <div className="h-8 w-8 rounded-lg bg-[#84CC16]/10 text-[#84CC16] flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-base font-bold text-white">It watches</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              PayPal webhook listeners monitor settlements 24/7. You never have to manually log in to check your account or mark spreadsheets.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-[#0D1220] border border-[#202B3D]">
            <div className="h-8 w-8 rounded-lg bg-[#84CC16]/10 text-[#84CC16] flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-base font-bold text-white">It chases</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              When a due date slips, polite reminders escalate from friendly to firm, pausing sprint milestones if needed so you never work for free.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#202B3D] text-xs text-[#94A3B8] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#84CC16] shrink-0" />
          <span>
            Privacy guarantee: The agent only reads invoices you create inside Get Paid. It never inspects your personal PayPal history.
          </span>
        </div>
      </section>

      {/* ── 6. Final Call to Action ── */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Stop writing the awkward email.
        </h2>
        <p className="text-base text-[#94A3B8] max-w-md mx-auto">
          Let your autonomous accounts-receivable agent handle the follow-ups while you do the work.
        </p>
        <div className="pt-2">
          <Link href="/app">
            <MagnetButton className="px-8 py-3.5 rounded-full bg-white text-[#080B14] text-sm font-bold hover:bg-[#F1F5F9] transition-all shadow-xl active:scale-95">
              Open the app
            </MagnetButton>
          </Link>
        </div>
      </section>

      {/* ── Minimal Footer with Both Founder Emails ── */}
      <footer className="py-12 px-6 border-t border-white/[0.08] text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">getpaid.</span>
            <span>· Built for PayPal AI Hackathon</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <a
              href="mailto:suryanshsaraf8@gmail.com"
              className="hover:text-white transition-colors"
            >
              suryanshsaraf8@gmail.com
            </a>
            <a
              href="mailto:saiarihara@gmail.com"
              className="hover:text-white transition-colors"
            >
              saiarihara@gmail.com
            </a>
            <Link href="/app" className="text-[#84CC16] hover:underline">
              Launch App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
