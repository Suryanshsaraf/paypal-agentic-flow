/**
 * Stage 4 Verification: Chase (Autonomous Scheduler, Escalating Tones, and Guardrails)
 * Tests: Multi-Tier Tone Progression, Human Escalation Boundary, Non-SENT Invariant, and Concurrency
 */

import { chaseInvoice, runAutonomousChaseSweep, draftReminderCopy } from "../src/lib/chase";
import { db, resetDb } from "../src/lib/db";

async function runStage4Tests() {
  console.log("=================================================");
  console.log("🚀 STAGE 4 VERIFICATION: CHASE (ESCALATION & AUTONOMY)");
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

  // 1. Multi-Tier Escalating Copy Verification
  console.log("1. Multi-Tier Tone Escalation Copy Logic");
  const testInv = db.getInvoice("inv_acme_001")!;
  const draftL1 = draftReminderCopy(testInv, 1);
  const draftL2 = draftReminderCopy(testInv, 2);
  const draftL3 = draftReminderCopy(testInv, 3);
  const draftL4 = draftReminderCopy(testInv, 4);

  assert(draftL1.tone === "FRIENDLY", "Level 1 is FRIENDLY");
  assert(draftL1.subject.toLowerCase().includes("friendly check-in"), "Level 1 subject is a polite check-in");
  assert(draftL2.tone === "NEUTRAL", "Level 2 is NEUTRAL");
  assert(draftL2.body.includes("deliverables are temporarily paused"), "Level 2 notice pauses sprint deliverables");
  assert(draftL3.tone === "FIRM", "Level 3 is FIRM");
  assert(draftL3.body.includes("late payment fees"), "Level 3 warns of accrued late fees");

  // 2. Step-by-Step Chasing Progression
  console.log("\n2. Sequential Progression Through Levels");
  // Fresh invoice at level 0
  const freshInv = db.createInvoice({
    clientId: "cli_acme_corp",
    invoiceNumber: "INV-CHASE-001",
    paypalInvoiceId: "PP-CHASE-001",
    status: "SENT",
    amountTotalCents: 100000,
    currency: "USD",
    dueDate: "2024-11-01",
    reminderLevel: 0,
    workStatus: "ACTIVE",
    lateFeeCents: 0,
    lineItems: [],
  });

  // Step to Level 1
  const step1 = await chaseInvoice(freshInv.id, "Step 1 Test");
  assert(step1.success === true, "Level 1 chase executed successfully");
  assert(step1.invoice?.reminderLevel === 1, "Invoice advanced to Level 1");
  assert(step1.reminder?.tone === "FRIENDLY", "Logged FRIENDLY tone reminder");

  // Step to Level 2
  const step2 = await chaseInvoice(freshInv.id, "Step 2 Test");
  assert(step2.success === true, "Level 2 chase executed successfully");
  assert(step2.invoice?.reminderLevel === 2, "Invoice advanced to Level 2");
  assert(step2.invoice?.workStatus === "PAUSED_DUE_TO_NON_PAYMENT", "Work status auto-updated to PAUSED_DUE_TO_NON_PAYMENT");

  // Step to Level 3
  const step3 = await chaseInvoice(freshInv.id, "Step 3 Test");
  assert(step3.success === true, "Level 3 chase executed successfully");
  assert(step3.invoice?.reminderLevel === 3, "Invoice advanced to Level 3");
  assert(step3.reminder?.tone === "FIRM", "Logged FIRM tone reminder");

  // Step to Level 4 -> Knows its limits! Escalates to Human
  const step4 = await chaseInvoice(freshInv.id, "Step 4 Test");
  assert(step4.success === true, "Level 4 handled gracefully");
  assert(step4.escalatedToHuman === true, "Recognizes autonomous limit and flags escalatedToHuman");
  assert(step4.invoice?.status === "NEEDS_REVIEW", "Invoice status updated to NEEDS_REVIEW");
  assert(step4.invoice?.nextReminderAt === undefined, "Halted subsequent automated reminders");

  const recentEvents = db.listEvents(5, freshInv.id);
  const escalationEvt = recentEvents.find((e) => e.eventType === "ESCALATED_TO_HUMAN");
  assert(escalationEvt !== undefined, "Emits ESCALATED_TO_HUMAN event to activity feed");

  // 3. Safety Invariant: Never Chase PAID Invoices
  console.log("\n3. Safety Invariant: Refuse Chasing on Paid Invoices");
  const paidInv = db.getInvoice("inv_hyper_003")!;
  assert(paidInv.status === "PAID", "inv_hyper_003 is PAID");
  const chasePaid = await chaseInvoice(paidInv.id, "Attempt on Paid");
  assert(chasePaid.success === false, "Refuses to chase PAID invoice");
  assert(Boolean(chasePaid.error?.includes("PAID")), "Returns clear explanatory error");

  // 4. Autonomous Sweep & Stress Test (20 concurrent overdue invoices)
  console.log("\n4. Concurrency & Latency Stress Test (Autonomous Sweep across 20 overdue invoices)");
  for (let i = 0; i < 20; i++) {
    db.createInvoice({
      clientId: "cli_fintech_labs",
      invoiceNumber: `INV-SWEEP-${i}`,
      paypalInvoiceId: `PP-SWEEP-${i}`,
      status: "SENT",
      amountTotalCents: 75000,
      currency: "USD",
      dueDate: "2024-10-01", // overdue
      nextReminderAt: new Date(Date.now() - 1000).toISOString(),
      reminderLevel: 1,
      workStatus: "ACTIVE",
      lateFeeCents: 0,
      lineItems: [],
    });
  }

  const startMs = Date.now();
  const sweep = await runAutonomousChaseSweep();
  const duration = Date.now() - startMs;

  console.log(`  -> Swept ${sweep.sweptCount} overdue invoices, dispatched ${sweep.remindersSent} reminders in ${duration}ms`);
  assert(sweep.remindersSent >= 20, "Dispatched reminders to all qualifying overdue invoices");
  assert(duration < 200, "Sweep completed in under 200ms");

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStage4Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
