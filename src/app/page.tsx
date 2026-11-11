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
} from "lucide-react";
import { Invoice, Client, EventLog } from "@/lib/types";
import { formatCents, centsToDecimalString, dollarsToCents } from "@/lib/money";

export default function AppShell() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Live Invoices & Events
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "SENT" | "PAID">("ALL");
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  // Copilot Compose & Proposal
  const [inputText, setInputText] = useState("");
  const [isScoping, setIsScoping] = useState(false);
  const [proposal, setProposal] = useState<any | null>(null);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    fetchInvoices();
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

  async function fetchInvoices() {
    setIsLoadingInvoices(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.ok && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setIsLoadingInvoices(false);
    }
  }

  // Handle Scoping
  async function handleScopeMessage(textToScope?: string) {
    const text = textToScope || inputText;
    if (!text.trim()) return;

    setIsScoping(true);
    setErrorMessage(null);
    setSuccessBanner(null);

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
      setIsScoping(false);
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
      await fetchInvoices();
    } catch (err: any) {
      setErrorMessage(err?.message || "Error submitting invoice.");
    } finally {
      setIsSendingInvoice(false);
    }
  }

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === "SENT") return inv.status === "SENT";
    if (activeTab === "PAID") return inv.status === "PAID";
    return true;
  });

  // Calculate stats dynamically
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
            <p className="text-xs text-slate-400">Powered by PayPal Invoicing v2 & Multi-Tier Escalation</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
              <h2 className="font-semibold text-sm text-slate-200">AR Copilot & Invoicing</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Stage 2 Bill
            </span>
          </div>

          {/* Assistant Context Pitch */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-blue-950/30 to-indigo-950/20 border border-blue-500/20 mb-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-slate-300">
                <strong className="text-white block mb-1">Paste any messy conversation below.</strong>
                The AI parses the line items, scopes the price, verifies email, and drafts a ready-to-send PayPal invoice. You stay in control.
              </div>
            </div>
          </div>

          {/* Quick Demo Prompts */}
          <div className="mb-4">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Try Sample Client Messages
            </label>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const text = "Sarah Chen: Hey Alex, go ahead with the logo + 3 banners, $500 total. Send to sarah@acmecorp.com.";
                  setInputText(text);
                  handleScopeMessage(text);
                }}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 transition flex items-center justify-between group"
              >
                <span className="truncate">"Sarah Chen: logo + 3 banners, $500 total..."</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition shrink-0 ml-2" />
              </button>
              <button
                onClick={() => {
                  const text = "David Miller: Hi Alex, approved the Q3 API Security Audit ($1,800.00). Invoice me at david@fintechlabs.io.";
                  setInputText(text);
                  handleScopeMessage(text);
                }}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 transition flex items-center justify-between group"
              >
                <span className="truncate">"David Miller: approved Q3 API Security Audit ($1800)..."</span>
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

          {/* Input Area */}
          <div className="flex-1 flex flex-col justify-end space-y-3">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste client message, email agreement, or ask 'who still owes me?'..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition"
              />
              <div className="absolute right-2 bottom-2">
                <button
                  onClick={() => handleScopeMessage()}
                  disabled={isScoping || !inputText.trim()}
                  className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {isScoping ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  <span>Scope Bill</span>
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
                          : inv.reminderLevel >= 2
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {inv.status} • Due {inv.dueDate}
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

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    {inv.status === "PAID" ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Settled via PayPal
                      </span>
                    ) : inv.reminderLevel >= 2 ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Level 2: Neutral Notice (Sprint Paused)
                      </span>
                    ) : (
                      <span className="text-blue-400 flex items-center gap-1">
                        <BellRing className="w-3.5 h-3.5" />
                        Level 1: Friendly Follow-up Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-[11px]">{inv.paypalInvoiceId}</span>
                    {inv.paypalPaymentUrl && (
                      <a
                        href={inv.paypalPaymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="View PayPal Sandbox Invoice"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-pointer" />
                      </a>
                    )}
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
            <span className="text-[10px] text-slate-400 uppercase font-mono">Live Audit</span>
          </div>

          {/* Activity items */}
          <div className="space-y-4">
            <div className="relative pl-5 border-l-2 border-emerald-500/40">
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-emerald-400"></div>
              <span className="text-[10px] text-slate-400 block">2 days ago • Webhook</span>
              <p className="text-xs font-medium text-slate-200">Payment Verified: $1,200.00</p>
              <p className="text-[11px] text-slate-400 mt-0.5">HyperGrowth Media settled invoice INV-2024-003.</p>
            </div>

            <div className="relative pl-5 border-l-2 border-amber-500/40">
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-amber-400"></div>
              <span className="text-[10px] text-slate-400 block">4 days ago • Autonomous Escalation</span>
              <p className="text-xs font-medium text-slate-200">Level 2 Reminder Dispatched</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Fintech Labs 11d overdue. Notice delivered; deliverables paused.</p>
            </div>

            <div className="relative pl-5 border-l-2 border-blue-500/40">
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-400"></div>
              <span className="text-[10px] text-slate-400 block">2 days ago • Autonomous Escalation</span>
              <p className="text-xs font-medium text-slate-200">Level 1 Friendly Check-in</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Acme Corporation reached 4d overdue threshold.</p>
            </div>

            <div className="relative pl-5 border-l-2 border-slate-700">
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-slate-500"></div>
              <span className="text-[10px] text-slate-400 block">14 days ago • PayPal Invoicing</span>
              <p className="text-xs font-medium text-slate-200">Invoice Created & Sent</p>
              <p className="text-[11px] text-slate-400 mt-0.5">INV-2024-001 ($3,500.00) sent to sarah@acmecorp.com.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
