"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Clock,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentOrb3D, AgentState } from "@/components/interactive/agent-orb-3d";
import {
  playSoftClick,
  playHarmonicSuccess,
  setSoundMuted,
  getSoundMuted,
} from "@/components/interactive/sound-effects";
import { toast } from "sonner";
import Link from "next/link";

interface SynexHeroProps {
  onTriggerSweep: () => Promise<void>;
  isSweeping: boolean;
  agentState: AgentState;
  setAgentState: (state: AgentState) => void;
}

export function SynexHero({
  onTriggerSweep,
  isSweeping,
  agentState,
  setAgentState,
}: SynexHeroProps) {
  const [soundMuted, setSoundMutedState] = useState(false);
  const [countdown, setCountdown] = useState(38);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 40 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMutedState(next);
    setSoundMuted(next);
    if (!next) playSoftClick();
  };

  return (
    <div className="relative overflow-hidden rounded-panel border border-border/80 bg-gradient-to-b from-bg-elevated via-bg-secondary/90 to-bg-primary p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Background Radial Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-accent/15 blur-[120px] opacity-70"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-bg-interactive/80 border border-white/[0.1] text-timestamp font-mono text-text-primary backdrop-blur-md shadow-inner">
            <span className="h-2 w-2 rounded-full bg-success agent-pulse" />
            <span className="text-text-muted">SYNEX PROTOCOL</span>
            <span className="text-white font-semibold">•</span>
            <span className="text-accent font-semibold">AUTONOMOUS AR ENGINE</span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1]">
            Next-Gen Autonomous <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-accent">
              Accounts Receivable.
            </span>
          </h1>

          {/* Editorial Subhead */}
          <p className="text-body md:text-base text-text-secondary max-w-xl leading-relaxed">
            Eliminate awkward debtor chasing. Our autonomous agent extracts project scopes from informal client chat,
            dispatches PayPal invoices, verifies webhook settlements, and escalates reminders on autopilot.
          </p>

          {/* Action Deck */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Link href="/invoices">
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles className="w-4 h-4 text-white" />}
                className="shadow-glow"
              >
                Create & Scope Invoice
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="lg"
              onClick={onTriggerSweep}
              loading={isSweeping}
              icon={<Zap className="w-4 h-4 text-accent" />}
            >
              Run Chasing Sweep
            </Button>

            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 px-3 py-2 rounded-control bg-bg-interactive hover:bg-bg-elevated border border-border text-meta text-text-muted hover:text-text-primary transition-colors"
              title={soundMuted ? "Unmute UI Audio" : "Mute UI Audio"}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-accent" />}
              <span className="text-timestamp font-mono">{soundMuted ? "Audio Off" : "Audio On"}</span>
            </button>
          </div>

          {/* Telemetry Micro-Bar */}
          <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-timestamp font-mono text-text-muted border-t border-border/50">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              PayPal Sandbox: <strong className="text-text-secondary">v2 Invoicing</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-accent" />
              Next sweep: <strong className="text-text-secondary">00:{countdown < 10 ? `0${countdown}` : countdown}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              Latency: <strong className="text-text-secondary">p95 &lt; 1ms</strong>
            </span>
          </div>
        </div>

        {/* Right Column: 3D Holographic Visualizer with Floating Glass Chips */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="relative w-[320px] h-[320px] flex items-center justify-center">
            {/* 3D WebGL Orb */}
            <div
              className="cursor-pointer group"
              onClick={() => {
                playSoftClick();
                setAgentState(agentState === "idle" ? "thinking" : agentState === "thinking" ? "chasing" : agentState === "chasing" ? "settled" : "idle");
              }}
              title="Click to cycle Agent Core telemetry state"
            >
              <AgentOrb3D state={agentState} size={230} />
            </div>

            {/* Floating Glass Chip 1: Settled (Top-Left) */}
            <div className="absolute top-2 -left-4 p-2 rounded-control bg-bg-elevated/80 border border-success/30 backdrop-blur-md shadow-xl text-meta flex items-center gap-2 animate-in fade-in slide-in-from-left duration-300">
              <span className="h-5 w-5 rounded-full bg-success-muted flex items-center justify-center text-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-[10px] text-text-muted block leading-none">Auto-Settled</span>
                <span className="font-bold text-success text-[11px] tabular-nums">$1,200.00 • HyperGrowth</span>
              </div>
            </div>

            {/* Floating Glass Chip 2: Scoped Draft (Top-Right) */}
            <div className="absolute top-4 -right-4 p-2 rounded-control bg-bg-elevated/80 border border-accent/30 backdrop-blur-md shadow-xl text-meta flex items-center gap-2 animate-in fade-in slide-in-from-right duration-300">
              <span className="h-5 w-5 rounded-full bg-accent-muted flex items-center justify-center text-accent">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-[10px] text-text-muted block leading-none">Scoped Proposal</span>
                <span className="font-bold text-text-primary text-[11px] tabular-nums">$3,500.00 • Net-7</span>
              </div>
            </div>

            {/* Floating Glass Chip 3: Escalation Tier 2 (Bottom-Left) */}
            <div className="absolute bottom-4 -left-6 p-2 rounded-control bg-bg-elevated/80 border border-warning/30 backdrop-blur-md shadow-xl text-meta flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
              <span className="h-5 w-5 rounded-full bg-warning-muted flex items-center justify-center text-warning">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-[10px] text-text-muted block leading-none">Level 2 Escalated</span>
                <span className="font-bold text-warning text-[11px]">Sprint Paused • David M.</span>
              </div>
            </div>

            {/* Floating Glass Chip 4: Webhook Dedup (Bottom-Right) */}
            <div className="absolute bottom-2 -right-4 p-2 rounded-control bg-bg-elevated/80 border border-white/[0.1] backdrop-blur-md shadow-xl text-meta flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
              <span className="h-5 w-5 rounded-full bg-bg-interactive flex items-center justify-center text-info">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-[10px] text-text-muted block leading-none">Idempotent Rail</span>
                <span className="font-mono text-text-secondary text-[11px]">Deduplicated OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
