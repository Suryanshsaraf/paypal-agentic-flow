export type BountyStatus = "OPEN" | "FUNDED" | "IN_REVIEW" | "MERGED_AND_PAID" | "FLAGGED_SECURITY_RISK";

export interface Bounty {
  id: string;
  issueNumber: number;
  repo: string;
  title: string;
  description: string;
  failingTestCase?: string;
  amount: number; // in USD
  currency: string;
  status: BountyStatus;
  createdAt: string;
  funderName: string;
  funderEmail: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Critical";
  prs: PullRequest[];
}

export interface SecurityAuditResult {
  score: number; // 0 - 100
  verdict: "APPROVED" | "CHANGES_REQUESTED" | "MALICIOUS_REJECTED";
  threatLevel: "NONE" | "LOW" | "MEDIUM" | "CRITICAL";
  vulnerabilitiesDetected: string[];
  unitTestsPass: boolean;
  astAnalysisSummary: string;
  suggestedSplit?: {
    contributorEmail: string;
    percentage: number;
    amount: number;
    reason: string;
  }[];
  timestamp: string;
}

export interface PullRequest {
  id: string;
  bountyId: string;
  prNumber: number;
  title: string;
  contributorName: string;
  contributorEmail: string; // PayPal email for payout
  coContributors?: { name: string; email: string }[];
  gitBranch: string;
  diffContent: string;
  status: "PENDING_AUDIT" | "AUDITED" | "MERGED" | "REJECTED";
  auditResult?: SecurityAuditResult;
  payoutResult?: {
    batchId: string;
    transactionId: string;
    amount: number;
    currency: string;
    paidAt: string;
    status: "SUCCESS" | "PENDING" | "FAILED";
  };
  mergedAt?: string;
}

export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  apiBase: string;
}
