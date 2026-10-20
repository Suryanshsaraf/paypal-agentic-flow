import { NextResponse } from "next/server";
import { auditPullRequestWithGemini } from "@/lib/gemini";
import { getBountyById, updateBounty } from "@/lib/store";
import { PullRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const {
      bountyId,
      prTitle,
      contributorName,
      contributorEmail,
      coContributors,
      gitBranch,
      diffContent,
    } = await request.json();

    const bounty = getBountyById(bountyId);
    if (!bounty) {
      return NextResponse.json({ success: false, error: "Bounty not found" }, { status: 404 });
    }

    const contributorsList = [
      { name: contributorName || "Lead Contributor", email: contributorEmail },
      ...(coContributors || []),
    ];

    // Run AI Audit
    const auditResult = await auditPullRequestWithGemini({
      diffContent: diffContent || "",
      issueTitle: bounty.title,
      issueDescription: bounty.description,
      failingTestCase: bounty.failingTestCase,
      contributors: contributorsList,
    });

    // Compute split dollar amounts if suggested
    if (auditResult.suggestedSplit && auditResult.suggestedSplit.length > 0) {
      auditResult.suggestedSplit = auditResult.suggestedSplit.map((s) => ({
        ...s,
        amount: Number(((bounty.amount * s.percentage) / 100).toFixed(2)),
      }));
    }

    const prId = `pr-${Date.now()}`;
    const newPr: PullRequest = {
      id: prId,
      bountyId: bounty.id,
      prNumber: (bounty.prs?.length || 0) + 1,
      title: prTitle || `fix: address issue #${bounty.issueNumber}`,
      contributorName: contributorName || "Contributor",
      contributorEmail: contributorEmail,
      coContributors,
      gitBranch: gitBranch || "fix/issue-resolution",
      diffContent: diffContent || "",
      status: auditResult.verdict === "MALICIOUS_REJECTED" ? "REJECTED" : "AUDITED",
      auditResult,
    };

    const currentPrs = bounty.prs ? [...bounty.prs] : [];
    currentPrs.unshift(newPr);

    const newBountyStatus =
      auditResult.threatLevel === "CRITICAL"
        ? "FLAGGED_SECURITY_RISK"
        : bounty.status === "MERGED_AND_PAID"
        ? "MERGED_AND_PAID"
        : "IN_REVIEW";

    updateBounty(bounty.id, {
      status: newBountyStatus,
      prs: currentPrs,
    });

    return NextResponse.json({
      success: true,
      pr: newPr,
      auditResult,
      eligibleForPayout: auditResult.verdict === "APPROVED" && auditResult.score >= 80,
    });
  } catch (error: any) {
    console.error("Error auditing PR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
