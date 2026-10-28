"use client";

import React, { useState } from "react";
import { Bot, Terminal, Play, Loader2, Sparkles, CheckCircle2, Layers } from "lucide-react";

export const AgentTerminal: React.FC = () => {
  const [prompt, setPrompt] = useState("Agent, initialize a $150 escrow order for Issue #104 using the PayPal Agent Toolkit.");
  const [isLoading, setIsLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState<any>(null);

  const handleRunAgent = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: activePrompt }),
      });
      const data = await res.json();
      if (data.agentDecision) {
        setAgentResponse(data.agentDecision);
      }
    } catch (err) {
      console.error("Error executing agent toolkit action:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Official PayPal Agent Toolkit Terminal
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                @paypal/agent-toolkit v1.11
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous AI agent invoking official PayPal SDK function-calling tools.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
            <Layers className="h-3 w-3 text-purple-400" />
            <span>47 Pre-Built PayPal Tools Active</span>
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 my-4">
        {[
          "Agent: Create $150 escrow order via create_order",
          "Agent: Audit disputes via list_disputes",
          "Agent: Check platform volume via get_merchant_insights",
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(item);
              handleRunAgent(item);
            }}
            className="text-[11px] px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition flex items-center space-x-1"
          >
            <Sparkles className="h-2.5 w-2.5 text-purple-400" />
            <span>{item}</span>
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Terminal className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Instruct the AI Agent to perform an action using PayPal Agent Toolkit..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        <button
          onClick={() => handleRunAgent()}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition shadow-lg shadow-purple-500/20 flex items-center space-x-1.5 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Invoking...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Execute Tool</span>
            </>
          )}
        </button>
      </div>

      {/* Agent Reasoning & Execution Card */}
      {agentResponse && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-purple-500/30 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-purple-300 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Agentic Tool Selection & Execution Result</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Provider: {agentResponse.executionResult?.toolkit_provider}
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div>
              <span className="text-slate-500">// AI MODEL REASONING:</span>
              <p className="text-slate-300 mt-0.5">{agentResponse.reasoning}</p>
            </div>

            <div>
              <span className="text-slate-500">// INVOKED PAYPAL AGENT TOOLKIT TOOL:</span>
              <p className="text-emerald-400 font-bold mt-0.5">
                {agentResponse.invokedTool}()
              </p>
            </div>

            <div>
              <span className="text-slate-500">// TOOL EXECUTION PAYLOAD:</span>
              <pre className="text-purple-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 mt-1 overflow-x-auto">
                {JSON.stringify(agentResponse.executionResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
