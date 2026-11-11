import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clients = db.listClients();
    return NextResponse.json({
      ok: true,
      clients,
      count: clients.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Valid email address is required." },
        { status: 400 }
      );
    }

    const client = db.upsertClient({
      name: body.name || email.split("@")[0],
      email,
      company: body.company,
      phone: body.phone,
    });

    return NextResponse.json(
      { ok: true, client },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
