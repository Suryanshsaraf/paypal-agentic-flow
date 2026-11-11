"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Bot,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileText,
  BellRing,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  Loader2,
  Mail,
  Calendar,
  AlertCircle,
  CreditCard,
  History,
  FastForward,
  UserCheck,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { Invoice, Client, EventLog } from "@/lib/types";
import { formatCents, centsToDecimalString } from "@/lib/money";

export default function AppShell() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Live Invoices & Events
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "SENT" | "PAID">("ALL");
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Selected Invoice for Reminders Inspection
  const [inspectingInvoice, setInspectingInvoice] = useState<Invoice | null>(null);

  // Copilot Compose, Proposal & Query Answer
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [proposal, setProposal] = useState<any | null>(null);
  const [queryAnswer, setQueryAnswer] = useState<string | null>(null);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    refreshAll();
  }, []);

  async function checkHealth() {
    setIsCheckingHealth(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealthStatus(data);
    } catch (err) {
      setHealthStatus({ ok: false, error: String(err) });
    } finally {
      setIsCheckingHealth(false);
    }
  }

  async function refreshAll() {
    await Promise.all([fetchInvoices(), fetchEvents()]);
  }

  async function fetchInvoices() {
    setIsLoadingInvoices(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.ok && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
        if (inspectingInvoice) {
          const updated = data.invoices.find((i: Invoice) => i.id === inspectingInvoice.id);
          if (updated) setInspectingInvoice(updated);
        }
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setIsLoadingInvoices(false);
    }
  }

  async function fetchEvents() {
    try {
      const res = await fetch("/api/events?limit=30");
      const data = await res.json();
      if (data.ok && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  }

  // Handle Input Dispatch (Either Financial Query or Invoice Scoping)
  async function handleSubmitInput(overrideText?: string) {
    const text = overrideText || inputText;
    if (!text.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessBanner(null);
    setProposal(null);
    setQueryAnswer(null);

    const isQuestion =
      text.includes("?") ||
      text.toLowerCase().startsWith("who") ||
      text.toLowerCase().startsWith("how much") ||
      text.toLowerCase().startsWith("what");

    if (isQuestion) {
      try {
        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text }),
        });
        const data = await res.json();
        if (data.ok) {
          setQueryAnswer(data.answer);
        } else {
          setErrorMessage(data.error || "Query failed.");
        }
      } catch (err: any) {
        setErrorMessage(err?.message || "Network error.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Message Scoping
      try {
        const res = await fetch("/api/invoices/scope", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        if (!data.ok) {
          setErrorMessage(data.error || "Failed to scope message.");
          return;
        }
        setProposal(data.proposal);
      } catch (err: any) {
        setErrorMessage(err?.message || "Network error while scoping.");
      } finally {
        setIsProcessing(false);
      }
    }
  }

  // Handle Final Send via PayPal
  async function handleConfirmAndSend() {
    if (!proposal) return;
    if (!proposal.clientEmail || !proposal.clientEmail.includes("@")) {
      setErrorMessage("Please enter a valid client email to send the PayPal invoice.");
      return;
    }

    setIsSendingInvoice(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: proposal.clientName,
          clientEmail: proposal.clientEmail,
          dueDate: proposal.dueDate,
          currency: proposal.currency || "USD",
          lineItems: proposal.lineItems,
          sourceMessage: proposal.rawInput,
          notes: proposal.notes,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setErrorMessage(data.error || "Failed to create invoice.");
        return;
      }

      setSuccessBanner(`Invoice ${data.invoice.invoiceNumber} created & sent via PayPal (${data.paypal.id})!`);
      setProposal(null);
      setInputText("");
      await refreshAll();
    } catch (err: any) {
      setErrorMessage(err?.message || "Error submitting invoice.");
    } finally {
      setIsSendingInvoice(false);
    }
  }

  // Handle Demo Mark Paid
  async function handleMarkPaid(invoiceId: string) {
    setActiveActionId(invoiceId);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/demo/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await res.json();
      if (!data.ok) {
        setErrorMessage(data.error || "Failed to mark invoice as paid.");
        return;
      }

      setSuccessBanner(`Payment Settled! ${data.message}`);
      await refreshAll();
    } catch (err: any) {
      setErrorMessage(err?.message || "Error processing payment replay.");
    } finally {
      setActiveActionId(null);
    }
  }

  // Handle Simulate Overdue (Time Machine)
  async function handleSimulateOverdue(invoiceId: string) {
    setActiveActionId(invoiceId);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/demo/simulate-overdue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, autoChase: true }),
      });

      const data = await res.json();
      if (!data.ok) {
        setErrorMessage(data.error || "Failed to simulate overdue.");
        return;
      }

      setSuccessBanner(`Time Machine: Invoice backdated! Autonomous agent escalated reminder.`);
      await refreshAll();
    } catch (err: any) {
      setErrorMessage(err?.message || "Error simulating overdue.");
    } finally {
      setActiveActionId(null);
    }
  }

  // Handle Remind Now Manual Trigger
  async function handleRemindNow(invoiceId: string) {
    setActiveActionId(invoiceId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Manual user trigger" }),
      });

      const data = await res.json();
      if (!data.ok) {
        setErrorMessage(data.error || "Failed to dispatch reminder.");
        return;
      }

      if (data.escalatedToHuman) {
        setSuccessBanner("Agent limits reached (Level 3 passed). Invoice escalated to human review.");
      } else {
        setSuccessBanner(`Reminder Level ${data.reminder.level} (${data.reminder.tone}) sent via PayPal!`);
      }
      await refreshAll();
    } catch (err: any) {
      setErrorMessage(err?.message || "Error triggering reminder.");
    } finally {
      setActiveActionId(null);
    }
  }

  // Demo Reset
  async function handleResetDemo() {
    if (!confirm("Reset database to initial demo state?")) return;
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      setProposal(null);
      setQueryAnswer(null);
      setInputText("");
      setSuccessBanner("Database reset to initial demo seed!");
      await refreshAll();
    } catch (err) {
      console.error(err);
    }
  }

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === "SENT") return inv.status === "SENT";
    if (activeTab === "PAID") return inv.status === "PAID";
    return true;
  });

  // Dynamic Financial Totals
  const totalOutstandingCents = invoices
    .filter((inv) => inv.status === "SENT")
    .reduce((sum, inv) => sum + inv.amountTotalCents, 0);

  const totalPaidCents = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amountTotalCents, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
            $
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-white">Get Paid</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Autonomous AR Copilot
              </span>
            </div>
            <p className="text-xs text-slate-400">PayPal Invoicing v2 • Autonomous Chasing • Ask Anything</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDemo}
            title="Reset database to demo seed"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 transition"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            title="Click to re-check system health"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              healthStatus?.ok
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40"
                : "bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? "animate-spin" : ""}`} />
            <span>
              {healthStatus?.ok
                ? `System Healthy • PayPal ${healthStatus?.details?.paypalMode === "LIVE_SANDBOX_TOKEN" ? "Live Sandbox" : "Sandbox Simulator"}`
                : "Checking System..."}
            </span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Autonomous Chasing: <strong className="text-slate-200">Active</strong></span>
          </div>
        </div>
      </header>

      {/* Main 3-Column Workplane */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: AI Copilot & Compose Panel (Cols 1-4) */}
        <section className="lg:col-span-4 border-r border-slate-800/80 bg-slate-900/30 flex flex-col p-5 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-sm text-slate-200">AR Copilot & Assistant</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Stage 5 Complete
            </span>
          </div>

          {/* Quick Demo Prompts: Scoping & Natural Language Q&A */}
          <div className="mb-4">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Try Inbound Message or Financial Question
            </label>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const text = "Sarah Chen: Hey Alex, go ahead with the logo + 3 banners, $500 total. Send to sarah@acmecorp.com.";
                  setInputText(text);
                  handleSubmitInput(text);
                }}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 transition flex items-center justify-between group"
              >
                <span className="truncate">"Sarah Chen: logo + 3 banners, $500 total..."</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition shrink-0 ml-2" />
              </button>
              <button
                onClick={() => {
                  const text = "Who still owes me?";
                  setInputText(text);
                  handleSubmitInput(text);
                }}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 transition flex items-center justify-between group"
              >
                <span className="truncate">"Who still owes me?" (Deterministic aggregate)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition shrink-0 ml-2" />
              </button>
              <button
                onClick={() => {
                  const text = "How much did I make from HyperGrowth?";
                  setInputText(text);
                  handleSubmitInput(text);
                }}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 transition flex items-center justify-between group"
              >
                <span className="truncate">"How much did I make from HyperGrowth?"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successBanner && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Q&A Answer Card */}
          {queryAnswer && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 shadow-xl mb-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Financial Intelligence Report
                </span>
                <button
                  onClick={() => setQueryAnswer(null)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {queryAnswer}
              </p>
            </div>
          )}

          {/* Proposal Review Card (When Scoped) */}
          {proposal && (
            <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 shadow-xl mb-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Extracted Proposal Review
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono">
                  Confidence: {Math.round(proposal.confidence * 100)}%
                </span>
              </div>

              {proposal.potentialInjectionDetected && (
                <div className="p-2 rounded bg-amber-950/50 border border-amber-500/40 text-amber-200 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Prompt injection attempt neutralized. Treated strictly as raw data.</span>
                </div>
              )}

              {/* Client Info Inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Client Name</label>
                  <input
                    type="text"
                    value={proposal.clientName || ""}
                    onChange={(e) => setProposal({ ...proposal, clientName: e.target.value })}
                    placeholder="e.g. Sarah Chen"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Client Email *</label>
                  <input
                    type="email"
                    value={proposal.clientEmail || ""}
                    onChange={(e) => setProposal({ ...proposal, clientEmail: e.target.value })}
                    placeholder="client@company.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Extracted Line Items</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {proposal.lineItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...proposal.lineItems];
                          updated[idx].description = e.target.value;
                          setProposal({ ...proposal, lineItems: updated });
                        }}
                        className="flex-1 bg-transparent border-none text-slate-100 focus:outline-none"
                      />
                      <span className="text-slate-400 text-[11px]">x{item.quantity}</span>
                      <span className="font-semibold text-slate-200">{formatCents(item.totalCents)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Due Date */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Due Date (Net-7)</span>
                  <input
                    type="date"
                    value={proposal.dueDate}
                    onChange={(e) => setProposal({ ...proposal, dueDate: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-xs"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Invoice Total</span>
                  <span className="text-base font-bold text-white">{formatCents(proposal.amountTotalCents)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setProposal(null)}
                  className="flex-1 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-400 transition"
                >
                  Discard
                </button>
                <button
                  onClick={handleConfirmAndSend}
                  disabled={isSendingInvoice}
                  className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {isSendingInvoice ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending to PayPal...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Reminders Inspection Box */}
          {inspectingInvoice && (
            <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 shadow-xl mb-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <History className="w-4 h-4" />
                  Chase History: {inspectingInvoice.invoiceNumber}
                </span>
                <button
                  onClick={() => setInspectingInvoice(null)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-2 max-h-48 overflow-y-auto">
                {inspectingInvoice.reminders.length === 0 ? (
                  <p className="text-slate-500 text-center py-2">No reminders sent yet for this invoice.</p>
                ) : (
                  inspectingInvoice.reminders.map((rem, i) => (
                    <div key={i} className="p-2.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-blue-300">Level {rem.level}: {rem.tone}</span>
                        <span className="text-[10px] text-slate-400">{new Date(rem.sentAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-200 mb-1">{rem.subject}</p>
                      <p className="text-[10px] text-slate-400 whitespace-pre-line leading-relaxed">{rem.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex-1 flex flex-col justify-end space-y-3">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste client message to scope, or ask 'who still owes me?'..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition"
              />
              <div className="absolute right-2 bottom-2">
                <button
                  onClick={() => handleSubmitInput()}
                  disabled={isProcessing || !inputText.trim()}
                  className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  <span>Run Agent</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Input treated as data, not commands. Autonomous injection protection enabled.
            </p>
          </div>
        </section>

        {/* Center Column: Invoice List & Financial Health (Cols 5-9) */}
        <section className="lg:col-span-5 p-6 flex flex-col overflow-y-auto border-r border-slate-800/80">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Total Outstanding</span>
              <div className="text-xl font-bold text-white tracking-tight">{formatCents(totalOutstandingCents)}</div>
              <span className="text-[10px] text-amber-400 font-medium">Active Receivables</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Overdue (Chasing)</span>
              <div className="text-xl font-bold text-rose-400 tracking-tight">{formatCents(totalOutstandingCents)}</div>
              <span className="text-[10px] text-rose-300 font-medium">Escalating Tones 1 & 2</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Collected (Paid)</span>
              <div className="text-xl font-bold text-emerald-400 tracking-tight">{formatCents(totalPaidCents)}</div>
              <span className="text-[10px] text-emerald-300 font-medium">100% Settled</span>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-sm text-slate-200">Active Invoices ({filteredInvoices.length})</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-2.5 py-1 rounded transition ${activeTab === "ALL" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("SENT")}
                className={`px-2.5 py-1 rounded transition ${activeTab === "SENT" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
              >
                Sent
              </button>
              <button
                onClick={() => setActiveTab("PAID")}
                className={`px-2.5 py-1 rounded transition ${activeTab === "PAID" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"}`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* Invoice Cards */}
          <div className="space-y-3">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className={`p-4 rounded-xl border transition ${
                  inv.status === "PAID"
                    ? "bg-slate-900/40 border-slate-800 hover:bg-slate-900/70"
                    : inv.status === "NEEDS_REVIEW"
                    ? "bg-rose-950/30 border-rose-600/50 hover:bg-rose-950/40"
                    : inv.reminderLevel >= 2
                    ? "bg-slate-900/50 border-rose-900/30 hover:bg-slate-900/80"
                    : "bg-slate-900/50 border-slate-800 hover:bg-slate-900/80"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">{inv.client?.name || "Client"}</span>
                      {inv.client?.company && <span className="text-xs text-slate-400">• {inv.client.company}</span>}
                    </div>
                    <span className="text-xs font-mono text-slate-400">{inv.invoiceNumber}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-white">{formatCents(inv.amountTotalCents, inv.currency)}</div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : inv.status === "NEEDS_REVIEW"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : inv.reminderLevel >= 2
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {inv.status === "NEEDS_REVIEW"
                        ? "ESCALATED TO HUMAN"
                        : `${inv.status} • Due ${inv.dueDate}`}
                    </span>
                  </div>
                </div>

                {/* Line Items Preview */}
                <div className="text-xs text-slate-300 mb-3 space-y-1">
                  {inv.lineItems.map((li, i) => (
                    <div key={i} className="flex justify-between text-slate-400">
                      <span>• {li.description}</span>
                      <span>{formatCents(li.totalCents)}</span>
                    </div>
                  ))}
                </div>

                {/* Tone Escalation Badge & Controls */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {inv.status === "PAID" ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Settled via PayPal
                      </span>
                    ) : inv.status === "NEEDS_REVIEW" ? (
                      <span className="text-rose-400 flex items-center gap-1 font-medium">
                        <UserCheck className="w-3.5 h-3.5" />
                        Level 4: Human Review Required
                      </span>
                    ) : inv.reminderLevel >= 2 ? (
                      <button
                        onClick={() => setInspectingInvoice(inv)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 underline underline-offset-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Level 2: Neutral Notice (Work Paused)
                      </button>
                    ) : inv.reminderLevel === 1 ? (
                      <button
                        onClick={() => setInspectingInvoice(inv)}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 underline underline-offset-2"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        Level 1: Friendly Check-in Dispatched
                      </button>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        On Track
                      </span>
                    )}
                  </div>

                  {/* Demo Buttons */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {inv.status === "SENT" && (
                      <>
                        <button
                          onClick={() => handleSimulateOverdue(inv.id)}
                          disabled={activeActionId === inv.id}
                          title="Time Machine: Backdate due date to trigger autonomous escalation now!"
                          className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-[11px] font-medium flex items-center gap-1 transition disabled:opacity-50"
                        >
                          {activeActionId === inv.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <FastForward className="w-3 h-3" />
                          )}
                          <span>Simulate Overdue</span>
                        </button>

                        <button
                          onClick={() => handleRemindNow(inv.id)}
                          disabled={activeActionId === inv.id}
                          title="Manually trigger next escalation reminder"
                          className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-[11px] font-medium flex items-center gap-1 transition disabled:opacity-50"
                        >
                          <BellRing className="w-3 h-3" />
                          <span>Remind Now</span>
                        </button>

                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          disabled={activeActionId === inv.id}
                          title="Replay PayPal Paid Webhook"
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center gap-1 transition disabled:opacity-50"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Mark Paid</span>
                        </button>
                      </>
                    )}

                    <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                      {inv.paypalPaymentUrl && (
                        <a
                          href={inv.paypalPaymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="View PayPal Sandbox Invoice"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Autonomous Activity Feed (Cols 10-12) */}
        <section className="lg:col-span-3 p-5 flex flex-col bg-slate-900/20 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-sm text-slate-200">Autonomous Activity Feed</h3>
            </div>
            <button
              onClick={fetchEvents}
              title="Refresh activity feed"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Activity items */}
          <div className="space-y-4">
            {events.map((evt) => {
              const isPaid = evt.eventType === "WEBHOOK_PAID";
              const isThankYou = evt.eventType === "THANKYOU_SENT";
              const isReminder = evt.eventType === "REMINDER_SENT";
              const isEscalation = evt.eventType === "ESCALATED_TO_HUMAN";

              return (
                <div
                  key={evt.id}
                  className={`relative pl-5 border-l-2 ${
                    isPaid || isThankYou
                      ? "border-emerald-500/50"
                      : isEscalation
                      ? "border-rose-500/60"
                      : isReminder
                      ? "border-amber-500/50"
                      : "border-blue-500/50"
                  }`}
                >
                  <div
                    className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${
                      isPaid || isThankYou
                        ? "bg-emerald-400"
                        : isEscalation
                        ? "bg-rose-400"
                        : isReminder
                        ? "bg-amber-400"
                        : "bg-blue-400"
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {evt.eventType}
                  </span>
                  <p className="text-xs font-medium text-slate-200">
                    {evt.eventType === "WEBHOOK_PAID" && `Payment Verified: ${formatCents(evt.payload?.amountCents || 0)}`}
                    {evt.eventType === "THANKYOU_SENT" && "Autonomous Thank-You Note Logged"}
                    {evt.eventType === "INVOICE_SENT" && `Invoice ${evt.payload?.invoiceNumber || ""} Sent via PayPal`}
                    {evt.eventType === "REMINDER_SENT" && `Level ${evt.payload?.level || 1} (${evt.payload?.tone}) Reminder Dispatched`}
                    {evt.eventType === "ESCALATED_TO_HUMAN" && "Chasing Limits Reached — Escalated to Alex"}
                    {evt.eventType === "RESCHEDULED" && "Time-Machine Simulation Overdue Event"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {evt.payload?.reason || evt.payload?.message || `PayPal: ${evt.payload?.invoiceNumber || evt.id}`}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
