import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await req.json();
    const replyText = (body.replyText || "").trim();

    if (!replyText) {
      return NextResponse.json(
        { ok: false, error: "Missing 'replyText' in request body." },
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

    const lower = replyText.toLowerCase();

    // Classification (Rule-based & heuristic safe classifier)
    let classification: "PROMISE_TO_PAY" | "DISPUTE" | "ALREADY_PAID" | "GENERAL";
    let actionTaken = "";

    if (lower.includes("dispute") || lower.includes("incorrect") || lower.includes("wrong amount") || lower.includes("not authorized")) {
      classification = "DISPUTE";
      // Pause chasing and flag for human review
      db.updateInvoice(invoice.id, {
        status: "NEEDS_REVIEW",
        nextReminderAt: undefined,
      });
      db.addEvent({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        eventType: "DISPUTE_FLAGGED",
        payload: {
          replyText,
          reason: "Client flagged dispute or billing discrepancy. Chasing halted for manual review.",
        },
      });
      actionTaken = "Flagged as DISPUTE. Autonomous reminders halted and escalated for human review.";
    } else if (lower.includes("will pay") || lower.includes("paying friday") || lower.includes("next week") || lower.includes("scheduled")) {
      classification = "PROMISE_TO_PAY";
      // Reschedule next reminder +5 days out
      const newReminder = new Date(Date.now() + 5 * 86400000).toISOString();
      db.updateInvoice(invoice.id, {
        nextReminderAt: newReminder,
      });
      db.addEvent({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        eventType: "RESCHEDULED",
        payload: {
          replyText,
          reason: "Client provided promise-to-pay. Next automated reminder deferred by 5 days.",
          nextReminderAt: newReminder,
        },
      });
      actionTaken = `Classified as PROMISE_TO_PAY. Next reminder deferred by 5 days.`;
    } else if (lower.includes("already paid") || lower.includes("sent wire") || lower.includes("check sent")) {
      classification = "ALREADY_PAID";
      db.addEvent({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        eventType: "REPLY_RECEIVED",
        payload: {
          replyText,
          reason: "Client claims payment was already initiated via alternate channel.",
        },
      });
      actionTaken = "Classified as ALREADY_PAID. Awaiting bank settlement confirmation.";
    } else {
      classification = "GENERAL";
      db.addEvent({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        eventType: "REPLY_RECEIVED",
        payload: { replyText },
      });
      actionTaken = "Client reply recorded in audit trail.";
    }

    return NextResponse.json({
      ok: true,
      classification,
      actionTaken,
      invoice: db.getInvoice(invoiceId),
    });
  } catch (error: any) {
    console.error("[POST /api/invoices/[id]/reply error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
