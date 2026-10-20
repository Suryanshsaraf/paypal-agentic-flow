import { NextResponse } from "next/server";
import { getBounties, createBounty } from "@/lib/store";
import { Bounty } from "@/lib/types";

export async function GET() {
  const bounties = getBounties();
  return NextResponse.json({ success: true, bounties });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBounty: Bounty = {
      id: `bounty-${Date.now()}`,
      issueNumber: body.issueNumber || Math.floor(100 + Math.random() * 900),
      repo: body.repo || "my-org/core-lib",
      title: body.title,
      description: body.description,
      failingTestCase: body.failingTestCase,
      amount: Number(body.amount) || 50,
      currency: "USD",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      funderName: body.funderName || "Open Source Maintainer",
      funderEmail: body.funderEmail || "sponsor@developer.com",
      tags: body.tags || ["Bugfix"],
      difficulty: body.difficulty || "Intermediate",
      prs: [],
    };

    const saved = createBounty(newBounty);
    return NextResponse.json({ success: true, bounty: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
