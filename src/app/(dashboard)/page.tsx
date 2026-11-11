"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  FileText,
  Zap,
  RefreshCw,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  BellRing,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Play,
} from "lucide-react";
import Link from "next/link";
import { Invoice, EventLog } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Badge, InvoiceStatusBadge } from "@/components/ui/badge";
import { CountUp } from "@/components/ui/count-up";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FinancialCharts } from "@/components/dashboard/financial-charts";
import { SpotlightCard } from "@/components/interactive/spotlight-card";
import { AgentOrb3D, AgentState } from "@/components/interactive/agent-orb-3d";
import { MoneyFlowStream } from "@/components/interactive/money-flow-stream";
import {
  playSoftClick,
  playHarmonicSuccess,
  playAlertChime,
  setSoundMuted,
  getSoundMuted,
} from "@/components/interactive/sound-effects";
import { fireFintechCelebration } from "@/components/interactive/confetti";
import { toast } from "sonner";

/* ── Types ── */
interface Stats {
  totalOutstandingCents: number;
  totalPaidCents: number;
  overdueCount: number;
  sentCount: number;
  paidCount: number;
  needsReviewCount: number;
  clientCount: number;
  totalInvoiceCount: number;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function eventLabel(type: string, payload: Record<string, any>): string {
  switch (type) {
    case "WEBHOOK_PAID":
      return `Payment received: ${formatCents(payload?.amountCents || 0)}`;
    case "THANKYOU_SENT":
      return "Thank-you note dispatched";
    case "INVOICE_CREATED":
      return `Invoice ${payload?.invoiceNumber || ""} created`;
    case "INVOICE_SENT":
      return `Invoice ${payload?.invoiceNumber || ""} sent via PayPal`;
    case "REMINDER_SENT":
      return `Level ${payload?.level || 1} (${payload?.tone}) reminder sent`;
    case "ESCALATED_TO_HUMAN":
      return "Escalated to human review";
    case "RESCHEDULED":
      return "Invoice rescheduled (time-machine)";
    case "WEBHOOK_CANCELLED":
      return "Invoice cancelled via webhook";
    case "REPLY_RECEIVED":
      return `Client reply: ${payload?.classification || "received"}`;
    case "DISPUTE_FLAGGED":
      return "Dispute flagged";
    default:
      return type.replace(/_/g, " ").toLowerCase();
  }
}

function eventColor(type: string): string {
  if (type === "WEBHOOK_PAID" || type === "THANKYOU_SENT") return "text-success";
  if (type === "ESCALATED_TO_HUMAN" || type === "DISPUTE_FLAGGED") return "text-danger";
  if (type === "REMINDER_SENT") return "text-warning";
  return "text-accent";
}

function eventDotColor(type: string): string {
  if (type === "WEBHOOK_PAID" || type === "THANKYOU_SENT") return "bg-success";
  if (type === "ESCALATED_TO_HUMAN" || type === "DISPUTE_FLAGGED") return "bg-danger";
  if (type === "REMINDER_SENT") return "bg-warning";
  return "bg-accent";
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);

  // Interactive 3D Agent State
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [isSweeping, setIsSweeping] = useState(false);
  const [soundMuted, setSoundMutedState] = useState(false);
  const [countdown, setCountdown] = useState(42);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, invoicesRes, eventsRes, healthRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/invoices"),
        fetch("/api/events?limit=8"),
        fetch("/api/health"),
      ]);
      const [statsData, invoicesData, eventsData, healthData] = await Promise.all([
        statsRes.json(),
        invoicesRes.json(),
        eventsRes.json(),
        healthRes.json(),
      ]);

      if (statsData.ok) setStats(statsData.stats);
      if (invoicesData.ok) setInvoices(invoicesData.invoices || []);
      if (eventsData.ok) setEvents(eventsData.events || []);
      setHealth(healthData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Countdown timer for next autonomous check
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMutedState(next);
    setSoundMuted(next);
    if (!next) playSoftClick();
  };

  // Trigger manual autonomous sweep
  const handleTriggerSweep = async () => {
    playSoftClick();
    setIsSweeping(true);
    setAgentState("thinking");
    try {
      const res = await fetch("/api/cron/tick", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setAgentState("settled");
        playHarmonicSuccess();
        toast.success(`Autonomous Sweep: Checked ${data.overdueCount || 0} overdue invoices`);
        await fetchData();
      }
    } catch (err) {
      setAgentState("idle");
    } finally {
      setIsSweeping(false);
      setTimeout(() => setAgentState("idle"), 2500);
    }
  };

  const recentInvoices = invoices.slice(0, 8);
  const recentEvents = events.slice(0, 8);

  const now = new Date();
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === "SENT" && new Date(inv.dueDate) < now
  );
  const overdueCents = overdueInvoices.reduce(
    (sum, inv) => sum + inv.amountTotalCents,
    0
  );

  return (
    <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Interactive Hero Command Deck ── */}
      <SpotlightCard
        className="p-6 md:p-8 border-accent/20 bg-gradient-to-br from-bg-elevated via-bg-secondary to-bg-interactive shadow-2xl"
        spotlightColor="rgba(99, 102, 241, 0.16)"
        borderColor="rgba(129, 140, 248, 0.4)"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent-muted border border-accent/30 text-timestamp font-mono text-accent">
              <span className="h-2 w-2 rounded-full bg-accent agent-pulse" />
              <span>AUTONOMOUS AGENT ACTIVE • PAYPAL v2 CONNECTED</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-accent">Alex</span>.
            </h1>

            <p className="text-body text-text-secondary leading-relaxed">
              Your accounts receivable are running entirely on autopilot. We monitor your PayPal webhooks,
              detect inbound approvals, and automatically escalate overdue follow-ups.
            </p>

            {/* Quick Actions & Live Ticker */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleTriggerSweep}
                loading={isSweeping}
                icon={<Zap className="w-3.5 h-3.5" />}
              >
                Run Autonomous Sweep
              </Button>

              <button
                onClick={toggleSound}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-bg-interactive hover:bg-bg-elevated border border-border text-meta text-text-muted hover:text-text-primary transition-colors"
                title={soundMuted ? "Unmute UI Audio" : "Mute UI Audio"}
              >
                {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-accent" />}
                <span className="text-timestamp font-mono">{soundMuted ? "Audio Off" : "Audio On"}</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-bg-primary/60 border border-border/80 text-timestamp font-mono text-text-muted">
                <Clock className="w-3 h-3 text-accent" />
                <span>Next cycle in 00:{countdown < 10 ? `0${countdown}` : countdown}</span>
              </div>
            </div>
          </div>

          {/* 3D Interactive Agent Orb */}
          <div className="flex flex-col items-center justify-center">
            <div
              className="cursor-pointer group relative"
              onClick={() => {
                playSoftClick();
                setAgentState((prev) => (prev === "idle" ? "thinking" : prev === "thinking" ? "chasing" : prev === "chasing" ? "settled" : "idle"));
              }}
              title="Click to cycle 3D Agent Core telemetry state"
            >
              <AgentOrb3D state={agentState} size={180} />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono text-text-muted bg-bg-primary/80 px-2 py-0.5 rounded border border-border/80 group-hover:border-accent transition-colors">
                State: <span className="text-accent uppercase font-bold">{agentState}</span>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* ── KPI Strip with Interactive Spotlight Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <Card><KpiSkeleton /></Card>
            <Card><KpiSkeleton /></Card>
            <Card><KpiSkeleton /></Card>
            <Card><KpiSkeleton /></Card>
          </>
        ) : stats ? (
          <>
            {/* Outstanding */}
            <SpotlightCard
              className="p-5"
              spotlightColor="rgba(245, 158, 11, 0.12)"
              borderColor="rgba(245, 158, 11, 0.4)"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-control bg-warning-muted flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-warning" />
                </div>
                <span className="text-meta text-text-muted font-medium">Outstanding</span>
              </div>
              <div className="text-figure-lg text-text-primary tabular-nums">
                <CountUp
                  end={stats.totalOutstandingCents / 100}
                  prefix="$"
                  decimals={2}
                />
              </div>
              <p className="text-timestamp text-text-muted mt-1">
                {stats.sentCount} invoice{stats.sentCount !== 1 ? "s" : ""} active
              </p>
            </SpotlightCard>

            {/* Overdue */}
            <SpotlightCard
              className={`p-5 ${overdueInvoices.length > 0 ? "border-danger/40" : ""}`}
              spotlightColor="rgba(244, 63, 94, 0.14)"
              borderColor="rgba(244, 63, 94, 0.5)"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-7 w-7 rounded-control flex items-center justify-center ${overdueInvoices.length > 0 ? "bg-danger-muted" : "bg-bg-interactive"}`}>
                  <AlertTriangle className={`w-3.5 h-3.5 ${overdueInvoices.length > 0 ? "text-danger" : "text-text-muted"}`} />
                </div>
                <span className="text-meta text-text-muted font-medium">Overdue</span>
              </div>
              <div className={`text-figure-lg tabular-nums ${overdueInvoices.length > 0 ? "text-danger" : "text-text-primary"}`}>
                <CountUp
                  end={overdueCents / 100}
                  prefix="$"
                  decimals={2}
                />
              </div>
              <p className="text-timestamp text-text-muted mt-1">
                {overdueInvoices.length} escalating follow-ups
              </p>
            </SpotlightCard>

            {/* Collected */}
            <SpotlightCard
              className="p-5"
              spotlightColor="rgba(16, 185, 129, 0.12)"
              borderColor="rgba(16, 185, 129, 0.4)"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-control bg-success-muted flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-success" />
                </div>
                <span className="text-meta text-text-muted font-medium">Collected</span>
              </div>
              <div className="text-figure-lg text-success tabular-nums">
                <CountUp
                  end={stats.totalPaidCents / 100}
                  prefix="$"
                  decimals={2}
                />
              </div>
              <p className="text-timestamp text-text-muted mt-1">
                {stats.paidCount} paid invoice{stats.paidCount !== 1 ? "s" : ""}
              </p>
            </SpotlightCard>

            {/* Total Invoiced */}
            <SpotlightCard
              className="p-5"
              spotlightColor="rgba(99, 102, 241, 0.12)"
              borderColor="rgba(129, 140, 248, 0.4)"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-control bg-accent-muted flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-meta text-text-muted font-medium">Total Invoiced</span>
              </div>
              <div className="text-figure-lg text-text-primary tabular-nums">
                <CountUp
                  end={(stats.totalOutstandingCents + stats.totalPaidCents) / 100}
                  prefix="$"
                  decimals={2}
                />
              </div>
              <p className="text-timestamp text-text-muted mt-1">
                {stats.totalInvoiceCount} total transactions
              </p>
            </SpotlightCard>
          </>
        ) : null}
      </div>

      {/* ── Live Money Flow Stream Canvas ── */}
      <MoneyFlowStream invoices={invoices} />

      {/* ── Financial Analytics Recharts ── */}
      <FinancialCharts invoices={invoices} />

      {/* ── Two Column: Recent Invoices + Agent Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-text-muted" />
              <h2 className="text-section text-text-primary">Recent Invoices</h2>
            </div>
            <Link
              href="/invoices"
              className="text-meta text-accent hover:text-accent-hover transition-colors"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <Card padding="none">
              <div className="divide-y divide-border">
                {[1, 2, 3, 4].map((i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </div>
            </Card>
          ) : recentInvoices.length === 0 ? (
            <Card>
              <EmptyState
                icon={<FileText className="w-10 h-10" />}
                title="No invoices yet"
                description="Create your first invoice by pasting a client message in the Assistant."
                action={
                  <Link href="/assistant">
                    <Button variant="primary" size="sm">
                      Open Assistant
                    </Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <SpotlightCard padding="none" className="divide-y divide-border">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-timestamp text-text-muted font-medium">
                <span className="col-span-3">Client</span>
                <span className="col-span-2">Invoice</span>
                <span className="col-span-3">Description</span>
                <span className="col-span-2 text-right">Amount</span>
                <span className="col-span-2 text-right">Status</span>
              </div>

              {recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices?selected=${inv.id}`}
                  onClick={() => playSoftClick()}
                  className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-bg-interactive transition-colors group"
                >
                  <div className="col-span-3 min-w-0">
                    <span className="text-body text-text-primary font-medium truncate block">
                      {inv.client?.name || "Client"}
                    </span>
                    {inv.client?.company && (
                      <span className="text-timestamp text-text-muted truncate block">
                        {inv.client.company}
                      </span>
                    )}
                  </div>
                  <span className="col-span-2 text-meta text-text-muted font-mono truncate">
                    {inv.invoiceNumber}
                  </span>
                  <span className="col-span-3 text-meta text-text-secondary truncate">
                    {inv.lineItems[0]?.description || "—"}
                  </span>
                  <span className="col-span-2 text-body text-text-primary font-semibold tabular-nums text-right">
                    {formatCents(inv.amountTotalCents, inv.currency)}
                  </span>
                  <div className="col-span-2 flex justify-end">
                    <InvoiceStatusBadge status={inv.status} dueDate={inv.dueDate} />
                  </div>
                </Link>
              ))}
            </SpotlightCard>
          )}
        </div>

        {/* Agent Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <h2 className="text-section text-text-primary">Agent Ledger</h2>
            </div>
            <Link
              href="/activity"
              className="text-meta text-accent hover:text-accent-hover transition-colors"
            >
              View all →
            </Link>
          </div>

          <SpotlightCard className="p-4">
            {recentEvents.length === 0 ? (
              <EmptyState
                icon={<Zap className="w-8 h-8" />}
                title="No activity yet"
                description="Agent actions will appear here."
              />
            ) : (
              <div className="space-y-0">
                {recentEvents.map((evt, i) => (
                  <div
                    key={evt.id}
                    className={`relative pl-5 py-2.5 ${
                      i < recentEvents.length - 1
                        ? "border-l border-border ml-[3px]"
                        : "border-l border-transparent ml-[3px]"
                    }`}
                  >
                    {/* Dot */}
                    <div
                      className={`absolute left-0 top-3.5 -translate-x-1/2 h-[7px] w-[7px] rounded-full ring-2 ring-bg-elevated ${eventDotColor(
                        evt.eventType
                      )}`}
                    />

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-meta font-medium ${eventColor(evt.eventType)}`}>
                          {eventLabel(evt.eventType, evt.payload)}
                        </p>
                        <p className="text-timestamp text-text-muted mt-0.5 truncate">
                          {evt.payload?.reason ||
                            evt.payload?.message ||
                            evt.payload?.invoiceNumber ||
                            ""}
                        </p>
                      </div>
                      <span className="text-timestamp text-text-muted whitespace-nowrap shrink-0">
                        {new Date(evt.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
