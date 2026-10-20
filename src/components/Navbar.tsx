"use client";

import React from "react";
import { ShieldCheck, RefreshCw, Settings, GitPullRequest, ExternalLink, Cpu } from "lucide-react";

interface NavbarProps {
  onResetData: () => void;
  onOpenSettings: () => void;
  onOpenArch: () => void;
  isResetting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onResetData,
  onOpenSettings,
  onOpenArch,
  isResetting = false,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-400 p-[2px] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">GitBounty</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                AI Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous Bug Escrow & Instant PayPal Payouts
            </p>
          </div>
        </div>

        {/* Live Badges */}
        <div className="hidden md:flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PayPal Sandbox Active</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cpu className="h-3.5 w-3.5" />
            <span>Gemini 1.5 Security Audit</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenArch}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
            title="View Architecture & Sponsor Integrations"
          >
            <GitPullRequest className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Architecture</span>
          </button>

          <button
            onClick={onResetData}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
            title="Reset Store to Initial Demo State"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${isResetting ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
            title="Configure Live PayPal or Gemini Keys"
          >
            <Settings className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">Keys</span>
          </button>

          <a
            href="https://github.com/Suryanshsaraf/paypal-agentic-flow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-sm shadow-blue-500/30"
          >
            <span>GitHub</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </header>
  );
};
