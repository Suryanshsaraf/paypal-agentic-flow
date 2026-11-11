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
import { LottieCheck } from "@/components/lottie/lottie-animations";
import { MagnetButton } from "@/components/reactbits/magnet-button";

// ── Shared Motion Tokens ──
const transitionEase = [0.16, 1, 0.3, 1]; // Premium cubic-bezier

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

  // Section 1 Wrapper: Hero Message -> Invoice
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroWrapperRef,
    offset: ["start start", "end end"],
  });

  // Section 2 Wrapper: Pinned Time Passes Timeline
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineWrapperRef,
    offset: ["start start", "end end"],
  });

  // Section 4 Wrapper: Ask It Anything
  const askWrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: askProgress } = useScroll({
    target: askWrapperRef,
    offset: ["start end", "center center"],
  });

  // ── Hero Transforms ──
  const heroBubbleHighlight = useTransform(heroProgress, [0, 0.25, 0.5, 0.75], [0, 1, 2, 3]);
  const invoiceStepOpacity = useTransform(heroProgress, [0.1, 0.3, 0.55, 0.8], [0.3, 0.6, 0.85, 1]);
  const invoiceCardY = useTransform(heroProgress, [0, 0.5, 1], [30, 0, 0]);

  // ── Timeline Normalized Transforms (0 to 1 across 350vh) ──
  // Day 0: 0.0 - 0.20 | Day 7: 0.20 - 0.40 | Day 10: 0.40 - 0.60 | Day 14: 0.60 - 0.80 | Day 18+: 0.80 - 1.0
  const timelinePlayheadX = useTransform(timelineProgress, [0, 1], ["0%", "100%"]);
  const activeDayIndex = useTransform(timelineProgress, [0, 0.22, 0.45, 0.70, 0.90], [0, 1, 2, 3, 4]);

  // Terminal Typing Transform
  const typedTextWidth = useTransform(askProgress, [0.3, 0.8], ["0%", "100%"]);
  const answerOpacity = useTransform(askProgress, [0.75, 1], [0, 1]);
  const answerY = useTransform(askProgress, [0.75, 1], [15, 0]);

  return (
    <div className="bg-[#080B14] text-[#F8FAFC] min-h-screen font-sans selection:bg-[#84CC16] selection:text-black antialiased relative">
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
      <section ref={heroWrapperRef} className="relative pt-32 md:pt-40 pb-20 px-6 max-w-6xl mx-auto min-h-[180vh]">
        <div className="sticky top-28 md:top-32 space-y-12">
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

          {/* Interactive Scoping Visual (Scroll-Scrubbed) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch pt-6">
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
                <span>Scroll down to see the agent extract line items</span>
              </div>
            </div>

            {/* Right: The Structured PayPal Invoice Card */}
            <motion.div
              style={{
                opacity: prefersReducedMotion ? 1 : invoiceStepOpacity,
                y: prefersReducedMotion ? 0 : invoiceCardY,
              }}
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
        </div>
      </section>

      {/* ── 2. Time Passes (The Bold Pinned Moment) ── */}
      <section
        id="timeline"
        ref={timelineWrapperRef}
        className="relative min-h-[320vh] px-6 max-w-6xl mx-auto"
      >
        <div className="sticky top-24 md:top-28 space-y-8 pb-16">
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
              <div className="md:col-span-5 p-5 rounded-xl bg-[#111827] border border-[#202B3D] space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#202B3D]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-[#84CC16]" />
                    <span>Agent Reasoning</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">Live audit</span>
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
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0D1220] border border-[#10B981]/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center space-y-6">
          <div className="mx-auto inline-flex items-center justify-center p-3 rounded-full bg-[#10B981]/10 border border-[#10B981]/30">
            <LottieCheck size={48} />
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
        <div className="max-w-xl space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How it works, in three steps.
          </h3>
          <p className="text-sm text-[#94A3B8]">
            Simple mechanics designed to protect freelancer time and relationships.
          </p>
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
