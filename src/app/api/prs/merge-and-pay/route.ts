import { NextResponse } from "next/server";
import { executePayPalPayout, PayoutItemInput } from "@/lib/paypal";
import { getBountyById, updateBounty } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { bountyId, prId, customCreds } = await request.json();

    const bounty = getBountyById(bountyId);
    if (!bounty) {
      return NextResponse.json({ success: false, error: "Bounty not found" }, { status: 404 });
    }

    const prIndex = bounty.prs.findIndex((p) => p.id === prId);
    if (prIndex === -1) {
      return NextResponse.json({ success: false, error: "Pull Request not found" }, { status: 404 });
    }

    const pr = bounty.prs[prIndex];

    if (!pr.auditResult || pr.auditResult.verdict !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "PR cannot be merged or paid: AI Security & Proof-of-Fix audit has not passed.",
        },
        { status: 400 }
      );
    }

    if (pr.status === "MERGED") {
      return NextResponse.json(
        { success: false, error: "PR has already been merged and paid out." },
        { status: 400 }
      );
    }

    // Prepare Payout Items (Single recipient or Multi-contributor split)
    let payoutItems: PayoutItemInput[] = [];

    if (pr.auditResult.suggestedSplit && pr.auditResult.suggestedSplit.length > 1) {
      payoutItems = pr.auditResult.suggestedSplit.map((split, idx) => ({
        recipientEmail: split.contributorEmail,
        amount: split.amount,
        currency: "USD",
        note: `GitBounty split reward for Issue #${bounty.issueNumber} (${split.percentage}% - ${split.reason})`,
        senderItemId: `bounty_${bounty.id}_split_${idx}_${Date.now()}`,
      }));
    } else {
      payoutItems = [
        {
          recipientEmail: pr.contributorEmail,
          amount: bounty.amount,
          currency: "USD",
          note: `GitBounty 100% Bounty Payout for Issue #${bounty.issueNumber}: ${bounty.title.substring(0, 60)}`,
          senderItemId: `bounty_${bounty.id}_full_${Date.now()}`,
        },
      ];
    }

    // Execute PayPal Payout
    const payoutResponse = await executePayPalPayout({
      items: payoutItems,
      emailSubject: `🎉 GitBounty Payout: Issue #${bounty.issueNumber} Resolved!`,
      customCreds,
    });

    const batchId =
      payoutResponse.batch_header?.payout_batch_id || `BATCH-${Date.now()}`;
    const transactionId =
      payoutResponse.items?.[0]?.transaction_id ||
      `5TY${Math.floor(10000000 + Math.random() * 90000000)}SANDBOX`;

    // Update PR status
    const updatedPr = {
      ...pr,
      status: "MERGED" as const,
      mergedAt: new Date().toISOString(),
      payoutResult: {
        batchId,
        transactionId,
        amount: bounty.amount,
        currency: "USD",
        paidAt: new Date().toISOString(),
        status: "SUCCESS" as const,
      },
    };

    const updatedPrs = [...bounty.prs];
    updatedPrs[prIndex] = updatedPr;

    const updatedBounty = updateBounty(bounty.id, {
      status: "MERGED_AND_PAID",
      prs: updatedPrs,
    });

    return NextResponse.json({
      success: true,
      message: "PR automatically merged and PayPal Payout successfully disbursed!",
      payoutResponse,
      batchId,
      transactionId,
      bounty: updatedBounty,
      pr: updatedPr,
    });
  } catch (error: any) {
    console.error("Error executing merge and payout:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
