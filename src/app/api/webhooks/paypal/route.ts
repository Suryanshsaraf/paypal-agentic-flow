import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const event = await request.json();
    const eventType = event.event_type || "UNKNOWN_EVENT";
    console.log(`[PayPal Webhook Received]: ${eventType}`, event);

    // Handle specific PayPal events
    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        // A bounty escrow deposit was captured
        break;
      case "PAYMENT.PAYOUTSBATCH.SUCCESS":
        // A batch payout to contributor(s) completed
        break;
      case "CUSTOMER.DISPUTE.CREATED":
        // Dispute opened
        break;
      default:
        break;
    }

    return NextResponse.json({
      status: "SUCCESS",
      received_event: eventType,
      processed_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ status: "ERROR", error: error.message }, { status: 400 });
  }
}
