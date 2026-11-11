"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Bot,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileText,
  BellRing,
  ExternalLink,
} from "lucide-react";

export default function AppShell() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    setIsCheckingHealth(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealthStatus(data);
    } catch (err) {
      setHealthStatus({ ok: false, error: String(err) });
    } finally {
      setIsCheckingHealth(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
            $
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-white">Get Paid</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Autonomous AR Agent
              </span>
            </div>
            <p className="text-xs text-slate-400">Powered by PayPal Invoicing v2 & Agentic Automation</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Health Badge */}
          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            title="Click to re-check system health"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              healthStatus?.ok
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40"
                : "bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? "animate-spin" : ""}`} />
            <span>
              {healthStatus?.ok
                ? `System Healthy • PayPal ${healthStatus?.details?.paypalMode === "LIVE_SANDBOX_TOKEN" ? "Live Sandbox" : "Sandbox Simulator"}`
                : "Checking System..."}
            </span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Autonomous Mode: <strong className="text-slate-200">Active</strong></span>
          </div>
        </div>
      </header>

      {/* Main 3-Column Workplane */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: AI Copilot & Compose Panel (Cols 1-4) */}
        <section className="lg:col-span-4 border-r border-slate-800/80 bg-slate-900/30 flex flex-col p-5 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-sm text-slate-200">AR Copilot & Invoicing</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Stage 1 Foundation
            </span>
          </div>

          {/* Assistant Context Pitch */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-blue-950/30 to-indigo-950/20 border border-blue-500/20 mb-5">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-slate-300">
                <strong className="text-white block mb-1">Never chase an invoice manually again.</strong>
                Paste any unstructured client email, Slack, or WhatsApp message. The copilot extracts the scope, verifies with you, creates a PayPal invoice, and autonomously chases payment on an escalating schedule.
              </div>
            </div>
          </div>

          {/* Quick Demo Prompts */}
          <div className="mb-4">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Sample Inbound Messages
            </label>
            <div className="space-y-2">
              <button className="w-full text-left p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 transition flex items-center justify-between group">
                <span className="truncate">"Sarah Chen: Go ahead with the logo + 3 banners, $500."</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition shrink-0 ml-2" />
              </button>
              <button className="w-full text-left p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 transition flex items-center justify-between group">
                <span className="truncate">"David: Approved Q3 Security Audit ($1800). Bill me."</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 flex flex-col justify-end space-y-3">
            <div className="relative">
              <textarea
                placeholder="Paste client message, email agreement, or ask 'who still owes me?'..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition"
              />
              <div className="absolute right-2 bottom-2">
                <button className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition">
                  <Send className="w-3 h-3" />
                  <span>Scope Bill</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Input is treated as data, not instructions. Prompt injection guardrails active.
            </p>
          </div>
        </section>

        {/* Center Column: Invoice List & Financial Health (Cols 5-9) */}
        <section className="lg:col-span-5 p-6 flex flex-col overflow-y-auto border-r border-slate-800/80">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Total Outstanding</span>
              <div className="text-xl font-bold text-white tracking-tight">$5,300.00</div>
              <span className="text-[10px] text-amber-400 font-medium">2 Active Receivables</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Overdue (Chasing)</span>
              <div className="text-xl font-bold text-rose-400 tracking-tight">$5,300.00</div>
              <span className="text-[10px] text-rose-300 font-medium">Escalating Tones 1 & 2</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Collected (Month)</span>
              <div className="text-xl font-bold text-emerald-400 tracking-tight">$1,200.00</div>
              <span className="text-[10px] text-emerald-300 font-medium">100% On-Time</span>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-sm text-slate-200">Active Invoices</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium">All</button>
              <button className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-200">Sent</button>
              <button className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-200">Paid</button>
            </div>
          </div>

          {/* Invoice Cards */}
          <div className="space-y-3">
            {/* Invoice 1: Acme Corp */}
            <div className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">Sarah Chen</span>
                    <span className="text-xs text-slate-400">• Acme Corporation</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">INV-2024-001</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-white">$3,500.00 USD</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    SENT • 6d OVERDUE
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-3">Q3 Design System & Mobile App Redesign</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Level 1: Friendly Check-in Sent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">PayPal: INV2-DEMO-ACME</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Invoice 2: Fintech Labs */}
            <div className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-rose-900/30 transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">David Miller</span>
                    <span className="text-xs text-slate-400">• Fintech Labs Inc</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">INV-2024-002</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-white">$1,800.00 USD</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    SENT • 15d OVERDUE
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-3">API Security Audit & Penetration Testing Report</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Level 2: Neutral Overdue Notice (Work Paused)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">PayPal: INV2-DEMO-FINTECH</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Invoice 3: HyperGrowth */}
            <div className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">Elena Rostova</span>
                    <span className="text-xs text-slate-400">• HyperGrowth Media</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">INV-2024-003</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-white">$1,200.00 USD</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PAID
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-3">Brand Identity, Pitch Deck & Investor Presentation</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Settled via PayPal Webhook • Thank-you logged</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">PayPal: INV2-DEMO-HYPER</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Autonomous Activity Feed (Cols 10-12) */}
        <section className="lg:col-span-3 p-5 flex flex-col bg-slate-900/20 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-sm text-slate-200">Autonomous Activity Feed</h3>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Live Audit</span>
          </div>

          {/* Activity items */}
          <div className="space-y-4">
            <div className="relative pl-5 border-l-2 border-emerald-500/40">
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-emerald-400"></div>
              <span className="text-[10px] text-slate-400 block">2 days ago • Webhook</span>
              <p className="text-xs font-medium text-slate-200">Payment Verified: $1,200.00</p>
              <p className="text-[11px] text-slate-400 mt-0.5">HyperGrowth Media settled invoice INV-2024-003.</p>
            </div>

            <div className="relative pl-5 border-l-2 border-amber-500/40">
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-amber-400"></div>
              <span className="text-[10px] text-slate-400 block">4 days ago • Autonomous Escalation</span>
              <p className="text-xs font-medium text-slate-200">Level 2 Reminder Dispatched</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Fintech Labs 11d overdue. Notice delivered; deliverables paused.</p>
            </div>

            <div className="relative pl-5 border-l-2 border-blue-500/40">
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-400"></div>
              <span className="text-[10px] text-slate-400 block">2 days ago • Autonomous Escalation</span>
              <p className="text-xs font-medium text-slate-200">Level 1 Friendly Check-in</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Acme Corporation reached 4d overdue threshold.</p>
            </div>

            <div className="relative pl-5 border-l-2 border-slate-700">
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-slate-500"></div>
              <span className="text-[10px] text-slate-400 block">14 days ago • PayPal Invoicing</span>
              <p className="text-xs font-medium text-slate-200">Invoice Created & Sent</p>
              <p className="text-[11px] text-slate-400 mt-0.5">INV-2024-001 ($3,500.00) sent to sarah@acmecorp.com.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
