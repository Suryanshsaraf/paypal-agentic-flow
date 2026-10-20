import { NextResponse } from "next/server";
import { getBountyById } from "@/lib/store";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const bounty = getBountyById(params.id);
  if (!bounty) {
    return NextResponse.json({ success: false, error: "Bounty not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, bounty });
}
