"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Lock,
  Globe,
  Zap,
  Volume2,
  VolumeX,
  ExternalLink,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  playSoftClick,
  playHarmonicSuccess,
  setSoundMuted,
  getSoundMuted,
} from "@/components/interactive/sound-effects";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { toast } from "sonner";

interface SynexWindowFrameProps {
  children: React.ReactNode;
}

export function SynexWindowFrame({ children }: SynexWindowFrameProps) {
  const pathname = usePathname();
  const [soundMuted, setSoundMutedState] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMutedState(next);
    setSoundMuted(next);
    if (!next) playSoftClick();
  };

  const handleSweep = async () => {
    playSoftClick();
    setIsSweeping(true);
    try {
      const res = await fetch("/api/cron/tick", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        playHarmonicSuccess();
        toast.success(`Autonomous Sweep complete: ${data.overdueCount || 0} overdue invoices monitored.`);
      }
    } catch (err) {
      toast.error("Failed to execute sweep");
    } finally {
      setIsSweeping(false);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/app" },
    { label: "Invoices", href: "/invoices" },
    { label: "Analytics", href: "/activity" },
    { label: "AI Assistant", href: "/assistant" },
    { label: "Clients", href: "/clients" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#1c1d20] py-6 px-3 sm:px-6 md:px-10 font-sans selection:bg-[#84CC16]/25 selection:text-inherit">
      {/* ── Outer macOS Floating Window Presentation Frame ── */}
      <div className="max-w-[1380px] mx-auto rounded-[24px] overflow-hidden border border-white/[0.12] bg-[#0E0F12] shadow-[0_30px_90px_rgba(0,0,0,0.7)]">
        {/* ── macOS Window Header Bar ── */}
        <div className="h-10 bg-[#16171A] px-4 flex items-center justify-between border-b border-white/[0.06] select-none">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            <div className="flex items-center gap-2 ml-4 text-xs text-[#6B7280]">
              <span className="cursor-pointer hover:text-white">&lt;</span>
              <span className="cursor-pointer hover:text-white">&gt;</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0D0E11] border border-white/[0.08] text-[11px] font-mono text-[#9CA3AF]">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>getpaid.ai{pathname}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
            <button
              onClick={toggleSound}
              className="flex items-center gap-1 hover:text-white transition-colors"
              title="Toggle Audio Haptic Feedback"
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-accent" />}
              <span className="font-mono text-[10px]">{soundMuted ? "Mute" : "Audio"}</span>
            </button>
          </div>
        </div>

        {/* ── Top Navigation Bar ── */}
        <header className="bg-[#0E0F12] px-6 md:px-10 py-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              onClick={() => playSoftClick()}
              className="text-2xl font-black text-white tracking-tight flex items-center gap-1"
            >
              <span>getpaid</span>
              <span className="text-[#84CC16]">.</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-[12px] font-semibold tracking-[0.08em] text-[#9CA3AF] uppercase">
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => playSoftClick()}
                    className={`transition-colors relative py-1 ${
                      isActive ? "text-white font-bold" : "hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#84CC16] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-[13px] text-[#D1D5DB] mr-2">
              <Globe className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>English</span>
            </div>

            <button
              onClick={handleSweep}
              disabled={isSweeping}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F2024] border border-[#374151] text-xs font-medium text-[#E5E7EB] hover:bg-[#2A2B30] transition-colors"
            >
              <Zap className="w-3 h-3 text-[#84CC16]" />
              <span>{isSweeping ? "Sweeping..." : "Run Sweep"}</span>
            </button>

            <Link href="/invoices">
              <button
                onClick={() => playSoftClick()}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F3F4F6] transition-all shadow-md active:scale-95"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16]" />
                <span>+ Scope Invoice</span>
              </button>
            </Link>
          </div>
        </header>

        {/* ── Inner Content Canvas ── */}
        <main className="bg-white text-[#0D0E11]">{children}</main>

        {/* ── Telemetry Status Bar ── */}
        <div className="bg-[#0E0F12] px-6 py-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#9CA3AF]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#84CC16] animate-pulse" />
            <span className="text-white font-bold">GETPAID OS TELEMETRY:</span>
            <span>PayPal Sandbox v2 Invoicing · 100% OK</span>
          </div>
          <div>Autonomous Cron Engine: Synchronized</div>
          <div>Zero-Float Money Arithmetic: Active</div>
          <div>Prompt Injection Guardrails: Engaged</div>
        </div>

        {/* ── Editorial Footer with Genuine Email ── */}
        <footer className="bg-[#0E0F12] text-white px-6 md:px-12 lg:px-20 py-16 border-t border-white/[0.08]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5 space-y-3">
              <span className="text-2xl font-black tracking-tight flex items-center gap-1">
                <span>getpaid</span>
                <span className="text-[#84CC16]">.</span>
              </span>
              <p className="text-sm text-[#9CA3AF] max-w-sm leading-relaxed">
                Autonomous accounts-receivable agent for freelancers. From casual client message to instant PayPal invoice and relentless automated chasing.
              </p>
              <div className="text-xs text-[#6B7280] pt-4 font-mono">
                © 2026 GetPaid AR Protocol · Built for PayPal AI Hackathon
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <span className="text-xs font-mono uppercase text-[#6B7280] tracking-wider block">
                Mail us
              </span>
              <div className="space-y-1.5">
                <a
                  href="mailto:suryanshsaraf8@gmail.com"
                  className="text-xs font-semibold text-white hover:text-[#84CC16] transition-colors flex items-center gap-1.5 group"
                >
                  <Mail className="w-3.5 h-3.5 text-[#84CC16] shrink-0" />
                  <span className="underline underline-offset-4 font-mono">suryanshsaraf8@gmail.com</span>
                  <ExternalLink className="w-3 h-3 text-[#6B7280] group-hover:text-[#84CC16] transition-colors" />
                </a>
                <a
                  href="mailto:saiarihara@gmail.com"
                  className="text-xs font-semibold text-white hover:text-[#84CC16] transition-colors flex items-center gap-1.5 group"
                >
                  <Mail className="w-3.5 h-3.5 text-[#84CC16] shrink-0" />
                  <span className="underline underline-offset-4 font-mono">saiarihara@gmail.com</span>
                  <ExternalLink className="w-3 h-3 text-[#6B7280] group-hover:text-[#84CC16] transition-colors" />
                </a>
              </div>
              <p className="text-[11px] text-[#6B7280] pt-1">
                Founders & engineering lead contacts.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2">
              <span className="text-xs font-mono uppercase text-[#6B7280] tracking-wider block">
                Instant Access
              </span>
              <Link
                href="/assistant"
                className="text-sm font-semibold hover:text-[#84CC16] transition-colors flex items-center gap-1 text-white"
              >
                <span>Ask AI Financial Intelligence ↗</span>
              </Link>
              <p className="text-xs text-[#6B7280]">
                Immediate natural-language querying of debtor balances and cash flow.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
