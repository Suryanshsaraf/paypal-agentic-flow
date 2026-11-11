import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPayPalCheckoutOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ ok: false, error: "invoiceId is required" }, { status: 400 });
    }

    let invoice = db.getInvoice(invoiceId);
    if (!invoice) invoice = db.findInvoiceByPaypalId(invoiceId);
    if (!invoice) {
      const all = db.listInvoices();
      invoice = all.find((i) => i.invoiceNumber.toLowerCase() === invoiceId.toLowerCase());
    }

    if (!invoice) {
      return NextResponse.json({ ok: false, error: `Invoice '${invoiceId}' not found` }, { status: 404 });
    }

    const orderRes = await createPayPalCheckoutOrder({
      invoiceNumber: invoice.invoiceNumber,
      amountCents: invoice.amountTotalCents,
      currency: invoice.currency,
      description: invoice.sourceMessage || `Invoice ${invoice.invoiceNumber}`,
      items: invoice.lineItems?.map((li) => ({
        name: li.description,
        quantity: li.quantity,
        unitPriceCents: li.unitPriceCents,
      })),
    });

    if (!orderRes.ok || !orderRes.approveUrl) {
      return NextResponse.json({ ok: false, error: orderRes.error || "Failed to create order" }, { status: 500 });
    }

    // Save PayPal order reference to DB
    db.updateInvoice(invoice.id, {
      paypalInvoiceId: orderRes.orderId,
      paypalPaymentUrl: orderRes.approveUrl,
    });

    return NextResponse.json({
      ok: true,
      orderId: orderRes.orderId,
      approveUrl: orderRes.approveUrl,
      isSimulated: orderRes.isSimulated,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Internal server error" }, { status: 500 });
  }
}
