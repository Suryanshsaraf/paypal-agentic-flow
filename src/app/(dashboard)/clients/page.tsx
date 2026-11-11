"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Mail,
  Building,
  DollarSign,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Client, Invoice } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { SynexSubpageShell } from "@/components/synex/synex-subpage-shell";
import { playSoftClick } from "@/components/interactive/sound-effects";
import { LottieCheck } from "@/components/lottie/lottie-animations";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, iRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/invoices"),
      ]);
      const [cData, iData] = await Promise.all([cRes.json(), iRes.json()]);
      if (cData.ok) setClients(cData.clients || []);
      if (iData.ok) setInvoices(iData.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function clientStats(clientId: string) {
    const clientInvoices = invoices.filter((i) => i.clientId === clientId);
    const totalInvoiced = clientInvoices.reduce((s, i) => s + i.amountTotalCents, 0);
    const totalPaid = clientInvoices
      .filter((i) => i.status === "PAID")
      .reduce((s, i) => s + i.amountTotalCents, 0);
    const outstanding = totalInvoiced - totalPaid;
    const lastPaid = clientInvoices
      .filter((i) => i.paidAt)
      .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())[0];

    return {
      invoiceCount: clientInvoices.length,
      totalInvoiced,
      totalPaid,
      outstanding,
      lastPayment: lastPaid?.paidAt,
      invoices: clientInvoices,
    };
  }

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.company?.toLowerCase().includes(s)
    );
  });

  const selectedStats = selectedClient ? clientStats(selectedClient.id) : null;

  const totalOutstanding = clients.reduce((acc, c) => acc + clientStats(c.id).outstanding, 0);
  const totalSettled = clients.reduce((acc, c) => acc + clientStats(c.id).totalPaid, 0);

  return (
    <SynexSubpageShell
      badge="CLIENT DIRECTORY"
      titleLight="Network Portfolio"
      titleBold="& Debtor Ledger"
      description="Autonomous client relationship profiles, historical settlement velocity, and active outstanding balances across your network."
    >
      <div className="space-y-6">
        {/* ── Top Network Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-[#E5E7EB]">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Active Network
            </span>
            <div className="text-2xl font-black text-[#0D0E11] tabular-nums">
              {clients.length} Clients
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              Auto-synced from PayPal invoicing
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Total Outstanding
            </span>
            <div className="text-2xl font-black text-[#0D0E11] tabular-nums">
              {formatCents(totalOutstanding)}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
              <span>Active collection protocol</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
              Lifetime Settled
            </span>
            <div className="text-2xl font-black text-[#10B981] tabular-nums flex items-center justify-between">
              <span>{formatCents(totalSettled)}</span>
              <LottieCheck size={26} />
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span>Zero-loss recovery</span>
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-[#0D0E11]">
            Directory ({filtered.length})
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-60 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0D0E11] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0D0E11] transition-all"
            />
          </div>
        </div>

        {/* ── Clients Table ── */}
        <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-[#E5E7EB]">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#9CA3AF]">
              Loading client accounts...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-8 h-8 text-[#9CA3AF] mx-auto stroke-1" />
              <div className="text-sm font-bold text-[#0D0E11]">No clients found</div>
              <div className="text-xs text-[#6B7280]">
                Clients are automatically added when you scope an invoice.
              </div>
            </div>
          ) : (
            filtered.map((client) => {
              const cs = clientStats(client.id);
              const isSelected = selectedClient?.id === client.id;
              return (
                <div
                  key={client.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    isSelected ? "bg-[#F9FAFB]" : "hover:bg-[#FAFAFA]"
                  }`}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => {
                      playSoftClick();
                      setSelectedClient(isSelected ? null : client);
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0D0E11]">{client.name}</span>
                        {client.company && (
                          <span className="text-xs text-[#6B7280]">({client.company})</span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
                          {cs.invoiceCount} {cs.invoiceCount === 1 ? "invoice" : "invoices"}
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280] font-mono mt-0.5">
                        {client.email}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-[#6B7280] block">
                          Outstanding
                        </span>
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            cs.outstanding > 0 ? "text-amber-600" : "text-[#6B7280]"
                          }`}
                        >
                          {formatCents(cs.outstanding)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-[#6B7280] block">
                          Settled
                        </span>
                        <span className="text-sm font-bold text-[#10B981] tabular-nums">
                          {formatCents(cs.totalPaid)}
                        </span>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 text-[#9CA3AF] transition-transform ${
                          isSelected ? "rotate-90 text-[#0D0E11]" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Client Invoices Drawer */}
                  {isSelected && selectedStats && (
                    <div className="mt-4 pt-4 border-t border-[#E5E7EB] bg-[#F9FAFB] p-4 rounded-xl space-y-3">
                      <div className="text-xs font-bold text-[#0D0E11]">
                        Invoice History for {client.name}
                      </div>

                      <div className="space-y-1.5">
                        {selectedStats.invoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="p-2.5 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#0D0E11]">
                                {inv.invoiceNumber}
                              </span>
                              <span className="text-[#6B7280]">• Due {inv.dueDate}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  inv.status === "PAID"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </div>

                            <span className="font-mono font-bold text-[#0D0E11] tabular-nums">
                              {formatCents(inv.amountTotalCents)}
                            </span>
                          </div>
                        ))}
                      </div>
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
