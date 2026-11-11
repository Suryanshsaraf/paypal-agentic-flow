import { NextRequest, NextResponse } from "next/server";
import { extractInvoice } from "@/lib/llm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid 'message' in request body." },
        { status: 400 }
      );
    }

    // Safety: message length cap to prevent DoS
    if (message.length > 10000) {
      return NextResponse.json(
        { ok: false, error: "Message too long (max 10,000 characters)." },
        { status: 400 }
      );
    }

    const proposal = await extractInvoice(message);

    return NextResponse.json({
      ok: true,
      proposal,
    });
  } catch (error: any) {
    console.error("[POST /api/invoices/scope error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
