/**
 * In-memory & Persistent Store — Get Paid
 * Exactly matching DOCS/BUILD_PLAN.md data model:
 * clients, invoices, line_items, reminders, events
 * Supports thread-safe operations, idempotent event logging, and demo resets.
 */

import { Client, Invoice, LineItem, Reminder, EventLog, InvoiceStatus } from "./types";

interface DatabaseStore {
  freelancer: {
    name: string;
    email: string;
    businessName: string;
    paypalMerchantId: string;
  };
  clients: Map<string, Client>;
  invoices: Map<string, Invoice>;
  reminders: Map<string, Reminder>;
  events: EventLog[];
  seenPaypalEvents: Set<string>;
}

// Global singleton to persist across Next.js dev server hot reloads
const globalForDb = globalThis as unknown as { __getPaidDb?: DatabaseStore };

function createInitialStore(): DatabaseStore {
  const store: DatabaseStore = {
    freelancer: {
      name: "Alex Morgan",
      email: "alex@morgancreative.io",
      businessName: "Morgan Creative Labs",
      paypalMerchantId: "SB_MERCHANT_ALEX_MORGAN",
    },
    clients: new Map(),
    invoices: new Map(),
    reminders: new Map(),
    events: [],
    seenPaypalEvents: new Set(),
  };

  // Seed Clients
  const acme: Client = {
    id: "cli_acme_corp",
    name: "Sarah Chen",
    email: "sarah@acmecorp.com",
    company: "Acme Corporation",
    phone: "+1-415-555-0199",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  };

  const fintech: Client = {
    id: "cli_fintech_labs",
    name: "David Miller",
    email: "david@fintechlabs.io",
    company: "Fintech Labs Inc",
    phone: "+1-650-555-0142",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  };

  const hyper: Client = {
    id: "cli_hypergrowth",
    name: "Elena Rostova",
    email: "elena@hypergrowth.co",
    company: "HyperGrowth Media",
    phone: "+1-212-555-0188",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  };

  const veloce: Client = {
    id: "cli_veloce",
    name: "Marcus Vance",
    email: "marcus.vance@velocelogistics.com",
    company: "Veloce Fleet Logistics",
    phone: "+1-312-555-0177",
    createdAt: new Date(Date.now() - 75 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 75 * 86400000).toISOString(),
  };

  const lumina: Client = {
    id: "cli_lumina",
    name: "Priya Patel",
    email: "priya@luminahealth.ai",
    company: "Lumina Health Intelligence",
    phone: "+1-415-555-0163",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  };

  const monolith: Client = {
    id: "cli_monolith",
    name: "Julian Thorne",
    email: "julian@monolithstudio.dk",
    company: "Monolith Architecture Copenhagen",
    phone: "+45-32-555-019",
    createdAt: new Date(Date.now() - 110 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 110 * 86400000).toISOString(),
  };

  const kinetix: Client = {
    id: "cli_kinetix",
    name: "Alexander Hayes",
    email: "a.hayes@kinetixrobotics.de",
    company: "Kinetix Robotics GmbH",
    phone: "+49-89-555-012",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
  };

  const nexus: Client = {
    id: "cli_nexus",
    name: "Vikram Malhotra",
    email: "vikram@nexuscap.sg",
    company: "Nexus Capital Partners",
    phone: "+65-6555-0144",
    createdAt: new Date(Date.now() - 140 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 140 * 86400000).toISOString(),
  };

  store.clients.set(acme.id, acme);
  store.clients.set(fintech.id, fintech);
  store.clients.set(hyper.id, hyper);
  store.clients.set(veloce.id, veloce);
  store.clients.set(lumina.id, lumina);
  store.clients.set(monolith.id, monolith);
  store.clients.set(kinetix.id, kinetix);
  store.clients.set(nexus.id, nexus);

  // Seed Invoices
  // Invoice 1: Acme Corp - Overdue 6 days (Level 1 Friendly Reminder sent)
  const inv1Due = new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];
  const inv1Items: LineItem[] = [
    {
      id: "li_1",
      invoiceId: "inv_acme_001",
      description: "Q3 Design System & Mobile App Redesign",
      quantity: 1,
      unitPriceCents: 350000,
      totalCents: 350000,
    },
  ];
  const inv1: Invoice = {
    id: "inv_acme_001",
    clientId: acme.id,
    client: acme,
    invoiceNumber: "INV-2024-001",
    paypalInvoiceId: "INV2-DEMO-ACME-9871",
    status: "SENT",
    amountTotalCents: 350000,
    currency: "USD",
    dueDate: inv1Due,
    reminderLevel: 1,
    lastRemindedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    nextReminderAt: new Date(Date.now() + 1 * 86400000).toISOString(),
    workStatus: "ACTIVE",
    lateFeeCents: 0,
    lineItems: inv1Items,
    reminders: [
      {
        id: "rem_1",
        invoiceId: "inv_acme_001",
        level: 1,
        tone: "FRIENDLY",
        subject: "Friendly check-in: Invoice INV-2024-001 for Acme Corporation",
        body: "Hi Sarah, gentle reminder that Invoice INV-2024-001 for $3,500.00 USD was due on " + inv1Due + ". Whenever you have a moment to process this via PayPal, it would be greatly appreciated!",
        sentAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        channel: "PAYPAL_REMIND",
      },
    ],
    events: [],
    sourceMessage: "Sarah Chen: Hey Alex, go ahead with the full Q3 mobile redesign and components. Send over the invoice for $3,500 whenever you are ready.",
    paypalPaymentUrl: "https://www.sandbox.paypal.com/invoice/p/#INV2-DEMO-ACME-9871",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  };

  // Invoice 2: Fintech Labs - Overdue 15 days (Level 2 Neutral Reminder sent, work paused)
  const inv2Due = new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0];
  const inv2Items: LineItem[] = [
    {
      id: "li_2",
      invoiceId: "inv_fintech_002",
      description: "API Security Audit & Penetration Testing Report",
      quantity: 1,
      unitPriceCents: 180000,
      totalCents: 180000,
    },
  ];
  const inv2: Invoice = {
    id: "inv_fintech_002",
    clientId: fintech.id,
    client: fintech,
    invoiceNumber: "INV-2024-002",
    paypalInvoiceId: "INV2-DEMO-FINTECH-5541",
    status: "SENT",
    amountTotalCents: 180000,
    currency: "USD",
    dueDate: inv2Due,
    reminderLevel: 2,
    lastRemindedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    nextReminderAt: new Date(Date.now() - 1 * 3600000).toISOString(), // overdue for tick
    workStatus: "PAUSED_DUE_TO_NON_PAYMENT",
    lateFeeCents: 1350,
    lineItems: inv2Items,
    reminders: [
      {
        id: "rem_2a",
        invoiceId: "inv_fintech_002",
        level: 1,
        tone: "FRIENDLY",
        subject: "Friendly reminder: Invoice INV-2024-002",
        body: "Hi David, just checking in on invoice INV-2024-002 for $1,800.00.",
        sentAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        channel: "PAYPAL_REMIND",
      },
      {
        id: "rem_2b",
        invoiceId: "inv_fintech_002",
        level: 2,
        tone: "NEUTRAL",
        subject: "Overdue Notice: Invoice INV-2024-002 (10 days past due)",
        body: "Hi David, following up on invoice INV-2024-002 ($1,800.00) which was due on " + inv2Due + ". Please remit payment via the attached PayPal link. Active milestone deliverables are currently paused pending receipt.",
        sentAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        channel: "PAYPAL_REMIND",
      },
    ],
    events: [],
    sourceMessage: "David Miller: Alex, start the API pentest ASAP. Scope approved at $1800 flat.",
    paypalPaymentUrl: "https://www.sandbox.paypal.com/invoice/p/#INV2-DEMO-FINTECH-5541",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  };

  // Invoice 3: HyperGrowth - Paid
  const inv3Due = new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0];
  const inv3Items: LineItem[] = [
    {
      id: "li_3",
      invoiceId: "inv_hyper_003",
      description: "Brand Identity, Pitch Deck & Investor Presentation",
      quantity: 1,
      unitPriceCents: 120000,
      totalCents: 120000,
    },
  ];
  const inv3: Invoice = {
    id: "inv_hyper_003",
    clientId: hyper.id,
    client: hyper,
    invoiceNumber: "INV-2024-003",
    paypalInvoiceId: "INV2-DEMO-HYPER-1129",
    status: "PAID",
    amountTotalCents: 120000,
    currency: "USD",
    dueDate: inv3Due,
    reminderLevel: 0,
    workStatus: "COMPLETED",
    lateFeeCents: 0,
    lineItems: inv3Items,
    reminders: [],
    events: [],
    sourceMessage: "Elena Rostova: Let's do the brand guide & pitch deck for $1,200. Send invoice.",
    paypalPaymentUrl: "https://www.sandbox.paypal.com/invoice/p/#INV2-DEMO-HYPER-1129",
    paidAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  };

  store.invoices.set(inv1.id, inv1);
  store.invoices.set(inv2.id, inv2);
  store.invoices.set(inv3.id, inv3);

  // Invoice 4: Veloce Logistics - Paid ($4,250.00)
  const inv4: Invoice = {
    id: "inv_veloce_004",
    clientId: veloce.id,
    client: veloce,
    invoiceNumber: "INV-2024-004",
    paypalInvoiceId: "INV2-DEMO-VELOCE-4421",
    status: "PAID",
    amountTotalCents: 425000,
    currency: "USD",
    dueDate: new Date(Date.now() - 22 * 86400000).toISOString().split("T")[0],
    reminderLevel: 0,
    workStatus: "COMPLETED",
    lateFeeCents: 0,
    lineItems: [
      {
        id: "li_4",
        invoiceId: "inv_veloce_004",
        description: "Warehouse Fleet Tracking Dashboard & Telemetry UX",
        quantity: 1,
        unitPriceCents: 425000,
        totalCents: 425000,
      },
    ],
    reminders: [],
    events: [],
    sourceMessage: "Marcus Vance: Alex, scope approved for fleet telemetry dashboard. Bill $4,250.",
    paypalPaymentUrl: "https://www.sandbox.paypal.com/invoice/p/#INV2-DEMO-VELOCE-4421",
    paidAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  };

  // Invoice 5: Lumina Health AI - Paid ($2,900.00)
  const inv5: Invoice = {
    id: "inv_lumina_005",
    clientId: lumina.id,
    client: lumina,
    invoiceNumber: "INV-2024-005",
    paypalInvoiceId: "INV2-DEMO-LUMINA-8812",
    status: "PAID",
    amountTotalCents: 290000,
    currency: "USD",
    dueDate: new Date(Date.now() - 38 * 86400000).toISOString().split("T")[0],
    reminderLevel: 0,
    workStatus: "COMPLETED",
    lateFeeCents: 0,
    lineItems: [
      {
        id: "li_5",
        invoiceId: "inv_lumina_005",
        description: "Bio-Metric Wearable Patient Health iOS Prototype",
        quantity: 1,
        unitPriceCents: 290000,
        totalCents: 290000,
      },
    ],
    reminders: [],
    events: [],
    sourceMessage: "Priya Patel: The iOS patient health build looks great. Send invoice for $2,900.",
    paypalPaymentUrl: "https://www.sandbox.paypal.com/invoice/p/#INV2-DEMO-LUMINA-8812",
    paidAt: new Date(Date.now() - 36 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 86400000).toISOString(),
  };

  // Invoice 6: Monolith Architecture - Paid ($6,400.00)
  const inv6: Invoice = {
    id: "inv_monolith_006",
    clientId: monolith.id,
    client: monolith,
    invoiceNumber: "INV-2024-006",
    paypalInvoiceId: "INV2-DEMO-MONOLITH-3190",
    status: "PAID",
    amountTotalCents: 640000,
    currency: "USD",
    dueDate: new Date(Date.now() - 52 * 86400000).toISOString().split("T")[0],
    reminderLevel: 0,
    workStatus: "COMPLETED",
    lateFeeCents: 0,
    lineItems: [
      {
        id: "li_6",
        invoiceId: "inv_monolith_006",
        description: "Nordic Minimalist Architectural Portfolio & 3D Interactive Viewer",
        quantity: 1,
        unitPriceCents: 640000,
        totalCents: 640000,
      },
    ],
    reminders: [],
    events: [],
    sourceMessage: "Julian Thorne: Nordic portfolio concept is accepted. Proceed with PayPal invoice for $6,400.",
    paypalPaymentUrl: "https://www.sandbox.paypal.com/invoice/p/#INV2-DEMO-MONOLITH-3190",
    paidAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 65 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 86400000).toISOString(),
  };

  // Invoice 7: Kinetix Robotics - Paid ($5,100.00)
  const inv7: Invoice = {
    id: "inv_kinetix_007",
    clientId: kinetix.id,
    client: kinetix,
    invoiceNumber: "INV-2024-007",
    paypalInvoiceId: "INV2-DEMO-KINETIX-9014",
    status: "PAID",
    amountTotalCents: 510000,
    currency: "USD",
    dueDate: new Date(Date.now() - 68 * 86400000).toISOString().split("T")[0],
    reminderLevel: 0,
    workStatus: "COMPLETED",
    lateFeeCents: 0,
    lineItems: [
      {
        id: "li_7",
        invoiceId: "inv_kinetix_007",
        description: "Industrial Robotic Arm Controller Interface & Design Tokens",
        quantity: 1,
        unitPriceCents: 510000,
        totalCents: 510000,
      },
    ],
    reminders: [],
    events: [],
    sourceMessage: "Alexander Hayes: Kinetix controller interface signed off. Bill $5,100 to robotics account.",
    paypalPaymentUrl: "https://www.sandbox.paypal.com/invoice/p/#INV2-DEMO-KINETIX-9014",
    paidAt: new Date(Date.now() - 66 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 80 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 66 * 86400000).toISOString(),
  };

  store.invoices.set(inv4.id, inv4);
  store.invoices.set(inv5.id, inv5);
  store.invoices.set(inv6.id, inv6);
  store.invoices.set(inv7.id, inv7);

  // Initial Events
  store.events.push(
    {
      id: "evt_seed_1",
      invoiceId: inv1.id,
      clientId: acme.id,
      eventType: "INVOICE_SENT",
      payload: { amountCents: 350000, invoiceNumber: "INV-2024-001" },
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: "evt_seed_2",
      invoiceId: inv1.id,
      clientId: acme.id,
      eventType: "REMINDER_SENT",
      payload: { level: 1, tone: "FRIENDLY", reason: "Invoice 4 days overdue" },
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "evt_seed_3",
      invoiceId: inv2.id,
      clientId: fintech.id,
      eventType: "REMINDER_SENT",
      payload: { level: 2, tone: "NEUTRAL", reason: "Invoice 11 days overdue. Active sprint paused." },
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: "evt_seed_4",
      invoiceId: inv3.id,
      clientId: hyper.id,
      eventType: "WEBHOOK_PAID",
      paypalEventId: "WH-SEED-HYPER-PAID-001",
      payload: { amountCents: 120000, transactionId: "TX-PAYPAL-98214" },
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "evt_seed_5",
      invoiceId: inv3.id,
      clientId: hyper.id,
      eventType: "THANKYOU_SENT",
      payload: { message: "Payment received! Thank you Elena." },
      createdAt: new Date(Date.now() - 2 * 86400000 + 1000).toISOString(),
    }
  );

  return store;
}

export function getDb(): DatabaseStore {
  if (!globalForDb.__getPaidDb) {
    globalForDb.__getPaidDb = createInitialStore();
  }
  return globalForDb.__getPaidDb;
}

export function resetDb(): DatabaseStore {
  globalForDb.__getPaidDb = createInitialStore();
  return globalForDb.__getPaidDb;
}

// Data access helpers
export const db = {
  // Freelancer Profile
  getFreelancer() {
    return getDb().freelancer;
  },

  // Clients
  listClients(): Client[] {
    return Array.from(getDb().clients.values()).sort((a, b) => 
      b.createdAt.localeCompare(a.createdAt)
    );
  },

  getClient(id: string): Client | undefined {
    return getDb().clients.get(id);
  },

  findClientByEmail(email: string): Client | undefined {
    const normalized = email.toLowerCase().trim();
    for (const client of Array.from(getDb().clients.values())) {
      if (client.email.toLowerCase().trim() === normalized) {
        return client;
      }
    }
    return undefined;
  },

  upsertClient(data: Partial<Client> & { email: string; name?: string }): Client {
    const existing = db.findClientByEmail(data.email);
    const now = new Date().toISOString();
    if (existing) {
      const updated: Client = {
        ...existing,
        ...data,
        name: data.name || existing.name,
        updatedAt: now,
      };
      getDb().clients.set(existing.id, updated);
      return updated;
    }

    const id = `cli_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newClient: Client = {
      id,
      name: data.name || data.email.split("@")[0],
      email: data.email,
      company: data.company,
      phone: data.phone,
      createdAt: now,
      updatedAt: now,
    };
    getDb().clients.set(id, newClient);
    return newClient;
  },

  // Invoices
  listInvoices(filter?: { status?: InvoiceStatus; clientId?: string }): Invoice[] {
    let list = Array.from(getDb().invoices.values());
    if (filter?.status) {
      list = list.filter((inv) => inv.status === filter.status);
    }
    if (filter?.clientId) {
      list = list.filter((inv) => inv.clientId === filter.clientId);
    }
    // Attach current client record
    return list
      .map((inv) => ({
        ...inv,
        client: getDb().clients.get(inv.clientId),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getInvoice(id: string): Invoice | undefined {
    const inv = getDb().invoices.get(id);
    if (!inv) return undefined;
    return {
      ...inv,
      client: getDb().clients.get(inv.clientId),
    };
  },

  findInvoiceByPaypalId(paypalInvoiceId: string): Invoice | undefined {
    for (const inv of Array.from(getDb().invoices.values())) {
      if (inv.paypalInvoiceId === paypalInvoiceId) {
        return {
          ...inv,
          client: getDb().clients.get(inv.clientId),
        };
      }
    }
    return undefined;
  },

  createInvoice(data: Omit<Invoice, "id" | "createdAt" | "updatedAt" | "reminders" | "events">): Invoice {
    const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const invoice: Invoice = {
      ...data,
      id,
      reminders: [],
      events: [],
      createdAt: now,
      updatedAt: now,
    };
    getDb().invoices.set(id, invoice);
    return invoice;
  },

  updateInvoice(id: string, patch: Partial<Invoice>): Invoice | undefined {
    const existing = getDb().invoices.get(id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const updated: Invoice = {
      ...existing,
      ...patch,
      updatedAt: now,
    };
    getDb().invoices.set(id, updated);
    return updated;
  },

  deleteInvoice(id: string): boolean {
    return getDb().invoices.delete(id);
  },

  // Reminders
  addReminder(reminder: Omit<Reminder, "id" | "sentAt">): Reminder {
    const id = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const fullReminder: Reminder = {
      ...reminder,
      id,
      sentAt: now,
    };
    getDb().reminders.set(id, fullReminder);

    // Also attach to invoice object
    const inv = getDb().invoices.get(reminder.invoiceId);
    if (inv) {
      inv.reminders.push(fullReminder);
      inv.reminderLevel = reminder.level;
      inv.lastRemindedAt = now;
      inv.updatedAt = now;
    }
    return fullReminder;
  },

  // Events (Audit log & activity feed)
  addEvent(event: Omit<EventLog, "id" | "createdAt">): { event: EventLog; isDuplicate: boolean } {
    // Webhook deduplication check
    if (event.paypalEventId) {
      if (getDb().seenPaypalEvents.has(event.paypalEventId)) {
        return {
          event: getDb().events.find((e) => e.paypalEventId === event.paypalEventId)!,
          isDuplicate: true,
        };
      }
      getDb().seenPaypalEvents.add(event.paypalEventId);
    }

    const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const fullEvent: EventLog = {
      ...event,
      id,
      createdAt: now,
    };

    getDb().events.unshift(fullEvent); // Newest first

    // Attach to invoice if applicable
    if (event.invoiceId) {
      const inv = getDb().invoices.get(event.invoiceId);
      if (inv) {
        inv.events.unshift(fullEvent);
      }
    }

    return { event: fullEvent, isDuplicate: false };
  },

  listEvents(limit = 50, invoiceId?: string): EventLog[] {
    let list = getDb().events;
    if (invoiceId) {
      list = list.filter((e) => e.invoiceId === invoiceId);
    }
    return list.slice(0, limit);
  },
};
