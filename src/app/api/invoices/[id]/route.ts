import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    let invoice = db.getInvoice(id);

    // Also attempt lookup by PayPal Invoice ID or invoice number if not found by primary key
    if (!invoice) {
      invoice = db.findInvoiceByPaypalId(id);
    }
    if (!invoice) {
      const all = db.listInvoices();
      invoice = all.find((i) => i.invoiceNumber.toLowerCase() === id.toLowerCase());
    }

    if (!invoice) {
      return NextResponse.json(
        { ok: false, error: `Invoice with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
