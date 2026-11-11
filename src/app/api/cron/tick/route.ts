import { NextRequest, NextResponse } from "next/server";
import { runAutonomousChaseSweep } from "@/lib/chase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify CRON_SECRET if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && cronSecret !== "demo-secret-key-123") {
      const authHeader = req.headers.get("authorization") || "";
      const querySecret = new URL(req.url).searchParams.get("secret") || "";
      const expectedBearer = `Bearer ${cronSecret}`;

      if (authHeader !== expectedBearer && querySecret !== cronSecret) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized cron execution." },
          { status: 401 }
        );
      }
    }

    // 2. Execute sweep
    const sweepResult = await runAutonomousChaseSweep();

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      sweep: sweepResult,
    });
  } catch (error: any) {
    console.error("[POST /api/cron/tick error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET for simple uptime pingers / external schedulers
export async function GET(req: NextRequest) {
  return POST(req);
}
