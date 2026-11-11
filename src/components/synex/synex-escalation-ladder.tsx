"use client";

import React, { useState } from "react";
import { Invoice } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { Shield, BellRing, AlertTriangle, AlertCircle, UserCheck, ArrowRight } from "lucide-react";
import { playSoftClick } from "@/components/interactive/sound-effects";

interface EscalationLadderProps {
  invoices: Invoice[];
  className?: string;
}

const tiers = [
  {
    level: 0,
    name: "On Track",
    tone: "Standard",
    desc: "Invoice sent via PayPal. Waiting on Net-7 terms.",
    color: "text-text-muted",
    bgColor: "bg-bg-interactive",
    borderColor: "border-border",
    badgeColor: "bg-bg-interactive text-text-muted",
    icon: BellRing,
  },
  {
    level: 1,
    name: "Level 1: Friendly",
    tone: "Polite Check-in",
    desc: "Due date passed (+1d). Gentle reminder sent via PayPal.",
    color: "text-info",
    bgColor: "bg-info-muted",
    borderColor: "border-info/30",
    badgeColor: "bg-info-muted text-info border-info/30",
    icon: BellRing,
  },
  {
    level: 2,
    name: "Level 2: Neutral",
    tone: "Work Paused",
    desc: "Overdue (+3d). Formal notice sent. Deliverables paused.",
    color: "text-warning",
    bgColor: "bg-warning-muted",
    borderColor: "border-warning/30",
    badgeColor: "bg-warning-muted text-warning border-warning/30",
    icon: AlertTriangle,
  },
  {
    level: 3,
    name: "Level 3: Firm",
    tone: "Final Notice",
    desc: "Overdue (+7d). Late fees accrued. Final payment demand.",
    color: "text-danger",
    bgColor: "bg-danger-muted",
    borderColor: "border-danger/30",
    badgeColor: "bg-danger-muted text-danger border-danger/30",
    icon: AlertCircle,
  },
  {
    level: 4,
    name: "Level 4: Human",
    tone: "Escalated to You",
    desc: "Autonomous limit reached. Flagged for manual review.",
    color: "text-purple-400",
    bgColor: "bg-purple-950/40",
    borderColor: "border-purple-500/40",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    icon: UserCheck,
  },
];

export function SynexEscalationLadder({ invoices, className = "" }: EscalationLadderProps) {
  const [selectedTier, setSelectedTier] = useState<number>(2);

  const getInvoicesForTier = (lvl: number) => {
    return invoices.filter((inv) => {
      if (lvl === 4) return inv.status === "NEEDS_REVIEW" || inv.reminderLevel >= 4;
      if (inv.status === "PAID") return false;
      return inv.reminderLevel === lvl;
    });
  };

  const activeTierObj = tiers[selectedTier];
  const invoicesInActiveTier = getInvoicesForTier(selectedTier);

  return (
    <div className={`p-5 rounded-panel border border-border/80 bg-bg-elevated/70 backdrop-blur-xl space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent agent-pulse" />
            <h3 className="text-section text-text-primary">Autonomous Escalation Ladder</h3>
          </div>
          <p className="text-timestamp text-text-muted mt-0.5">
            Progressive tone calibration protecting client relationships
          </p>
        </div>
        <span className="text-[11px] font-mono uppercase text-accent px-2 py-0.5 rounded bg-accent-muted border border-accent/20">
          Stage 4 Engine
        </span>
      </div>

      {/* Tier Steps (Interactive Visual Track) */}
      <div className="grid grid-cols-5 gap-1.5 p-1 rounded-control bg-bg-primary/60 border border-border">
        {tiers.map((t) => {
          const invs = getInvoicesForTier(t.level);
          const isSelected = selectedTier === t.level;
          return (
            <button
              key={t.level}
              onClick={() => {
                playSoftClick();
                setSelectedTier(t.level);
              }}
              className={`relative flex flex-col items-center py-2 px-1 rounded-control transition-all ${
                isSelected
                  ? `${t.bgColor} border ${t.borderColor} shadow-lg shadow-black/20`
                  : "hover:bg-bg-interactive text-text-muted"
              }`}
            >
              <span className={`text-[11px] font-bold ${isSelected ? t.color : "text-text-muted"}`}>
                L{t.level}
              </span>
              <span className="text-[10px] text-text-muted font-medium truncate max-w-full">
                {t.name.split(":")[1]?.trim() || t.name}
              </span>

              {/* Invoices present badge */}
              {invs.length > 0 && (
                <span
                  className={`mt-1 h-4 min-w-[16px] px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center ${
                    isSelected ? "bg-white text-black" : "bg-accent text-white"
                  }`}
                >
                  {invs.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tier Detail Card */}
      <div className={`p-4 rounded-control border ${activeTierObj.borderColor} ${activeTierObj.bgColor} space-y-2.5 transition-all`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <activeTierObj.icon className={`w-4 h-4 ${activeTierObj.color}`} />
            <span className={`text-meta font-bold ${activeTierObj.color}`}>
              {activeTierObj.name} ({activeTierObj.tone})
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeTierObj.badgeColor} font-mono`}>
            {invoicesInActiveTier.length} Invoice{invoicesInActiveTier.length !== 1 ? "s" : ""} Active
          </span>
        </div>

        <p className="text-body text-text-secondary leading-relaxed">
          {activeTierObj.desc}
        </p>

        {/* Invoices in this tier */}
        {invoicesInActiveTier.length > 0 ? (
          <div className="pt-2 border-t border-border/40 space-y-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted block">
              Currently Under This Protocol:
            </span>
            {invoicesInActiveTier.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-2 rounded bg-bg-primary/70 border border-border/60 text-meta"
              >
                <div className="min-w-0">
                  <span className="font-semibold text-text-primary block truncate">
                    {inv.client?.name || "Client"}
                  </span>
                  <span className="text-timestamp font-mono text-text-muted">
                    {inv.invoiceNumber} • Due {inv.dueDate}
                  </span>
                </div>
                <span className="font-bold tabular-nums text-text-primary">
                  {formatCents(inv.amountTotalCents)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-2 text-timestamp text-text-muted italic">
            No invoices currently escalated to this level.
          </div>
        )}
      </div>
    </div>
  );
}
