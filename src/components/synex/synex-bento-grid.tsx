"use client";

import React from "react";
import { Invoice, EventLog } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { SpotlightCard } from "@/components/interactive/spotlight-card";
import { CountUp } from "@/components/ui/count-up";
import { SynexEscalationLadder } from "./synex-escalation-ladder";
import { MoneyFlowStream } from "@/components/interactive/money-flow-stream";
import { FinancialCharts } from "@/components/dashboard/financial-charts";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  FileText,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { playSoftClick } from "@/components/interactive/sound-effects";

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

interface SynexBentoGridProps {
  stats: Stats | null;
  invoices: Invoice[];
  events: EventLog[];
  overdueInvoices: Invoice[];
  overdueCents: number;
}

export function SynexBentoGrid({
  stats,
  invoices,
  events,
  overdueInvoices,
  overdueCents,
}: SynexBentoGridProps) {
  const recentInvoices = invoices.slice(0, 6);
  const recentEvents = events.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* ── Row 1: KPI Bento Quad ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Receivables */}
        <SpotlightCard
          className="p-5"
          spotlightColor="rgba(245, 158, 11, 0.14)"
          borderColor="rgba(245, 158, 11, 0.4)"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-meta text-text-muted font-medium">Active Receivables</span>
            <div className="h-7 w-7 rounded-control bg-warning-muted flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-warning" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
            <CountUp
              end={(stats?.totalOutstandingCents || 0) / 100}
              prefix="$"
              decimals={2}
            />
          </div>
          <p className="text-timestamp text-text-muted mt-2 font-mono">
            {stats?.sentCount || 0} active invoice{stats?.sentCount !== 1 ? "s" : ""} pending settlement
          </p>
        </SpotlightCard>

        {/* Overdue Chasing */}
        <SpotlightCard
          className={`p-5 ${overdueInvoices.length > 0 ? "border-danger/40" : ""}`}
          spotlightColor="rgba(244, 63, 94, 0.15)"
          borderColor="rgba(244, 63, 94, 0.5)"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-meta text-text-muted font-medium">Overdue (Chasing)</span>
            <div className={`h-7 w-7 rounded-control flex items-center justify-center ${overdueInvoices.length > 0 ? "bg-danger-muted" : "bg-bg-interactive"}`}>
              <AlertTriangle className={`w-3.5 h-3.5 ${overdueInvoices.length > 0 ? "text-danger" : "text-text-muted"}`} />
            </div>
          </div>
          <div className={`text-3xl font-extrabold tracking-tight tabular-nums ${overdueInvoices.length > 0 ? "text-danger" : "text-white"}`}>
            <CountUp
              end={overdueCents / 100}
              prefix="$"
              decimals={2}
            />
          </div>
          <p className="text-timestamp text-text-muted mt-2 font-mono">
            {overdueInvoices.length} under escalation protocol
          </p>
        </SpotlightCard>

        {/* Collected Capital */}
        <SpotlightCard
          className="p-5"
          spotlightColor="rgba(16, 185, 129, 0.14)"
          borderColor="rgba(16, 185, 129, 0.4)"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-meta text-text-muted font-medium">Settled to Date</span>
            <div className="h-7 w-7 rounded-control bg-success-muted flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-success tracking-tight tabular-nums">
            <CountUp
              end={(stats?.totalPaidCents || 0) / 100}
              prefix="$"
              decimals={2}
            />
          </div>
          <p className="text-timestamp text-text-muted mt-2 font-mono">
            {stats?.paidCount || 0} invoice{stats?.paidCount !== 1 ? "s" : ""} settled via PayPal
          </p>
        </SpotlightCard>

        {/* Total Processed Volume */}
        <SpotlightCard
          className="p-5"
          spotlightColor="rgba(99, 102, 241, 0.14)"
          borderColor="rgba(129, 140, 248, 0.4)"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-meta text-text-muted font-medium">Total Lifetime Volume</span>
            <div className="h-7 w-7 rounded-control bg-accent-muted flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-accent" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
            <CountUp
              end={((stats?.totalOutstandingCents || 0) + (stats?.totalPaidCents || 0)) / 100}
              prefix="$"
              decimals={2}
            />
          </div>
          <p className="text-timestamp text-text-muted mt-2 font-mono">
            {stats?.totalInvoiceCount || 0} total invoices managed
          </p>
        </SpotlightCard>
      </div>

      {/* ── Row 2: Escalation Ladder & Live Telemetry Stream ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SynexEscalationLadder invoices={invoices} />
        </div>
        <div className="lg:col-span-5 flex flex-col justify-between">
          <MoneyFlowStream invoices={invoices} className="h-full" />
        </div>
      </div>

      {/* ── Row 3: Recharts Cash Flow Analytics ── */}
      <FinancialCharts invoices={invoices} />

      {/* ── Row 4: Recent Invoices & Live Streaming Ledger ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Invoices Table */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <h2 className="text-section text-text-primary">Live Invoice Ledger</h2>
            </div>
            <Link
              href="/invoices"
              onClick={() => playSoftClick()}
              className="text-meta text-accent hover:text-accent-hover transition-colors flex items-center gap-1 font-medium"
            >
              <span>Full Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <SpotlightCard padding="none" className="divide-y divide-border/60">
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-timestamp text-text-muted font-medium bg-bg-interactive/40">
              <span className="col-span-4">Client</span>
              <span className="col-span-2">Invoice</span>
              <span className="col-span-2 text-right">Amount</span>
              <span className="col-span-2 text-center">Due</span>
              <span className="col-span-2 text-right">Status</span>
            </div>

            {recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices?selected=${inv.id}`}
                onClick={() => playSoftClick()}
                className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-bg-interactive/70 transition-colors group"
              >
                <div className="col-span-4 min-w-0">
                  <span className="text-body text-text-primary font-semibold truncate block group-hover:text-accent transition-colors">
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
                <span className="col-span-2 text-body text-text-primary font-bold tabular-nums text-right">
                  {formatCents(inv.amountTotalCents, inv.currency)}
                </span>
                <span className="col-span-2 text-timestamp text-text-muted font-mono text-center">
                  {inv.dueDate}
                </span>
                <div className="col-span-2 flex justify-end">
                  <InvoiceStatusBadge status={inv.status} dueDate={inv.dueDate} />
                </div>
              </Link>
            ))}
          </SpotlightCard>
        </div>

        {/* Real-time Event Feed */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <h2 className="text-section text-text-primary">Autonomous Feed</h2>
            </div>
            <Link
              href="/activity"
              onClick={() => playSoftClick()}
              className="text-meta text-accent hover:text-accent-hover transition-colors flex items-center gap-1 font-medium"
            >
              <span>Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <SpotlightCard className="p-4 space-y-0">
            {recentEvents.map((evt, i) => {
              const isPaid = evt.eventType === "WEBHOOK_PAID" || evt.eventType === "THANKYOU_SENT";
              const isEscalation = evt.eventType === "ESCALATED_TO_HUMAN" || evt.eventType === "DISPUTE_FLAGGED";
              const isReminder = evt.eventType === "REMINDER_SENT";

              return (
                <div
                  key={evt.id}
                  className={`relative pl-4 py-2.5 ${
                    i < recentEvents.length - 1
                      ? "border-l border-border/80 ml-[3px]"
                      : "border-l border-transparent ml-[3px]"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-3.5 -translate-x-1/2 h-[7px] w-[7px] rounded-full ring-2 ring-bg-elevated ${
                      isPaid ? "bg-success" : isEscalation ? "bg-danger" : isReminder ? "bg-warning" : "bg-accent"
                    }`}
                  />
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-meta font-semibold text-text-primary truncate">
                      {evt.eventType.replace(/_/g, " ")}
                    </p>
                    <span className="text-timestamp font-mono text-text-muted shrink-0">
                      {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-timestamp text-text-muted truncate mt-0.5">
                    {evt.payload?.reason || evt.payload?.message || evt.payload?.invoiceNumber || "Autonomous event"}
                  </p>
                </div>
              );
            })}
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
