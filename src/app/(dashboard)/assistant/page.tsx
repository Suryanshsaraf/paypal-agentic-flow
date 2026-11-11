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
} from "lucide-react";
import { formatCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.ok ? data.answer : data.error || "Something went wrong.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${err?.message || "Network error"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function clearConversation() {
    setMessages([]);
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-page-title text-text-primary">AI Assistant</h1>
          <p className="text-body text-text-muted mt-1">
            Ask anything about your finances. Natural language, real data.
          </p>
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="h-12 w-12 rounded-panel bg-accent-muted flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-section text-text-primary mb-2">
              Financial Intelligence
            </h2>
            <p className="text-meta text-text-muted text-center max-w-md mb-8">
              Ask questions about your invoices, clients, and payments. The agent
              queries your actual data — no hallucinations.
            </p>

            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSubmit(prompt)}
                  className="flex items-center justify-between gap-2 p-3 rounded-control bg-bg-elevated border border-border hover:bg-bg-interactive transition-colors text-left group"
                >
                  <span className="text-meta text-text-secondary group-hover:text-text-primary transition-colors">
                    {prompt}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0 group-hover:text-accent transition-colors" />
                </button>
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
                  className={`max-w-[80%] rounded-panel px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-accent text-white"
                      : "bg-bg-elevated border border-border"
                  }`}
                >
                  <p className="text-body whitespace-pre-line">{msg.content}</p>
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
                <div className="bg-bg-elevated border border-border rounded-panel px-4 py-3">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-meta">Querying your data…</span>
                  </div>
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
            placeholder="Ask about your finances…"
            rows={2}
            className="w-full bg-bg-elevated border border-border rounded-panel px-4 py-3 pr-14 text-body text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none transition"
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
              Send
            </Button>
          </div>
        </div>
        <p className="text-timestamp text-text-muted text-center mt-2">
          Queries your actual database. Enter to send, Shift+Enter for newline.
        </p>
      </div>
    </div>
  );
}
