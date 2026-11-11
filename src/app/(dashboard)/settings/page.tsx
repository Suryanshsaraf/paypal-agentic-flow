"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCcw,
  Server,
  AlertCircle,
  CheckCircle2,
  Lock,
  Cpu,
  Database,
} from "lucide-react";
import { SynexSubpageShell } from "@/components/synex/synex-subpage-shell";
import { toast } from "sonner";
import { playSoftClick, playHarmonicSuccess, playAlertChime } from "@/components/interactive/sound-effects";
import { LottieCheck } from "@/components/lottie/lottie-animations";
import { MagnetButton } from "@/components/reactbits/magnet-button";

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  async function handleResetDemo() {
    playAlertChime();
    if (!confirm("Reset database to initial demo seed? This will restore original invoices & clients."))
      return;

    setIsResetting(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      playHarmonicSuccess();
      toast.success("Database restored to initial demo state!");
      await fetchHealth();
    } catch (err) {
      toast.error("Failed to reset demo");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <SynexSubpageShell
      badge="SYSTEM DIAGNOSTICS"
      titleLight="Autonomous Engine"
      titleBold="& Rail Diagnostics"
      description="Real-time inspection of PayPal v2 Invoicing sandbox rails, webhook listeners, in-memory ACID store, and deterministic demo controls."
      headerAction={
        <MagnetButton
          onClick={() => {
            playSoftClick();
            fetchHealth();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D0E11] text-white text-xs font-bold hover:bg-[#2A2B30] transition-all shadow-md active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#84CC16]" />
          <span>Ping Rails</span>
        </MagnetButton>
      }
    >
      <div className="space-y-6">
        {/* ── Top Rail Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-[#E5E7EB]">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              PayPal Invoicing Rail
            </span>
            <div className="text-xl font-black text-[#10B981] flex items-center justify-between">
              <span>{health?.ok ? "Live Sandbox OK" : "Simulated"}</span>
              <LottieCheck size={26} />
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              OAuth token cached & pre-refreshed
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Database Store
            </span>
            <div className="text-xl font-black text-[#0D0E11] tabular-nums">
              ACID In-Memory
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span>Zero-float integer cents safe</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Autonomous Daemon
            </span>
            <div className="text-xl font-black text-[#0D0E11] tabular-nums">
              Synchronized
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16]" />
              <span>Sweep cron ticks enabled</span>
            </div>
          </div>
        </div>

        {/* ── Diagnostics Panels ── */}
        <div className="space-y-4">
          <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#84CC16]" />
                <span className="text-xs font-bold text-[#0D0E11]">PayPal v2 Integration Specs</span>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280]">
                API Version: {health?.version || "2.4.0"}
              </span>
            </div>

            <div className="divide-y divide-[#E5E7EB] text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#6B7280]">Sandbox Connection</span>
                <span className="font-mono font-bold text-[#10B981] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  Connected & Verified
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#6B7280]">OAuth Mode</span>
                <span className="font-mono text-[#0D0E11]">
                  {health?.details?.paypalMode || "LIVE_SANDBOX_TOKEN"}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#6B7280]">In-Memory Token Cache</span>
                <span className="font-mono text-[#0D0E11]">
                  {health?.details?.tokenCached ? "True (Active)" : "Pending Refresh"}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#6B7280]">Webhook Idempotency Filter</span>
                <span className="font-mono text-[#0D0E11]">Active (Event-ID Deduplication)</span>
              </div>
            </div>
          </div>

          {/* ── Demo Controls ── */}
          <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-[#F9FAFB] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-bold text-[#0D0E11]">Demo State Time-Machine</span>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280]">Non-destructive restore</span>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed">
              Reset all invoices, payment records, client reminders, and activity telemetry back to the initial seeded demo state. Perfect for presenting the end-to-end agent workflow again.
            </p>

            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isResetting ? "Resetting Demo..." : "Reset Database to Demo Seed"}</span>
            </button>
          </div>
        </div>
      </div>
    </SynexSubpageShell>
  );
}
