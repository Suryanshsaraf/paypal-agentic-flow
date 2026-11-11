"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
  useInView,
  useReducedMotion,
  animate,
  AnimatePresence,
} from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  Bot,
  Zap,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Mail,
  Hash,
  ArrowRight,
  RotateCcw,
  Clock,
  Search,
  MousePointerClick,
} from "lucide-react";
import { LottieAutonomousBot } from "@/components/lottie/lottie-animations";
import { MagnetButton } from "@/components/reactbits/magnet-button";
import GradientASCII from "@/components/reactbits/gradient-ascii";
import { fireFintechCelebration } from "@/components/interactive/confetti";

// ── Shared Motion Tokens ──
const transitionEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Demo data ──
type Part = string | { hl: string };

const DEMOS: Array<{
  id: string;
  channel: string;
  icon: React.ElementType;
  time: string;
  from: string;
  parts: Part[];
  client: string;
  terms: string;
  items: Array<[string, number]>;
}> = [
  {
    id: "whatsapp",
    channel: "WhatsApp",
    icon: MessageSquare,
    time: "10:24 AM",
    from: "Sarah Chen · Acme Studio",
    parts: [
      "Hey Alex! Go ahead with the ",
      { hl: "logo + 3 banners" },
      ". Agreed price ",
      { hl: "$500 flat" },
      ". Send over the invoice when you can!",
    ],
    client: "Sarah Chen · Acme Studio",
    terms: "Net 7 days",
    items: [
      ["Brand identity & primary logo design", 350],
      ["3 social marketing banners", 150],
    ],
  },
  {
    id: "email",
    channel: "Email",
    icon: Mail,
    time: "Yesterday",
    from: "David Miller · Fintech Labs",
    parts: [
      "Loved the landing page draft. Let's lock in ",
      { hl: "2 more pages" },
      " plus ",
      { hl: "a week of QA" },
      ". ",
      { hl: "$1,800 total" },
      " works for us.",
    ],
    client: "David Miller · Fintech Labs",
    terms: "Net 14 days",
    items: [
      ["2 additional marketing pages", 1200],
      ["QA & cross-browser testing (1 week)", 600],
    ],
  },
  {
    id: "slack",
    channel: "Slack",
    icon: Hash,
    time: "2:07 PM",
    from: "Priya Nair · Bloom Co.",
    parts: [
      "can you do ",
      { hl: "6 hours" },
      " of consulting at ",
      { hl: "$90/hr" },
      " + the ",
      { hl: "$120 font license" },
      "? thx!!",
    ],
    client: "Priya Nair · Bloom Co.",
    terms: "Due on receipt",
    items: [
      ["Design consulting, 6 hrs @ $90", 540],
      ["Commercial font license (pass-through)", 120],
    ],
  },
];

const STAGES = [
  {
    day: "Day 0",
    label: "Sent",
    color: "#F8FAFC",
    badge: "Invoice sent",
    subject: "Invoice INV-2024-001 from Alex: $500.00",
    body: "Hi Sarah, thanks for the go-ahead! Here's the invoice for the logo and 3 banners. You can pay securely through PayPal.",
    audit: "Invoice created and delivered through PayPal. Due date set to Nov 5 (Net 7).",
    guard: "Work status: IN_PROGRESS",
  },
  {
    day: "Day 7",
    label: "Due",
    color: "#F59E0B",
    badge: "Due today",
    subject: "Friendly heads-up: your invoice is due today",
    body: "Hi Sarah, just a quick reminder that INV-2024-001 ($500.00) is due today. Thanks so much!",
    audit: "Due date reached with no payment event from PayPal. Scheduled a gentle nudge.",
    guard: "Work status: IN_PROGRESS",
  },
  {
    day: "Day 10",
    label: "Friendly",
    color: "#84CC16",
    badge: "Level 1 · Friendly",
    subject: "Quick follow-up on INV-2024-001",
    body: "Hi Sarah, hope the banners are landing well! Just following up on the $500.00 invoice from last week. Here's the pay link again.",
    audit: "3 days overdue. Sent reminder 1 in a friendly tone.",
    guard: "Work status: IN_PROGRESS",
  },
  {
    day: "Day 14",
    label: "Pause work",
    color: "#F59E0B",
    badge: "Level 2 · Neutral",
    subject: "Overdue notice: INV-2024-001 (7 days overdue)",
    body: "Hi Sarah, following up on invoice INV-2024-001 ($500.00), due Nov 5. Active deliverables are paused until payment is received.",
    audit: "7 days overdue and reminder 1 got no payment event. Sent reminder 2.",
    guard: "Work status → PAUSED_DUE_TO_NON_PAYMENT",
  },
  {
    day: "Day 18",
    label: "Firm notice",
    color: "#EF4444",
    badge: "Level 3 · Firm",
    subject: "Final notice: INV-2024-001 is 11 days overdue",
    body: "Hi Sarah, INV-2024-001 ($500.00) is still unpaid. Please settle it this week so we can resume the project.",
    audit: "11 days overdue. Escalated to a firm final notice and flagged for your review.",
    guard: "Flagged for your review",
  },
];

const QUERIES = [
  {
    q: "Who still owes me?",
    title: "Outstanding balances",
    total: "$5,300.00",
    rows: [
      { name: "Sarah Chen (Acme Studio)", meta: "INV-2024-001 · 6 days overdue", amt: "$3,500.00", tone: "#F59E0B" },
      { name: "David Miller (Fintech Labs)", meta: "INV-2024-002 · 15 days overdue", amt: "$1,800.00", tone: "#EF4444" },
    ],
  },
  {
    q: "How much did I earn this month?",
    title: "Paid in November",
    total: "$7,240.00",
    rows: [
      { name: "Bloom Co.", meta: "3 invoices settled", amt: "$4,120.00", tone: "#10B981" },
      { name: "Northwind Media", meta: "2 invoices settled", amt: "$3,120.00", tone: "#10B981" },
    ],
  },
  {
    q: "Which client pays the slowest?",
    title: "Average days late",
    total: "Fintech Labs",
    rows: [
      { name: "Fintech Labs", meta: "Pays 19 days after the due date on average", amt: "19 days", tone: "#EF4444" },
      { name: "Acme Studio", meta: "Pays 6 days after the due date on average", amt: "6 days", tone: "#F59E0B" },
    ],
  },
];

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

// ── Small building blocks ──

/** Card with a lime spotlight that follows the cursor. */
function Spot({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`spot ${className}`} {...rest}>
      {children}
    </div>
  );
}

/** Number that counts up once it scrolls into view. */
function Counter({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: transitionEase, onUpdate: setV });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Centered section heading with eyebrow pill and a huge outlined numeral behind it. */
function SectionHeading({
  num,
  eyebrow,
  dot,
  title,
  sub,
  compact = false,
}: {
  num: string;
  eyebrow: string;
  dot: string;
  title: React.ReactNode;
  sub: string;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: transitionEase }}
      className={`relative mx-auto text-center ${compact ? "max-w-5xl space-y-3" : "max-w-3xl space-y-5"}`}
    >
      <div
        className="numeral absolute left-1/2 -translate-x-1/2 -top-14 sm:-top-24 text-[9rem] sm:text-[14rem] -z-10"
        aria-hidden="true"
      >
        {num}
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827]/80 border border-white/[0.08] text-xs sm:text-sm font-mono text-[#CBD5E1] backdrop-blur-md">
        <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: dot }} />
        <span className="tracking-[0.18em]">{eyebrow}</span>
      </div>
      <h2
        className={`${
          compact ? "text-[2.4rem] sm:text-5xl md:text-[3.5rem]" : "text-[2.6rem] sm:text-6xl md:text-7xl"
        } font-bold tracking-[-0.035em] text-white leading-[1.02]`}
      >
        {title}
      </h2>
      <p className="text-lg sm:text-xl text-[#CBD5E1] leading-relaxed max-w-2xl mx-auto">{sub}</p>
    </motion.div>
  );
}

const TICKER = [
  { t: "INV-2024-014", v: "PAID $1,250.00", c: "#84CC16" },
  { t: "Reminder 2", v: "sent to Fintech Labs", c: "#F59E0B" },
  { t: "Webhook", v: "PAYMENT.CAPTURE.COMPLETED", c: "#38BDF8" },
  { t: "INV-2024-015", v: "DRAFTED in 0.2s", c: "#CBD5E1" },
  { t: "Acme Studio", v: "work resumed", c: "#84CC16" },
  { t: "INV-2024-009", v: "PAID $3,500.00", c: "#84CC16" },
  { t: "Bloom Co.", v: "thank-you note sent", c: "#34D399" },
  { t: "INV-2024-002", v: "15 DAYS OVERDUE", c: "#EF4444" },
];

/** Live-ledger ticker band: two rows drifting in opposite directions. */
function Ticker() {
  const row = (reverse: boolean) => (
    <div className="marquee-mask overflow-hidden">
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {(reverse ? [...TICKER].reverse() : TICKER).map((item, i) => (
              <span key={i} className="flex items-center gap-3 px-6 font-mono text-sm sm:text-base whitespace-nowrap">
                <span className="text-[#64748B]">{item.t}</span>
                <span style={{ color: item.c }}>{item.v}</span>
                <span className="text-[#334155] pl-6">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="relative z-10 py-6 space-y-3 border-y border-white/[0.06] bg-[#0A0F1C]/80 backdrop-blur-sm">
      {row(false)}
      {row(true)}
    </div>
  );
}

/** A line of ASCII glyphs with a travelling lime shimmer, used between sections. */
function AsciiRule() {
  const glyphs = " = + x X 0 S 8 # @ 8 S 0 X x + = ".repeat(8);
  return (
    <div className="relative z-10 max-w-5xl mx-auto px-6 py-4 select-none" aria-hidden="true">
      <div className="ascii-rule text-xs sm:text-sm text-center">{glyphs}</div>
    </div>
  );
}

export function ScrollStory() {
  const prefersReducedMotion = useReducedMotion();

  // Header + page progress
  const [headerCompacted, setHeaderCompacted] = useState(false);
  useEffect(() => {
    const handleScroll = () => setHeaderCompacted(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const { scrollYProgress: pageProgress } = useScroll();
  const progressX = useSpring(pageProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  // ── Hero demo: message → invoice ──
  const [demoIndex, setDemoIndex] = useState(0);
  const [scoping, setScoping] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const demo = DEMOS[demoIndex];
  const demoTotal = demo.items.reduce((sum, [, amt]) => sum + amt, 0);

  const selectDemo = (i: number, fromUser = true) => {
    if (fromUser) setAutoplay(false);
    if (i === demoIndex) return;
    setDemoIndex(i);
    setScoping(true);
  };
  useEffect(() => {
    if (!scoping) return;
    const t = setTimeout(() => setScoping(false), 750);
    return () => clearTimeout(t);
  }, [scoping]);
  useEffect(() => {
    if (!autoplay || prefersReducedMotion) return;
    const t = setInterval(() => {
      setDemoIndex((i) => (i + 1) % DEMOS.length);
      setScoping(true);
    }, 6500);
    return () => clearInterval(t);
  }, [autoplay, prefersReducedMotion]);

  // ── Timeline: scroll-driven stage, also clickable ──
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineWrapperRef,
    offset: ["start start", "end end"],
  });
  const [stageIndex, setStageIndex] = useState(0);
  const stageClickLock = useRef(0);
  useMotionValueEvent(timelineProgress, "change", (v) => {
    // Scroll drives the stages only where the section is pinned (md+), and not right after a tap.
    if (window.innerWidth < 768 || Date.now() < stageClickLock.current) return;
    setStageIndex(Math.max(0, Math.min(STAGES.length - 1, Math.floor(v * STAGES.length))));
  });
  const pickStage = (i: number) => {
    stageClickLock.current = Date.now() + 1200;
    setStageIndex(i);
  };
  const stage = STAGES[stageIndex];

  // ── Settlement: simulate a payment ──
  const [paid, setPaid] = useState(false);
  const simulatePayment = () => {
    if (paid) {
      setPaid(false);
      return;
    }
    setPaid(true);
    try {
      fireFintechCelebration();
    } catch {
      /* confetti is decorative */
    }
  };

  // ── Assistant: typed queries ──
  const askRef = useRef<HTMLDivElement>(null);
  const askInView = useInView(askRef, { once: true, margin: "-120px" });
  const [queryIndex, setQueryIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const query = QUERIES[queryIndex];
  const typingDone = typed >= query.q.length;
  useEffect(() => {
    if (!askInView) return;
    if (prefersReducedMotion) {
      setTyped(query.q.length);
      return;
    }
    setTyped(0);
    const t = setInterval(() => {
      setTyped((n) => {
        if (n >= query.q.length) {
          clearInterval(t);
          return n;
        }
        return n + 1;
      });
    }, 32);
    return () => clearInterval(t);
  }, [askInView, queryIndex, query.q.length, prefersReducedMotion]);

  const headlineWords = ["Tell", "it", "about", "the", "job."];
  const headlineWords2 = ["It", "handles"];

  return (
    <div className="bg-[#080B14] text-[#F8FAFC] min-h-screen font-sans selection:bg-[#84CC16] selection:text-black antialiased relative overflow-hidden">
      {/* ── Ambient Interactive GradientASCII Background (React Bits) ── */}
      <div className="absolute top-0 left-0 right-0 h-[115vh] min-h-[860px] overflow-hidden pointer-events-auto opacity-[0.6] z-0">
        <div
          className="aurora-blob"
          style={{ width: 680, height: 680, top: -200, left: "-8%", background: "rgba(2,132,199,0.28)" }}
          aria-hidden="true"
        />
        <div
          className="aurora-blob"
          style={{ width: 560, height: 560, top: 60, right: "-6%", background: "rgba(132,204,22,0.20)", animationDelay: "-6s" }}
          aria-hidden="true"
        />
        <GradientASCII
          colors={["#080B14", "#172554", "#0284C7", "#84CC16"]}
          shape="horizon"
          characters=" =+xX0S8#@"
          cellSize={17}
          density={0.88}
          glow={0.55}
          speed={0.7}
          flow={0.55}
          mouseInteraction={true}
          clickEffect="wave"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080B14]/25 to-[#080B14] pointer-events-none" />
      </div>

      {/* ── Faint dotted grid texture ── */}
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none z-0" aria-hidden="true" />

      {/* ── Sticky Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          headerCompacted
            ? "py-3 bg-[#080B14]/85 backdrop-blur-md border-b border-white/[0.08] shadow-lg"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white flex items-center gap-0.5 group w-fit">
            <span>getpaid</span>
            <span className="text-[#84CC16] group-hover:scale-125 transition-transform">.</span>
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-medium text-[#CBD5E1]">
            <a href="#demo" className="hover:text-white transition-colors">Try it</a>
            <a href="#timeline" className="hover:text-white transition-colors">The chase</a>
            <a href="#assistant" className="hover:text-white transition-colors">Ask it</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          </nav>

          <div className="flex justify-end">
            <Link href="/app">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#080B14] text-sm font-semibold hover:bg-[#F1F5F9] transition-all shadow-sm active:scale-95">
                <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                <span>Open app</span>
              </button>
            </Link>
          </div>
        </div>
        {/* Page scroll progress */}
        <motion.div
          style={{ scaleX: progressX }}
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-[#0284C7] via-[#84CC16] to-[#BEF264]"
        />
      </header>

      {/* ── 1. Hero (centered) ── */}
      <section className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
        {/* Readability vignette behind the copy */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 45% at 50% 48%, rgba(8,11,20,0.78), transparent 75%)" }}
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: transitionEase }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827]/80 border border-white/[0.1] text-xs sm:text-sm font-mono backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-[#84CC16] animate-pulse" />
            <span className="text-[#CBD5E1]">Autonomous accounts-receivable agent · Built on PayPal</span>
          </motion.div>

          <h1 className="text-[3.4rem] sm:text-7xl lg:text-[6.25rem] font-bold tracking-[-0.045em] text-white leading-[0.98]">
            <span className="block">
              {headlineWords.map((w, i) => (
                <motion.span
                  key={w + i}
                  initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.07, ease: transitionEase }}
                  className="inline-block mr-[0.25em]"
                >
                  {w}
                </motion.span>
              ))}
            </span>
            <span className="block">
              {headlineWords2.map((w, i) => (
                <motion.span
                  key={w + i}
                  initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.5 + i * 0.07, ease: transitionEase }}
                  className="inline-block mr-[0.25em]"
                >
                  {w}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.7, ease: transitionEase }}
                className="inline-block text-gradient-lime accent-serif pb-2"
              >
                the money.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: transitionEase }}
            className="text-lg sm:text-xl md:text-2xl text-[#CBD5E1] max-w-3xl mx-auto leading-relaxed"
          >
            Paste any casual client message. The agent scopes the line items, sends a PayPal invoice, and chases the
            payment so you never write the awkward email again.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05, ease: transitionEase }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/app">
              <MagnetButton className="group flex items-center gap-2 px-8 py-4 rounded-full bg-[#84CC16] text-black text-base font-bold hover:bg-[#9BE329] transition-all shadow-[0_10px_30px_-8px_rgba(132,204,22,0.65)] active:scale-95">
                <span>Open the app</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </MagnetButton>
            </Link>
            <a
              href="#demo"
              className="px-8 py-4 rounded-full bg-[#111827]/80 backdrop-blur-md border border-[#2A3850] text-[#E2E8F0] hover:text-white hover:border-[#84CC16]/50 text-base font-semibold transition-colors flex items-center gap-2"
            >
              <span>See it work</span>
              <ChevronDown className="w-5 h-5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.25 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2 text-sm text-[#94A3B8]"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#84CC16]" />
              Reads only invoices you create
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#38BDF8]" />
              Drafts in under a second
            </span>
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#F59E0B]" />
              Chases while you sleep
            </span>
          </motion.div>
        </div>

        {/* Interaction hint + scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="relative mt-14 flex flex-col items-center gap-3 text-xs font-mono text-[#64748B]"
        >
          <span className="hidden md:flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-[#84CC16]" />
            Move your cursor through the numbers. Click to send a ripple.
          </span>
          <ChevronDown className="w-5 h-5 cue-bounce text-[#94A3B8]" />
        </motion.div>
      </section>

      {/* ── Live ledger ticker ── */}
      <Ticker />

      {/* ── 2. Interactive demo: message → invoice ── */}
      <section id="demo" className="relative z-10 py-24 px-6 max-w-6xl mx-auto space-y-12 scroll-mt-20">
        <SectionHeading
          num="01"
          eyebrow="TRY IT · PICK A MESSAGE"
          dot="#84CC16"
          title={
            <>
              A message goes in. <span className="text-gradient-lime accent-serif">An invoice comes out.</span>
            </>
          }
          sub="Choose how your client got in touch. Watch the agent pull out the scope and price, then build a real PayPal invoice."
        />

        {/* Channel tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-[#0D1220] border border-[#202B3D]" role="tablist">
            {DEMOS.map((d, i) => {
              const Icon = d.icon;
              const active = i === demoIndex;
              return (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectDemo(i)}
                  className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-colors ${
                    active ? "text-black" : "text-[#CBD5E1] hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="demo-tab"
                      className="absolute inset-0 rounded-full bg-[#84CC16] shadow-[0_6px_20px_-6px_rgba(132,204,22,0.7)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className="relative w-4 h-4" />
                  <span className="relative">{d.channel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Client message */}
          <Spot className="md:col-span-5 p-7 rounded-3xl panel flex flex-col justify-between gap-6 card-interactive card-sheen">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-[#94A3B8]">
                <span className="font-mono">{demo.channel} message</span>
                <span>{demo.time}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: transitionEase }}
                  className="p-5 rounded-2xl bg-[#172033] border border-[#2A3850] text-base sm:text-lg text-[#F8FAFC] leading-relaxed space-y-2"
                >
                  <div className="text-sm text-[#94A3B8] font-semibold">{demo.from}</div>
                  <p>
                    {demo.parts.map((p, i) =>
                      typeof p === "string" ? (
                        <span key={i}>{p}</span>
                      ) : (
                        <span
                          key={i}
                          className="bg-[#84CC16]/15 text-[#BEF264] px-1.5 py-0.5 rounded-md font-semibold border border-[#84CC16]/40"
                        >
                          {p.hl}
                        </span>
                      )
                    )}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="text-sm font-mono text-[#94A3B8] flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${scoping ? "bg-[#F59E0B]" : "bg-[#84CC16]"} animate-pulse`} />
              <span>{scoping ? "Agent is reading the message…" : "Highlighted: what the agent extracted"}</span>
            </div>
          </Spot>

          {/* Invoice */}
          <div className="md:col-span-7 relative p-7 rounded-3xl panel flex flex-col justify-between gap-6 card-sheen">
            <div className="conic-ring" aria-hidden="true" />
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#202B3D]">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#84CC16]" />
                  <span className="font-bold text-lg text-white">PayPal Invoice Preview</span>
                </div>
                <span
                  className={`text-xs sm:text-sm font-mono px-3 py-1 rounded-full border transition-colors ${
                    scoping
                      ? "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25"
                      : "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25"
                  }`}
                >
                  {scoping ? "Scoping…" : "Drafted in 0.2s"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm sm:text-base">
                <div>
                  <span className="text-[#94A3B8] block text-xs uppercase font-mono mb-1 tracking-wider">Billed to</span>
                  <span className="font-semibold text-white">{demo.client}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#94A3B8] block text-xs uppercase font-mono mb-1 tracking-wider">Terms</span>
                  <span className="font-mono text-white">{demo.terms}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[#94A3B8] block text-xs uppercase font-mono tracking-wider">Scoped line items</span>
                <div className="space-y-2 min-h-[116px]">
                  {scoping
                    ? [0, 1].map((i) => <div key={i} className="h-[52px] rounded-xl skeleton" />)
                    : demo.items.map(([label, amt], i) => (
                        <motion.div
                          key={demo.id + label}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.45, delay: i * 0.12, ease: transitionEase }}
                          className="px-4 py-3.5 rounded-xl bg-[#0D1220] border border-[#202B3D] flex items-center justify-between gap-4 text-sm sm:text-base hover:border-[#84CC16]/40 transition-colors"
                        >
                          <span className="text-[#F8FAFC]">{label}</span>
                          <span className="font-mono font-semibold text-white tabular-nums">{money(amt)}</span>
                        </motion.div>
                      ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#202B3D]">
                <span className="text-base text-[#CBD5E1]">Total amount</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={scoping ? "scoping" : demo.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl sm:text-3xl font-bold text-white tabular-nums"
                  >
                    {scoping ? "…" : `${money(demoTotal)} USD`}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-4 border-t border-[#202B3D] flex items-center justify-between text-sm">
              <span className="text-[#10B981] flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sent through PayPal Sandbox</span>
              </span>
              <span className="text-xs font-mono text-[#64748B]">Example invoice</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { node: <Counter to={0.2} decimals={1} suffix="s" />, label: "to draft a PayPal invoice" },
            { node: <Counter to={4} />, label: "reminder stages, friendly to firm" },
            { node: <Counter to={24} suffix="/7" />, label: "payment watching via webhooks" },
          ].map((s, i) => (
            <Spot
              key={i}
              className="p-8 rounded-3xl panel card-interactive card-sheen"
            >
              <div className="text-5xl sm:text-6xl font-extrabold text-gradient-lime leading-none pb-2">{s.node}</div>
              <div className="mt-3 text-base text-[#CBD5E1]">{s.label}</div>
            </Spot>
          ))}
        </div>
      </section>

      <AsciiRule />

      {/* ── 3. The chase timeline (scroll-driven + clickable) ── */}
      <section id="timeline" ref={timelineWrapperRef} className="relative z-10 md:min-h-[300vh] px-6 py-16 md:py-0">
        <div className="relative isolate md:sticky md:top-20 max-w-6xl mx-auto space-y-8 md:pt-6 pb-12">
          {/* Amber ASCII band behind the chase */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-screen h-[520px] -z-10 opacity-40 pointer-events-none"
            style={{
              WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 45%, #000 20%, transparent 75%)",
              maskImage: "radial-gradient(ellipse 60% 55% at 50% 45%, #000 20%, transparent 75%)",
            }}
            aria-hidden="true"
          >
            <GradientASCII
              colors={["#080B14", "#1F2937", "#B45309", "#F59E0B"]}
              shape="pinch"
              characters=" =+xX0S8#@"
              cellSize={16}
              density={0.8}
              glow={0.45}
              speed={0.5}
              flow={0.5}
              mouseInteraction={true}
              clickEffect="burst"
            />
          </div>
          <SectionHeading
            num="02"
          compact
          eyebrow="THE CHASE · SCROLL OR TAP A DAY"
            dot="#F59E0B"
            title={
              <>
                Time passes. <span className="text-gradient-lime accent-serif">The agent remembers.</span>
              </>
            }
            sub="It watches PayPal for payment, even when your laptop is closed, and escalates politely only when it needs to."
          />

          <div className="p-6 sm:p-8 rounded-3xl panel space-y-8 card-sheen">
            {/* Track with clickable day nodes */}
            <div className="relative px-2 sm:px-6">
              <div className="absolute left-2 right-2 sm:left-6 sm:right-6 top-[11px] h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${(stageIndex / (STAGES.length - 1)) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 22 }}
                  className="h-full bg-gradient-to-r from-[#0284C7] via-[#84CC16] to-[#BEF264] shadow-[0_0_12px_rgba(132,204,22,0.6)]"
                />
              </div>
              <div className="relative flex justify-between">
                {STAGES.map((s, i) => {
                  const reached = i <= stageIndex;
                  const current = i === stageIndex;
                  return (
                    <button
                      key={s.day}
                      onClick={() => pickStage(i)}
                      className="group flex flex-col items-center gap-2 focus:outline-none"
                      aria-pressed={current}
                    >
                      <span
                        className={`h-6 w-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                          current ? "scale-125" : "group-hover:scale-110"
                        }`}
                        style={{
                          borderColor: reached ? s.color : "#334155",
                          background: current ? s.color : "#0D1220",
                          boxShadow: current ? `0 0 18px ${s.color}` : "none",
                        }}
                      />
                      <span
                        className="text-sm sm:text-base font-bold font-mono transition-colors"
                        style={{ color: reached ? s.color : "#64748B" }}
                      >
                        {s.day}
                      </span>
                      <span className="hidden sm:block text-xs sm:text-sm text-[#94A3B8]">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.day}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: transitionEase }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
              >
                <Spot className="md:col-span-7 p-6 rounded-2xl panel space-y-4 card-interactive">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#202B3D]">
                    <span className="text-sm text-[#94A3B8] font-mono">Email the agent sends</span>
                    <span
                      className="text-xs sm:text-sm font-mono px-3 py-1 rounded-full border"
                      style={{ color: stage.color, borderColor: `${stage.color}40`, background: `${stage.color}14` }}
                    >
                      {stage.badge}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[#94A3B8] block text-xs font-mono uppercase tracking-wider mb-1">Subject</span>
                      <span className="font-semibold text-white text-base sm:text-lg">{stage.subject}</span>
                    </div>
                    <p className="text-[#E2E8F0] text-base leading-relaxed bg-[#080B14] p-4 rounded-xl border border-[#202B3D]">
                      &ldquo;{stage.body}&rdquo;
                    </p>
                  </div>
                </Spot>

                <Spot className="md:col-span-5 p-6 rounded-2xl panel space-y-4 card-interactive">
                  <div className="flex items-center justify-between pb-3 border-b border-[#202B3D]">
                    <span className="font-bold text-white text-base flex items-center gap-2">
                      <LottieAutonomousBot size={30} className="shrink-0" />
                      <span>Why it did this</span>
                    </span>
                    <span className="text-xs font-mono text-[#84CC16] bg-[#84CC16]/10 px-2.5 py-1 rounded-full border border-[#84CC16]/25">
                      Audit log
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-[#0D1220] border border-[#202B3D] space-y-1.5">
                      <span className="text-xs font-mono tracking-wider" style={{ color: stage.color }}>
                        {stage.day.toUpperCase()} · REASONING
                      </span>
                      <p className="text-[#F8FAFC] text-base leading-relaxed">{stage.audit}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0D1220] border border-[#202B3D] flex items-center gap-2.5 text-sm sm:text-base text-[#CBD5E1]">
                      <Clock className="w-4 h-4 shrink-0" style={{ color: stage.color }} />
                      <span className="font-mono">{stage.guard}</span>
                    </div>
                  </div>
                </Spot>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── 4. Payment lands (interactive) ── */}
      <section className="relative z-10 py-24 px-6 max-w-4xl mx-auto">
        <div
          className={`p-8 sm:p-14 rounded-[2rem] bg-[#0B1120]/80 border text-center space-y-8 relative isolate overflow-hidden card-sheen transition-all duration-700 ${
            paid
              ? "border-[#10B981]/50 shadow-[0_0_80px_rgba(16,185,129,0.22)]"
              : "border-[#202B3D] shadow-[0_0_40px_rgba(2,132,199,0.08)]"
          }`}
        >
          <div
            className="aurora-blob halo-pulse"
            style={{
              width: 460,
              height: 460,
              top: -160,
              left: "50%",
              marginLeft: -230,
              background: paid ? "rgba(16,185,129,0.28)" : "rgba(2,132,199,0.18)",
              transition: "background 0.7s ease",
            }}
            aria-hidden="true"
          />

          {/* ASCII eclipse that turns green when the payment lands */}
          <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none" aria-hidden="true">
            <GradientASCII
              colors={
                paid
                  ? ["#080B14", "#064E3B", "#10B981", "#BEF264"]
                  : ["#080B14", "#172554", "#0284C7", "#38BDF8"]
              }
              shape="eclipse"
              characters=" =+xX0S8#@"
              cellSize={14}
              density={0.85}
              glow={0.6}
              speed={0.6}
              softness={0.8}
              mouseInteraction={true}
              clickEffect="wave"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_55%,rgba(8,11,20,0.85),transparent_80%)]" />
          </div>

          {/* PayPal → $ handshake */}
          <div className="relative mx-auto flex items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#003087]/30 via-[#0079C1]/20 to-[#0D1220] border border-[#0079C1]/50 flex items-center justify-center shadow-[0_0_25px_rgba(0,121,193,0.35)]">
              <svg className="w-7 h-7" viewBox="0 0 34 32" fill="none" aria-label="PayPal">
                <path
                  d="M10.8 3.5H3.9C3.5 3.5 3.2 3.8 3.1 4.2L0 26C-0.03 26.3 0.2 26.6 0.5 26.6H4.2C4.6 26.6 4.9 26.3 5 25.9L6.1 18.6C6.2 18.2 6.5 17.9 6.9 17.9H9.3C14.6 17.9 17.6 15.3 18.4 10.4C18.7 8.3 18.3 6.6 17.1 5.4C15.9 4.1 13.9 3.5 10.8 3.5Z"
                  fill="#0079C1"
                />
                <path
                  d="M26.8 10.5H19.9C19.5 10.5 19.2 10.8 19.1 11.2L16.8 25.6C16.7 26 17 26.3 17.4 26.3H21.1C21.5 26.3 21.8 26 21.9 25.6L22.7 20.2C22.8 19.8 23.1 19.5 23.5 19.5H24.9C30.2 19.5 33.2 16.9 34 12C34.3 9.9 33.9 8.2 32.7 7C31.5 5.7 29.5 5.1 26.8 5.1"
                  fill="#00457C"
                />
              </svg>
            </div>

            <div className="relative w-20 h-1 rounded-full bg-[#1E293B] overflow-hidden">
              <motion.div
                animate={{ width: paid ? "100%" : "0%" }}
                transition={{ duration: 0.8, ease: transitionEase }}
                className="h-full bg-gradient-to-r from-[#0079C1] to-[#84CC16]"
              />
            </div>

            <motion.div
              animate={paid ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={`h-16 w-16 rounded-full border flex items-center justify-center transition-all duration-500 ${
                paid
                  ? "bg-gradient-to-br from-[#84CC16]/35 via-[#10B981]/20 to-[#0D1220] border-[#84CC16]/60 shadow-[0_0_30px_rgba(132,204,22,0.45)]"
                  : "bg-[#111827] border-[#2A3850]"
              }`}
            >
              <span className={`text-3xl font-black font-mono leading-none ${paid ? "text-[#84CC16]" : "text-[#475569]"}`}>$</span>
            </motion.div>
          </div>

          <div className="relative space-y-4 max-w-2xl mx-auto">
            <h3 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08]">
              Payment lands. <span className="text-gradient-lime accent-serif">The chase stops.</span>
            </h3>
            <p className="text-lg sm:text-xl text-[#CBD5E1] leading-relaxed">
              The moment Sarah pays, PayPal tells the agent. Reminders stop, paused work resumes, and a thank-you note
              goes out on its own.
            </p>
          </div>

          <div className="relative flex flex-col items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={paid ? "paid" : "waiting"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm sm:text-base font-mono ${
                  paid
                    ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#34D399]"
                    : "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#FBBF24]"
                }`}
              >
                {paid ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                <span>{paid ? "Payment confirmed by PayPal · $500.00" : "Awaiting payment · INV-2024-001 · $500.00"}</span>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={simulatePayment}
              className={`flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-bold transition-all active:scale-95 ${
                paid
                  ? "bg-[#111827] border border-[#2A3850] text-[#CBD5E1] hover:text-white"
                  : "bg-[#84CC16] text-black hover:bg-[#9BE329] shadow-[0_10px_30px_-8px_rgba(132,204,22,0.65)]"
              }`}
            >
              {paid ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{paid ? "Reset demo" : "Simulate a PayPal payment"}</span>
            </button>
          </div>
        </div>
      </section>

      <AsciiRule />

      {/* ── 5. Ask it anything (typed queries) ── */}
      <section id="assistant" ref={askRef} className="relative z-10 py-24 px-6 max-w-4xl mx-auto space-y-10 scroll-mt-20">
        <SectionHeading
          num="03"
          eyebrow="ASK IT ANYTHING"
          dot="#38BDF8"
          title={
            <>
              Ask about <span className="text-gradient-lime accent-serif">your money.</span>
            </>
          }
          sub="Answers come only from your real PayPal invoices. No guessed numbers, and nothing outside your workspace."
        />

        <div className="flex flex-wrap items-center justify-center gap-3">
          {QUERIES.map((item, i) => (
            <button
              key={item.q}
              onClick={() => setQueryIndex(i)}
              className={`px-5 py-2.5 rounded-full text-sm sm:text-base font-medium border transition-all active:scale-95 ${
                i === queryIndex
                  ? "bg-[#84CC16]/15 border-[#84CC16]/50 text-[#D9F99D]"
                  : "bg-[#0D1220] border-[#202B3D] text-[#CBD5E1] hover:text-white hover:border-[#38BDF8]/40"
              }`}
            >
              {item.q}
            </button>
          ))}
        </div>

        <Spot className="p-6 sm:p-8 rounded-3xl panel space-y-5 card-sheen">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#172033] border border-[#2A3850] text-base sm:text-lg font-mono text-white">
            <Search className="w-5 h-5 text-[#84CC16] shrink-0" />
            <span>{query.q.slice(0, typed)}</span>
            <span className="h-5 w-2.5 bg-[#84CC16] animate-pulse -ml-1" />
          </div>

          <AnimatePresence mode="wait">
            {typingDone && (
              <motion.div
                key={query.q}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: transitionEase }}
                className="p-6 rounded-2xl panel space-y-4"
              >
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#202B3D]">
                  <span className="text-sm text-[#94A3B8] font-mono uppercase tracking-wider">{query.title}</span>
                  <span className="text-lg sm:text-xl font-bold text-white tabular-nums">{query.total}</span>
                </div>
                <div className="space-y-3">
                  {query.rows.map((r, i) => (
                    <motion.div
                      key={r.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: transitionEase }}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#0D1220] border border-[#202B3D] hover:border-[#2A3850] transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-white block text-base">{r.name}</span>
                        <span className="text-sm text-[#94A3B8]">{r.meta}</span>
                      </div>
                      <span className="font-mono font-bold text-base sm:text-lg whitespace-nowrap" style={{ color: r.tone }}>
                        {r.amt}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="text-xs sm:text-sm font-mono text-[#64748B]">
                  Example data. Only invoices created in your Get Paid workspace are counted.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Spot>
      </section>

      <AsciiRule />

      {/* ── 6. How it works ── */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 max-w-6xl mx-auto space-y-14 scroll-mt-20">
        <SectionHeading
          num="04"
          eyebrow="HOW IT WORKS"
          dot="#84CC16"
          title={
            <>
              Three jobs. <span className="text-gradient-lime accent-serif">Zero spreadsheets.</span>
            </>
          }
          sub="Simple mechanics that protect your time and your client relationships."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              n: 1,
              icon: Sparkles,
              title: "It bills",
              text: "Paste any client message or email thread. The agent scopes the line items, works out exact amounts, and creates a real PayPal invoice.",
            },
            {
              n: 2,
              icon: ShieldCheck,
              title: "It watches",
              text: "PayPal webhooks report every payment, day and night. You never log in to check your account or update a spreadsheet.",
            },
            {
              n: 3,
              icon: Bot,
              title: "It chases",
              text: "When a due date slips, reminders escalate from friendly to firm, and work can pause automatically so you never work for free.",
            },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: transitionEase }}
              >
                <Spot className="h-full p-8 rounded-3xl panel text-center space-y-4 card-interactive card-sheen">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-[#84CC16]/25 to-[#0284C7]/15 text-[#BEF264] border border-[#84CC16]/30 flex items-center justify-center shadow-[0_0_24px_-4px_rgba(132,204,22,0.45)]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="numeral absolute top-5 right-6 text-7xl" aria-hidden="true">
                    0{step.n}
                  </div>
                  <div className="text-xs font-mono text-[#84CC16]/80 tracking-[0.25em]">STEP 0{step.n}</div>
                  <h4 className="text-2xl font-bold text-white">{step.title}</h4>
                  <p className="text-base text-[#CBD5E1] leading-relaxed">{step.text}</p>
                </Spot>
              </motion.div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto p-5 rounded-2xl panel text-base text-[#CBD5E1] flex items-center justify-center gap-3 text-center">
          <ShieldCheck className="w-5 h-5 text-[#84CC16] shrink-0" />
          <span>
            Privacy first: the agent only reads invoices you create in Get Paid. It never looks at your personal PayPal
            history.
          </span>
        </div>
      </section>

      {/* ── 7. Final CTA ── */}
      <section className="relative z-10 isolate overflow-hidden px-6 pt-36 pb-44">
        {/* Sunrise ASCII: bookends the hero */}
        <div className="absolute inset-0 -z-10 opacity-60" aria-hidden="true">
          <GradientASCII
            colors={["#080B14", "#172554", "#0284C7", "#84CC16"]}
            shape="rise"
            characters=" =+xX0S8#@"
            cellSize={17}
            density={0.88}
            glow={0.55}
            speed={0.6}
            flow={0.55}
            mouseInteraction={true}
            clickEffect="wave"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080B14] via-[#080B14]/30 to-transparent pointer-events-none" />
        </div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: transitionEase }}
          className="relative text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.04]"
        >
          Stop writing the <span className="text-gradient-lime accent-serif">awkward email.</span>
        </motion.h2>
        <p className="relative text-lg sm:text-xl text-[#CBD5E1] max-w-2xl mx-auto">
          Let your accounts-receivable agent handle the follow-ups while you do the work you love.
        </p>
        <div className="relative pt-2 flex justify-center">
          <Link href="/app">
            <MagnetButton className="group flex items-center gap-2 px-10 py-4 rounded-full bg-white text-[#080B14] text-lg font-bold hover:bg-[#F1F5F9] transition-all shadow-[0_12px_40px_-10px_rgba(255,255,255,0.35)] active:scale-95">
              <span>Open the app</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </MagnetButton>
          </Link>
        </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 overflow-hidden pt-12 px-6 border-t border-white/[0.08] text-sm text-[#94A3B8]">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">getpaid.</span>
            <span>· Built for the PayPal AI Hackathon</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-sm">
            <a href="mailto:suryanshsaraf8@gmail.com" className="hover:text-white transition-colors">
              suryanshsaraf8@gmail.com
            </a>
            <a href="mailto:saiarihara@gmail.com" className="hover:text-white transition-colors">
              saiarihara@gmail.com
            </a>
            <Link href="/app" className="text-[#84CC16] hover:underline">
              Launch app
            </Link>
          </div>
        </div>
        <div className="numeral text-center text-[18vw] mt-10 -mb-[3vw] whitespace-nowrap" aria-hidden="true">
          getpaid.
        </div>
      </footer>
    </div>
  );
}
