import { NextRequest, NextResponse } from "next/server";
import { chaseInvoice } from "@/lib/chase";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Manual user-triggered follow-up";

    const result = await chaseInvoice(invoiceId, reason);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      invoice: result.invoice,
      reminder: result.reminder,
      escalatedToHuman: result.escalatedToHuman,
    });
  } catch (error: any) {
    console.error("[POST /api/invoices/[id]/remind error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
