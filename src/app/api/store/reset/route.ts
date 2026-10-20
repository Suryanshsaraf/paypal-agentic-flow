import { NextResponse } from "next/server";
import { resetStore } from "@/lib/store";

export async function POST() {
  const bounties = resetStore();
  return NextResponse.json({
    success: true,
    message: "Bounty store reset to initial demonstration state.",
    bounties,
  });
}
