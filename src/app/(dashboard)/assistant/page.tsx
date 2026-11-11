"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  ArrowRight,
  Loader2,
  Bot,
  Sparkles,
  Terminal,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { SynexSubpageShell } from "@/components/synex/synex-subpage-shell";
import { AgentOrb3D, AgentState } from "@/components/interactive/agent-orb-3d";
import { playSoftClick, playHarmonicSuccess } from "@/components/interactive/sound-effects";
import { LottieAgentRadar } from "@/components/lottie/lottie-animations";
import { MagnetButton } from "@/components/reactbits/magnet-button";
import { ShinyText } from "@/components/reactbits/shiny-text";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  "Who still owes me money?",
  "How much did I collect this month?",
  "Show me overdue invoices",
  "How much did Acme Corporation pay?",
  "What's my total outstanding?",
  "Which clients need follow-ups?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(text?: string) {
    const question = text || input;
    if (!question.trim()) return;

    playSoftClick();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setAgentState("thinking");

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      playHarmonicSuccess();
      setAgentState("settled");

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.ok ? data.answer : data.error || "Something went wrong.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setAgentState("idle");
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${err?.message || "Network error"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setAgentState("idle"), 2500);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function clearConversation() {
    playSoftClick();
    setMessages([]);
  }

  return (
    <SynexSubpageShell
      badge="FINANCIAL INTELLIGENCE"
      titleLight="Direct Autonomous"
      titleBold="Command Terminal"
      description="Deterministic real-time querying into your actual transaction accounts, overdue client balances, and payment recovery rates."
      headerAction={
        messages.length > 0 ? (
          <button
            onClick={clearConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-semibold text-[#0D0E11] transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Clear Terminal</span>
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col h-[680px]">
        {/* ── Chat Canvas ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-6 text-center">
              <div className="mb-4">
                <AgentOrb3D state={agentState} size={130} />
              </div>

              <div className="max-w-md space-y-2 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Deterministic Invariant Engine · Zero Hallucination</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0D0E11]">
                  Ask Your Accounts Receivable
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Query outstanding balances, client payments, and automated chases. The agent aggregates your database without float bugs.
                </p>
              </div>

              {/* Suggested Questions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSubmit(prompt)}
                    className="p-3 rounded-xl bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] text-left text-xs text-[#0D0E11] flex items-center justify-between gap-2 group transition-all"
                  >
                    <span className="group-hover:text-black font-medium">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#0D0E11] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#0D0E11] text-white"
                        : "bg-[#F9FAFB] border border-[#E5E7EB] text-[#0D0E11]"
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans font-normal">{msg.content}</div>
                    <span
                      className={`text-[10px] font-mono block mt-2 ${
                        msg.role === "user" ? "text-[#9CA3AF]" : "text-[#6B7280]"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3.5 flex items-center gap-3">
                    <AgentOrb3D state="thinking" size={28} />
                    <span className="text-xs text-[#6B7280] font-mono">
                      Querying minor-unit database records…
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Command Bar Input ── */}
        <div className="pt-3 border-t border-[#E5E7EB]">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything ('Who still owes me?', 'How much did Acme pay?')..."
              rows={2}
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 pr-20 text-xs text-[#0D0E11] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0D0E11] transition-all resize-none shadow-sm"
            />
            <div className="absolute right-3 bottom-3">
              <button
                onClick={() => handleSubmit()}
                disabled={isLoading || !input.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0D0E11] text-white text-xs font-bold hover:bg-[#2A2B30] disabled:opacity-50 transition-all shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Ask</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] mt-1.5 px-1 font-mono">
            <span>Press Enter to send · Shift+Enter for line break</span>
            <span>Zero-Float Safe</span>
          </div>
        </div>
      </div>
    </SynexSubpageShell>
  );
}
