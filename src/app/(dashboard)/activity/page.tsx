"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BellRing,
  Clock,
  Shield,
  Activity,
  Wifi,
  Filter,
  FileText,
  CreditCard,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { EventLog } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { SynexSubpageShell } from "@/components/synex/synex-subpage-shell";
import { playSoftClick, playHarmonicSuccess } from "@/components/interactive/sound-effects";
import { LottieCheck, LottieAgentRadar } from "@/components/lottie/lottie-animations";
import { DecryptedText } from "@/components/reactbits/decrypted-text";
import { MagnetButton } from "@/components/reactbits/magnet-button";

function eventLabel(type: string, payload: Record<string, any>): string {
  switch (type) {
    case "WEBHOOK_PAID":
      return `Payment received: ${formatCents(payload?.amountCents || 0)}`;
    case "THANKYOU_SENT":
      return "Autonomous thank-you note dispatched to client";
    case "INVOICE_CREATED":
      return `Invoice ${payload?.invoiceNumber || ""} scoped & created`;
    case "INVOICE_SENT":
      return `Invoice ${payload?.invoiceNumber || ""} dispatched via PayPal Rails`;
    case "REMINDER_SENT":
      return `Level ${payload?.level || 1} (${payload?.tone}) reminder delivered`;
    case "ESCALATED_TO_HUMAN":
      return "Chasing ceiling reached — escalated to human review";
    case "RESCHEDULED":
      return "Invoice rescheduled via Time-Machine simulation";
    case "WEBHOOK_CANCELLED":
      return "Invoice voided via PayPal webhook notification";
    case "REPLY_RECEIVED":
      return `Client message classified: "${payload?.classification || "inquiry"}"`;
    case "DISPUTE_FLAGGED":
      return "Dispute alert detected on transaction";
    default:
      return type.replace(/_/g, " ").toLowerCase();
  }
}

type EventCategory = "all" | "payments" | "reminders" | "invoices" | "escalations";

function eventCategory(type: string): EventCategory {
  if (type === "WEBHOOK_PAID" || type === "THANKYOU_SENT") return "payments";
  if (type === "REMINDER_SENT") return "reminders";
  if (type === "INVOICE_CREATED" || type === "INVOICE_SENT") return "invoices";
  if (type === "ESCALATED_TO_HUMAN" || type === "DISPUTE_FLAGGED" || type === "WEBHOOK_CANCELLED")
    return "escalations";
  return "all";
}

function eventStyles(type: string) {
  if (type === "WEBHOOK_PAID" || type === "THANKYOU_SENT")
    return {
      dot: "bg-[#10B981]",
      border: "border-emerald-200",
      badge: "bg-emerald-50 text-emerald-800",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />,
    };
  if (type === "ESCALATED_TO_HUMAN" || type === "DISPUTE_FLAGGED")
    return {
      dot: "bg-[#DC2626]",
      border: "border-rose-200",
      badge: "bg-rose-50 text-rose-800",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />,
    };
  if (type === "REMINDER_SENT")
    return {
      dot: "bg-[#F59E0B]",
      border: "border-amber-200",
      badge: "bg-amber-50 text-amber-800",
      icon: <BellRing className="w-3.5 h-3.5 text-[#F59E0B]" />,
    };
  return {
    dot: "bg-[#3B82F6]",
    border: "border-blue-200",
    badge: "bg-blue-50 text-blue-800",
    icon: <Zap className="w-3.5 h-3.5 text-[#3B82F6]" />,
  };
}

function groupByDay(events: EventLog[]): Map<string, EventLog[]> {
  const groups = new Map<string, EventLog[]>();
  for (const evt of events) {
    const day = new Date(evt.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(evt);
  }
  return groups;
}

export default function ActivityPage() {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventCategory>("all");
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, statsRes, healthRes] = await Promise.all([
        fetch("/api/events?limit=100"),
        fetch("/api/stats"),
        fetch("/api/health"),
      ]);
      const [eventsData, statsData, healthData] = await Promise.all([
        eventsRes.json(),
        statsRes.json(),
        healthRes.json(),
      ]);
      if (eventsData.ok) setEvents(eventsData.events || []);
      if (statsData.ok) setStats(statsData.stats);
      setHealth(healthData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((e) => eventCategory(e.eventType) === filter);

  const grouped = groupByDay(filteredEvents);

  const reminderCount = events.filter((e) => e.eventType === "REMINDER_SENT").length;
  const paymentCount = events.filter((e) => e.eventType === "WEBHOOK_PAID").length;

  return (
    <SynexSubpageShell
      badge="AUTONOMOUS TELEMETRY"
      titleLight="Continuous Operational"
      titleBold="Audit Ledger"
      description="Real-time chronological telemetry of every invoice scoped, PayPal webhook received, and escalating reminder dispatched by the GetPaid autonomous copilot."
      headerAction={
        <MagnetButton
          onClick={() => {
            playSoftClick();
            fetchData();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D0E11] text-white text-xs font-bold hover:bg-[#2A2B30] transition-all shadow-md active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#84CC16]" />
          <span>Refresh Ledger</span>
        </MagnetButton>
      }
    >
      <div className="space-y-6">
        {/* ── Top Telemetry KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pb-6 border-b border-[#E5E7EB]">
          <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-[#6B7280]">Agent Core</span>
              <LottieAgentRadar size={18} />
            </div>
            <div className="text-lg font-bold text-[#0D0E11] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#84CC16] animate-pulse" />
              <span>Online</span>
            </div>
            <span className="text-[10px] text-[#6B7280]">100% background uptime</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-[#6B7280]">Monitoring</span>
              <Activity className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>
            <div className="text-lg font-bold text-[#0D0E11] tabular-nums">
              {stats?.sentCount || 0} Invoices
            </div>
            <span className="text-[10px] text-[#6B7280]">Active Net-7 watch</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-[#6B7280]">Chased</span>
              <BellRing className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <div className="text-lg font-bold text-[#0D0E11] tabular-nums">
              {reminderCount} Reminders
            </div>
            <span className="text-[10px] text-[#6B7280]">Escalating cadence</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-[#6B7280]">Settled</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <div className="text-lg font-bold text-[#10B981] tabular-nums">
              {paymentCount} Payments
            </div>
            <span className="text-[10px] text-[#6B7280]">Webhook verified</span>
          </div>
        </div>

        {/* ── Category Filters ── */}
        <div className="flex items-center gap-1.5 bg-[#F3F4F6] p-1 rounded-xl w-fit">
          {(["all", "payments", "reminders", "invoices", "escalations"] as EventCategory[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => {
                  playSoftClick();
                  setFilter(cat);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === cat
                    ? "bg-white text-[#0D0E11] shadow-sm"
                    : "text-[#6B7280] hover:text-[#0D0E11]"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* ── Event Timeline Stream ── */}
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-2 border border-[#E5E7EB] rounded-2xl bg-[#F9FAFB]">
            <Activity className="w-8 h-8 text-[#9CA3AF] mx-auto stroke-1" />
            <div className="text-sm font-bold text-[#0D0E11]">No activity logged yet</div>
            <div className="text-xs text-[#6B7280]">
              Events will record automatically as invoices are scoped and chased.
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([day, dayEvents]) => (
              <div key={day} className="space-y-2.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280] flex items-center gap-2">
                  <span>{day}</span>
                  <span className="h-[1px] flex-1 bg-[#E5E7EB]" />
                </div>

                <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-[#E5E7EB]">
                  {dayEvents.map((evt) => {
                    const st = eventStyles(evt.eventType);
                    return (
                      <div
                        key={evt.id}
                        className="p-4 flex items-start gap-3.5 hover:bg-[#F9FAFB] transition-colors"
                      >
                        <div className="mt-0.5 p-1.5 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] shrink-0">
                          {st.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0D0E11]">
                              {eventLabel(evt.eventType, evt.payload)}
                            </span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${st.badge}`}>
                              {evt.eventType}
                            </span>
                          </div>

                          {(evt.payload?.reason || evt.payload?.message || evt.payload?.invoiceNumber) && (
                            <p className="text-xs text-[#6B7280] mt-0.5 font-sans">
                              {evt.payload?.reason || evt.payload?.message || `Ref: ${evt.payload?.invoiceNumber}`}
                            </p>
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-[#9CA3AF] shrink-0">
                          {new Date(evt.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SynexSubpageShell>
  );
}
