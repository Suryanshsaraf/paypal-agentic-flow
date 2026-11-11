import { NextRequest, NextResponse } from "next/server";
import { verifyPayPalWebhookSignature } from "@/lib/paypal";
import { processPayPalWebhookEvent } from "@/lib/webhook-processor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Read RAW body as string first (required for cryptographic verification)
    const rawBody = await req.text();

    if (!rawBody) {
      return NextResponse.json(
        { ok: false, error: "Empty webhook payload." },
        { status: 400 }
      );
    }

    // 2. Extract PayPal transmission headers
    const transmissionId = req.headers.get("paypal-transmission-id") || "";
    const transmissionTime = req.headers.get("paypal-transmission-time") || "";
    const certUrl = req.headers.get("paypal-cert-url") || "";
    const authAlgo = req.headers.get("paypal-auth-algo") || "";
    const transmissionSig = req.headers.get("paypal-transmission-sig") || "";
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || "MOCK_WEBHOOK_ID";

    // 3. Verify signature if webhook headers are present
    if (transmissionId && certUrl) {
      const isValid = await verifyPayPalWebhookSignature({
        transmissionId,
        transmissionTime,
        certUrl,
        authAlgo,
        transmissionSig,
        webhookId,
        rawBody,
      });

      if (!isValid) {
        console.warn("[PayPal Webhook] Signature verification failed for transmission:", transmissionId);
        return NextResponse.json(
          { ok: false, error: "Invalid webhook signature." },
          { status: 401 }
        );
      }
    }

    // 4. Parse payload and process
    let eventPayload: any;
    try {
      eventPayload = JSON.parse(rawBody);
    } catch (parseErr) {
      return NextResponse.json(
        { ok: false, error: "Malformed JSON payload." },
        { status: 400 }
      );
    }

    const result = await processPayPalWebhookEvent(eventPayload);

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error: any) {
    console.error("[POST /api/webhooks/paypal error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
