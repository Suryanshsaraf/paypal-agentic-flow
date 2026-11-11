/**
 * PayPal Webhook Processor — Get Paid
 * Implements transaction-safe event handling, idempotent deduplication on paypal_event_id,
 * state transition guards, and automatic thank-you note logging.
 * As per BUILD_PLAN.md: Never regress out of PAID; deduplicate every inbound event.
 */

import { db } from "./db";
import { Invoice, EventLog } from "./types";

export interface ProcessWebhookResult {
  handled: boolean;
  isDuplicate: boolean;
  eventType: string;
  invoiceId?: string;
  invoiceNumber?: string;
  newStatus?: string;
  message: string;
}

export async function processPayPalWebhookEvent(eventPayload: any): Promise<ProcessWebhookResult> {
  const eventId = eventPayload?.id;
  const eventType = eventPayload?.event_type;
  const resource = eventPayload?.resource;

  if (!eventId || !eventType) {
    return {
      handled: false,
      isDuplicate: false,
      eventType: eventType || "UNKNOWN",
      message: "Missing event id or event_type in webhook payload.",
    };
  }

  // 1. Locate corresponding invoice by paypalInvoiceId or id in resource
  const paypalInvoiceId = resource?.invoice?.id || resource?.id;
  let invoice: Invoice | undefined;

  if (paypalInvoiceId) {
    invoice = db.findInvoiceByPaypalId(paypalInvoiceId);
  }

  // Fallback: check custom_id if set
  if (!invoice && resource?.invoice?.detail?.invoice_number) {
    const list = db.listInvoices();
    invoice = list.find((i) => i.invoiceNumber === resource.invoice.detail.invoice_number);
  }

  // Handle Event Types
  switch (eventType) {
    case "INVOICING.INVOICE.PAID":
    case "PAYMENT.CAPTURE.COMPLETED": {
      if (!invoice) {
        return {
          handled: false,
          isDuplicate: false,
          eventType,
          message: `Invoice not found for PayPal ID '${paypalInvoiceId}'.`,
        };
      }

      // Check for duplicate webhook delivery (idempotency)
      const auditRes = db.addEvent({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        eventType: "WEBHOOK_PAID",
        paypalEventId: eventId,
        payload: {
          paypalInvoiceId,
          amountCents: invoice.amountTotalCents,
          paidAt: new Date().toISOString(),
          transactionId: resource?.id,
        },
      });

      if (auditRes.isDuplicate) {
        return {
          handled: true,
          isDuplicate: true,
          eventType,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          newStatus: invoice.status,
          message: "Duplicate webhook delivery ignored idempotently.",
        };
      }

      // State Invariant: Update to PAID, stop chasing
      const updatedInvoice = db.updateInvoice(invoice.id, {
        status: "PAID",
        workStatus: "COMPLETED",
        paidAt: new Date().toISOString(),
        nextReminderAt: undefined, // Cease auto-chasing
      })!;

      // Automatically generate & log Thank-You event
      const clientName = invoice.client?.name || "Client";
      db.addEvent({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        eventType: "THANKYOU_SENT",
        payload: {
          clientName,
          invoiceNumber: invoice.invoiceNumber,
          message: `Autonomous thank-you dispatched to ${clientName}: Payment for ${invoice.invoiceNumber} confirmed! Work status updated to COMPLETED.`,
        },
      });

      return {
        handled: true,
        isDuplicate: false,
        eventType,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        newStatus: "PAID",
        message: `Invoice ${invoice.invoiceNumber} marked PAID and thank-you event logged.`,
      };
    }

    case "INVOICING.INVOICE.CANCELLED": {
      if (!invoice) {
        return { handled: false, isDuplicate: false, eventType, message: "Invoice not found." };
      }

      const auditRes = db.addEvent({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        eventType: "WEBHOOK_CANCELLED",
        paypalEventId: eventId,
        payload: { paypalInvoiceId },
      });

      if (auditRes.isDuplicate) {
        return { handled: true, isDuplicate: true, eventType, message: "Duplicate cancelled event." };
      }

      // Never regress out of PAID
      if (invoice.status === "PAID") {
        return { handled: true, isDuplicate: false, eventType, message: "Invoice already PAID; cannot regress." };
      }

      db.updateInvoice(invoice.id, {
        status: "CANCELLED",
        nextReminderAt: undefined,
      });

      return {
        handled: true,
        isDuplicate: false,
        eventType,
        invoiceId: invoice.id,
        newStatus: "CANCELLED",
        message: `Invoice ${invoice.invoiceNumber} cancelled.`,
      };
    }

    default:
      return {
        handled: true,
        isDuplicate: false,
        eventType,
        message: `Webhook event '${eventType}' acknowledged.`,
      };
  }
}
