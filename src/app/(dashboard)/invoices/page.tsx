"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  Sparkles,
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
import { LottieCheck } from "@/components/lottie/lottie-animations";
import { MagnetButton } from "@/components/reactbits/magnet-button";
import { motion } from "framer-motion";

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

  /* ── Computations ── */
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
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
        {/* ── Top Financial Ribbon: Balanced Cohesive Neutral Palette ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-[#EBECE9]">
          <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#EBECE9]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Total Outstanding
            </span>
            <div className="text-2xl font-bold text-[#0D0E11] tabular-nums tracking-tight flex items-baseline gap-1">
              <span>{formatCents(totalOutstanding)}</span>
              <span className="text-xs font-mono text-[#9CA3AF]">USD</span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
              <span>{tabCounts.SENT + tabCounts.OVERDUE} pending collection</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#EBECE9]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Settled Volume
            </span>
            <div className="text-2xl font-bold text-[#0D0E11] tabular-nums tracking-tight flex items-baseline gap-1">
              <span>{formatCents(totalPaid)}</span>
              <span className="text-xs font-mono text-[#9CA3AF]">USD</span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span>PayPal Sandbox verified</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#EBECE9]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Escalation Engine
            </span>
            <div className="text-2xl font-bold text-[#0D0E11] tabular-nums tracking-tight flex items-baseline gap-1">
              <span>{tabCounts.OVERDUE} Overdue</span>
              <span className="text-xs font-mono text-[#9CA3AF]">accounts</span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
              <span>Automated chase active</span>
            </div>
          </div>
        </div>

        {/* ── Scoping Drawer ── */}
        {showCreate && (
          <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#EBECE9] space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-[#EBECE9]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#84CC16]" />
                <span className="text-xs font-bold text-[#0D0E11]">
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
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#0D0E11] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0D0E11] transition-all resize-none shadow-2xs"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D0E11] text-white text-xs font-bold hover:bg-[#2A2B30] disabled:opacity-50 transition-all shadow-2xs"
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
              <div className="space-y-4 bg-white p-4 rounded-xl border border-[#EBECE9]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0D0E11]">Invoice Scoped Proposal</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
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
                      className="w-full bg-[#FAFAF8] border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#0D0E11]"
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
                      className="w-full bg-[#FAFAF8] border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#0D0E11]"
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
                        className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAF8] border border-[#EBECE9] text-xs"
                      >
                        <span className="font-medium text-[#0D0E11]">{item.description}</span>
                        <span className="font-mono font-bold text-[#0D0E11]">
                          {formatCents(item.totalCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EBECE9]">
                  <div>
                    <span className="text-[11px] text-[#6B7280]">Due Date: </span>
                    <span className="text-xs font-mono font-bold text-[#0D0E11]">{proposal.dueDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#6B7280] mr-2">Total:</span>
                    <span className="text-base font-bold text-[#0D0E11] tabular-nums">
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
          <div className="flex items-center gap-1 bg-[#F1F3F5] p-1 rounded-xl relative">
            {(["ALL", "SENT", "PAID", "OVERDUE", "NEEDS_REVIEW"] as TabFilter[]).map((tab) => {
              const isCurrent = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    playSoftClick();
                    setFilter(tab);
                  }}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isCurrent
                      ? "text-[#0D0E11] font-semibold"
                      : "text-[#6B7280] hover:text-[#0D0E11]"
                  }`}
                >
                  {isCurrent && (
                    <motion.div
                      layoutId="activeInvoiceFilterTab"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs -z-0"
                    />
                  )}
                  <span className="relative z-10">
                    {tab === "NEEDS_REVIEW" ? "Review" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </span>
                  {tabCounts[tab] > 0 && (
                    <span className="relative z-10 ml-1 text-[10px] font-mono opacity-70">
                      [{tabCounts[tab]}]
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search client or invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-60 bg-white border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0D0E11] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0D0E11] transition-all"
            />
          </div>
        </div>

        {/* ── Invoices Ledger Table with Clean Horizontal Spacing (No Broken Wrapping) ── */}
        <div className="border border-[#EBECE9] rounded-2xl overflow-hidden bg-white shadow-2xs divide-y divide-[#EBECE9]">
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

              // Unified Status Pill with Quiet Semantic Restraint
              let statusBadge = (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                  <span>SENT</span>
                </span>
              );

              if (inv.status === "PAID") {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    <span>PAID</span>
                  </span>
                );
              } else if (inv.status === "NEEDS_REVIEW") {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                    <span>REVIEW</span>
                  </span>
                );
              } else if (isOverdue) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                    <span>OVERDUE{inv.reminderLevel > 0 ? ` · LVL ${inv.reminderLevel}` : ""}</span>
                  </span>
                );
              }

              return (
                <div
                  key={inv.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    isSelected ? "bg-[#FAFAF8]" : "hover:bg-[#FDFDFD]"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Column: Client Info & Metadata with Whitespace-Nowrap */}
                    <div
                      className="cursor-pointer space-y-1.5 min-w-0 flex-1"
                      onClick={() => {
                        playSoftClick();
                        setSelectedInvoice(isSelected ? null : inv);
                      }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#0D0E11]">
                          {inv.client?.name || "Client"}
                        </span>
                        {inv.client?.company && (
                          <span className="text-xs text-[#6B7280]">({inv.client.company})</span>
                        )}
                        {statusBadge}
                      </div>

                      {/* Line 2 Metadata: Strict nowrap on ID and Due Date */}
                      <div className="text-xs text-[#6B7280] font-mono flex items-center gap-2 overflow-hidden text-ellipsis">
                        <span className="font-semibold text-[#374151] whitespace-nowrap">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-[#D1D5DB]">•</span>
                        <span className="whitespace-nowrap">Due {inv.dueDate}</span>
                        <span className="text-[#D1D5DB]">•</span>
                        <span className="truncate max-w-[280px] text-[#4B5563]">
                          {inv.lineItems[0]?.description || "Services rendered"}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Amount & Balanced Action Button Group */}
                    <div className="flex items-center justify-between md:justify-end gap-3.5 shrink-0">
                      <div className="text-right whitespace-nowrap">
                        <span className="text-base font-bold text-[#0D0E11] tabular-nums tracking-tight">
                          {formatCents(inv.amountTotalCents)}
                        </span>
                        <span className="text-[10px] font-mono text-[#9CA3AF] ml-1">USD</span>
                      </div>

                      {/* Balanced Action Group: Clean neutrals instead of loud neon rainbow */}
                      {inv.status === "SENT" && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSimulateOverdue(inv.id)}
                            disabled={actionLoading === inv.id}
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] hover:text-[#0D0E11] text-xs font-medium transition-colors shadow-2xs whitespace-nowrap"
                            title="Simulate passing due date and trigger autonomous escalation"
                          >
                            Simulate Overdue
                          </button>
                          <button
                            onClick={() => handleRemindNow(inv.id)}
                            disabled={actionLoading === inv.id}
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] hover:text-[#0D0E11] text-xs font-medium transition-colors shadow-2xs whitespace-nowrap"
                            title="Trigger immediate chase reminder"
                          >
                            Chase
                          </button>
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            disabled={actionLoading === inv.id}
                            className="px-3 py-1.5 rounded-lg bg-[#0D0E11] hover:bg-[#232529] text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                            title="Simulate PayPal instant settlement webhook"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16]" />
                            <span>Mark Paid</span>
                          </button>
                        </div>
                      )}

                      <Link
                        href={`/pay/${inv.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#6B7280] hover:text-[#003087] transition-colors p-1.5 rounded-md hover:bg-black/5"
                        title="Open PayPal Sandbox Invoice"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-[#EBECE9] space-y-3 bg-[#FAFAF8] p-4 rounded-xl">
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

                      {/* Detail Footer Actions */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#EBECE9]">
                        <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                          <span>PayPal Invoicing v2 Reference: <code className="font-mono text-[#0D0E11]">{inv.paypalInvoiceId || "INV2-SANDBOX"}</code></span>
                        </div>
                        <Link
                          href={`/pay/${inv.id}`}
                          target="_blank"
                          className="px-3.5 py-1.5 rounded-lg bg-[#003087] hover:bg-[#00246B] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#FFC439]" />
                          <span>Open PayPal Sandbox Payer View</span>
                        </Link>
                      </div>

                      {/* Reminder Audit Trail */}
                      {inv.reminders.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] uppercase font-mono text-[#6B7280] block mb-1">
                            Dispatched Follow-up Trail ({inv.reminders.length})
                          </span>
                          <div className="space-y-1">
                            {inv.reminders.map((rem, rIdx) => (
                              <div key={rIdx} className="text-xs bg-white p-2 rounded border border-[#EBECE9] flex items-center justify-between">
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
