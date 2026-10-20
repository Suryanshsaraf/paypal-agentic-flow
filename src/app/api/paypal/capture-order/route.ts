import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { getBountyById, updateBounty } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { orderId, bountyId, customCreds } = await request.json();
    const bounty = getBountyById(bountyId);

    if (!bounty) {
      return NextResponse.json({ success: false, error: "Bounty not found" }, { status: 404 });
    }

    const captureResult = await capturePayPalOrder(orderId, customCreds);
    const captureId =
      captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id || `CAP-${Date.now()}`;

    const updated = updateBounty(bounty.id, {
      status: "FUNDED",
      paypalOrderId: orderId,
      paypalCaptureId: captureId,
    });

    return NextResponse.json({
      success: true,
      captureId,
      bounty: updated,
      captureResult,
    });
  } catch (error: any) {
    console.error("Error capturing PayPal order:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
