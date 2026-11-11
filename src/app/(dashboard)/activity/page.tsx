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
} from "lucide-react";
import { EventLog } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/* ── Event helpers ── */
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
      return `Level ${payload?.level || 1} (${payload?.tone}) reminder dispatched`;
    case "ESCALATED_TO_HUMAN":
      return "Chasing limits reached — escalated to human review";
    case "RESCHEDULED":
      return "Invoice rescheduled (time-machine simulation)";
    case "WEBHOOK_CANCELLED":
      return "Invoice cancelled via webhook";
    case "REPLY_RECEIVED":
      return `Client reply: ${payload?.classification || "received"}`;
    case "DISPUTE_FLAGGED":
      return "Dispute flagged by client";
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

function eventColorClasses(type: string) {
  if (type === "WEBHOOK_PAID" || type === "THANKYOU_SENT")
    return { dot: "bg-success", text: "text-success", bg: "bg-success-muted" };
  if (type === "ESCALATED_TO_HUMAN" || type === "DISPUTE_FLAGGED")
    return { dot: "bg-danger", text: "text-danger", bg: "bg-danger-muted" };
  if (type === "REMINDER_SENT")
    return { dot: "bg-warning", text: "text-warning", bg: "bg-warning-muted" };
  return { dot: "bg-accent", text: "text-accent", bg: "bg-accent-muted" };
}

function eventIcon(type: string) {
  if (type === "WEBHOOK_PAID" || type === "THANKYOU_SENT")
    return <CheckCircle2 className="w-4 h-4" />;
  if (type === "ESCALATED_TO_HUMAN" || type === "DISPUTE_FLAGGED")
    return <AlertTriangle className="w-4 h-4" />;
  if (type === "REMINDER_SENT") return <BellRing className="w-4 h-4" />;
  return <Zap className="w-4 h-4" />;
}

/* ── Group events by day ── */
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

  // Compute agent stats
  const reminderCount = events.filter((e) => e.eventType === "REMINDER_SENT").length;
  const paymentCount = events.filter((e) => e.eventType === "WEBHOOK_PAID").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">Agent Activity</h1>
          <p className="text-body text-text-muted mt-1">
            Your autonomous agent&apos;s complete operational ledger.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh
        </Button>
      </div>

      {/* ── Agent Command Center ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-control bg-success-muted flex items-center justify-center">
              <Wifi className="w-3 h-3 text-success" />
            </div>
            <span className="text-timestamp text-text-muted font-medium">Agent Status</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success agent-pulse" />
            <span className="text-body font-medium text-success">Online</span>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-control bg-accent-muted flex items-center justify-center">
              <Activity className="w-3 h-3 text-accent" />
            </div>
            <span className="text-timestamp text-text-muted font-medium">Monitoring</span>
          </div>
          <span className="text-body font-medium text-text-primary tabular-nums">
            {stats?.sentCount || 0} invoices
          </span>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-control bg-warning-muted flex items-center justify-center">
              <BellRing className="w-3 h-3 text-warning" />
            </div>
            <span className="text-timestamp text-text-muted font-medium">Reminders</span>
          </div>
          <span className="text-body font-medium text-text-primary tabular-nums">
            {reminderCount} dispatched
          </span>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-control bg-info-muted flex items-center justify-center">
              <Shield className="w-3 h-3 text-info" />
            </div>
            <span className="text-timestamp text-text-muted font-medium">PayPal</span>
          </div>
          <span className={`text-body font-medium ${health?.ok ? "text-success" : "text-warning"}`}>
            {health?.ok ? "Connected" : "Checking…"}
          </span>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-1 p-0.5 rounded-control bg-bg-secondary border border-border w-fit">
        {(["all", "payments", "reminders", "invoices", "escalations"] as EventCategory[]).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-control text-meta font-medium capitalize transition-colors ${
                filter === cat
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* ── Event Timeline ── */}
      {filteredEvents.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Activity className="w-10 h-10" />}
            title="No activity yet"
            description="Agent events will appear here as the system processes invoices."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([day, dayEvents]) => (
            <div key={day}>
              <h3 className="text-meta text-text-muted font-medium mb-3 sticky top-0 bg-bg-primary py-1 z-10">
                {day}
              </h3>
              <Card padding="none">
                <div className="divide-y divide-border">
                  {dayEvents.map((evt) => {
                    const colors = eventColorClasses(evt.eventType);
                    return (
                      <div
                        key={evt.id}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <div
                          className={`mt-0.5 h-7 w-7 shrink-0 rounded-control ${colors.bg} flex items-center justify-center ${colors.text}`}
                        >
                          {eventIcon(evt.eventType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-body font-medium ${colors.text}`}>
                            {eventLabel(evt.eventType, evt.payload)}
                          </p>
                          <p className="text-meta text-text-muted mt-0.5 truncate">
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
                    );
                  })}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
