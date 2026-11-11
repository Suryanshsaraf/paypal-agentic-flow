"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCcw,
  FastForward,
  BellRing,
  CreditCard,
  Server,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Reset database to initial demo state? This cannot be undone."))
      return;
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      toast.success("Database reset to initial demo seed!");
      fetchHealth();
    } catch (err) {
      toast.error("Failed to reset demo");
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-page-title text-text-primary">Settings</h1>
        <p className="text-body text-text-muted mt-1">
          System configuration and demo controls.
        </p>
      </div>

      {/* ── PayPal Connection ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <h2 className="text-section text-text-primary">PayPal Connection</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchHealth}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Check
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-4 w-40 rounded" />
            <div className="skeleton h-4 w-60 rounded" />
          </div>
        ) : health ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border text-meta">
              <span className="text-text-muted">Status</span>
              <div className="flex items-center gap-2">
                {health.ok ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-success" />
                    <span className="text-success font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-danger" />
                    <span className="text-danger font-medium">Disconnected</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border text-meta">
              <span className="text-text-muted">Mode</span>
              <span className="text-text-secondary">
                {health.details?.paypalMode === "LIVE_SANDBOX_TOKEN"
                  ? "Live Sandbox"
                  : "Simulated Sandbox"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border text-meta">
              <span className="text-text-muted">Database</span>
              <Badge variant={health.db ? "success" : "danger"}>
                {health.db ? "Healthy" : "Error"}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border text-meta">
              <span className="text-text-muted">Token Cached</span>
              <span className="text-text-secondary">
                {health.details?.tokenCached ? "Yes" : "No"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 text-meta">
              <span className="text-text-muted">Version</span>
              <span className="text-text-secondary font-mono">{health.version}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-meta text-warning">
            <AlertCircle className="w-4 h-4" />
            <span>Unable to check health</span>
          </div>
        )}
      </Card>

      {/* ── Environment ── */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-text-muted" />
          <h2 className="text-section text-text-primary">Environment</h2>
        </div>
        <div className="space-y-2 text-meta">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-text-muted">Application URL</span>
            <span className="text-text-secondary font-mono">
              {health?.env?.appUrl || "localhost:3000"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-text-muted">Sandbox Mode</span>
            <span className="text-text-secondary">
              {health?.env?.sandbox ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-text-muted">Timestamp</span>
            <span className="text-text-secondary font-mono">
              {health?.timestamp
                ? new Date(health.timestamp).toLocaleString()
                : "—"}
            </span>
          </div>
        </div>
      </Card>

      {/* ── Demo Controls ── */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="w-5 h-5 text-warning" />
          <h2 className="text-section text-text-primary">Demo Controls</h2>
        </div>
        <p className="text-meta text-text-muted mb-4">
          Use these controls to test the autonomous agent&apos;s behavior. These
          actions modify the in-memory database.
        </p>
        <div className="space-y-3">
          <Button
            variant="danger"
            size="md"
            onClick={handleResetDemo}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="w-full"
          >
            Reset Demo Database
          </Button>
          <p className="text-timestamp text-text-muted text-center">
            Resets all invoices, clients, events, and reminders to the initial
            seed state.
          </p>
        </div>
      </Card>
    </div>
  );
}
