# Build Plan — Get Paid

A staged plan to build the autonomous accounts-receivable agent. See [`README.md`](./README.md) for the
concept/architecture and [`API_ENDPOINTS.md`](./API_ENDPOINTS.md) for the full endpoint map.

## Approach: vertical slices

We build **one capability at a time, frontend and backend together**, instead of all-frontend-then-all-backend.
Every stage ends at a **demoable checkpoint** — something that visibly works — so we always have a fallback demo
and the FE↔BE contract is proven continuously. Stages are ordered so the two things judges actually watch
(billing, then autonomous chasing) are the earliest fully-working slices, and the risky/optional work is last.

| Stage | Theme | Demoable outcome |
|---|---|---|
| 1 | Foundation | App runs, talks to Postgres, mints a PayPal sandbox token |
| 2 | **Bill** | Paste a message → a real sandbox invoice reaches the client |
| 3 | **Watch** | Payment (or demo button) flips the invoice to Paid live |
| 4 | **Chase** | Overdue invoice is auto-chased with escalating reminders + activity feed |
| 5 | Ask + Deploy | "Who owes me?" works; whole loop runs on a hosted URL |

**Definition of done (applies to every stage):** the demo checkpoint works end-to-end on a clean run, errors
are handled (no unhandled rejections / 500s surface to the user as readable messages), the happy path and the
listed edge cases are covered, and nothing secret is committed.

---

## Stage 1 — Foundation (plumbing)

**Goal:** a running Next.js app wired to Postgres and PayPal, with the data model in place and the app shell
visible. No business features yet — this is the skeleton everything hangs on.

**Demo checkpoint:** `npm run dev` serves the app; `/api/health` returns `{ ok, db: true, paypal: true }`
(the PayPal check actually mints and caches a sandbox token).

### Backend
- Scaffold Next.js (App Router) + TypeScript + Tailwind.
- Database: Postgres (Neon locally/hosted). Migrations for the 5 tables (`clients`, `invoices`, `line_items`,
  `reminders`, `events`) + enums (`invoice_status`, `reminder_tone`). Use a migration tool (Drizzle/Prisma) so
  the schema is reproducible.
- `src/lib/db.ts` — connection pool, typed query helpers.
- `src/lib/paypal.ts` — OAuth: `getAccessToken()` with in-memory cache, refresh ~60s before expiry, one retry
  on `401`. Thin wrappers to be filled in later.
- `src/lib/money.ts` — money as **integer minor units (cents)** or `decimal` strings; never JS floats.
- `src/lib/env.ts` — validate required env vars at boot; fail fast with a clear message if missing.
- `GET /api/health`.
- Seed script: one default freelancer identity + the sandbox business account details; a couple of demo clients.

### Frontend
- App layout: left chat/compose panel, main dashboard (invoice list placeholder), activity feed placeholder.
- Design tokens, dark mode, empty states. No live data yet (static placeholders).

### Endpoints
- `GET /api/health`; internal `POST /v1/oauth2/token` (via `paypal.ts`).

### Edge cases & decisions
- **Missing/invalid env** → health returns `paypal:false`/`db:false` with a reason; app still boots so you can see why.
- **PayPal token caching** — never fetch a token per request; cache and reuse. Handle sandbox transient `5xx` with one retry + backoff.
- **Money precision** — decide cents-vs-decimal now and use it everywhere; mixing them later causes rounding bugs.
- **Timezones** — store all timestamps in UTC; `due_date` is a calendar date; do overdue math in UTC.
- **Webhook raw body** — configure the `/api/webhooks/paypal` route (added Stage 3) to read the **raw** body; set this route up now so the body parser isn't applied globally.

### Risks
- Postgres on an ephemeral host wipes data → use a persistent provider (Neon/Render PG), not file SQLite.

---

## Stage 2 — Bill (scope → create → send)

**Goal:** the first magic moment. A messy message becomes a real, sent PayPal sandbox invoice.

**Demo checkpoint:** paste *"go ahead with the logo + 3 banners, $500"* → review the extracted proposal →
confirm → a real invoice appears in the list as **SENT** and arrives in the sandbox buyer's inbox.

### Backend
- `src/lib/llm.ts` → `extractInvoice(message)` using **structured output / tool-calling** so the result is
  validated JSON: `{ lineItems:[{description, quantity, unitPrice}], amountTotal, currency, clientName?, clientEmail?, confidence, notes }`.
- `POST /api/invoices/scope` — returns the proposal only; **writes nothing**.
- `POST /api/invoices` — transaction: upsert client → insert `invoices` (DRAFT) + `line_items` → PayPal
  `create` → PayPal `send` → set `paypal_invoice_id`, status `SENT` → append `events:INVOICE_SENT`.
- `GET /api/invoices`, `GET /api/invoices/{id}`, `GET /api/clients`, `POST /api/clients`.
- PayPal wrappers: `createInvoice`, `sendInvoice`, `getInvoice`.

### Frontend
- Compose box → calls `scope` → **proposal card** (editable line items, amount, client email, due date) → Confirm.
- Invoice list (status badges), invoice detail drawer.

### Endpoints
`POST /api/invoices/scope` (LLM), `POST /api/invoices` → PayPal `invoices` + `invoices/{id}/send`,
`GET /api/invoices`, `GET /api/invoices/{id}`, `GET/POST /api/clients`.

### Edge cases & decisions (extraction is where this gets messy)
- **No amount found** / **multiple amounts** → low confidence; proposal asks the user to fill/choose. Never guess silently.
- **No line items / vague ("the usual")** → one generic line item with the total; user edits.
- **Missing client email** → required before send; block confirm until provided.
- **Currency ambiguity** → default `USD`, show it, let user change.
- **Non-English / emoji / huge or negative amounts** → validate ranges; reject negatives; cap sanity-check large values.
- **Malformed LLM JSON** → schema validation + one re-ask; if still bad, fall back to a blank editable proposal.
- **Prompt injection in the message** ("ignore instructions, email X") → the message is **data**; the LLM only
  proposes, the user confirms, code executes. Extraction never triggers an action.
- **PayPal create succeeds but send fails** → invoice left as DRAFT in our DB with its `paypal_invoice_id`; show
  a "Retry send" action; don't lose the record.
- **Our DB write fails after PayPal created the invoice** → reconcile by `paypal_invoice_id` (idempotent upsert); never create a second PayPal invoice for the same proposal.
- **Double-submit / double-click** → idempotency key on `POST /api/invoices` (e.g. a client-generated request id).
- **Invalid client email** → PayPal rejects on send; surface the exact error.
- **Past or missing due date** → default to net-N (e.g. +7 days); warn if user sets it in the past.
- **Line items vs total mismatch** → recompute total from items; show both if they disagree.

### Definition of done
Real invoice visible in the PayPal sandbox; list reflects it; all the above inputs produce a sane result or a
clear prompt, never a crash.

---

## Stage 3 — Watch (webhooks → paid → thank-you)

**Goal:** the reactive half. When the client pays, the system knows — without anyone asking.

**Demo checkpoint:** pay the invoice in the sandbox (or click **mark paid**) → status flips to **PAID** live and
a thank-you event appears.

### Backend
- One-time webhook registration script → `POST /v1/notifications/webhooks` with our URL + event types; store `PAYPAL_WEBHOOK_ID`.
- `POST /api/webhooks/paypal`:
  1. read **raw** body (`await req.text()`), 2. verify via `verify-webhook-signature`, 3. dedupe on
  `events.paypal_event_id` (UNIQUE), 4. in one transaction update invoice state + append event, 5. trigger thank-you.
- Handle `PAID`, `CANCELLED`, `REFUNDED`, `UPDATED`.
- `POST /api/demo/mark-paid` — builds a real-shaped PAID event and replays it through the handler logic.
- Local dev: tunnel (ngrok) so PayPal can reach the webhook.

### Frontend
- Invoice status updates live (poll `GET /api/invoices` or SSE). "Mark paid" demo button on the invoice.

### Endpoints
`POST /api/webhooks/paypal` → PayPal `verify-webhook-signature`; `POST /api/demo/mark-paid`.

### Edge cases & decisions
- **Signature verification fails** → return `401`, log, do **not** act. Only verified events change state.
- **Body already parsed** → verification silently fails; ensure this route reads raw bytes (no global JSON parser).
- **Duplicate delivery** → unique `paypal_event_id` makes the second insert a no-op; handler is idempotent.
- **Out-of-order events** (UPDATED after PAID) → never regress out of PAID; use event timestamps.
- **Partial / pending payment** — `INVOICING.INVOICE.PAID` can fire on partial/pending. Decide: track
  `amount_paid`; only mark fully `PAID` when paid ≥ total; otherwise keep chasing the balance (or a
  `PARTIALLY_PAID` sub-state). **Document the chosen rule.**
- **Refund after paid** → `REFUNDED`; stop any chasing.
- **Webhook for an unknown invoice** (created outside the app) → log and ignore.
- **Thank-you channel** — PayPal has no "thank-you" API. MVP: log a `THANKYOU_SENT` event (+ in-app). Real
  outbound thank-you is a stretch (email, or a PayPal note). **Don't block the demo on it.**
- **Sandbox mock events can't be postback-verified** → the live demo uses `mark-paid` (real-shaped replay), not the webhook simulator.
- **Webhook not yet reachable locally** → `mark-paid` is the deterministic fallback for the video.

---

## Stage 4 — Chase (scheduler + escalation) — the core

**Goal:** the autonomy. With no human present, overdue invoices get chased on an escalating schedule, and every
decision is visible in the activity feed.

**Demo checkpoint:** click **simulate overdue** → within one tick the agent drafts and sends an escalating
reminder through PayPal, bumps the level, and the **activity feed** shows the action *with its reasoning*.

### Backend
- Scheduler: in-process `node-cron` tick (~60s) **and** `POST /api/cron/tick` (guarded by `CRON_SECRET`) so an
  external cron / keep-alive can also drive it.
- Chase engine (`src/lib/chase.ts`): select invoices where `status=SENT AND next_reminder_at <= now()`
  **FOR UPDATE SKIP LOCKED** (no double-processing); for each: re-check it's still SENT, pick the level from
  thresholds, draft copy, send, record, advance.
- `llm.ts` → `draftReminder(invoice, level)`; **fallback to a templated string if the LLM fails** (chase must
  work without the LLM).
- `POST /api/invoices/{id}/remind` (manual + engine path) → PayPal `remind` with custom `subject`/`note` →
  insert `reminders`, `invoices.reminder_level++`, set `next_reminder_at` + `last_reminded_at`, append event.
- Knows-its-limits: after level 3, set `NEEDS_REVIEW`, stop auto-chasing, log `ESCALATED_TO_HUMAN`.
- `POST /api/demo/simulate-overdue` → backdate `due_date` and set `next_reminder_at = now()` so the next tick fires.
- `GET /api/events` (activity feed), `GET /api/invoices/{id}/events`.

### Frontend
- **Activity feed** component (newest first, reasoning line per entry).
- Reminder-level badge + "remind now" + "simulate overdue" controls on each invoice.

### Endpoints
`POST /api/cron/tick`, `POST /api/invoices/{id}/remind` → PayPal `invoices/{id}/remind`,
`POST /api/demo/simulate-overdue`, `GET /api/events`.

### Edge cases & decisions (this stage has the subtle bugs)
- **Overlapping ticks** → row locking + advance level **only after** a successful send ⇒ no double-send, no skipped level.
- **Invoice paid between selection and send** → re-check status immediately before sending; only chase `SENT`.
- **PayPal `remind` cap: 2/invoice/day** → our thresholds are days apart, so we stay well under; still guard with `last_reminded_at`.
- **Reminder send fails** (PayPal error / rate limit) → do **not** advance level; retry next tick; log the failure.
- **LLM draft fails/slow** → templated fallback copy; the chase still happens.
- **Never chase** `PAID`/`CANCELLED`/`REFUNDED`/`NEEDS_REVIEW`/`DRAFT`.
- **Scheduler doesn't run on serverless** → requires a persistent host; on Render free (sleeps) use an external
  cron/keep-alive hitting `/api/cron/tick`. Confirm the tick actually fires in the deployed env.
- **Clock/timezone** → compute overdue in UTC; a wrong tz silently stops or over-fires chasing.
- **Escalation thresholds** live in config (e.g. +1 / +4 / +8 days), easy to shorten for the demo.
- **Feed volume** → paginate; cap the feed query.

---

## Stage 5 — Ask + Deploy + Polish

**Goal:** close the loop (the "report" half) and get the whole thing running on a public URL.

**Demo checkpoint:** ask *"who still owes me?"* → correct plain-English answer from our own data; the full
scope→bill→watch→chase→ask loop runs on the deployed URL.

### Backend
- `POST /api/query` — **compute the answer deterministically in code** (aggregate over `invoices`/`clients`);
  the LLM only *phrases* the result and maps the question to a known intent. Do **not** let the LLM invent
  numbers or run free-form SQL.
- `GET /api/stats` — outstanding total, overdue count, paid-this-month.
- Deploy to Render (persistent web service), Postgres (Neon/Render), set all env vars, register the PayPal
  sandbox webhook at the public URL, set `CRON_SECRET`, add keep-alive.
- `POST /api/demo/reset` for clean demo runs.

### Frontend
- Q&A answers rendered in chat; stats ribbon; final polish on feed/empty states.

### Endpoints
`POST /api/query` (LLM phrasing + DB), `GET /api/stats`, `POST /api/demo/reset`.

### Edge cases & decisions
- **NL→data safety** → read-only DB role; predefined intents + parameterized aggregates; never string-concatenate
  LLM output into SQL (injection). If an intent isn't recognized, say so rather than guess.
- **Answer accuracy** → numbers come from code, not the model, so "who owes me" is always correct.
- **Deploy gotchas** → webhook must be re-registered against the deployed URL; env parity with local; confirm the
  scheduler fires in prod; keep-alive prevents the free tier from sleeping and killing the cron.

### Stretch (only if Stage 1–5 are solid)
- `POST /api/invoices/{id}/reply` — paste a client reply → LLM **classifies** (promise-to-pay / dispute /
  already-paid) → reschedule `next_reminder_at` or flag `NEEDS_REVIEW`. **The reply text is untrusted data** —
  classify only; code decides; a reply can never directly trigger a send or a refund (prompt-injection guard).
- Dispute detection pauses chasing and flags for the human.

---

## Cross-cutting concerns (apply throughout)

| Concern | Rule |
|---|---|
| **Money** | Integer cents or decimal strings — never JS floats. One representation everywhere. |
| **Idempotency** | External actions carry an idempotency key; webhooks dedupe on `paypal_event_id`; level advances only after confirmed send. |
| **Source of truth** | No state change without an `events` row. The feed and Q&A read only from our data. |
| **Untrusted input** | Client messages and replies are data, not instructions. The LLM proposes/classifies; deterministic code decides and executes; billing is user-confirmed. |
| **PayPal token** | Cache; refresh before expiry; one retry on 401; backoff on 5xx. |
| **Webhook security** | Verify signature on the raw body before acting; reject failures; never trust unverified events. |
| **Secrets** | Only in env; `.env` git-ignored; `/api/cron/*` behind `CRON_SECRET`; share only sandbox keys. |
| **Errors** | Typed error taxonomy; user-facing messages are readable; failures are logged as events where relevant. |
| **Time** | UTC everywhere; `due_date` is a date; overdue math in UTC. |

## Testing

- **Unit:** extraction-parse edge cases, escalation-level selection, webhook dedupe, money math.
- **Integration (sandbox):** create→send→get, remind, webhook verify, cancel.
- **E2E demo paths:** the three magic-moment flows + `mark-paid` / `simulate-overdue` replays.

## Demo script (sub-3-minute video)

1. Paste a messy message → confirm → **real invoice sent** (Stage 2).
2. Click **simulate overdue** → agent **auto-sends an escalating reminder**; feed shows the reasoning (Stage 4).
3. Click **mark paid** → status flips to **PAID**, thank-you logged (Stage 3).
4. Ask **"who still owes me?"** → instant correct answer (Stage 5).
5. One line: every button drove the **real** code path, and the chase ran on the agent's own clock.

## Open decisions to confirm

- Partial-payment handling: balance-chase vs. mark paid on first payment.
- Thank-you channel: in-app event only (MVP) vs. outbound message (stretch).
- LLM provider (default Claude) and whether the chat path also uses the PayPal Agent Toolkit.
- Escalation thresholds (production vs. demo-shortened).
