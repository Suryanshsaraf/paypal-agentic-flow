/**
 * Autonomous Accounts-Receivable Chasing Engine — Get Paid
 * Implements multi-tier tone escalation (Friendly -> Neutral -> Firm -> Human Escalation),
 * scheduled ticks, PayPal reminder dispatch with custom subject/note, and activity logging.
 * As per BUILD_PLAN.md: Advance level ONLY after successful send; never chase PAID or cancelled.
 */

import { db } from "./db";
import { Invoice, ReminderTone, Reminder } from "./types";
import { formatCents, centsToDecimalString } from "./money";
import { remindPayPalInvoice } from "./paypal";

export interface ReminderDraft {
  level: number;
  tone: ReminderTone;
  subject: string;
  body: string;
}

/**
 * Generate escalating reminder copy based on current level and overdue duration
 */
export function draftReminderCopy(invoice: Invoice, targetLevel: number): ReminderDraft {
  const clientName = invoice.client?.name || "Client";
  const invNumber = invoice.invoiceNumber;
  const amountStr = formatCents(invoice.amountTotalCents, invoice.currency);
  const dueDate = invoice.dueDate;

  switch (targetLevel) {
    case 1:
      return {
        level: 1,
        tone: "FRIENDLY",
        subject: `Friendly check-in: Invoice ${invNumber} for ${amountStr}`,
        body: `Hi ${clientName},\n\nI hope you're having a productive week! Just sending a quick, friendly note to check in on invoice ${invNumber} (${amountStr}), which was due on ${dueDate}.\n\nWhenever you have a moment, you can review and pay securely via the attached PayPal invoice link. Let me know if you need any additional receipts or documentation!\n\nBest regards,\nAlex Morgan`,
      };

    case 2:
      return {
        level: 2,
        tone: "NEUTRAL",
        subject: `Overdue Notice: Invoice ${invNumber} (${amountStr}) — Milestone Deliverables Paused`,
        body: `Hi ${clientName},\n\nThis is a follow-up regarding invoice ${invNumber} for ${amountStr}, which is now overdue (due date was ${dueDate}).\n\nPlease remit payment via the attached PayPal link at your earliest convenience. Per standard freelance agreement terms, upcoming project milestones and deliverables are temporarily paused pending payment receipt.\n\nThank you for your prompt attention.\n\nAlex Morgan`,
      };

    case 3:
      return {
        level: 3,
        tone: "FIRM",
        subject: `Final Notice: Outstanding Balance for Invoice ${invNumber} (${amountStr})`,
        body: `Hi ${clientName},\n\nWe have not yet received payment for invoice ${invNumber} (${amountStr}), which is now significantly past due (${dueDate}).\n\nPlease settle this account immediately using the PayPal payment link below to avoid formal collection procedures and accrued late payment fees (1.5% monthly).\n\nIf payment was already submitted today, please reply with the reference number so we can update our records.\n\nAlex Morgan`,
      };

    default:
      return {
        level: 4,
        tone: "FIRM",
        subject: `Escalation to Human: Invoice ${invNumber}`,
        body: `Autonomous agent limits reached after 3 formal reminder attempts. Escalated to Alex for direct phone call or dispute management.`,
      };
  }
}

/**
 * Autonomous chase single invoice
 */
export async function chaseInvoice(
  invoiceId: string,
  triggerReason = "Scheduled autonomous sweep"
): Promise<{ success: boolean; invoice?: Invoice; reminder?: Reminder; escalatedToHuman?: boolean; error?: string }> {
  const invoice = db.getInvoice(invoiceId);

  if (!invoice) {
    return { success: false, error: `Invoice '${invoiceId}' not found.` };
  }

  // Guard Invariant: Never chase non-SENT invoices
  if (invoice.status !== "SENT") {
    return {
      success: false,
      error: `Invoice status is '${invoice.status}'. Autonomous chasing only operates on 'SENT' invoices.`,
    };
  }

  const nextLevel = invoice.reminderLevel + 1;

  // Level 4 Check: Autonomous Agent knows its limits! Escalates to Human.
  if (nextLevel > 3) {
    const updated = db.updateInvoice(invoice.id, {
      status: "NEEDS_REVIEW",
      nextReminderAt: undefined,
    })!;

    db.addEvent({
      invoiceId: invoice.id,
      clientId: invoice.clientId,
      eventType: "ESCALATED_TO_HUMAN",
      payload: {
        reason: "Autonomous agent limits reached after Level 3 Firm Notice. Chasing paused for manual human intervention.",
        clientName: invoice.client?.name,
        invoiceNumber: invoice.invoiceNumber,
        amountCents: invoice.amountTotalCents,
      },
    });

    return {
      success: true,
      invoice: updated,
      escalatedToHuman: true,
    };
  }

  // Generate Draft Copy
  const draft = draftReminderCopy(invoice, nextLevel);

  // Dispatch reminder through PayPal
  let ppRes = { success: true };
  if (invoice.paypalInvoiceId) {
    try {
      ppRes = await remindPayPalInvoice(invoice.paypalInvoiceId, draft.subject, draft.body);
    } catch (err: any) {
      console.warn("[PayPal Remind error]", err);
      ppRes = { success: false };
    }
  }

  if (!ppRes.success) {
    console.warn(`[Chase Engine] Failed to dispatch reminder via PayPal for ${invoice.id}. Will retry next tick.`);
    return { success: false, error: "PayPal reminder dispatch returned non-200." };
  }

  // Calculate next reminder date (demo-shortened or Net-4/Net-8 days)
  const nextReminderAt = new Date(Date.now() + 4 * 86400000).toISOString();
  const workStatus = nextLevel >= 2 ? "PAUSED_DUE_TO_NON_PAYMENT" : invoice.workStatus;

  // Advance level and update record
  const updated = db.updateInvoice(invoice.id, {
    reminderLevel: nextLevel,
    lastRemindedAt: new Date().toISOString(),
    nextReminderAt,
    workStatus,
  })!;

  // Record Reminder
  const reminder = db.addReminder({
    invoiceId: invoice.id,
    level: nextLevel,
    tone: draft.tone,
    subject: draft.subject,
    body: draft.body,
    channel: "PAYPAL_REMIND",
    paypalReminderId: invoice.paypalInvoiceId,
  });

  // Append Audit Event with reasoning line
  const reasoning =
    nextLevel === 1
      ? "Invoice reached overdue threshold. Dispatched polite Level 1 check-in to preserve client relationship."
      : nextLevel === 2
      ? "Invoice 5+ days past due. Dispatched Level 2 Neutral overdue notice and automatically paused active sprint deliverables."
      : "Invoice 10+ days past due. Dispatched Level 3 Firm final warning with accrued late fee terms.";

  db.addEvent({
    invoiceId: invoice.id,
    clientId: invoice.clientId,
    eventType: "REMINDER_SENT",
    payload: {
      invoiceNumber: invoice.invoiceNumber,
      level: nextLevel,
      tone: draft.tone,
      subject: draft.subject,
      reason: `${triggerReason}: ${reasoning}`,
      workStatus,
    },
  });

  return {
    success: true,
    invoice: updated,
    reminder,
  };
}

/**
 * Sweep all invoices and chase overdue ones whose nextReminderAt has arrived
 */
export async function runAutonomousChaseSweep(): Promise<{
  sweptCount: number;
  remindersSent: number;
  escalatedCount: number;
  results: Array<{ invoiceId: string; invoiceNumber: string; level: number; outcome: string }>;
}> {
  const allInvoices = db.listInvoices({ status: "SENT" });
  const now = new Date();

  const overdueInvoices = allInvoices.filter((inv) => {
    // Check if nextReminderAt is reached or if invoice is past due with no reminder yet
    if (inv.nextReminderAt) {
      return new Date(inv.nextReminderAt) <= now;
    }
    return new Date(inv.dueDate) < now;
  });

  const results: Array<{ invoiceId: string; invoiceNumber: string; level: number; outcome: string }> = [];
  let remindersSent = 0;
  let escalatedCount = 0;

  for (const inv of overdueInvoices) {
    const chaseRes = await chaseInvoice(inv.id, "Autonomous cron tick");
    if (chaseRes.success) {
      if (chaseRes.escalatedToHuman) {
        escalatedCount++;
        results.push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          level: 4,
          outcome: "ESCALATED_TO_HUMAN",
        });
      } else {
        remindersSent++;
        results.push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          level: chaseRes.reminder?.level || inv.reminderLevel + 1,
          outcome: `SENT_REMINDER_${chaseRes.reminder?.tone}`,
        });
      }
    } else {
      results.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        level: inv.reminderLevel,
        outcome: `FAILED: ${chaseRes.error}`,
      });
    }
  }

  return {
    sweptCount: overdueInvoices.length,
    remindersSent,
    escalatedCount,
    results,
  };
}
