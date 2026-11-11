import { NextRequest, NextResponse } from "next/server";
import { resetDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    resetDb();
    return NextResponse.json({
      ok: true,
      message: "Database successfully reset to initial seed state for demo presentation.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
