# API & Endpoint Reference — Get Paid

This document maps **every endpoint in the system** and shows **which endpoint hits which**, so the
frontend ↔ backend ↔ PayPal contract stays clear as we build.

There are three layers:

1. **Internal app API** — Next.js route handlers the **frontend** (and the scheduler) call. Base: `/api/*`
2. **External PayPal REST API** — endpoints the **backend** calls. Base: `https://api-m.sandbox.paypal.com`
3. **Inbound webhooks** — PayPal → our backend (`POST /api/webhooks/paypal`)

```
Frontend ──▶ Internal API (/api/*) ──▶ LLM (extract/draft/answer)
                   │                 └─▶ PayPal REST API ──▶ Client
                   └─▶ Postgres
PayPal ──(webhook)──▶ /api/webhooks/paypal ──▶ Postgres
Scheduler/cron ──▶ /api/cron/tick ──▶ chase engine ──▶ LLM + PayPal
```

**Legend** — `Caller`: FE = frontend, CRON = scheduler/cron, PP = PayPal (inbound). `Calls`: which
downstream it hits (LLM touchpoint, PayPal endpoint, or DB tables written). Read-only endpoints write nothing.

---

## 1. Conventions

| Thing | Value |
|---|---|
| App API base | `/api` (same origin as the Next.js app) |
| PayPal base (sandbox) | `https://api-m.sandbox.paypal.com` |
| PayPal base (live) | `https://api-m.paypal.com` |
| Auth to PayPal | OAuth 2.0 `client_credentials` → Bearer access token (cache ~9h) |
| Auth on internal API | single-user for MVP; `/api/cron/*` guarded by `CRON_SECRET` |
| Content type | `application/json` everywhere except the OAuth token call (`x-www-form-urlencoded`) |

### Environment variables

```
PAYPAL_CLIENT_ID=        # sandbox app client id
PAYPAL_SECRET=           # sandbox app secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=       # id of the registered webhook (needed to verify signatures)
DATABASE_URL=            # Postgres connection string
ANTHROPIC_API_KEY=       # LLM provider key (pluggable)
APP_BASE_URL=            # public URL (for webhook registration + keep-alive)
CRON_SECRET=             # shared secret the scheduler sends to /api/cron/tick
```

---

## 2. Internal app endpoints (frontend → backend)

### Chat / AI

| Method | Path | Purpose | Caller | Calls |
|---|---|---|---|---|
| `POST` | `/api/invoices/scope` | **Scope step.** Body `{ message }`. LLM extracts line items + total from a messy message. Returns a *proposal only* — **nothing is saved** until the user confirms. | FE | LLM (extract) |
| `POST` | `/api/query` | **Ask step.** Body `{ question }` (e.g. "who owes me?"). LLM turns it into a query over our own data and returns `{ answer, data }`. | FE | LLM (answer) + DB (read) |

### Clients

| Method | Path | Purpose | Caller | Calls |
|---|---|---|---|---|
| `GET` | `/api/clients` | List clients (dashboard, dropdowns). | FE | DB (read) |
| `POST` | `/api/clients` | Create a client `{ name, email }`. Often created implicitly during invoice creation. | FE / internal | DB → `clients` |
| `GET` | `/api/clients/{id}` | Client detail + their invoices. | FE | DB (read) |

### Invoices

| Method | Path | Purpose | Caller | Calls |
|---|---|---|---|---|
| `POST` | `/api/invoices` | **Bill step.** Body `{ clientId \| clientEmail, lineItems, dueDate }` (the confirmed proposal). Saves a DRAFT invoice → creates it in PayPal → sends it → marks `SENT` and stores `paypal_invoice_id`. | FE | PayPal create + send, DB → `clients`,`invoices`,`line_items`,`events` |
| `GET` | `/api/invoices` | List invoices with filters `?status=&clientId=`. | FE | DB (read) |
| `GET` | `/api/invoices/{id}` | Invoice detail: line items, reminders, events. | FE | DB (read) |
| `POST` | `/api/invoices/{id}/remind` | **Chase (manual).** Draft a reminder for the current level and send it via PayPal. Same code the engine calls automatically. | FE / CRON | LLM (draft), PayPal remind, DB → `reminders`,`invoices`,`events` |
| `POST` | `/api/invoices/{id}/cancel` | Cancel a sent invoice. | FE | PayPal cancel, DB → `invoices`,`events` |
| `POST` | `/api/invoices/{id}/reply` | **Reply handling (stretch).** Body `{ replyText }`. LLM classifies the client's reply (promise-to-pay / dispute / already-paid) → reschedules `next_reminder_at` or flags `NEEDS_REVIEW`. | FE | LLM (classify), DB → `invoices`,`events` |
| `GET` | `/api/invoices/{id}/events` | Event history for one invoice. | FE | DB (read) |
| `POST` | `/api/invoices/{id}/sync` | *(optional)* Re-fetch status from PayPal and reconcile our record. | internal | PayPal get, DB |

### Activity feed & reports

| Method | Path | Purpose | Caller | Calls |
|---|---|---|---|---|
| `GET` | `/api/events` | **Activity feed.** All agent actions + webhook events, newest first. | FE | DB (read) |
| `GET` | `/api/stats` | Summary numbers: total outstanding, overdue count, paid this month. | FE | DB (read) |

### Scheduler (the heartbeat)

| Method | Path | Purpose | Caller | Calls |
|---|---|---|---|---|
| `POST` | `/api/cron/tick` | The autonomous sweep. Finds overdue, unpaid invoices whose `next_reminder_at` has passed, and for each runs the chase (draft + send + record). Guarded by `CRON_SECRET`. Runs on an in-process `node-cron` **and** is callable by an external cron/keep-alive pinger. | CRON | per invoice: LLM (draft), PayPal remind, DB → `reminders`,`invoices`,`events` |
| `GET` | `/api/health` | Liveness check for hosting + keep-alive pinger. | CRON/infra | none |

### Webhooks (inbound — see §4)

| Method | Path | Purpose | Caller | Calls |
|---|---|---|---|---|
| `POST` | `/api/webhooks/paypal` | **Watch step.** Receives PayPal events, verifies signature, dedupes on `paypal_event_id`, updates invoice state, logs the event, triggers the thank-you. | PP | PayPal verify, DB → `invoices`,`events` |

### Demo controls (drive the *real* code paths, not mocks)

| Method | Path | Purpose | Caller | Calls |
|---|---|---|---|---|
| `POST` | `/api/demo/simulate-overdue` | Body `{ invoiceId }`. Backdates `due_date` so the next `cron/tick` chases it for real. | FE | DB → `invoices`,`events` |
| `POST` | `/api/demo/mark-paid` | Body `{ invoiceId }`. Builds a `PAID` event and replays it through the real webhook handler. | FE | internal → `/api/webhooks/paypal` logic |
| `POST` | `/api/demo/reset` | Reseed/clear demo data. | FE | DB |

---

## 3. External PayPal endpoints (backend → PayPal)

### Auth

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/oauth2/token` | Exchange `client_id:secret` (Basic auth) + `grant_type=client_credentials` for a Bearer token. Called (and cached) before every other PayPal call. |

### Invoicing API v2 — the core

| Method | Path | Purpose | Used by |
|---|---|---|---|
| `POST` | `/v2/invoicing/invoices` | Create a **DRAFT** invoice. Customer is **not** notified yet. | `POST /api/invoices` |
| `POST` | `/v2/invoicing/invoices/{id}/send` | Send (or schedule) the invoice — this is what emails the client. | `POST /api/invoices` |
| `GET` | `/v2/invoicing/invoices/{id}` | Get one invoice's status/details. | `sync`, reconciliation |
| `GET` | `/v2/invoicing/invoices` | List invoices (we mostly read our own DB instead). | optional |
| `POST` | `/v2/invoicing/invoices/{id}/remind` | Send a reminder with a **custom `subject` + `note`** — this is where the LLM-drafted escalating copy goes. ⚠️ Max **2 reminders per invoice per day**. | `POST /api/invoices/{id}/remind`, `cron/tick` |
| `POST` | `/v2/invoicing/invoices/{id}/cancel` | Cancel a sent invoice (optionally notify payer). | `POST /api/invoices/{id}/cancel` |
| `POST` | `/v2/invoicing/invoices/{id}/cancel-reminders` | Stop PayPal's own scheduled auto-reminders for an invoice. | optional |
| `PUT` | `/v2/invoicing/invoices/{id}` | Full update of a draft/sent invoice. | optional |
| `DELETE` | `/v2/invoicing/invoices/{id}` | Delete a **draft** (use `cancel` for sent). | optional |
| `POST` | `/v2/invoicing/generate-next-invoice-number` | Get the next sequential invoice number (keeps prefix/suffix). *(Some docs show `/v2/invoicing/invoices/generate-next-invoice-number` — confirm against the live reference.)* | optional |
| `POST` | `/v2/invoicing/invoices/{id}/payments` | Record an external/manual payment. | optional |

> **Note on auto-reminders:** PayPal has native auto-reminder configuration endpoints
> (`/v2/invoicing/.../auto-reminders` setup/list/update/suspend/resume). We deliberately **do not** use them —
> our escalation logic + LLM copy is the product. We send reminders manually via the `remind` endpoint.

> **Orders API (`/v2/checkout/orders`) is NOT used** in this invoicing-based product. It's listed here only so
> future contributors know it was a deliberate choice, not an omission.

### Webhooks Management API v1

| Method | Path | Purpose | Used by |
|---|---|---|---|
| `POST` | `/v1/notifications/webhooks` | Register our listener URL + the event types we care about (one-time setup). | setup script |
| `GET` | `/v1/notifications/webhooks` | List registered webhooks. | setup/debug |
| `GET` | `/v1/notifications/webhooks/{id}` | Get one webhook (and its `id` for `PAYPAL_WEBHOOK_ID`). | setup |
| `POST` | `/v1/notifications/verify-webhook-signature` | **Verify an inbound event** by posting back its headers + body + our webhook id. | `POST /api/webhooks/paypal` |
| `GET` | `/v1/notifications/webhooks-event-types` | List all subscribable event types. | setup |
| `GET` | `/v1/notifications/webhooks-events` | List recently delivered events (debug/replay). | debug |
| `POST` | `/v1/notifications/webhooks-events/{id}/resend` | Re-deliver an event. | debug |

---

## 4. Inbound webhooks (PayPal → `POST /api/webhooks/paypal`)

**Event types we subscribe to:**

| Event | Meaning | Our action |
|---|---|---|
| `INVOICING.INVOICE.PAID` | Paid (also fires on partial / pending payment) | status → `PAID`, log, send thank-you |
| `INVOICING.INVOICE.CANCELLED` | Invoice cancelled | status → `CANCELLED`, stop chasing |
| `INVOICING.INVOICE.REFUNDED` | Invoice refunded | status → `REFUNDED` |
| `INVOICING.INVOICE.UPDATED` | Invoice changed | reconcile fields |
| `INVOICING.INVOICE.CREATED` | Draft/invoice created | *(optional)* reconcile |
| `INVOICING.INVOICE.SCHEDULED` | Scheduled to send | *(optional)* |

> `INVOICING.INVOICE.SENT` appears in some PayPal sample code but is **not** in the official event-names
> table — treat it as unconfirmed and don't depend on it.

**Handler rules (important, easy to get wrong):**

1. **Read the raw body first.** Signature verification hashes the exact bytes. In Next.js route handlers use
   `await req.text()` (not `req.json()`) and parse *after* verifying — a body parser that runs first will
   alter the bytes and break verification.
2. **Verify** via `POST /v1/notifications/verify-webhook-signature` with the transmission headers + raw body +
   `PAYPAL_WEBHOOK_ID`. Reject anything that returns `FAILURE`.
3. **Dedupe** on the event's id, stored as `events.paypal_event_id` (UNIQUE). PayPal redelivers; the unique
   constraint makes that a no-op.
4. **Then** update invoice state + append the `events` row, inside one transaction.
5. Sandbox **mock** events (from the webhook simulator) **cannot** be postback-verified — use our
   `/api/demo/mark-paid` (which replays a real-shaped event through the handler) for the live demo instead.

---

## 5. End-to-end mapping — "which endpoint hits which"

| Flow | FE action | Internal endpoint | LLM | PayPal endpoint(s) | Tables written | State |
|---|---|---|---|---|---|---|
| **Scope** | type message | `POST /api/invoices/scope` | extract | — | *none* | — |
| **Bill** | confirm proposal | `POST /api/invoices` | — | `oauth2/token` → `invoices` → `invoices/{id}/send` | clients, invoices, line_items, events | → SENT |
| **Watch (paid)** | *(none — PayPal)* | `POST /api/webhooks/paypal` | — | `verify-webhook-signature` | invoices, events | SENT → PAID |
| **Chase** | *(none — clock)* | `POST /api/cron/tick` → `POST /api/invoices/{id}/remind` | draft | `invoices/{id}/remind` | reminders, invoices, events | stays SENT |
| **Chase (manual)** | click "remind now" | `POST /api/invoices/{id}/remind` | draft | `invoices/{id}/remind` | reminders, invoices, events | stays SENT |
| **Ask** | ask a question | `POST /api/query` | answer | — | *read-only* | — |
| **Reply** | paste client reply | `POST /api/invoices/{id}/reply` | classify | — | invoices, events | SENT or → NEEDS_REVIEW |
| **Cancel** | click cancel | `POST /api/invoices/{id}/cancel` | — | `invoices/{id}/cancel` | invoices, events | → CANCELLED |
| **Demo: overdue** | button | `POST /api/demo/simulate-overdue` | — | — | invoices, events | stays SENT |
| **Demo: paid** | button | `POST /api/demo/mark-paid` | — | — (replays webhook) | invoices, events | SENT → PAID |
| **Feed** | open feed | `GET /api/events` | — | — | *read-only* | — |

---

## 6. OAuth token flow (every PayPal call)

```
backend ──POST /v1/oauth2/token (Basic client_id:secret, grant_type=client_credentials)──▶ PayPal
        ◀── { access_token, expires_in (~32400s) } ──
backend caches token, reuses until ~60s before expiry, then refreshes
all v2/invoicing + v1/notifications calls send:  Authorization: Bearer <access_token>
```

---

## Sources

- [PayPal Invoices API v2 reference](https://developer.paypal.com/api/invoicing/v2)
- [Send invoice — Invoices v2](https://developer.paypal.com/api/invoicing/v2/invoices-send)
- [Invoicing webhooks](https://developer.paypal.com/api/invoicing/webhooks)
- [Webhook event names](https://developer.paypal.com/api/rest/webhooks/event-names)
- [Webhooks Management API v1](https://developer.paypal.com/api/webhooks/v1)
- [Integrate webhooks (verification + raw body)](https://developer.paypal.com/api/rest/webhooks/rest)
