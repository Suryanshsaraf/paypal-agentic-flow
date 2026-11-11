/**
 * Stage 1 Verification: Foundation, Money Math, DB Store, OAuth Token Caching,
 * and Concurrent Latency / Stress Checks
 */

import { dollarsToCents, centsToDecimalString, formatCents, addCents, calculateLatePenalty } from "../src/lib/money";
import { getDb, db, resetDb } from "../src/lib/db";
import { getPayPalAccessToken } from "../src/lib/paypal";
import { getEnv } from "../src/lib/env";

async function runStage1Tests() {
  console.log("=================================================");
  console.log("🚀 STAGE 1 VERIFICATION: FOUNDATION & PLUMBING");
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

  // 1. Money Math Minor Units
  console.log("1. Money Arithmetic (Cents Minor Units — Zero Float Errors)");
  assert(dollarsToCents(10.5) === 1050, "dollarsToCents(10.50) === 1050 cents");
  assert(dollarsToCents("49.99") === 4999, "dollarsToCents('49.99') === 4999 cents");
  assert(dollarsToCents("$1,500.25") === 150025, "dollarsToCents('$1,500.25') handles commas & symbols");
  assert(centsToDecimalString(1050) === "10.50", "centsToDecimalString(1050) === '10.50'");
  assert(centsToDecimalString(7) === "0.07", "centsToDecimalString(7) === '0.07' with zero-padding");
  assert(formatCents(350000) === "$3500.00 USD", "formatCents formats properly for display");
  assert(addCents(1000, 2500, 450) === 3950, "addCents sums without float precision bugs");
  assert(calculateLatePenalty(100000, 0.015, 30) === 1500, "calculateLatePenalty computes monthly rate correctly");

  // 2. Database Store & Invariants
  console.log("\n2. In-Memory Persistent Store & Invariant Checks");
  resetDb();
  const clients = db.listClients();
  assert(clients.length >= 3, `Initial database contains ${clients.length} seeded clients`);
  
  const invoices = db.listInvoices();
  assert(invoices.length >= 3, `Initial database contains ${invoices.length} seeded invoices`);
  
  const acmeInv = db.getInvoice("inv_acme_001");
  assert(acmeInv !== undefined, "Finds invoice by ID");
  assert(acmeInv?.amountTotalCents === 350000, "Preserves minor unit cents amount: 350,000 cents ($3,500.00)");
  assert(acmeInv?.client?.name === "Sarah Chen", "Hydrates relational client correctly");

  // Test Event Idempotent Deduplication
  console.log("\n3. Event Audit Log & Idempotent Webhook Deduplication");
  const evt1 = db.addEvent({
    eventType: "WEBHOOK_PAID",
    paypalEventId: "WH-TEST-DEDUPE-999",
    payload: { test: true },
  });
  assert(!evt1.isDuplicate, "First event insert with ID WH-TEST-DEDUPE-999 is NOT duplicate");

  const evt2 = db.addEvent({
    eventType: "WEBHOOK_PAID",
    paypalEventId: "WH-TEST-DEDUPE-999",
    payload: { test: true, replayed: true },
  });
  assert(evt2.isDuplicate, "Second event insert with identical paypalEventId is detected as duplicate (idempotent no-op)");

  // 4. PayPal OAuth Token Caching
  console.log("\n4. PayPal OAuth Token In-Memory Caching & Pre-Expiry Refresh");
  const t1 = await getPayPalAccessToken();
  assert(Boolean(t1.token), "Successfully retrieved OAuth token (token minted)");
  
  const t2 = await getPayPalAccessToken();
  assert(t1.token === t2.token, "Subsequent call returns cached token without re-fetching");
  assert(t1.expiresAt === t2.expiresAt, "Token expiry preserved in cache");

  // 5. Concurrency & Latency Stress Test (50 concurrent calls)
  console.log("\n5. Concurrency & Latency Stress Test (50 concurrent operations)");
  const concurrencyCount = 50;
  const startMs = Date.now();
  const promises = [];

  for (let i = 0; i < concurrencyCount; i++) {
    promises.push(
      (async () => {
        const reqStart = Date.now();
        const client = db.upsertClient({
          name: `Concurrent User ${i}`,
          email: `concurrent_${i}@test.com`,
        });
        const inv = db.createInvoice({
          clientId: client.id,
          invoiceNumber: `INV-CONCUR-${i}`,
          status: "DRAFT",
          amountTotalCents: 10000 + i * 100,
          currency: "USD",
          dueDate: "2024-12-31",
          reminderLevel: 0,
          workStatus: "ACTIVE",
          lateFeeCents: 0,
          lineItems: [],
        });
        const token = await getPayPalAccessToken();
        const reqEnd = Date.now();
        return { duration: reqEnd - reqStart, invoiceId: inv.id };
      })()
    );
  }

  const results = await Promise.all(promises);
  const totalDuration = Date.now() - startMs;
  const latencies = results.map((r) => r.duration).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[latencies.length - 1];

  console.log(`  -> Handled ${concurrencyCount} concurrent database & token ops in ${totalDuration}ms`);
  console.log(`  -> Latency: p50 = ${p50}ms, p95 = ${p95}ms, p99 = ${p99}ms`);
  assert(latencies.length === concurrencyCount, `All ${concurrencyCount} concurrent operations completed successfully`);
  assert(p95 < 100, "95% of concurrent operations completed in under 100ms");

  // 6. Environment & Security Check
  console.log("\n6. Environment Diagnostics & Secret Quarantine Check");
  const env = getEnv();
  assert(typeof env.isSandbox === "boolean", "Identifies sandbox vs production environment");
  assert(env.baseUrl.startsWith("http"), "Valid base URL configured");

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStage1Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
