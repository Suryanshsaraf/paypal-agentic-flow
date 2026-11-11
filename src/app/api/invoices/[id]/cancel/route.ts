import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cancelPayPalInvoice } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Cancelled by freelancer";

    const invoice = db.getInvoice(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { ok: false, error: `Invoice with ID '${invoiceId}' not found.` },
        { status: 404 }
      );
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { ok: false, error: "Cannot cancel an invoice that is already PAID." },
        { status: 400 }
      );
    }

    // Cancel in PayPal
    if (invoice.paypalInvoiceId) {
      await cancelPayPalInvoice(invoice.paypalInvoiceId, "Invoice Cancelled", reason);
    }

    const updated = db.updateInvoice(invoice.id, {
      status: "CANCELLED",
      nextReminderAt: undefined,
    })!;

    db.addEvent({
      invoiceId: invoice.id,
      clientId: invoice.clientId,
      eventType: "WEBHOOK_CANCELLED",
      payload: {
        reason,
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    return NextResponse.json({
      ok: true,
      invoice: updated,
    });
  } catch (error: any) {
    console.error("[POST /api/invoices/[id]/cancel error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
