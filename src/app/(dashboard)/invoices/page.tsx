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
  History,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Invoice, EventLog } from "@/lib/types";
import { formatCents, centsToDecimalString } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Badge, InvoiceStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SpotlightCard } from "@/components/interactive/spotlight-card";
import { fireFintechCelebration } from "@/components/interactive/confetti";
import {
  playSoftClick,
  playHarmonicSuccess,
  playAlertChime,
} from "@/components/interactive/sound-effects";

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

  // Invoice Creation
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
        // Auto-select from URL
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

  // Refresh selected invoice when list updates
  useEffect(() => {
    if (selectedInvoice) {
      const updated = invoices.find((i) => i.id === selectedInvoice.id);
      if (updated) setSelectedInvoice(updated);
    }
  }, [invoices]);

  /* ── Filters ── */
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

  /* ── Invoice Scoping ── */
  async function handleScope() {
    if (!inputText.trim()) return;
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
      setProposal(data.proposal);
    } catch (err: any) {
      toast.error(err?.message || "Network error");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleConfirmSend() {
    if (!proposal) return;
    if (!proposal.clientEmail || !proposal.clientEmail.includes("@")) {
      toast.error("Please enter a valid client email");
      return;
    }
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
      toast.success(
        `Invoice ${data.invoice.invoiceNumber} created & sent via PayPal!`
      );
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

  /* ── Actions ── */
  async function handleMarkPaid(invoiceId: string) {
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
        toast.success(
          `Reminder Level ${data.reminder.level} (${data.reminder.tone}) sent!`
        );
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-page-title text-text-primary">Invoices</h1>
          <p className="text-body text-text-muted mt-1">
            Manage all your invoices in one place.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreate(!showCreate)}
          icon={showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        >
          {showCreate ? "Cancel" : "New Invoice"}
        </Button>
      </div>

      {/* ── Invoice Creation Panel ── */}
      {showCreate && (
        <Card className="mb-6">
          {!proposal ? (
            <div className="space-y-4">
              <div>
                <label className="text-meta text-text-muted font-medium block mb-2">
                  Paste a client message or describe the work
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder='e.g. "Sarah Chen approved the logo redesign for $500. Send to sarah@acmecorp.com"'
                  rows={3}
                  className="w-full bg-bg-primary border border-border rounded-control px-3 py-2.5 text-body text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none transition"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleScope();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleScope}
                  loading={isProcessing}
                  disabled={!inputText.trim()}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Extract Invoice
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span className="text-body font-semibold text-text-primary">
                    Invoice Preview
                  </span>
                </div>
                <Badge variant="info">
                  Confidence: {Math.round(proposal.confidence * 100)}%
                </Badge>
              </div>

              {proposal.potentialInjectionDetected && (
                <div className="flex items-center gap-2 p-2.5 rounded-control bg-warning-muted border border-warning/20 text-meta text-warning">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Prompt injection neutralized. Data treated as raw text.
                </div>
              )}

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-timestamp text-text-muted block mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={proposal.clientName || ""}
                    onChange={(e) =>
                      setProposal({ ...proposal, clientName: e.target.value })
                    }
                    className="w-full bg-bg-primary border border-border rounded-control px-2.5 py-1.5 text-meta text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                <div>
                  <label className="text-timestamp text-text-muted block mb-1">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    value={proposal.clientEmail || ""}
                    onChange={(e) =>
                      setProposal({ ...proposal, clientEmail: e.target.value })
                    }
                    className="w-full bg-bg-primary border border-border rounded-control px-2.5 py-1.5 text-meta text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <label className="text-timestamp text-text-muted block mb-1.5">
                  Line Items
                </label>
                <div className="space-y-1.5">
                  {proposal.lineItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-control bg-bg-primary border border-border text-meta"
                    >
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...proposal.lineItems];
                          updated[idx].description = e.target.value;
                          setProposal({ ...proposal, lineItems: updated });
                        }}
                        className="flex-1 bg-transparent text-text-primary focus:outline-none"
                      />
                      <span className="text-text-muted">×{item.quantity}</span>
                      <span className="font-semibold text-text-primary tabular-nums">
                        {formatCents(item.totalCents)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total + Due Date */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <label className="text-timestamp text-text-muted block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={proposal.dueDate}
                    onChange={(e) =>
                      setProposal({ ...proposal, dueDate: e.target.value })
                    }
                    className="bg-bg-primary border border-border rounded-control px-2.5 py-1 text-meta text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                <div className="text-right">
                  <span className="text-timestamp text-text-muted block">
                    Total
                  </span>
                  <span className="text-figure text-text-primary tabular-nums">
                    {formatCents(proposal.amountTotalCents)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setProposal(null)}
                  className="flex-1"
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmSend}
                  loading={isSending}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  className="flex-1"
                >
                  Confirm & Send
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── Filters & Search ── */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-1 p-0.5 rounded-control bg-bg-secondary border border-border">
          {(["ALL", "SENT", "PAID", "OVERDUE", "NEEDS_REVIEW"] as TabFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-control text-meta font-medium transition-colors ${
                filter === tab
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab === "NEEDS_REVIEW" ? "Review" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              {tabCounts[tab] > 0 && (
                <span className="ml-1.5 text-timestamp opacity-70">
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="pl-8 pr-3 py-1.5 w-56 bg-bg-secondary border border-border rounded-control text-meta text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
          />
        </div>
      </div>

      {/* ── Invoice Table ── */}
      <div className="flex gap-6">
        <div className={`flex-1 ${selectedInvoice ? "max-w-none" : ""}`}>
          <Card padding="none">
            {loading ? (
              <div className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-10 h-10" />}
                title="No invoices found"
                description={search ? "Try adjusting your search." : "Create your first invoice above."}
              />
            ) : (
              <div className="divide-y divide-border">
                {/* Header */}
                <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-timestamp text-text-muted font-medium">
                  <span className="col-span-3">Client</span>
                  <span className="col-span-2">Invoice #</span>
                  <span className="col-span-2 hidden md:block">Description</span>
                  <span className="col-span-2 text-right">Amount</span>
                  <span className="col-span-1 text-center hidden md:block">Due</span>
                  <span className="col-span-2 text-right">Status</span>
                </div>

                {filtered.map((inv) => {
                  const isSelected = selectedInvoice?.id === inv.id;
                  return (
                    <button
                      key={inv.id}
                      onClick={() =>
                        setSelectedInvoice(isSelected ? null : inv)
                      }
                      className={`w-full grid grid-cols-12 gap-3 px-4 py-3 items-center text-left transition-colors ${
                        isSelected
                          ? "bg-accent-muted"
                          : "hover:bg-bg-interactive"
                      }`}
                    >
                      <div className="col-span-3 min-w-0">
                        <span className="text-body text-text-primary font-medium truncate block">
                          {inv.client?.name || "Client"}
                        </span>
                        {inv.client?.company && (
                          <span className="text-timestamp text-text-muted truncate block">
                            {inv.client.company}
                          </span>
                        )}
                      </div>
                      <span className="col-span-2 text-meta text-text-muted font-mono truncate">
                        {inv.invoiceNumber}
                      </span>
                      <span className="col-span-2 text-meta text-text-secondary truncate hidden md:block">
                        {inv.lineItems[0]?.description || "—"}
                      </span>
                      <span className="col-span-2 text-body text-text-primary font-semibold tabular-nums text-right">
                        {formatCents(inv.amountTotalCents, inv.currency)}
                      </span>
                      <span className="col-span-1 text-timestamp text-text-muted text-center hidden md:block">
                        {inv.dueDate}
                      </span>
                      <div className="col-span-2 flex justify-end items-center gap-1.5">
                        <InvoiceStatusBadge
                          status={inv.status}
                          dueDate={inv.dueDate}
                        />
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Invoice Detail Panel ── */}
        {selectedInvoice && (
          <div className="w-96 shrink-0 hidden lg:block">
            <Card className="sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div>
                  <h3 className="text-section text-text-primary">
                    {selectedInvoice.invoiceNumber}
                  </h3>
                  <span className="text-meta text-text-muted">
                    {selectedInvoice.client?.name}
                    {selectedInvoice.client?.company && ` • ${selectedInvoice.client.company}`}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 hover:bg-bg-interactive rounded text-text-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Amount + Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-figure-lg text-text-primary tabular-nums">
                  {formatCents(selectedInvoice.amountTotalCents, selectedInvoice.currency)}
                </span>
                <InvoiceStatusBadge
                  status={selectedInvoice.status}
                  dueDate={selectedInvoice.dueDate}
                />
              </div>

              {/* Line Items */}
              <div className="mb-4">
                <h4 className="text-timestamp text-text-muted font-medium mb-2 uppercase tracking-wider">
                  Line Items
                </h4>
                <div className="space-y-1.5">
                  {selectedInvoice.lineItems.map((li, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-meta text-text-secondary"
                    >
                      <span>
                        {li.description} ×{li.quantity}
                      </span>
                      <span className="tabular-nums text-text-primary">
                        {formatCents(li.totalCents)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="mb-4 space-y-2 text-meta">
                <div className="flex justify-between">
                  <span className="text-text-muted">Due Date</span>
                  <span className="text-text-secondary">{selectedInvoice.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Created</span>
                  <span className="text-text-secondary">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Reminder Level</span>
                  <span className="text-text-secondary">
                    {selectedInvoice.reminderLevel}
                  </span>
                </div>
                {selectedInvoice.paypalPaymentUrl && (
                  <a
                    href={selectedInvoice.paypalPaymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-accent hover:text-accent-hover transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on PayPal
                  </a>
                )}
              </div>

              {/* Chase History */}
              {selectedInvoice.reminders.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-timestamp text-text-muted font-medium mb-2 uppercase tracking-wider">
                    Chase History
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedInvoice.reminders.map((rem, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-control bg-bg-primary border border-border text-meta"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-accent">
                            Level {rem.level}: {rem.tone}
                          </span>
                          <span className="text-timestamp text-text-muted">
                            {new Date(rem.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-timestamp text-text-muted line-clamp-2">
                          {rem.subject}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Demo Actions */}
              {selectedInvoice.status === "SENT" && (
                <div className="pt-3 border-t border-border space-y-2">
                  <h4 className="text-timestamp text-text-muted font-medium uppercase tracking-wider mb-2">
                    Demo Actions
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleSimulateOverdue(selectedInvoice.id)}
                      loading={actionLoading === selectedInvoice.id}
                      icon={<FastForward className="w-3 h-3" />}
                    >
                      Overdue
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemindNow(selectedInvoice.id)}
                      loading={actionLoading === selectedInvoice.id}
                      icon={<BellRing className="w-3 h-3" />}
                    >
                      Remind
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleMarkPaid(selectedInvoice.id)}
                      loading={actionLoading === selectedInvoice.id}
                      icon={<CreditCard className="w-3 h-3" />}
                    >
                      Paid
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-4">
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
