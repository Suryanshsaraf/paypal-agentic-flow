"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  useMotionTemplate,
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
  Send,
  Mouse,
} from "lucide-react";
import { LottieAutonomousBot } from "@/components/lottie/lottie-animations";
import { MagnetButton } from "@/components/reactbits/magnet-button";
import GradientASCII from "@/components/reactbits/gradient-ascii";
import { fireFintechCelebration } from "@/components/interactive/confetti";

// ── Shared Motion Tokens ──
const transitionEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Demo data ──
type LinkKey = number | "total";
type Part = string | { hl: string; links: LinkKey[] };

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
  thread: string;
  initials: string;
  due: string;
}> = [
  {
    id: "whatsapp",
    thread: "Sarah Chen",
    initials: "SC",
    due: "Due Nov 18",
    channel: "WhatsApp",
    icon: MessageSquare,
    time: "10:24 AM",
    from: "Sarah Chen · Acme Studio",
    parts: [
      "Hey Alex! Go ahead with the ",
      { hl: "logo + 3 banners", links: [0, 1] },
      ". Agreed price ",
      { hl: "$500 flat", links: ["total"] },
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
    thread: "Re: Landing page, next steps",
    initials: "DM",
    due: "Due Nov 25",
    channel: "Email",
    icon: Mail,
    time: "Yesterday",
    from: "David Miller · Fintech Labs",
    parts: [
      "Loved the landing page draft. Let's lock in ",
      { hl: "2 more pages", links: [0] },
      " plus ",
      { hl: "a week of QA", links: [1] },
      ". ",
      { hl: "$1,800 total", links: ["total"] },
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
    thread: "bloom-co-design",
    initials: "PN",
    due: "Due on receipt",
    channel: "Slack",
    icon: Hash,
    time: "2:07 PM",
    from: "Priya Nair · Bloom Co.",
    parts: [
      "can you do ",
      { hl: "6 hours", links: [0] },
      " of consulting at ",
      { hl: "$90/hr", links: [0] },
      " + the ",
      { hl: "$120 font license", links: [1] },
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
    status: "Invoice delivered",
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
    status: "Due today",
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
    status: "3 days overdue",
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
    status: "7 days overdue",
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
    status: "11 days overdue",
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

/** Card that tilts toward the cursor in 3D, with a soft lime glare following the pointer. */
function TiltCard({
  className = "",
  wrapperClassName = "",
  children,
}: {
  className?: string;
  wrapperClassName?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 180, damping: 18 });
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(520px circle at ${gx} ${gy}, rgba(190,242,100,0.10), transparent 55%)`;
  const [hover, setHover] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    setHover(false);
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div className={`[perspective:1400px] ${wrapperClassName}`}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={onLeave}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative h-full transition-[border-color,box-shadow] duration-300 ${
          hover ? "!border-[#84CC16]/35 !shadow-[0_0_0_1px_rgba(132,204,22,0.18),0_34px_70px_-30px_rgba(132,204,22,0.4)]" : ""
        } ${className}`}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{ background: glare, opacity: hover ? 1 : 0 }}
          aria-hidden="true"
        />
        <div className="relative h-full">{children}</div>
      </motion.div>
    </div>
  );
}

/**
 * One green ASCII layer behind the whole page. Sections drop invisible `data-flow="0..1"` markers;
 * as the viewport centre moves between markers the layer bulges (taller, brighter) or shrinks to
 * nothing, so the pattern swells into the open space between sections and gets out of the way of
 * dense content. Rendering pauses entirely while it is faded out.
 */
function AsciiFlow() {
  const level = useMotionValue(0);
  const smooth = useSpring(level, { stiffness: 55, damping: 18, mass: 0.6 });
  const opacity = useTransform(smooth, (v) => Math.min(1, Math.max(0, v)) * 0.62);
  const mask = useTransform(smooth, (v) => {
    const k = Math.min(1, Math.max(0, v));
    const w = 50 + 50 * k; // ellipse widens as it bulges
    const h = 8 + 52 * k; // and grows taller
    const y = 50 + Math.sin(k * Math.PI) * 6; // the bulge drifts slightly as it swells: a gentle curve
    return `radial-gradient(ellipse ${w}% ${h}% at 50% ${y}%, #000 0%, rgba(0,0,0,0.6) 45%, transparent 82%)`;
  });
  const [active, setActive] = useState(false);

  useEffect(() => {
    let marks: Array<{ y: number; v: number }> = [];
    const update = () => {
      if (!marks.length) return;
      const c = window.scrollY + window.innerHeight / 2;
      let v = marks[0].v;
      if (c >= marks[marks.length - 1].y) v = marks[marks.length - 1].v;
      else {
        for (let i = 0; i < marks.length - 1; i++) {
          const a = marks[i];
          const b = marks[i + 1];
          if (c >= a.y && c <= b.y) {
            const t = (c - a.y) / Math.max(1, b.y - a.y);
            v = a.v + (b.v - a.v) * (t * t * (3 - 2 * t)); // smoothstep for soft curves
            break;
          }
        }
      }
      level.set(v);
      setActive(v > 0.02);
    };
    const measure = () => {
      marks = Array.from(document.querySelectorAll<HTMLElement>("[data-flow]"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { y: r.top + window.scrollY + r.height / 2, v: parseFloat(el.dataset.flow || "0") };
        })
        .sort((a, b) => a.y - b.y);
      update();
    };
    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [level]);

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity, WebkitMaskImage: mask, maskImage: mask }}
      aria-hidden="true"
    >
      <GradientASCII
        colors={["#080B14", "#052E16", "#16A34A", "#A3E635"]}
        shape="pinch"
        characters=" =+xX0S8#@"
        cellSize={16}
        density={0.85}
        glow={0.5}
        speed={0.55}
        flow={0.6}
        softness={0.9}
        mouseInteraction={true}
        clickEffect="wave"
        paused={!active}
      />
    </motion.div>
  );
}

// ── Payment orbit: status chips circling the headline, a radar sweep while waiting, a shockwave when paid ──
const ORBIT_RINGS = [
  { size: 64, dur: 46, dir: 1 },
  { size: 84, dur: 68, dir: -1 },
  { size: 104, dur: 92, dir: 1 },
];
const ORBIT_CHIPS = [
  // The inner ring carries only a bead, so nothing crosses the copy.
  { ring: 1, angle: -30, wait: "Webhook · listening", done: "Payment captured", tone: "#38BDF8" },
  { ring: 1, angle: 90, wait: "Reminder 2 · sent", done: "Reminders stopped", tone: "#F59E0B" },
  { ring: 1, angle: 210, wait: "Work paused", done: "Work resumed", tone: "#EF4444" },
  { ring: 2, angle: 30, wait: "Due Nov 5", done: "Paid Nov 16", tone: "#F59E0B" },
  { ring: 2, angle: 150, wait: "INV-2024-001 · $500.00", done: "Thank-you note sent", tone: "#94A3B8" },
  { ring: 2, angle: 270, wait: "Sarah Chen · Acme Studio", done: "Client in good standing", tone: "#94A3B8" },
];

function PaymentOrbit({ paid }: { paid: boolean }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(1240px,160vw)] aspect-square -z-10 pointer-events-none select-none"
      style={{
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 52%, transparent 72%)",
        maskImage: "radial-gradient(circle at 50% 50%, #000 52%, transparent 72%)",
      }}
      aria-hidden="true"
    >
      {/* Soft centre glow */}
      <div
        className="absolute inset-[22%] rounded-full blur-3xl transition-colors duration-1000"
        style={{ background: paid ? "rgba(74,222,128,0.16)" : "rgba(132,204,22,0.07)" }}
      />

      {/* Radar sweep: the agent listening for PayPal */}
      <div
        className={`absolute inset-[8%] rounded-full transition-opacity duration-700 ${paid ? "opacity-0" : "opacity-100"}`}
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(132,204,22,0.04) 320deg, rgba(163,230,53,0.22) 360deg)",
          WebkitMaskImage: "radial-gradient(circle, transparent 27%, #000 30%, #000 70%, transparent 71%)",
          maskImage: "radial-gradient(circle, transparent 27%, #000 30%, #000 70%, transparent 71%)",
          animation: "spin-slow 5s linear infinite",
        }}
      />

      {/* Orbit rings with their chips */}
      {ORBIT_RINGS.map((ring, ri) => (
        <div
          key={ri}
          className="absolute left-1/2 top-1/2 rounded-full border border-dashed transition-colors duration-1000"
          style={{
            width: `${ring.size * 0.9}%`,
            height: `${ring.size * 0.9}%`,
            marginLeft: `-${(ring.size * 0.9) / 2}%`,
            marginTop: `-${(ring.size * 0.9) / 2}%`,
            borderColor: paid ? "rgba(74,222,128,0.34)" : "rgba(148,163,184,0.13)",
            animation: `spin-slow ${ring.dur}s linear infinite ${ring.dir < 0 ? "reverse" : "normal"}`,
          }}
        >
          {/* A small bead travelling on each ring */}
          <span
            className="absolute -top-[4px] left-1/2 -ml-[4px] h-2 w-2 rounded-full transition-colors duration-700"
            style={{
              background: paid ? "#4ADE80" : "#84CC16",
              boxShadow: `0 0 12px ${paid ? "#4ADE80" : "#84CC16"}`,
            }}
          />
          {ORBIT_CHIPS.filter((c) => c.ring === ri).map((chip) => {
            const rad = (chip.angle * Math.PI) / 180;
            return (
              <div
                key={chip.wait}
                className="absolute hidden sm:block"
                style={{
                  left: `${50 + 50 * Math.cos(rad)}%`,
                  top: `${50 + 50 * Math.sin(rad)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Counter-rotate so the label stays upright while the ring turns */}
                <div
                  style={{
                    animation: `spin-slow ${ring.dur}s linear infinite ${ring.dir < 0 ? "normal" : "reverse"}`,
                  }}
                >
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono whitespace-nowrap backdrop-blur-md transition-all duration-700 ${
                      paid
                        ? "bg-[#10B981]/10 border-[#10B981]/40 text-[#6EE7B7] shadow-[0_0_20px_-6px_rgba(16,185,129,0.6)]"
                        : "bg-[#111827]/80 border-white/[0.08] text-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full transition-colors duration-700"
                      style={{ background: paid ? "#4ADE80" : chip.tone }}
                    />
                    {paid ? chip.done : chip.wait}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Shockwave when the payment lands */}
      <AnimatePresence>
        {paid &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0.25, opacity: 0.9 }}
              animate={{ scale: 2.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, delay: 0.25 + i * 0.32, ease: [0.2, 0.7, 0.3, 1] }}
              className="absolute left-1/2 top-1/2 h-[36%] w-[36%] -ml-[18%] -mt-[18%] rounded-full border-2 border-[#4ADE80]"
              style={{ boxShadow: "0 0 40px rgba(74,222,128,0.45), inset 0 0 40px rgba(74,222,128,0.25)" }}
            />
          ))}
      </AnimatePresence>
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

/** Centered section heading with eyebrow pill. */
function SectionHeading({
  eyebrow,
  dot,
  title,
  sub,
  compact = false,
}: {
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
      <p
        className={`${
          compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
        } text-[#CBD5E1] leading-relaxed max-w-2xl mx-auto`}
      >
        {sub}
      </p>
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
  // Hovering a highlighted phrase lights up the invoice lines it produced, and vice versa.
  const [activeLinks, setActiveLinks] = useState<LinkKey[] | null>(null);
  const isLinked = (keys: LinkKey[]) => !!activeLinks && keys.some((k) => activeLinks.includes(k));
  const [sentFor, setSentFor] = useState<string | null>(null);
  const sent = sentFor === demo.id;

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
  // md+ : the section pins to the screen and scrolling walks through the days.
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useMotionValueEvent(timelineProgress, "change", (v) => {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    setStageIndex(Math.max(0, Math.min(STAGES.length - 1, Math.floor(v * STAGES.length))));
  });
  // Continuous fill for the progress rail so it moves with every scroll tick.
  const railFill = useSpring(timelineProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const playheadLeft = useTransform(railFill, (v) => `${Math.min(1, Math.max(0, v)) * 100}%`);

  // Horizontal card strip: on desktop, vertical scroll slides it sideways so the current day's card sits centred.
  const stripRef = useRef<HTMLDivElement>(null);
  const stripViewportRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef({ vw: 1280, w: 540, gap: 24 });
  const metricsTick = useMotionValue(0);
  useEffect(() => {
    const measure = () => {
      const card = stripRef.current?.querySelector<HTMLElement>("[data-card]");
      metricsRef.current = { vw: window.innerWidth, w: card?.offsetWidth ?? 540, gap: 24 };
      metricsTick.set(metricsTick.get() + 1); // re-run the strip transform with the new sizes
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [metricsTick]);
  const stripX = useTransform([railFill, metricsTick], ([v]: number[]) => {
    const { vw, w, gap } = metricsRef.current;
    const n = STAGES.length;
    const f = Math.min(n - 1, Math.max(0, v * n - 0.5)); // fractional card index
    return vw / 2 - (f * (w + gap) + w / 2);
  });
  // Phones: the strip is a native swipe row; keep the active day in sync with it.
  const onStripScroll = () => {
    if (pinned || !stripViewportRef.current) return;
    const { w, gap } = metricsRef.current;
    const i = Math.round(stripViewportRef.current.scrollLeft / (w + gap));
    setStageIndex(Math.max(0, Math.min(STAGES.length - 1, i)));
  };

  // Clicking a day scrolls the page to that day's spot, so scroll and state never disagree.
  const goToStage = (i: number) => {
    const el = timelineWrapperRef.current;
    if (!pinned) {
      const { w, gap } = metricsRef.current;
      stripViewportRef.current?.scrollTo({ left: i * (w + gap), behavior: "smooth" });
      setStageIndex(i);
      return;
    }
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const y = top + ((i + 0.5) / STAGES.length) * travel;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
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
    <div className="bg-[#080B14] text-[#F8FAFC] min-h-screen font-sans selection:bg-[#84CC16] selection:text-black antialiased relative overflow-x-clip">
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

      {/* ── Site-wide green ASCII flow: bulges between sections, fades behind content ── */}
      <AsciiFlow />

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
      <section data-flow="0" className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
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
      <div data-flow="0.85" className="h-0" aria-hidden="true" />

      {/* ── 2. Interactive demo: message → invoice ── */}
      <section id="demo" className="relative z-10 py-24 px-6 max-w-6xl mx-auto space-y-12 scroll-mt-20">
        <SectionHeading
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

        <div data-flow="0.15" className="relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-stretch">
          {/* Agent node sitting between the message and the invoice */}
          <div
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 items-center justify-center"
            style={{ left: "calc((100% - 2.5rem) * 5 / 12 + 1.25rem)" }}
            aria-hidden="true"
          >
            {scoping && <span className="absolute h-14 w-14 rounded-full bg-[#84CC16]/30 animate-ping" />}
            <span
              className={`relative h-14 w-14 rounded-full bg-[#0B1120] border flex items-center justify-center transition-all duration-300 ${
                scoping
                  ? "border-[#84CC16] shadow-[0_0_30px_rgba(132,204,22,0.6)]"
                  : "border-[#84CC16]/40 shadow-[0_0_18px_rgba(132,204,22,0.25)]"
              }`}
            >
              <Bot className={`w-6 h-6 text-[#A3E635] ${scoping ? "animate-pulse" : ""}`} />
            </span>
          </div>

          {/* ── Client message, skinned like the real channel ── */}
          <TiltCard wrapperClassName="md:col-span-5" className="rounded-3xl panel overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: transitionEase }}
                className="h-full flex flex-col"
              >
                {/* Channel app bar */}
                {demo.id === "whatsapp" && (
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-[#0F2A22] border-b border-white/[0.06]">
                    <span className="h-10 w-10 rounded-full bg-[#25D366]/20 text-[#4ADE80] flex items-center justify-center text-sm font-bold">
                      {demo.initials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold leading-tight">{demo.thread}</div>
                      <div className="text-xs text-[#4ADE80]">online</div>
                    </div>
                    <MessageSquare className="w-5 h-5 text-[#4ADE80]/70" />
                  </div>
                )}
                {demo.id === "email" && (
                  <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-white font-semibold leading-tight">
                      <Mail className="w-4 h-4 text-[#7DD3FC] shrink-0" />
                      <span className="truncate">{demo.thread}</span>
                    </div>
                    <div className="text-xs text-[#94A3B8] truncate">David Miller · to me · {demo.time}</div>
                  </div>
                )}
                {demo.id === "slack" && (
                  <div className="flex items-center gap-2 px-5 py-3.5 bg-[#1A1D21] border-b border-white/[0.06]">
                    <Hash className="w-4 h-4 text-[#E8E8E8]" />
                    <span className="text-white font-semibold">{demo.thread}</span>
                    <span className="ml-auto text-xs text-[#94A3B8]">3 members</span>
                  </div>
                )}

                {/* Conversation */}
                <div
                  className={`relative flex-1 p-5 overflow-hidden ${
                    demo.id === "whatsapp" ? "bg-[#0B141A]/80" : demo.id === "slack" ? "bg-[#1A1D21]/50" : "bg-[#0E1424]/60"
                  }`}
                  style={
                    demo.id === "whatsapp"
                      ? {
                          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(74,222,128,0.07) 1px, transparent 0)",
                          backgroundSize: "18px 18px",
                        }
                      : undefined
                  }
                >
                  {/* Scan line while the agent reads */}
                  {scoping && (
                    <motion.div
                      initial={{ top: "-30%" }}
                      animate={{ top: "110%" }}
                      transition={{ duration: 0.75, ease: "linear" }}
                      className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-[#84CC16]/25 to-transparent pointer-events-none z-10"
                      aria-hidden="true"
                    />
                  )}

                  {(() => {
                    const body = (
                      <p className="text-base sm:text-[17px] text-[#F1F5F9] leading-[1.85]">
                        {demo.parts.map((p, i) =>
                          typeof p === "string" ? (
                            <span key={i}>{p}</span>
                          ) : (
                            <span
                              key={i}
                              onMouseEnter={() => setActiveLinks(p.links)}
                              onMouseLeave={() => setActiveLinks(null)}
                              className={`inline-block cursor-help px-1.5 rounded-md font-semibold border transition-all duration-200 ${
                                scoping
                                  ? "bg-transparent text-[#F1F5F9] border-transparent"
                                  : isLinked(p.links)
                                  ? "bg-[#84CC16] text-black border-[#84CC16] -translate-y-0.5 shadow-[0_8px_22px_-6px_rgba(132,204,22,0.75)]"
                                  : "bg-[#84CC16]/15 text-[#BEF264] border-[#84CC16]/40 hover:bg-[#84CC16]/25"
                              }`}
                            >
                              {p.hl}
                            </span>
                          )
                        )}
                      </p>
                    );
                    if (demo.id === "whatsapp")
                      return (
                        <div className="max-w-[94%] rounded-2xl rounded-tl-sm bg-[#1F2C34] px-4 pt-3 pb-2 shadow-lg">
                          {body}
                          <div className="flex justify-end items-center gap-1 text-[11px] text-[#94A3B8] mt-1">
                            <span>{demo.time}</span>
                            <span className="text-[#53BDEB] font-bold tracking-[-0.2em]">✓✓</span>
                          </div>
                        </div>
                      );
                    if (demo.id === "slack")
                      return (
                        <div className="flex gap-3">
                          <span className="h-10 w-10 shrink-0 rounded-lg bg-[#E01E5A]/20 text-[#F472B6] flex items-center justify-center text-sm font-bold">
                            {demo.initials}
                          </span>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-white font-bold">Priya Nair</span>
                              <span className="text-xs text-[#94A3B8]">{demo.time}</span>
                            </div>
                            {body}
                          </div>
                        </div>
                      );
                    return (
                      <div className="space-y-3 text-[#F1F5F9]">
                        <div className="text-base">Hi Alex,</div>
                        {body}
                        <div className="text-base text-[#CBD5E1]">Best, David</div>
                      </div>
                    );
                  })()}
                </div>

                {/* What the agent understood */}
                <div className="px-5 py-4 border-t border-white/[0.06] bg-[#0B1120]/70 space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.18em] text-[#64748B]">
                    <span className={`h-1.5 w-1.5 rounded-full ${scoping ? "bg-[#F59E0B]" : "bg-[#84CC16]"} animate-pulse`} />
                    {scoping ? "READING THE MESSAGE…" : "WHAT THE AGENT UNDERSTOOD"}
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {!scoping &&
                      [
                        ["Scope", `${demo.items.length} line items`],
                        ["Price", money(demoTotal)],
                        ["Terms", demo.terms],
                      ].map(([k, v], i) => (
                        <motion.span
                          key={demo.id + k}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#84CC16]/10 border border-[#84CC16]/25 text-sm"
                        >
                          <span className="text-[#94A3B8]">{k}</span>
                          <span className="text-[#D9F99D] font-semibold">{v}</span>
                        </motion.span>
                      ))}
                  </div>
                  <div className="text-xs text-[#64748B]">Hover a highlight to trace it into the invoice</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TiltCard>

          {/* ── Invoice document ── */}
          <TiltCard wrapperClassName="md:col-span-7" className="rounded-3xl panel overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#84CC16] via-[#38BDF8] to-[#0284C7]" />
            <div className="relative p-6 sm:p-7 space-y-6">
              {/* SENT stamp */}
              <AnimatePresence>
                {sent && (
                  <motion.div
                    initial={{ scale: 2.2, opacity: 0, rotate: -26 }}
                    animate={{ scale: 1, opacity: 1, rotate: -12 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 16 }}
                    className="absolute right-8 top-20 z-20 px-4 py-1 rounded-lg border-[3px] border-[#34D399] text-[#34D399] font-display font-bold text-2xl tracking-[0.25em] bg-[#34D399]/[0.06] pointer-events-none"
                  >
                    SENT
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-11 w-11 rounded-xl bg-[#0079C1]/15 border border-[#0079C1]/40 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 34 32" fill="none" aria-hidden="true">
                      <path
                        d="M10.8 3.5H3.9C3.5 3.5 3.2 3.8 3.1 4.2L0 26C-0.03 26.3 0.2 26.6 0.5 26.6H4.2C4.6 26.6 4.9 26.3 5 25.9L6.1 18.6C6.2 18.2 6.5 17.9 6.9 17.9H9.3C14.6 17.9 17.6 15.3 18.4 10.4C18.7 8.3 18.3 6.6 17.1 5.4C15.9 4.1 13.9 3.5 10.8 3.5Z"
                        fill="#38BDF8"
                      />
                    </svg>
                  </span>
                  <div>
                    <div className="font-display font-bold text-2xl text-white leading-none">Invoice</div>
                    <div className="mt-1 text-sm font-mono text-[#94A3B8]">INV-2024-0{17 + demoIndex}</div>
                  </div>
                </div>
                <div className="text-right space-y-1.5">
                  <span
                    className={`inline-block text-xs sm:text-sm font-mono px-3 py-1 rounded-full border transition-colors ${
                      scoping
                        ? "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25"
                        : "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25"
                    }`}
                  >
                    {scoping ? "Scoping…" : "Drafted in 0.2s"}
                  </span>
                  <div className="text-sm text-[#CBD5E1]">{demo.due}</div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: "From", name: "Alex Rivera", sub: "Brand & web design", ini: "AR", tint: "#84CC16" },
                  { k: "Bill to", name: demo.client.split(" · ")[0], sub: demo.client.split(" · ")[1], ini: demo.initials, tint: "#38BDF8" },
                ].map((party) => (
                  <div key={party.k} className="rounded-2xl bg-[#0B1120]/60 border border-white/[0.06] p-3.5 flex items-center gap-3">
                    <span
                      className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: `${party.tint}22`, color: party.tint }}
                    >
                      {party.ini}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B]">{party.k}</div>
                      <div className="text-sm sm:text-base font-semibold text-white truncate">{party.name}</div>
                      <div className="text-xs text-[#94A3B8] truncate">{party.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Line items table */}
              <div>
                <div className="flex justify-between px-4 pb-2 text-[11px] font-mono uppercase tracking-wider text-[#64748B]">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="space-y-2 min-h-[116px]">
                  {scoping
                    ? [0, 1].map((i) => <div key={i} className="h-[52px] rounded-xl skeleton" />)
                    : demo.items.map(([label, amt], i) => {
                        const lit = isLinked([i]);
                        return (
                          <motion.div
                            key={demo.id + label}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45, delay: i * 0.12, ease: transitionEase }}
                            onMouseEnter={() => setActiveLinks([i])}
                            onMouseLeave={() => setActiveLinks(null)}
                            className={`px-4 py-3.5 rounded-xl border flex items-center justify-between gap-4 text-sm sm:text-base cursor-help transition-all duration-200 ${
                              lit
                                ? "bg-[#84CC16]/[0.08] border-[#84CC16]/60 shadow-[0_0_26px_-8px_rgba(132,204,22,0.6)]"
                                : "bg-[#0B1120]/70 border-white/[0.06]"
                            }`}
                          >
                            <span className="text-[#F8FAFC]">{label}</span>
                            <span
                              className={`font-mono font-semibold tabular-nums transition-colors ${
                                lit ? "text-[#BEF264]" : "text-white"
                              }`}
                            >
                              {money(amt)}
                            </span>
                          </motion.div>
                        );
                      })}
                </div>
              </div>

              {/* Totals */}
              <div className="ml-auto w-full sm:w-72 space-y-1.5 text-sm">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{scoping ? "…" : money(demoTotal)}</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Tax</span>
                  <span className="font-mono tabular-nums">$0.00</span>
                </div>
                <div
                  onMouseEnter={() => setActiveLinks(["total"])}
                  onMouseLeave={() => setActiveLinks(null)}
                  className="flex items-baseline justify-between pt-2 border-t border-white/[0.08] cursor-help"
                >
                  <span className="text-base text-[#CBD5E1]">Total</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={scoping ? "scoping" : demo.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className={`font-display text-3xl font-bold tabular-nums tracking-[-0.03em] transition-colors ${
                        isLinked(["total"]) ? "text-[#BEF264]" : "text-white"
                      }`}
                    >
                      {scoping ? "…" : money(demoTotal)}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-[#FFC439] text-[#003087] font-bold italic text-sm sm:text-base shadow-[0_6px_18px_-8px_rgba(255,196,57,0.8)] select-none">
                  Pay with <span className="not-italic">Pay</span>
                  <span className="text-[#009CDE] not-italic -ml-1">Pal</span>
                </span>
                <button
                  disabled={scoping}
                  onClick={() => {
                    setAutoplay(false);
                    setSentFor(demo.id);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all active:scale-95 disabled:opacity-50 ${
                    sent
                      ? "bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/40"
                      : "bg-[#84CC16] text-black hover:bg-[#9BE329] shadow-[0_8px_24px_-8px_rgba(132,204,22,0.7)]"
                  }`}
                >
                  {sent ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>{sent ? `Sent to ${demo.client.split(" ")[0]}` : "Send to client"}</span>
                </button>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section data-flow="1" className="relative z-10 py-16 px-6">
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

      {/* ── 3. The chase: a horizontal timeline, pinned while you scroll down ── */}
      <section id="timeline" ref={timelineWrapperRef} className="relative z-10 md:h-[420vh] py-20 md:py-0">
        {/* Green flow stays at a medium swell throughout the chase */}
        <div data-flow="0.5" className="absolute top-[50vh] left-0 w-full h-0" aria-hidden="true" />
        <div data-flow="0.5" className="absolute bottom-[50vh] left-0 w-full h-0" aria-hidden="true" />

        <div className="md:sticky md:top-0 md:h-screen md:overflow-hidden flex flex-col justify-center gap-8 md:gap-9 md:pt-16">
          <div className="px-6">
            <SectionHeading
              compact
              eyebrow="THE CHASE · SCROLL TO TRAVEL THROUGH TIME"
              dot="#F59E0B"
              title={
                <>
                  Time passes. <span className="text-gradient-lime accent-serif">The agent remembers.</span>
                </>
              }
              sub="One unpaid invoice, eighteen days, zero awkward emails written by you."
            />
          </div>

          {/* Horizontal day track */}
          <div className="px-6 w-full max-w-6xl mx-auto">
            <div className="relative h-[78px]">
              <div className="absolute left-0 right-0 top-[18px] h-1 rounded-full bg-white/[0.08]" />
              <motion.div
                className="absolute left-0 right-0 top-[18px] h-1 rounded-full origin-left bg-gradient-to-r from-[#16A34A] via-[#F59E0B] to-[#EF4444] shadow-[0_0_14px_rgba(245,158,11,0.45)]"
                style={{ scaleX: pinned ? railFill : (stageIndex + 0.5) / STAGES.length }}
              />
              {pinned && (
                <motion.div
                  className="absolute top-[10px] -ml-[10px] h-5 w-5 rounded-full bg-white z-20 shadow-[0_0_0_5px_rgba(255,255,255,0.10),0_0_26px_rgba(163,230,53,0.9)]"
                  style={{ left: playheadLeft }}
                  aria-hidden="true"
                />
              )}
              {STAGES.map((s, i) => {
                const reached = i <= stageIndex;
                const current = i === stageIndex;
                return (
                  <button
                    key={s.day}
                    onClick={() => goToStage(i)}
                    aria-current={current ? "step" : undefined}
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center gap-1.5 group z-10"
                    style={{ left: `${((i + 0.5) / STAGES.length) * 100}%` }}
                  >
                    <span
                      className="mt-[11px] h-[18px] w-[18px] rounded-full border-2 transition-all duration-300 group-hover:scale-125"
                      style={{
                        borderColor: reached ? s.color : "#334155",
                        background: current ? s.color : "#0B1120",
                        boxShadow: current ? `0 0 18px ${s.color}` : "none",
                      }}
                    />
                    <span
                      className="font-mono text-sm sm:text-base font-bold transition-colors"
                      style={{ color: reached ? s.color : "#64748B" }}
                    >
                      {s.day}
                    </span>
                    <span
                      className={`hidden sm:block text-xs whitespace-nowrap transition-colors ${
                        current ? "text-white" : "text-[#64748B]"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal strip of day cards */}
          <div
            ref={stripViewportRef}
            onScroll={onStripScroll}
            className="w-full overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none no-scrollbar"
          >
            <motion.div
              ref={stripRef}
              style={pinned ? { x: stripX } : undefined}
              className="flex gap-6 w-max px-6 md:px-0 py-2"
            >
              {STAGES.map((s, i) => {
                const current = i === stageIndex;
                return (
                  <div
                    key={s.day}
                    data-card
                    onClick={() => goToStage(i)}
                    className={`snap-center shrink-0 w-[82vw] sm:w-[460px] md:w-[540px] panel rounded-3xl overflow-hidden transition-all duration-500 ${
                      current ? "opacity-100 scale-100" : "opacity-40 scale-[0.93] cursor-pointer hover:opacity-70"
                    }`}
                    style={current ? { boxShadow: `0 0 0 1px ${s.color}55, 0 30px 80px -30px ${s.color}88` } : undefined}
                  >
                    <div className="h-1" style={{ background: s.color }} />
                    <div className="p-6 sm:p-7 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-3">
                          <span className="font-display font-bold text-4xl tracking-[-0.04em]" style={{ color: s.color }}>
                            {s.day}
                          </span>
                          <span className="text-base text-[#CBD5E1]">{s.status}</span>
                        </div>
                        <span
                          className="text-xs font-mono px-3 py-1 rounded-full border whitespace-nowrap"
                          style={{ color: s.color, borderColor: `${s.color}40`, background: `${s.color}14` }}
                        >
                          {s.badge}
                        </span>
                      </div>
                      <div className="rounded-2xl bg-[#0B1120]/70 border border-white/[0.06] p-4 space-y-2">
                        <div className="text-[11px] font-mono tracking-[0.15em] text-[#64748B]">
                          EMAIL TO SARAH · SENT AUTOMATICALLY
                        </div>
                        <div className="text-white font-semibold text-base sm:text-lg leading-snug">{s.subject}</div>
                        <p className="text-[15px] sm:text-base text-[#CBD5E1] leading-relaxed">{s.body}</p>
                      </div>
                      <div className="flex items-start gap-3 text-[15px] text-[#CBD5E1] leading-relaxed">
                        <Bot className="w-5 h-5 shrink-0 mt-0.5" style={{ color: s.color }} />
                        <span>{s.audit}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-mono text-[#94A3B8]">{s.guard}</div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <div className="hidden md:flex justify-center items-center gap-2 text-sm text-[#64748B]">
            <Mouse className="w-4 h-4 text-[#A3E635] cue-bounce" />
            <span>
              {stageIndex < STAGES.length - 1 ? "Keep scrolling to move forward in time" : "Scroll on to see it get paid"}
            </span>
          </div>
        </div>
      </section>

      {/* ── 4. Payment lands: sits on the shared page background, orbit behind the copy ── */}
      <section data-flow="0.3" className="relative z-10 isolate overflow-hidden min-h-[820px] md:min-h-[920px] flex items-center justify-center px-6 py-24">
        {/* Orbiting status chips, radar sweep and payment shockwave */}
        <PaymentOrbit paid={paid} />

        <div className="relative w-full max-w-3xl mx-auto text-center space-y-9">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827]/80 border border-white/[0.08] text-xs sm:text-sm font-mono text-[#CBD5E1] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: paid ? "#4ADE80" : "#84CC16" }} />
            <span className="tracking-[0.18em]">PAYMENT LANDS · TRY IT</span>
          </div>

          {/* PayPal → $ handshake */}
          <div className="mx-auto flex items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#003087]/40 via-[#0079C1]/25 to-[#0D1220] border border-[#0079C1]/50 flex items-center justify-center shadow-[0_0_25px_rgba(0,121,193,0.35)]">
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

            <div className="relative w-24 h-1 rounded-full bg-white/10 overflow-hidden">
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
                  : "bg-[#0B1120] border-white/15"
              }`}
            >
              <span className={`text-3xl font-black font-mono leading-none ${paid ? "text-[#84CC16]" : "text-[#475569]"}`}>$</span>
            </motion.div>
          </div>

          <div className="space-y-5">
            <h3 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-[-0.04em] leading-[1.02]">
              Payment lands.
              <br />
              <span className="text-gradient-lime accent-serif">The chase stops.</span>
            </h3>
            <p className="text-lg sm:text-xl text-[#E2E8F0] leading-relaxed max-w-xl mx-auto">
              The moment Sarah pays, PayPal tells the agent. Reminders stop, paused work resumes, and a thank-you note
              goes out on its own.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={paid ? "paid" : "waiting"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm sm:text-base font-mono backdrop-blur-md ${
                  paid
                    ? "bg-[#10B981]/15 border-[#10B981]/40 text-[#34D399]"
                    : "bg-[#F59E0B]/10 border-[#F59E0B]/35 text-[#FBBF24]"
                }`}
              >
                {paid ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                <span>{paid ? "Payment confirmed by PayPal · $500.00" : "Awaiting payment · INV-2024-001 · $500.00"}</span>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={simulatePayment}
              className={`flex items-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-bold transition-all active:scale-95 ${
                paid
                  ? "bg-[#0B1120]/80 border border-white/15 text-[#CBD5E1] hover:text-white backdrop-blur-md"
                  : "bg-[#84CC16] text-black hover:bg-[#9BE329] shadow-[0_12px_34px_-8px_rgba(132,204,22,0.7)]"
              }`}
            >
              {paid ? <RotateCcw className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              <span>{paid ? "Reset demo" : "Simulate a PayPal payment"}</span>
            </button>
          </div>
        </div>
      </section>

      <AsciiRule />

      <div data-flow="0.75" className="h-0" aria-hidden="true" />

      {/* ── 5. Ask it anything (typed queries) ── */}
      <section id="assistant" ref={askRef} className="relative z-10 py-24 px-6 max-w-4xl mx-auto space-y-10 scroll-mt-20">
        <SectionHeading
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

        <Spot data-flow="0.15" className="p-6 sm:p-8 rounded-3xl panel space-y-5 card-sheen">
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
      <section data-flow="0.6" id="how-it-works" className="relative z-10 py-24 px-6 max-w-6xl mx-auto space-y-14 scroll-mt-20">
        <SectionHeading
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
                  <div className="text-xs font-mono text-[#84CC16]/80 tracking-[0.25em]">STEP {step.n}</div>
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
      <section data-flow="0" className="relative z-10 isolate overflow-hidden px-6 pt-36 pb-44">
        {/* Sunrise ASCII: bookends the hero */}
        <div className="absolute inset-0 -z-10 opacity-60" aria-hidden="true">
          <GradientASCII
            colors={["#080B14", "#052E16", "#15803D", "#A3E635"]}
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
      <footer data-flow="0" className="relative z-10 overflow-hidden pt-12 px-6 border-t border-white/[0.08] text-sm text-[#94A3B8]">
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
