import { NextRequest, NextResponse } from "next/server";
import { processFinancialQuery } from "@/lib/query-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid 'question' in request body." },
        { status: 400 }
      );
    }

    const result = await processFinancialQuery(question);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[POST /api/query error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
