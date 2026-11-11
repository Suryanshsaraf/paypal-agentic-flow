import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPayPalInvoice, sendPayPalInvoice } from "@/lib/paypal";
import { InvoiceStatus, LineItem } from "@/lib/types";
import { addCents } from "@/lib/money";

export const dynamic = "force-dynamic";

// In-memory idempotency cache to prevent double-submit
const idempotencyStore = new Map<string, { response: any; timestamp: number }>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as InvoiceStatus | null;
    const clientId = searchParams.get("clientId") || undefined;

    const invoices = db.listInvoices({
      status: status || undefined,
      clientId,
    });

    return NextResponse.json({
      ok: true,
      invoices,
      count: invoices.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Idempotency Check
    const idempotencyKey = body.idempotencyKey || req.headers.get("x-idempotency-key");
    if (idempotencyKey) {
      const cached = idempotencyStore.get(idempotencyKey);
      if (cached && Date.now() - cached.timestamp < 300000) {
        // Cached response valid for 5 minutes
        return NextResponse.json(cached.response);
      }
    }

    // 2. Validate input
    const clientEmail = (body.clientEmail || "").trim().toLowerCase();
    if (!clientEmail || !clientEmail.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "A valid client email address is required to issue a PayPal invoice." },
        { status: 400 }
      );
    }

    const rawLineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
    if (rawLineItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: "At least one line item is required." },
        { status: 400 }
      );
    }

    // Sanitize and compute line items
    let totalCents = 0;
    const lineItems: LineItem[] = rawLineItems.map((item: any, idx: number) => {
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitCents = Math.max(0, parseInt(item.unitPriceCents, 10) || 0);
      const itemTotal = item.totalCents ? parseInt(item.totalCents, 10) : qty * unitCents;

      // Range check
      if (unitCents < 0 || itemTotal < 0) {
        throw new Error(`Invalid negative pricing on line item: ${item.description}`);
      }
      if (itemTotal > 100000000) {
        throw new Error("Line item exceeds single-transaction sanity limit ($1,000,000).");
      }

      totalCents += itemTotal;

      return {
        id: `li_${Date.now()}_${idx}`,
        invoiceId: "",
        description: item.description || `Item #${idx + 1}`,
        quantity: qty,
        unitPriceCents: unitCents,
        totalCents: itemTotal,
      };
    });

    if (totalCents <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invoice total must be greater than $0.00." },
        { status: 400 }
      );
    }

    const dueDate = body.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    const currency = (body.currency || "USD").toUpperCase();

    // 3. Upsert Client
    const client = db.upsertClient({
      name: body.clientName || clientEmail.split("@")[0],
      email: clientEmail,
      company: body.companyName,
    });

    // 4. Generate sequential invoice number
    const existingCount = db.listInvoices().length;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(existingCount + 1).padStart(3, "0")}`;

    // 5. Create DRAFT Invoice in DB
    let invoice = db.createInvoice({
      clientId: client.id,
      invoiceNumber,
      status: "DRAFT",
      amountTotalCents: totalCents,
      currency,
      dueDate,
      reminderLevel: 0,
      workStatus: "ACTIVE",
      lateFeeCents: 0,
      lineItems,
      sourceMessage: body.sourceMessage,
    });

    // Link line items to invoice id
    invoice.lineItems.forEach((li) => (li.invoiceId = invoice.id));

    // 6. PayPal Create
    let ppInvoice;
    try {
      ppInvoice = await createPayPalInvoice({
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        primaryRecipientEmail: client.email,
        recipientName: client.name,
        items: lineItems.map((li) => ({
          name: li.description,
          description: li.description,
          quantity: li.quantity,
          unitPriceCents: li.unitPriceCents,
        })),
        note: body.notes || "Sent via Get Paid Copilot",
      });
    } catch (createErr: any) {
      console.error("[PayPal createInvoice failed]", createErr);
      return NextResponse.json(
        { ok: false, error: `Failed to create invoice with PayPal: ${createErr.message}` },
        { status: 502 }
      );
    }

    const paymentUrl = ppInvoice.isSimulated
      ? `/pay/${invoice.id}`
      : ppInvoice.paymentUrl || `/pay/${invoice.id}`;

    // Update with PayPal invoice ID
    invoice = db.updateInvoice(invoice.id, {
      paypalInvoiceId: ppInvoice.id,
      paypalPaymentUrl: paymentUrl,
    })!;

    // 7. PayPal Send
    let sendResult;
    try {
      sendResult = await sendPayPalInvoice(ppInvoice.id);
    } catch (sendErr: any) {
      console.warn("[PayPal send error]", sendErr);
      sendResult = { success: false, error: sendErr.message };
    }

    if (sendResult.success) {
      // Mark SENT and append audit event
      invoice = db.updateInvoice(invoice.id, {
        status: "SENT",
        nextReminderAt: new Date(new Date(dueDate).getTime() + 86400000).toISOString(), // Level 1 threshold
      })!;

      db.addEvent({
        invoiceId: invoice.id,
        clientId: client.id,
        eventType: "INVOICE_SENT",
        payload: {
          invoiceNumber: invoice.invoiceNumber,
          amountCents: invoice.amountTotalCents,
          recipientEmail: client.email,
          paypalInvoiceId: ppInvoice.id,
          paymentUrl: ppInvoice.paymentUrl,
          isSimulated: ppInvoice.isSimulated,
        },
      });
    } else {
      // Keep as DRAFT so user can retry send
      console.warn(`[PayPal Send Warning] Invoice ${invoice.id} created as ${ppInvoice.id} but send returned error.`);
      db.addEvent({
        invoiceId: invoice.id,
        clientId: client.id,
        eventType: "INVOICE_CREATED",
        payload: {
          invoiceNumber: invoice.invoiceNumber,
          paypalInvoiceId: ppInvoice.id,
          sendError: sendResult.error,
        },
      });
    }

    const finalResponse = {
      ok: true,
      invoice,
      client,
      paypal: {
        id: ppInvoice.id,
        paymentUrl: invoice.paypalPaymentUrl || ppInvoice.paymentUrl,
        sent: sendResult.success,
        isSimulated: ppInvoice.isSimulated,
      },
    };

    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, { response: finalResponse, timestamp: Date.now() });
    }

    return NextResponse.json(finalResponse, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/invoices error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
