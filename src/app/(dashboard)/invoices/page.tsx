"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ShieldCheck,
  BellRing,
  FastForward,
  CreditCard,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Invoice } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { toast } from "sonner";
import { SynexSubpageShell } from "@/components/synex/synex-subpage-shell";
import { fireFintechCelebration } from "@/components/interactive/confetti";
import {
  playSoftClick,
  playHarmonicSuccess,
  playAlertChime,
} from "@/components/interactive/sound-effects";
import { LottieCheck, LottieAgentRadar, LottieCoins } from "@/components/lottie/lottie-animations";
import { DecryptedText } from "@/components/reactbits/decrypted-text";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { MagnetButton } from "@/components/reactbits/magnet-button";

type TabFilter = "ALL" | "SENT" | "PAID" | "OVERDUE" | "NEEDS_REVIEW";

function InvoicesContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TabFilter>("ALL");
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Invoice Scoping
  const [showCreate, setShowCreate] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [proposal, setProposal] = useState<any | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.ok) {
        setInvoices(data.invoices || []);
        if (selectedId) {
          const found = (data.invoices || []).find((i: Invoice) => i.id === selectedId);
          if (found) setSelectedInvoice(found);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 10000);
    return () => clearInterval(interval);
  }, [fetchInvoices]);

  useEffect(() => {
    if (selectedInvoice) {
      const updated = invoices.find((i) => i.id === selectedInvoice.id);
      if (updated) setSelectedInvoice(updated);
    }
  }, [invoices]);

  /* ── Filter Logic ── */
  const now = new Date();
  const filtered = invoices.filter((inv) => {
    const isOverdue = inv.status === "SENT" && new Date(inv.dueDate) < now;
    if (filter === "SENT") return inv.status === "SENT" && !isOverdue;
    if (filter === "PAID") return inv.status === "PAID";
    if (filter === "OVERDUE") return isOverdue;
    if (filter === "NEEDS_REVIEW") return inv.status === "NEEDS_REVIEW";
    return true;
  }).filter((inv) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      inv.client?.name?.toLowerCase().includes(s) ||
      inv.client?.company?.toLowerCase().includes(s) ||
      inv.invoiceNumber.toLowerCase().includes(s) ||
      inv.lineItems.some((li) => li.description.toLowerCase().includes(s))
    );
  });

  /* ── Total Computations ── */
  const totalOutstanding = invoices
    .filter((i) => i.status === "SENT")
    .reduce((acc, i) => acc + i.amountTotalCents, 0);

  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, i) => acc + i.amountTotalCents, 0);

  /* ── Scoping Handler ── */
  async function handleScope() {
    if (!inputText.trim()) return;
    playSoftClick();
    setIsProcessing(true);
    try {
      const res = await fetch("/api/invoices/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error || "Failed to scope message");
        return;
      }
      playHarmonicSuccess();
      setProposal(data.proposal);
    } catch (err: any) {
      toast.error(err?.message || "Network error");
    } finally {
      setIsProcessing(false);
    }
  }

  /* ── Confirm & Send ── */
  async function handleConfirmSend() {
    if (!proposal) return;
    if (!proposal.clientEmail || !proposal.clientEmail.includes("@")) {
      toast.error("Please enter a valid client email");
      return;
    }
    playSoftClick();
    setIsSending(true);
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
        toast.error(data.error || "Failed to create invoice");
        return;
      }
      playHarmonicSuccess();
      fireFintechCelebration();
      toast.success(`Invoice ${data.invoice.invoiceNumber} created & sent via PayPal!`);
      setProposal(null);
      setInputText("");
      setShowCreate(false);
      await fetchInvoices();
    } catch (err: any) {
      toast.error(err?.message || "Error submitting invoice");
    } finally {
      setIsSending(false);
    }
  }

  /* ── Demo Actions ── */
  async function handleMarkPaid(invoiceId: string) {
    playSoftClick();
    setActionLoading(invoiceId);
    try {
      const res = await fetch("/api/demo/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      playHarmonicSuccess();
      fireFintechCelebration();
      toast.success(`Payment settled! ${data.message}`);
      await fetchInvoices();
    } catch (err: any) {
      toast.error(err?.message || "Error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSimulateOverdue(invoiceId: string) {
    playSoftClick();
    setActionLoading(invoiceId);
    try {
      const res = await fetch("/api/demo/simulate-overdue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, autoChase: true }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      playAlertChime();
      toast.success("Time Machine: Invoice backdated! Agent escalated.");
      await fetchInvoices();
    } catch (err: any) {
      toast.error(err?.message || "Error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemindNow(invoiceId: string) {
    playSoftClick();
    setActionLoading(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Manual user trigger" }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      playAlertChime();
      if (data.escalatedToHuman) {
        toast.warning("Agent limits reached. Invoice escalated to human review.");
      } else {
        toast.success(`Reminder Level ${data.reminder.level} (${data.reminder.tone}) sent!`);
      }
      await fetchInvoices();
    } catch (err: any) {
      toast.error(err?.message || "Error");
    } finally {
      setActionLoading(null);
    }
  }

  const tabCounts = {
    ALL: invoices.length,
    SENT: invoices.filter((i) => i.status === "SENT" && new Date(i.dueDate) >= now).length,
    PAID: invoices.filter((i) => i.status === "PAID").length,
    OVERDUE: invoices.filter((i) => i.status === "SENT" && new Date(i.dueDate) < now).length,
    NEEDS_REVIEW: invoices.filter((i) => i.status === "NEEDS_REVIEW").length,
  };

  return (
    <SynexSubpageShell
      badge="ACCOUNTS RECEIVABLE"
      titleLight="A New Standard"
      titleBold="in Invoices"
      description="Autonomous invoice generation from client messages, live PayPal Sandbox issuance, and unrelenting automated follow-up protocols."
      headerAction={
        <MagnetButton
          onClick={() => {
            playSoftClick();
            setShowCreate(!showCreate);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 ${
            showCreate
              ? "bg-[#1A1C1E] text-white hover:bg-black"
              : "bg-[#0D0E11] text-white hover:bg-[#2A2B30]"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16]" />
          <span>{showCreate ? "Close Scoper" : "+ Scope New Invoice"}</span>
        </MagnetButton>
      }
    >
      <div className="space-y-6">
        {/* ── Top Financial Ribbon ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-[#E5E7EB]">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Total Outstanding
            </span>
            <div className="text-2xl font-black text-[#0D0E11] tabular-nums">
              {formatCents(totalOutstanding)}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
              <span>{tabCounts.SENT + tabCounts.OVERDUE} pending collection</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Settled Volume
            </span>
            <div className="text-2xl font-black text-[#10B981] tabular-nums flex items-center justify-between">
              <span>{formatCents(totalPaid)}</span>
              <LottieCheck size={28} />
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span>PayPal Sandbox verified</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Escalation Engine
            </span>
            <div className="text-2xl font-black text-[#0D0E11] tabular-nums">
              {tabCounts.OVERDUE} Overdue
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
              <span>Automated chase active</span>
            </div>
          </div>
        </div>

        {/* ── Scoping Drawer ── */}
        {showCreate && (
          <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] shadow-inner space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#84CC16]" />
                <span className="text-sm font-bold text-[#0D0E11]">
                  Autonomous Invoice Scoper
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#6B7280]">
                Paste casual message → PayPal draft
              </span>
            </div>

            {!proposal ? (
              <div className="space-y-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder='e.g. "Sarah Chen approved the mobile UI redesign for $1,200. Send to sarah@acmecorp.com by Friday."'
                  rows={3}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#0D0E11] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0D0E11] transition-all resize-none shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleScope();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-[#6B7280]">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E5E7EB] text-[10px] font-mono">Enter</kbd> to extract
                  </div>
                  <button
                    onClick={handleScope}
                    disabled={isProcessing || !inputText.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D0E11] text-white text-xs font-bold hover:bg-[#2A2B30] disabled:opacity-50 transition-all shadow-sm"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isProcessing ? "Analyzing..." : "Extract Line Items"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0D0E11]">Invoice Scoped Proposal</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Confidence: {Math.round((proposal.confidence || 1) * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-[#6B7280] block mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={proposal.clientName || ""}
                      onChange={(e) => setProposal({ ...proposal, clientName: e.target.value })}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#0D0E11]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-[#6B7280] block mb-1">
                      Client Email *
                    </label>
                    <input
                      type="email"
                      value={proposal.clientEmail || ""}
                      onChange={(e) => setProposal({ ...proposal, clientEmail: e.target.value })}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#0D0E11]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-[#6B7280] block mb-1.5">
                    Extracted Line Items
                  </label>
                  <div className="space-y-1.5">
                    {proposal.lineItems.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-xs"
                      >
                        <span className="font-medium text-[#0D0E11]">{item.description}</span>
                        <span className="font-mono font-bold text-[#0D0E11]">
                          {formatCents(item.totalCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                  <div>
                    <span className="text-[11px] text-[#6B7280]">Due Date: </span>
                    <span className="text-xs font-mono font-bold text-[#0D0E11]">{proposal.dueDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#6B7280] mr-2">Total:</span>
                    <span className="text-base font-black text-[#0D0E11] tabular-nums">
                      {formatCents(proposal.amountTotalCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setProposal(null)}
                    className="flex-1 py-2 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-semibold text-[#0D0E11] transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleConfirmSend}
                    disabled={isSending}
                    className="flex-1 py-2 rounded-lg bg-[#0D0E11] hover:bg-black text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#84CC16]" />
                    )}
                    <span>{isSending ? "Creating on PayPal..." : "Confirm & Send via PayPal"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Filters & Search ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl">
            {(["ALL", "SENT", "PAID", "OVERDUE", "NEEDS_REVIEW"] as TabFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  playSoftClick();
                  setFilter(tab);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab
                    ? "bg-white text-[#0D0E11] shadow-sm"
                    : "text-[#6B7280] hover:text-[#0D0E11]"
                }`}
              >
                <span>{tab === "NEEDS_REVIEW" ? "Review" : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                {tabCounts[tab] > 0 && (
                  <span className="ml-1 text-[10px] font-mono opacity-70">[{tabCounts[tab]}]</span>
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search client or invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-60 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0D0E11] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0D0E11] transition-all"
            />
          </div>
        </div>

        {/* ── Invoices Ledger Table ── */}
        <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-[#E5E7EB]">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#9CA3AF] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#0D0E11]" />
              <span>Loading ledger from PayPal store...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FileText className="w-8 h-8 text-[#9CA3AF] mx-auto stroke-1" />
              <div className="text-sm font-bold text-[#0D0E11]">No invoices match filter</div>
              <div className="text-xs text-[#6B7280]">
                {search ? "Try adjusting your search criteria." : "Scope a new invoice above to start."}
              </div>
            </div>
          ) : (
            filtered.map((inv) => {
              const isSelected = selectedInvoice?.id === inv.id;
              const isOverdue = inv.status === "SENT" && new Date(inv.dueDate) < now;
              return (
                <div
                  key={inv.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    isSelected ? "bg-[#F9FAFB]" : "hover:bg-[#FAFAFA]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        playSoftClick();
                        setSelectedInvoice(isSelected ? null : inv);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0D0E11]">
                          {inv.client?.name || "Client"}
                        </span>
                        {inv.client?.company && (
                          <span className="text-xs text-[#6B7280]">({inv.client.company})</span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inv.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.status === "NEEDS_REVIEW"
                              ? "bg-rose-100 text-rose-800"
                              : isOverdue
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isOverdue && inv.status === "SENT" ? "OVERDUE" : inv.status}
                        </span>
                        {inv.reminderLevel > 0 && inv.status !== "PAID" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Chase Lvl {inv.reminderLevel}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#6B7280] font-mono mt-0.5 flex items-center gap-2">
                        <span>{inv.invoiceNumber}</span>
                        <span>•</span>
                        <span>Due {inv.dueDate}</span>
                        <span>•</span>
                        <span>{inv.lineItems[0]?.description || "Services"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-[#0D0E11] tabular-nums">
                        {formatCents(inv.amountTotalCents)}
                      </span>

                      {/* Interactive Demo Actions */}
                      {inv.status === "SENT" && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSimulateOverdue(inv.id)}
                            disabled={actionLoading === inv.id}
                            className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold transition-colors"
                            title="Simulate passing due date and trigger autonomous escalation"
                          >
                            Simulate Overdue
                          </button>
                          <button
                            onClick={() => handleRemindNow(inv.id)}
                            disabled={actionLoading === inv.id}
                            className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-xs font-semibold transition-colors"
                            title="Trigger immediate chase reminder"
                          >
                            Chase
                          </button>
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            disabled={actionLoading === inv.id}
                            className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold transition-colors"
                            title="Simulate PayPal instant settlement webhook"
                          >
                            Mark Paid
                          </button>
                        </div>
                      )}

                      {inv.paypalPaymentUrl && (
                        <a
                          href={inv.paypalPaymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#9CA3AF] hover:text-[#0D0E11] transition-colors p-1"
                          title="Open PayPal Sandbox Invoice"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-[#E5E7EB] space-y-3 bg-[#F9FAFB] p-4 rounded-xl">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#6B7280] block">Client Email</span>
                          <span className="font-medium text-[#0D0E11]">{inv.client?.email || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#6B7280] block">Issue Date</span>
                          <span className="font-mono text-[#0D0E11]">{new Date(inv.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#6B7280] block">Chasing Tone</span>
                          <span className="font-medium text-[#0D0E11]">{inv.reminders[inv.reminders.length - 1]?.tone || "Standard"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#6B7280] block">Deliverables Status</span>
                          <span className="font-medium text-[#0D0E11]">{inv.workStatus}</span>
                        </div>
                      </div>

                      {/* Reminder Audit Trail */}
                      {inv.reminders.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] uppercase font-mono text-[#6B7280] block mb-1">
                            Dispatched Follow-up Trail ({inv.reminders.length})
                          </span>
                          <div className="space-y-1">
                            {inv.reminders.map((rem, rIdx) => (
                              <div key={rIdx} className="text-xs bg-white p-2 rounded border border-[#E5E7EB] flex items-center justify-between">
                                <span className="font-mono text-[#0D0E11]">
                                  Lvl {rem.level} ({rem.tone}): &quot;{rem.subject}&quot;
                                </span>
                                <span className="text-[10px] text-[#6B7280] font-mono">
                                  {new Date(rem.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </SynexSubpageShell>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBF9] p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#0D0E11]" />
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
