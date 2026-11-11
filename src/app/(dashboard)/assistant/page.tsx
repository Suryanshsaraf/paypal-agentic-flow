"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  FileText,
  Plus,
  ArrowRight,
  Loader2,
  Bot,
} from "lucide-react";
import { formatCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentOrb3D, AgentState } from "@/components/interactive/agent-orb-3d";
import { SpotlightCard } from "@/components/interactive/spotlight-card";
import { playSoftClick, playHarmonicSuccess } from "@/components/interactive/sound-effects";

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
    <div className="relative z-10 p-6 md:p-8 max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-control bg-accent-muted border border-accent/30 flex items-center justify-center text-accent">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">AI Financial Intelligence</h1>
            <p className="text-meta text-text-muted">
              Direct telemetry into your real transaction database.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6">
            {/* 3D Agent Core */}
            <div className="mb-2">
              <AgentOrb3D state={agentState} size={150} />
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-1 text-center">
              Autonomous Financial Telemetry
            </h2>
            <p className="text-meta text-text-muted text-center max-w-md mb-6">
              Ask questions about outstanding balances, client payments, and automated chases.
              The agent deterministically aggregates your actual accounts.
            </p>

            {/* Suggested Prompts with Spotlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
              {suggestedPrompts.map((prompt) => (
                <SpotlightCard
                  key={prompt}
                  onClick={() => handleSubmit(prompt)}
                  className="p-3 cursor-pointer group hover:border-accent/40 transition-colors"
                  spotlightColor="rgba(99, 102, 241, 0.15)"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-meta text-text-secondary group-hover:text-text-primary transition-colors">
                      {prompt}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0 group-hover:text-accent transition-colors" />
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-panel px-4 py-3 shadow-lg ${
                    msg.role === "user"
                      ? "bg-accent text-white"
                      : "bg-bg-elevated border border-border/80 text-text-primary"
                  }`}
                >
                  <p className="text-body whitespace-pre-line leading-relaxed">{msg.content}</p>
                  <span
                    className={`text-timestamp block mt-1.5 ${
                      msg.role === "user"
                        ? "text-white/60"
                        : "text-text-muted"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-bg-elevated border border-border rounded-panel px-4 py-3 flex items-center gap-3">
                  <AgentOrb3D state="thinking" size={32} />
                  <span className="text-meta text-text-muted">Querying ledger records…</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything ('Who still owes me?', 'How much did Acme pay?')..."
            rows={2}
            className="w-full bg-bg-elevated/90 backdrop-blur-md border border-border rounded-panel px-4 py-3 pr-16 text-body text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none transition"
          />
          <div className="absolute right-3 bottom-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSubmit()}
              disabled={isLoading || !input.trim()}
              icon={
                isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )
              }
            >
              Ask
            </Button>
          </div>
        </div>
        <p className="text-timestamp text-text-muted text-center mt-2">
          Strict deterministic engine. Enter to submit, Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
}
