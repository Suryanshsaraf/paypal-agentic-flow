import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const invoices = db.listInvoices();
    const clients = db.listClients();

    const sentInvoices = invoices.filter((i) => i.status === "SENT");
    const paidInvoices = invoices.filter((i) => i.status === "PAID");
    const needsReviewInvoices = invoices.filter((i) => i.status === "NEEDS_REVIEW");

    const totalOutstandingCents = sentInvoices.reduce((sum, i) => sum + i.amountTotalCents, 0);
    const totalPaidCents = paidInvoices.reduce((sum, i) => sum + i.amountTotalCents, 0);

    const now = new Date();
    const overdueCount = sentInvoices.filter((i) => new Date(i.dueDate) < now).length;

    return NextResponse.json({
      ok: true,
      stats: {
        totalOutstandingCents,
        totalPaidCents,
        overdueCount,
        sentCount: sentInvoices.length,
        paidCount: paidInvoices.length,
        needsReviewCount: needsReviewInvoices.length,
        clientCount: clients.length,
        totalInvoiceCount: invoices.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
