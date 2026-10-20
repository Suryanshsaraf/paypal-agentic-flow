import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getBountyById, updateBounty } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { bountyId, amount, customCreds } = await request.json();
    const bounty = getBountyById(bountyId);

    if (!bounty) {
      return NextResponse.json({ success: false, error: "Bounty not found" }, { status: 404 });
    }

    const orderAmount = amount || bounty.amount;
    const order = await createPayPalOrder({
      amount: orderAmount,
      currency: "USD",
      bountyId: bounty.id,
      title: bounty.title,
      customCreds,
    });

    updateBounty(bounty.id, {
      paypalOrderId: order.id,
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
