"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, Mail, Building, DollarSign, FileText, Search } from "lucide-react";
import { Client, Invoice } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRowSkeleton } from "@/components/ui/skeleton";

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

  // Computed per-client stats
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-page-title text-text-primary">Clients</h1>
          <p className="text-body text-text-muted mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""} in your network.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="pl-8 pr-3 py-1.5 w-56 bg-bg-secondary border border-border rounded-control text-meta text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <Card padding="none">
            {loading ? (
              <div className="divide-y divide-border">
                {[1, 2, 3].map((i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Users className="w-10 h-10" />}
                title="No clients found"
                description="Clients are created automatically when you send invoices."
              />
            ) : (
              <div className="divide-y divide-border">
                <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-timestamp text-text-muted font-medium">
                  <span className="col-span-3">Name</span>
                  <span className="col-span-3">Email</span>
                  <span className="col-span-2">Company</span>
                  <span className="col-span-1 text-right">Invoices</span>
                  <span className="col-span-1 text-right hidden md:block">Paid</span>
                  <span className="col-span-2 text-right">Outstanding</span>
                </div>

                {filtered.map((client) => {
                  const cs = clientStats(client.id);
                  const isSelected = selectedClient?.id === client.id;
                  return (
                    <button
                      key={client.id}
                      onClick={() =>
                        setSelectedClient(isSelected ? null : client)
                      }
                      className={`w-full grid grid-cols-12 gap-3 px-4 py-3 items-center text-left transition-colors ${
                        isSelected
                          ? "bg-accent-muted"
                          : "hover:bg-bg-interactive"
                      }`}
                    >
                      <span className="col-span-3 text-body text-text-primary font-medium truncate">
                        {client.name}
                      </span>
                      <span className="col-span-3 text-meta text-text-muted truncate">
                        {client.email}
                      </span>
                      <span className="col-span-2 text-meta text-text-secondary truncate">
                        {client.company || "—"}
                      </span>
                      <span className="col-span-1 text-meta text-text-secondary text-right tabular-nums">
                        {cs.invoiceCount}
                      </span>
                      <span className="col-span-1 text-meta text-success text-right tabular-nums hidden md:block">
                        {formatCents(cs.totalPaid)}
                      </span>
                      <span
                        className={`col-span-2 text-body font-semibold text-right tabular-nums ${
                          cs.outstanding > 0 ? "text-warning" : "text-text-muted"
                        }`}
                      >
                        {formatCents(cs.outstanding)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Client Detail Panel */}
        {selectedClient && selectedStats && (
          <div className="w-80 shrink-0 hidden lg:block">
            <Card className="sticky top-6">
              <div className="pb-3 border-b border-border mb-4">
                <h3 className="text-section text-text-primary">
                  {selectedClient.name}
                </h3>
                <div className="flex items-center gap-1.5 text-meta text-text-muted mt-1">
                  <Mail className="w-3 h-3" />
                  {selectedClient.email}
                </div>
                {selectedClient.company && (
                  <div className="flex items-center gap-1.5 text-meta text-text-muted mt-1">
                    <Building className="w-3 h-3" />
                    {selectedClient.company}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <span className="text-timestamp text-text-muted block">
                    Total Invoiced
                  </span>
                  <span className="text-body font-semibold text-text-primary tabular-nums">
                    {formatCents(selectedStats.totalInvoiced)}
                  </span>
                </div>
                <div>
                  <span className="text-timestamp text-text-muted block">
                    Total Paid
                  </span>
                  <span className="text-body font-semibold text-success tabular-nums">
                    {formatCents(selectedStats.totalPaid)}
                  </span>
                </div>
                <div>
                  <span className="text-timestamp text-text-muted block">
                    Outstanding
                  </span>
                  <span className={`text-body font-semibold tabular-nums ${selectedStats.outstanding > 0 ? "text-warning" : "text-text-muted"}`}>
                    {formatCents(selectedStats.outstanding)}
                  </span>
                </div>
                <div>
                  <span className="text-timestamp text-text-muted block">
                    Last Payment
                  </span>
                  <span className="text-body text-text-secondary">
                    {selectedStats.lastPayment
                      ? new Date(selectedStats.lastPayment).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>

              {selectedStats.invoices.length > 0 && (
                <div>
                  <h4 className="text-timestamp text-text-muted font-medium mb-2 uppercase tracking-wider">
                    Invoice History
                  </h4>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {selectedStats.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-2 rounded-control bg-bg-primary border border-border text-meta"
                      >
                        <div>
                          <span className="text-text-primary font-mono">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-timestamp text-text-muted block">
                            {inv.dueDate}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-text-primary font-semibold tabular-nums block">
                            {formatCents(inv.amountTotalCents)}
                          </span>
                          <Badge
                            variant={
                              inv.status === "PAID"
                                ? "paid"
                                : inv.status === "NEEDS_REVIEW"
                                ? "needs_review"
                                : "sent"
                            }
                          >
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
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
