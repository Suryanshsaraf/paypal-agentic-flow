/**
 * Financial Query & Reporting Engine — Get Paid
 * Implements deterministic aggregation over invoices and clients.
 * As per BUILD_PLAN.md: Compute numbers deterministically in code;
 * the LLM only phrases the answer. Never let LLM invent financial numbers.
 */

import { db } from "./db";
import { formatCents, centsToDecimalString } from "./money";

export interface QueryResult {
  intent: "WHO_OWES_ME" | "TOTAL_OUTSTANDING" | "CLIENT_EARNINGS" | "CHASING_STATUS" | "GENERAL_HELP";
  answer: string;
  data: any;
}

export async function processFinancialQuery(question: string): Promise<QueryResult> {
  const q = question.toLowerCase().trim();
  const invoices = db.listInvoices();
  const clients = db.listClients();

  // 1. Intent: WHO_OWES_ME ("who still owes me?", "who hasn't paid?", "unpaid clients")
  if (q.includes("who owes") || q.includes("who still owes") || q.includes("who hasn't paid") || q.includes("unpaid")) {
    const overdueInvoices = invoices.filter((inv) => inv.status === "SENT");
    
    if (overdueInvoices.length === 0) {
      return {
        intent: "WHO_OWES_ME",
        answer: "Great news! You have zero unpaid invoices right now. All clients are fully settled.",
        data: { count: 0, totalCents: 0, clients: [] },
      };
    }

    const debtorList = overdueInvoices.map((inv) => {
      const clientName = inv.client?.name || "Client";
      const company = inv.client?.company ? ` (${inv.client.company})` : "";
      const amt = formatCents(inv.amountTotalCents, inv.currency);
      const toneStr = inv.reminderLevel === 1 ? "Friendly Follow-up" : inv.reminderLevel >= 2 ? "Neutral Overdue Notice" : "Pending";
      return `• ${clientName}${company}: ${amt} for ${inv.invoiceNumber} (Due ${inv.dueDate}, Level ${inv.reminderLevel} ${toneStr})`;
    });

    const totalOverdueCents = overdueInvoices.reduce((sum, inv) => sum + inv.amountTotalCents, 0);

    return {
      intent: "WHO_OWES_ME",
      answer: `You currently have ${overdueInvoices.length} active receivable${overdueInvoices.length > 1 ? "s" : ""} totaling ${formatCents(totalOverdueCents)}:\n\n${debtorList.join("\n")}\n\nThe autonomous copilot is actively monitoring and escalating reminders for these accounts.`,
      data: {
        count: overdueInvoices.length,
        totalCents: totalOverdueCents,
        invoices: overdueInvoices.map((i) => ({
          invoiceNumber: i.invoiceNumber,
          client: i.client?.name,
          amountCents: i.amountTotalCents,
          dueDate: i.dueDate,
          reminderLevel: i.reminderLevel,
        })),
      },
    };
  }

  // 2. Intent: TOTAL_OUTSTANDING ("how much am I owed?", "outstanding balance", "total receivables")
  if (q.includes("how much") && (q.includes("owed") || q.includes("outstanding") || q.includes("receivable"))) {
    const sentInvoices = invoices.filter((inv) => inv.status === "SENT");
    const totalCents = sentInvoices.reduce((sum, inv) => sum + inv.amountTotalCents, 0);

    return {
      intent: "TOTAL_OUTSTANDING",
      answer: `Your total outstanding balance is ${formatCents(totalCents)} across ${sentInvoices.length} active invoice${sentInvoices.length === 1 ? "" : "s"}.`,
      data: { totalCents, count: sentInvoices.length },
    };
  }

  // 3. Intent: CLIENT_EARNINGS ("how much did I make from Acme?", "earnings from fintech", "hypergrowth")
  const clientMatch = clients.find((c) => {
    const nameLower = c.name.toLowerCase();
    const compLower = (c.company || "").toLowerCase();
    const nameParts = nameLower.split(/\s+/);
    const companyKeywords = compLower
      .split(/\s+/)
      .filter((p) => !["inc", "llc", "corp", "corporation", "media", "labs"].includes(p));

    return (
      q.includes(nameLower) ||
      (c.company && q.includes(compLower)) ||
      nameParts.some((p) => p.length > 2 && q.includes(p)) ||
      companyKeywords.some((p) => p.length > 2 && q.includes(p))
    );
  });
  if (clientMatch) {
    const clientInvoices = invoices.filter((i) => i.clientId === clientMatch.id);
    const paidInvoices = clientInvoices.filter((i) => i.status === "PAID");
    const sentInvoices = clientInvoices.filter((i) => i.status === "SENT");

    const totalPaidCents = paidInvoices.reduce((sum, i) => sum + i.amountTotalCents, 0);
    const totalPendingCents = sentInvoices.reduce((sum, i) => sum + i.amountTotalCents, 0);

    return {
      intent: "CLIENT_EARNINGS",
      answer: `For ${clientMatch.name} (${clientMatch.company || "Client"}):\n• Total Collected (Paid): ${formatCents(totalPaidCents)}\n• Currently Outstanding: ${formatCents(totalPendingCents)} (${sentInvoices.length} invoice${sentInvoices.length === 1 ? "" : "s"})\n• Lifetime Invoices: ${clientInvoices.length}`,
      data: {
        clientId: clientMatch.id,
        clientName: clientMatch.name,
        totalPaidCents,
        totalPendingCents,
        totalInvoices: clientInvoices.length,
      },
    };
  }

  // 4. Intent: CHASING_STATUS ("what is the agent doing?", "chase status", "who is being chased?")
  if (q.includes("chase") || q.includes("status") || q.includes("agent") || q.includes("remind")) {
    const chasingInvoices = invoices.filter((i) => i.status === "SENT" && i.reminderLevel > 0);
    const summary = chasingInvoices.map(
      (i) => `• ${i.invoiceNumber} (${i.client?.name || "Client"}): Level ${i.reminderLevel} (${i.reminderLevel === 1 ? "Friendly" : "Neutral/Paused"})`
    );

    return {
      intent: "CHASING_STATUS",
      answer: `The autonomous agent is currently chasing ${chasingInvoices.length} overdue invoice${chasingInvoices.length === 1 ? "" : "s"}:\n\n${summary.join("\n")}`,
      data: { count: chasingInvoices.length, invoices: chasingInvoices },
    };
  }

  // Default fallback
  const totalSentCents = invoices.filter((i) => i.status === "SENT").reduce((sum, i) => sum + i.amountTotalCents, 0);
  return {
    intent: "GENERAL_HELP",
    answer: `You can ask me questions like:\n• "Who still owes me?"\n• "How much am I owed?"\n• "How much did I make from Acme Corporation?"\n• "What is the agent currently chasing?"\n\nCurrently, you have ${formatCents(totalSentCents)} outstanding.`,
    data: { totalSentCents },
  };
}
