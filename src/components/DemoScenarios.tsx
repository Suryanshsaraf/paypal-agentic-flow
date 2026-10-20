"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldAlert, Users, Play, Loader2, Sparkles, DollarSign } from "lucide-react";

interface DemoScenariosProps {
  onRunAuditAndPayout: (scenario: "HAPPY_PATH" | "BACKDOOR_ATTACK" | "MULTI_DEV_SPLIT") => Promise<void>;
  isLoading: boolean;
  activeScenario: string | null;
}

export const DemoScenarios: React.FC<DemoScenariosProps> = ({
  onRunAuditAndPayout,
  isLoading,
  activeScenario,
}) => {
  return (
    <div className="mb-12">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-bold text-white tracking-tight">
          Interactive Hackathon Live Demo Runner
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          1-Click Automated Flows
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Test the end-to-end PayPal Sandbox and Gemini AI pipelines with one click.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Scenario 1: Happy Path */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition flex flex-col justify-between group shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                SCENARIO 1: HAPPY PATH
              </span>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <h4 className="font-semibold text-slate-100 text-sm group-hover:text-emerald-300 transition">
              Verified Fix ➔ Instant PayPal Payout
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Submits a clean PR addressing Issue #104. Gemini verifies test cases pass, assigns 96/100 quality score, auto-merges, and triggers instant $150 PayPal Payout.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onRunAuditAndPayout("HAPPY_PATH")}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition disabled:opacity-50"
            >
              {isLoading && activeScenario === "HAPPY_PATH" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Auditing & Paying...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Run Happy Path ($150 Payout)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scenario 2: Backdoor Attack Interception */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 transition flex flex-col justify-between group shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                SCENARIO 2: DEFENSE SHIELD
              </span>
              <ShieldAlert className="h-5 w-5 text-rose-400" />
            </div>
            <h4 className="font-semibold text-slate-100 text-sm group-hover:text-rose-300 transition">
              XZ-Backdoor Attack Intercepted
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Simulates a malicious PR with obfuscated hex eval payload trying to harvest secrets. Gemini AST scans and blocks PR, locking the PayPal escrow.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onRunAuditAndPayout("BACKDOOR_ATTACK")}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-950 bg-rose-400 hover:bg-rose-300 transition disabled:opacity-50"
            >
              {isLoading && activeScenario === "BACKDOOR_ATTACK" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scanning Backdoor...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Test Backdoor Block</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scenario 3: Multi-Dev Split Payout */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition flex flex-col justify-between group shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                SCENARIO 3: BATCH PAYOUTS
              </span>
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="font-semibold text-slate-100 text-sm group-hover:text-blue-300 transition">
              AI Multi-Dev Split Payout
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              2 developers collaborate on an issue. Gemini analyzes AST diffs, calculates a 70% / 30% split, and executes simultaneous PayPal Batch Payouts.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onRunAuditAndPayout("MULTI_DEV_SPLIT")}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-blue-950 bg-blue-400 hover:bg-blue-300 transition disabled:opacity-50"
            >
              {isLoading && activeScenario === "MULTI_DEV_SPLIT" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Calculating Split...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Test Batch Split Payout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
