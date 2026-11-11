"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Invoice, EventLog } from "@/lib/types";
import { SynexHero } from "@/components/synex/synex-hero";
import { SynexBentoGrid } from "@/components/synex/synex-bento-grid";
import { AgentState } from "@/components/interactive/agent-orb-3d";
import { playSoftClick, playHarmonicSuccess } from "@/components/interactive/sound-effects";
import { toast } from "sonner";

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

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [isSweeping, setIsSweeping] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, invoicesRes, eventsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/invoices"),
        fetch("/api/events?limit=10"),
      ]);
      const [statsData, invoicesData, eventsData] = await Promise.all([
        statsRes.json(),
        invoicesRes.json(),
        eventsRes.json(),
      ]);

      if (statsData.ok) setStats(statsData.stats);
      if (invoicesData.ok) setInvoices(invoicesData.invoices || []);
      if (eventsData.ok) setEvents(eventsData.events || []);
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

  // Handle Manual Autonomous Sweep
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
        toast.success(`Autonomous Sweep: Checked ${data.overdueCount || 0} overdue accounts.`);
        await fetchData();
      }
    } catch (err) {
      setAgentState("idle");
    } finally {
      setIsSweeping(false);
      setTimeout(() => setAgentState("idle"), 2500);
    }
  };

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
      {/* ── Synex AI Fintech Editorial Hero ── */}
      <SynexHero
        onTriggerSweep={handleTriggerSweep}
        isSweeping={isSweeping}
        agentState={agentState}
        setAgentState={setAgentState}
      />

      {/* ── Synex Bento Grid System ── */}
      <SynexBentoGrid
        stats={stats}
        invoices={invoices}
        events={events}
        overdueInvoices={overdueInvoices}
        overdueCents={overdueCents}
      />
    </div>
  );
}
