import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const invoice = db.getInvoice(id);

    if (!invoice) {
      return NextResponse.json(
        { ok: false, error: `Invoice with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
