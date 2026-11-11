"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Invoice } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { BarChart3, PieChart as PieIcon } from "lucide-react";

interface FinancialChartsProps {
  invoices: Invoice[];
}

export function FinancialCharts({ invoices }: FinancialChartsProps) {
  const [activeTab, setActiveTab] = useState<"client" | "distribution">("client");

  // Aggregate by Client
  const clientData = useMemo(() => {
    const map = new Map<string, { name: string; collected: number; outstanding: number }>();

    for (const inv of invoices) {
      const clientName = inv.client?.name || "Client";
      if (!map.has(clientName)) {
        map.set(clientName, { name: clientName, collected: 0, outstanding: 0 });
      }
      const entry = map.get(clientName)!;
      if (inv.status === "PAID") {
        entry.collected += inv.amountTotalCents / 100;
      } else if (inv.status === "SENT") {
        entry.outstanding += inv.amountTotalCents / 100;
      }
    }

    return Array.from(map.values());
  }, [invoices]);

  // Aggregate by Status Distribution
  const distributionData = useMemo(() => {
    let paidTotal = 0;
    let pendingTotal = 0;
    let overdueTotal = 0;
    const now = new Date();

    for (const inv of invoices) {
      const amt = inv.amountTotalCents / 100;
      if (inv.status === "PAID") {
        paidTotal += amt;
      } else if (inv.status === "SENT") {
        if (new Date(inv.dueDate) < now) {
          overdueTotal += amt;
        } else {
          pendingTotal += amt;
        }
      }
    }

    return [
      { name: "Collected", value: paidTotal, color: "#10B981" },
      { name: "On-Track", value: pendingTotal, color: "#6366F1" },
      { name: "Overdue", value: overdueTotal, color: "#F43F5E" },
    ].filter((d) => d.value > 0);
  }, [invoices]);

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-panel border border-border bg-bg-elevated p-3 shadow-xl text-meta space-y-1">
          <p className="font-semibold text-text-primary">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="flex items-center gap-2"
              style={{ color: entry.color || entry.fill }}
            >
              <span className="text-text-muted capitalize">{entry.name}:</span>
              <span className="font-bold tabular-nums">
                ${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card padding="md">
      {/* Header with Switcher */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-section text-text-primary">Receivables & Cash Flow</h3>
          <p className="text-timestamp text-text-muted">
            Live receivables distribution across clients & payment statuses
          </p>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-control bg-bg-interactive border border-border">
          <button
            onClick={() => setActiveTab("client")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-control text-meta transition-colors ${
              activeTab === "client"
                ? "bg-accent text-white font-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">By Client</span>
          </button>
          <button
            onClick={() => setActiveTab("distribution")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-control text-meta transition-colors ${
              activeTab === "distribution"
                ? "bg-accent text-white font-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Status Ratio</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {invoices.length === 0 ? (
          <div className="h-full flex items-center justify-center text-meta text-text-muted">
            No transaction records available to render analytics.
          </div>
        ) : activeTab === "client" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clientData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#202B3D" }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#202B3D" }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.03)" }} />
              <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outstanding" name="Outstanding" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-around">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3 pr-6">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-3 text-meta">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="block text-text-muted">{item.name}</span>
                    <span className="block font-bold text-text-primary tabular-nums">
                      ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
