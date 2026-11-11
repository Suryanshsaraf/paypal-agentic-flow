/**
 * Core Data Models & Enums — Get Paid
 * Exactly matching DOCS/BUILD_PLAN.md & DOCS/API_ENDPOINTS.md
 */

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "NEEDS_REVIEW" | "CANCELLED";

export type ReminderTone = "FRIENDLY" | "NEUTRAL" | "FIRM";

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface Reminder {
  id: string;
  invoiceId: string;
  level: number; // 1, 2, 3
  tone: ReminderTone;
  subject: string;
  body: string;
  sentAt: string;
  paypalReminderId?: string;
  channel: "PAYPAL_REMIND" | "IN_APP_COPY";
}

export interface EventLog {
  id: string;
  invoiceId?: string;
  clientId?: string;
  eventType: 
    | "INVOICE_CREATED"
    | "INVOICE_SENT"
    | "REMINDER_SENT"
    | "WEBHOOK_PAID"
    | "THANKYOU_SENT"
    | "REPLY_RECEIVED"
    | "RESCHEDULED"
    | "DISPUTE_FLAGGED"
    | "ESCALATED_TO_HUMAN"
    | "WEBHOOK_CANCELLED";
  paypalEventId?: string;
  payload: Record<string, any>;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  client?: Client;
  invoiceNumber: string;
  paypalInvoiceId?: string;
  status: InvoiceStatus;
  amountTotalCents: number;
  currency: string;
  dueDate: string; // YYYY-MM-DD
  reminderLevel: number; // 0, 1, 2, 3
  lastRemindedAt?: string;
  nextReminderAt?: string;
  workStatus: "ACTIVE" | "PAUSED_DUE_TO_NON_PAYMENT" | "COMPLETED";
  lateFeeCents: number;
  lineItems: LineItem[];
  reminders: Reminder[];
  events: EventLog[];
  sourceMessage?: string;
  paypalPaymentUrl?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthResponse {
  ok: boolean;
  db: boolean;
  paypal: boolean;
  timestamp: string;
  version: string;
  env: {
    sandbox: boolean;
    appUrl: string;
  };
  details?: {
    paypalMode: "LIVE_SANDBOX_TOKEN" | "SIMULATED_SANDBOX";
    tokenCached: boolean;
    tokenExpiry?: string;
  };
}
