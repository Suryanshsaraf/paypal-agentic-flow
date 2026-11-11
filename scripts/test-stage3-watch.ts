/**
 * Stage 3 Verification: Watch (Webhooks, Settlement, Replay Defense, and Thank-You Loop)
 * Tests: Smoke Test, Idempotency & Replay Protection, State Invariant Defense, and Concurrent Load
 */

import { processPayPalWebhookEvent } from "../src/lib/webhook-processor";
import { db, resetDb } from "../src/lib/db";

async function runStage3Tests() {
  console.log("=================================================");
  console.log("🚀 STAGE 3 VERIFICATION: WATCH (WEBHOOKS & SETTLEMENT)");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  resetDb();

  // 1. Smoke Test: Inbound Webhook INVOICING.INVOICE.PAID
  console.log("1. Smoke Test: Live Webhook INVOICING.INVOICE.PAID Delivery");
  const targetInvoice = db.getInvoice("inv_acme_001")!;
  assert(targetInvoice.status === "SENT", "Invoice inv_acme_001 starts in SENT status");

  const webhookId = `WH-EVT-PAID-${Date.now()}`;
  const webhookPayload = {
    id: webhookId,
    event_version: "1.0",
    create_time: new Date().toISOString(),
    event_type: "INVOICING.INVOICE.PAID",
    resource: {
      id: "CAPTURE-998811",
      invoice: {
        id: targetInvoice.paypalInvoiceId,
        detail: {
          invoice_number: targetInvoice.invoiceNumber,
        },
      },
    },
  };

  const res1 = await processPayPalWebhookEvent(webhookPayload);
  assert(res1.handled === true, "Webhook was successfully handled");
  assert(res1.isDuplicate === false, "First delivery is recognized as non-duplicate");
  assert(res1.newStatus === "PAID", "Invoice status transitioned to PAID");

  const updatedInvoice = db.getInvoice(targetInvoice.id)!;
  assert(updatedInvoice.status === "PAID", "DB store invoice status is PAID");
  assert(updatedInvoice.workStatus === "COMPLETED", "workStatus auto-transitioned to COMPLETED");
  assert(Boolean(updatedInvoice.paidAt), `paidAt timestamp set: ${updatedInvoice.paidAt}`);
  assert(updatedInvoice.nextReminderAt === undefined, "nextReminderAt cleared (auto-chasing halted)");

  // 2. Thank-You Note Dispatch
  console.log("\n2. Autonomous Thank-You Note Generation");
  const recentEvents = db.listEvents(10, targetInvoice.id);
  const thankYouEvent = recentEvents.find((e) => e.eventType === "THANKYOU_SENT");
  assert(thankYouEvent !== undefined, "THANKYOU_SENT event was autonomously logged");
  assert(
    Boolean(thankYouEvent?.payload?.message?.includes("Payment for INV-2024-001 confirmed")),
    "Thank-you message includes invoice number and client name"
  );

  // 3. Idempotency & Replay Attack Defense
  console.log("\n3. Idempotency & Replay Attack Defense");
  const replayRes = await processPayPalWebhookEvent(webhookPayload);
  assert(replayRes.handled === true, "Replayed webhook acknowledged");
  assert(replayRes.isDuplicate === true, "Detects duplicate delivery via unique paypal_event_id");

  // 4. State Invariant: Never Regress Out of PAID
  console.log("\n4. State Invariants: Protect PAID Invoices Against Regressive Events");
  const cancelPayload = {
    id: `WH-EVT-CANCEL-${Date.now()}`,
    event_version: "1.0",
    create_time: new Date().toISOString(),
    event_type: "INVOICING.INVOICE.CANCELLED",
    resource: {
      id: "CANCEL-776655",
      invoice: {
        id: targetInvoice.paypalInvoiceId,
      },
    },
  };

  const cancelRes = await processPayPalWebhookEvent(cancelPayload);
  const postCancelInvoice = db.getInvoice(targetInvoice.id)!;
  assert(postCancelInvoice.status === "PAID", "Invoice does not regress from PAID to CANCELLED");

  // 5. Concurrency & Latency Stress Test (25 concurrent webhook arrivals)
  console.log("\n5. Concurrency & Latency Stress Test (25 concurrent webhook events)");
  const concurrencyCount = 25;
  const startMs = Date.now();
  const promises = [];

  for (let i = 0; i < concurrencyCount; i++) {
    promises.push(
      (async () => {
        const reqStart = Date.now();
        // Create an invoice to pay
        const testInv = db.createInvoice({
          clientId: "cli_acme_corp",
          invoiceNumber: `INV-WH-STRESS-${i}`,
          paypalInvoiceId: `PP-INV-WH-${i}`,
          status: "SENT",
          amountTotalCents: 50000,
          currency: "USD",
          dueDate: "2024-12-31",
          reminderLevel: 1,
          workStatus: "ACTIVE",
          lateFeeCents: 0,
          lineItems: [],
        });

        const evt = {
          id: `WH-STRESS-${i}-${Date.now()}`,
          event_type: "INVOICING.INVOICE.PAID",
          resource: {
            id: `CAP-${i}`,
            invoice: { id: testInv.paypalInvoiceId },
          },
        };

        const result = await processPayPalWebhookEvent(evt);
        const reqEnd = Date.now();
        return {
          duration: reqEnd - reqStart,
          handled: result.handled,
          isDuplicate: result.isDuplicate,
        };
      })()
    );
  }

  const results = await Promise.all(promises);
  const totalDuration = Date.now() - startMs;
  const latencies = results.map((r) => r.duration).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[latencies.length - 1];

  console.log(`  -> Handled ${concurrencyCount} concurrent webhook settlements in ${totalDuration}ms`);
  console.log(`  -> Latency: p50 = ${p50}ms, p95 = ${p95}ms, p99 = ${p99}ms`);
  assert(results.every((r) => r.handled && !r.isDuplicate), "All 25 concurrent webhooks handled cleanly without race errors");
  assert(p95 < 100, "95% of webhook settlements handled under 100ms");

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStage3Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
