/**
 * Environment validation and configuration diagnostics
 * As per BUILD_PLAN.md: validate required env vars; fail fast or report diagnostics.
 */

export interface EnvDiagnostics {
  paypalConfigured: boolean;
  dbConfigured: boolean;
  aiConfigured: boolean;
  isSandbox: boolean;
  baseUrl: string;
}

export function getEnv(): EnvDiagnostics {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  const paypalSecret = process.env.PAYPAL_SECRET;
  const paypalBase = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  const isRealPayPal = Boolean(
    paypalClientId &&
    paypalSecret &&
    paypalClientId !== "sb-demo-client-id" &&
    paypalSecret !== "sb-demo-client-secret"
  );

  return {
    paypalConfigured: isRealPayPal,
    dbConfigured: Boolean(process.env.DATABASE_URL),
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY),
    isSandbox: paypalBase.includes("sandbox"),
    baseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  };
}
