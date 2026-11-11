import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chaseInvoice } from "@/lib/chase";

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

    // Backdate due date by 8 days into the past
    const simulatedPastDue = new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0];
    const updated = db.updateInvoice(invoice.id, {
      dueDate: simulatedPastDue,
      nextReminderAt: new Date(Date.now() - 1000).toISOString(), // expired
    })!;

    // Log the simulation event
    db.addEvent({
      invoiceId: invoice.id,
      clientId: invoice.clientId,
      eventType: "RESCHEDULED",
      payload: {
        reason: "Time-machine simulation: due date backdated to trigger immediate autonomous chase.",
        simulatedDueDate: simulatedPastDue,
      },
    });

    // Optionally auto-trigger the chase immediately for instant visual feedback
    const autoChase = body.autoChase !== false;
    let chaseResult = null;
    if (autoChase && updated.status === "SENT") {
      chaseResult = await chaseInvoice(invoice.id, "Time-machine demo trigger");
    }

    return NextResponse.json({
      ok: true,
      message: `Time-machine: Invoice ${invoice.invoiceNumber} simulated as overdue (due ${simulatedPastDue}).`,
      invoice: db.getInvoice(invoiceId),
      chaseResult,
    });
  } catch (error: any) {
    console.error("[POST /api/demo/simulate-overdue error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
