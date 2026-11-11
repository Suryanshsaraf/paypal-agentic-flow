import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getPayPalAccessToken } from "@/lib/paypal";
import { getEnv } from "@/lib/env";
import { HealthResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const envInfo = getEnv();
  const startTime = Date.now();

  let dbOk = false;
  try {
    const store = getDb();
    dbOk = Boolean(store && store.invoices.size >= 0);
  } catch (err) {
    dbOk = false;
  }

  let paypalOk = false;
  let tokenExpiryIso: string | undefined;
  let paypalMode: "LIVE_SANDBOX_TOKEN" | "SIMULATED_SANDBOX" = "SIMULATED_SANDBOX";

  try {
    const tokenInfo = await getPayPalAccessToken();
    paypalOk = Boolean(tokenInfo.token);
    paypalMode = tokenInfo.isLiveSandbox ? "LIVE_SANDBOX_TOKEN" : "SIMULATED_SANDBOX";
    tokenExpiryIso = new Date(tokenInfo.expiresAt).toISOString();
  } catch (err) {
    paypalOk = false;
  }

  const responsePayload: HealthResponse = {
    ok: dbOk && paypalOk,
    db: dbOk,
    paypal: paypalOk,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    env: {
      sandbox: envInfo.isSandbox,
      appUrl: envInfo.baseUrl,
    },
    details: {
      paypalMode,
      tokenCached: true,
      tokenExpiry: tokenExpiryIso,
    },
  };

  return NextResponse.json(responsePayload, {
    status: responsePayload.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Response-Time-Ms": `${Date.now() - startTime}`,
    },
  });
}
