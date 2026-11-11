import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processPayPalWebhookEvent } from "@/lib/webhook-processor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoiceId = body.invoiceId;

    if (!invoiceId) {
      return NextResponse.json(
        { ok: false, error: "Missing 'invoiceId' in request body." },
        { status: 400 }
      );
    }

    const invoice = db.getInvoice(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { ok: false, error: `Invoice with ID '${invoiceId}' not found.` },
        { status: 404 }
      );
    }

    // Synthesize real-shaped PayPal INVOICING.INVOICE.PAID event
    const eventId = `WH-DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const syntheticEvent = {
      id: eventId,
      event_version: "1.0",
      create_time: new Date().toISOString(),
      event_type: "INVOICING.INVOICE.PAID",
      summary: `Invoice ${invoice.invoiceNumber} was paid`,
      resource_type: "invoices",
      resource: {
        id: `CAPTURE-${Date.now()}`,
        invoice: {
          id: invoice.paypalInvoiceId || `INV2-DEMO-${invoice.id}`,
          detail: {
            invoice_number: invoice.invoiceNumber,
          },
        },
      },
    };

    // Replay through the real webhook processor
    const result = await processPayPalWebhookEvent(syntheticEvent);

    return NextResponse.json({
      ok: true,
      message: `Demo mark-paid succeeded for ${invoice.invoiceNumber}`,
      result,
      invoice: db.getInvoice(invoiceId),
    });
  } catch (error: any) {
    console.error("[POST /api/demo/mark-paid error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
