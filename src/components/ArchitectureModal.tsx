"use client";

import React from "react";
import { X, Cpu, Layers, DollarSign, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">System Architecture & Sponsor Matrix</h3>
            <p className="text-[11px] text-slate-400">Autonomous Bug Escrow Protocol</p>
          </div>
        </div>

        {/* Architecture Flow Diagram */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 mb-6 overflow-x-auto">
          <p className="text-indigo-400 font-bold mb-2">// END-TO-END AGENTIC SETTLEMENT PIPELINE</p>
          <pre className="text-[11px] leading-relaxed text-slate-400">
{`[Maintainer / Sponsor]
       │
       ▼
1. PayPal Orders v2 API ───► Funds Bounty into Smart Escrow ($50-$200)
       │
       ▼
2. Contributor opens PR ────► GitHub Webhook / Diff Ingestion
       │
       ▼
3. Gemini 1.5 Flash AI  ───► AST Vulnerability & Proof-of-Fix Audit
       │
       ├─► [Threat Detected?] ──► 🚨 Block PR & Freeze PayPal Release (XZ-Shield)
       │
       └─► [Score >= 80 & Tests Pass?]
                 │
                 ▼
4. GitHub Merge API      ───► Automatic Pull Request Merge
                 │
                 ▼
5. PayPal Payouts v1 API ───► Instant Disbursement to Contributor Email
                 │            (Single recipient OR Multi-Contributor Batch Split)`}
          </pre>
        </div>

        {/* Sponsor Integration Grid */}
        <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">
          Hackathon Sponsor Tool Synergy
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center space-x-1.5 font-bold text-blue-400 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>PayPal Developer Platform</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Orders v2 for maintainer escrow funding, Payouts v1 for instant automated batch disbursement to developer email accounts.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-400 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>AG Grid (Sponsor)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              High-performance data grid for real-time bounty exploration, status sorting, quick filtering, and audit log analysis.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center space-x-1.5 font-bold text-amber-400 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Render (Sponsor)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero-config deployment via <code>render.yaml</code>, providing a 24/7 public hosted demo URL for judges.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center space-x-1.5 font-bold text-purple-400 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Postman (Sponsor)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Included Postman Collection (<code>/postman</code>) documenting PayPal Orders, Payouts, and Webhook API contracts.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
