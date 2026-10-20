"use client";

import React, { useState } from "react";
import { Bounty, SecurityAuditResult } from "@/lib/types";
import {
  GitPullRequest,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  DollarSign,
  CheckCircle,
  ExternalLink,
  Loader2,
  Code2,
  Users,
} from "lucide-react";

interface PRSubmissionPanelProps {
  bounty: Bounty;
  onAuditPR: (bountyId: string, prData: any) => Promise<any>;
  onMergeAndPay: (bountyId: string, prId: string) => Promise<any>;
  isAuditing: boolean;
  isPaying: boolean;
}

export const PRSubmissionPanel: React.FC<PRSubmissionPanelProps> = ({
  bounty,
  onAuditPR,
  onMergeAndPay,
  isAuditing,
  isPaying,
}) => {
  const [prTitle, setPrTitle] = useState(`fix: resolve #${bounty.issueNumber} memory leak`);
  const [contributorName, setContributorName] = useState("Alex Rivera");
  const [contributorEmail, setContributorEmail] = useState("alex.dev@sandbox.com");
  const [diffContent, setDiffContent] = useState(
    `diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -88,6 +88,10 @@ export function closeSession(sessionId: string) {
+  // Clean up references to prevent SSR memory leak
+  if (sessionCache.has(sessionId)) {
+    sessionCache.delete(sessionId);
+  }
+  global.gc?.();
`
  );

  const [activePr, setActivePr] = useState<any>(bounty.prs?.[0] || null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onAuditPR(bounty.id, {
      prTitle,
      contributorName,
      contributorEmail,
      diffContent,
    });
    if (result && result.pr) {
      setActivePr(result.pr);
    }
  };

  const handlePay = async (prId: string) => {
    const result = await onMergeAndPay(bounty.id, prId);
    if (result && result.pr) {
      setActivePr(result.pr);
    }
  };

  const latestAudit: SecurityAuditResult | undefined = activePr?.auditResult;
  const isPaid = activePr?.status === "MERGED" && activePr?.payoutResult;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl mb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              #{bounty.issueNumber}
            </span>
            <span className="text-sm font-semibold text-slate-400">{bounty.repo}</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1.5">{bounty.title}</h3>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Escrow Value</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">${bounty.amount}.00</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Issue Details & Failing Test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        <div>
          <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Issue Description</h4>
          <p className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
            {bounty.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {bounty.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase text-slate-400">Acceptance Test Suite</h4>
            <span className="text-[11px] text-amber-400 font-mono">Failing Criteria</span>
          </div>
          <pre className="text-[11px] font-mono text-amber-300 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 overflow-x-auto max-h-36">
            {bounty.failingTestCase || "// No automated test case supplied"}
          </pre>
        </div>
      </div>

      {/* PR Submission & Audit Section */}
      <div className="border-t border-slate-800 pt-6">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <GitPullRequest className="h-4 w-4 text-blue-400" />
          <span>Submit & Audit Pull Request (Gemini CodeGuard)</span>
        </h4>

        <form onSubmit={handleAudit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">PR Title</label>
              <input
                type="text"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Contributor Name</label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                PayPal Email (Payout Target)
              </label>
              <input
                type="email"
                value={contributorEmail}
                onChange={(e) => setContributorEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-400">
                Git Diff Content (Code to Audit)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Unified diff format</span>
            </div>
            <textarea
              rows={4}
              value={diffContent}
              onChange={(e) => setDiffContent(e.target.value)}
              className="w-full font-mono text-[11px] p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="submit"
              disabled={isAuditing}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition flex items-center space-x-2 disabled:opacity-50"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Gemini AST Scanning...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Run AI Security & Proof-of-Fix Audit</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Audit Report Card */}
        {latestAudit && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    latestAudit.score >= 80
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {latestAudit.score}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">Gemini AI Audit Verdict:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        latestAudit.verdict === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {latestAudit.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Threat Level:{" "}
                    <span
                      className={
                        latestAudit.threatLevel === "CRITICAL"
                          ? "text-rose-400 font-bold"
                          : "text-emerald-400 font-bold"
                      }
                    >
                      {latestAudit.threatLevel}
                    </span>{" "}
                    | Unit Tests:{" "}
                    <span className="text-slate-200">
                      {latestAudit.unitTestsPass ? "PASS" : "FAIL"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Button: Merge and Pay */}
              <div>
                {isPaid ? (
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="h-4 w-4" />
                    <span>Merged & Paid via PayPal</span>
                  </div>
                ) : latestAudit.verdict === "APPROVED" ? (
                  <button
                    onClick={() => handlePay(activePr.id)}
                    disabled={isPaying}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Disbursing via PayPal Payouts...</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4" />
                        <span>Auto-Merge & Disburse ${bounty.amount} Payout</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <ShieldAlert className="h-4 w-4" />
                    <span>PayPal Release Locked</span>
                  </div>
                )}
              </div>
            </div>

            {/* AST Analysis Text */}
            <p className="text-xs text-slate-300 mt-4 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {latestAudit.astAnalysisSummary}
            </p>

            {/* Split Breakdown if present */}
            {latestAudit.suggestedSplit && latestAudit.suggestedSplit.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">
                    Multi-Contributor Batch Split Proposal:
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {latestAudit.suggestedSplit.map((split, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="flex justify-between font-mono font-bold mb-1">
                        <span className="text-slate-200">{split.contributorEmail}</span>
                        <span className="text-emerald-400">
                          {split.percentage}% (${split.amount || (bounty.amount * split.percentage) / 100})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{split.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payout Result Receipt */}
            {activePr?.payoutResult && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>PayPal Payout Transaction Receipt</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500">Batch ID: </span>
                    <span className="text-white">{activePr.payoutResult.batchId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Transaction ID: </span>
                    <span className="text-emerald-400">{activePr.payoutResult.transactionId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Amount Disbursed: </span>
                    <span className="text-white font-bold">${bounty.amount}.00 USD</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
