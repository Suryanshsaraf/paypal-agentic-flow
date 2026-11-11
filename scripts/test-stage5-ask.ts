/**
 * Stage 5 Verification: Ask + Query + Reporting + Polish
 * Tests: Natural Language Financial Q&A, Deterministic Aggregates, Reply Classification, and Concurrency
 */

import { processFinancialQuery } from "../src/lib/query-engine";
import { db, resetDb } from "../src/lib/db";

async function runStage5Tests() {
  console.log("=================================================");
  console.log("🚀 STAGE 5 VERIFICATION: ASK (FINANCIAL Q&A & POLISH)");
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

  // 1. "Who still owes me?"
  console.log("1. 'Who still owes me?' Deterministic Aggregation");
  const q1 = await processFinancialQuery("Who still owes me?");
  assert(q1.intent === "WHO_OWES_ME", "Classifies intent as WHO_OWES_ME");
  assert(q1.data.count >= 2, `Accurately identified ${q1.data.count} debtor accounts`);
  assert(q1.data.totalCents === 530000, "Calculates exact outstanding total: 530,000 cents ($5,300.00)");
  assert(q1.answer.includes("Sarah Chen"), "Includes Sarah Chen in plain-English debtor breakdown");
  assert(q1.answer.includes("David Miller"), "Includes David Miller in plain-English debtor breakdown");

  // 2. "How much am I owed?"
  console.log("\n2. 'How much am I owed?' Balance Aggregation");
  const q2 = await processFinancialQuery("How much am I owed right now?");
  assert(q2.intent === "TOTAL_OUTSTANDING", "Classifies intent as TOTAL_OUTSTANDING");
  assert(q2.data.totalCents === 530000, "Computes exact sum of sent invoices ($5,300.00)");
  assert(q2.answer.includes("$5300.00 USD"), "Formats formatted dollar string accurately");

  // 3. Client-Specific Earnings Query
  console.log("\n3. Client-Specific Lifetime Earnings Aggregation");
  const q3 = await processFinancialQuery("How much did I make from HyperGrowth?");
  assert(q3.intent === "CLIENT_EARNINGS", "Classifies intent as CLIENT_EARNINGS");
  assert(q3.data.totalPaidCents === 120000, "Identifies $1,200.00 paid from HyperGrowth");
  assert(q3.answer.includes("Total Collected (Paid): $1200.00 USD"), "Outputs itemized breakdown");

  // 4. Agent Chasing Status Query
  console.log("\n4. Agent Chasing Status Query");
  const q4 = await processFinancialQuery("What is the autonomous agent currently chasing?");
  assert(q4.intent === "CHASING_STATUS", "Classifies intent as CHASING_STATUS");
  assert(q4.data.count >= 2, "Identifies active chased invoices");

  // 5. Concurrency & Latency Stress Test (25 concurrent queries)
  console.log("\n5. Concurrency & Latency Stress Test (25 concurrent Q&A runs)");
  const concurrencyCount = 25;
  const startMs = Date.now();
  const promises = [];

  for (let i = 0; i < concurrencyCount; i++) {
    promises.push(
      (async () => {
        const reqStart = Date.now();
        const res = await processFinancialQuery(i % 2 === 0 ? "Who owes me money?" : "How much did I make from Acme?");
        const reqEnd = Date.now();
        return {
          duration: reqEnd - reqStart,
          intent: res.intent,
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

  console.log(`  -> Handled ${concurrencyCount} concurrent financial queries in ${totalDuration}ms`);
  console.log(`  -> Latency: p50 = ${p50}ms, p95 = ${p95}ms, p99 = ${p99}ms`);
  assert(results.length === concurrencyCount, "All 25 queries answered successfully");
  assert(p95 < 50, "95% of financial queries completed in under 50ms");

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStage5Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
