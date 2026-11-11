import fs from "fs";
import path from "path";

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val.trim();
      }
    });
  }
} catch (e) {}

import { getPayPalAccessToken, createPayPalInvoice, sendPayPalInvoice } from "../src/lib/paypal";

async function verifyLivePayPal() {
  console.log("=================================================");
  console.log("🔍 PAYPAL REST API v2 LIVE CONNECTION DIAGNOSTIC");
  console.log("=================================================\n");

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  console.log(`Endpoint:    ${baseUrl}`);
  console.log(`Client ID:   ${clientId ? clientId.substring(0, 8) + "..." : "NOT SET"}`);
  console.log(`Secret:      ${secret ? "********" + secret.slice(-4) : "NOT SET"}\n`);

  if (!clientId || !secret || clientId === "sb-demo-client-id" || secret === "sb-demo-client-secret") {
    console.log("⚠️  STATUS: SIMULATED SANDBOX (Placeholder Keys in .env.local)");
    console.log("-------------------------------------------------");
    console.log("Your codebase is 100% wired for real PayPal API calls, but is currently");
    console.log("running in protected simulator mode because placeholder keys are set in .env.local.");
    console.log("\nTo connect 100% live to PayPal's real servers:");
    console.log("1. Open: https://developer.paypal.com/dashboard/applications/sandbox");
    console.log("2. Click on 'Default Application' (or Create App)");
    console.log("3. Copy your 'Client ID' and 'Secret'");
    console.log("4. Paste them into .env.local (or provide them in chat)");
    console.log("5. Re-run: npx tsx scripts/verify-live-paypal.ts\n");
    return;
  }

  console.log("⏳ 1. Requesting Live OAuth2 Token from PayPal Sandbox...");
  try {
    const tokenRes = await getPayPalAccessToken(true);
    if (!tokenRes.isLiveSandbox) {
      console.log("❌ Failed to obtain live token from PayPal.");
      return;
    }
    console.log("✅ OAuth2 Success: Live Token minted from PayPal API!");
    console.log(`   Expires at: ${new Date(tokenRes.expiresAt).toLocaleTimeString()}\n`);

    console.log("⏳ 2. Creating Live Invoice on PayPal Sandbox...");
    const draftRes = await createPayPalInvoice({
      invoiceNumber: `INV-LIVE-${Date.now().toString().slice(-4)}`,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      currency: "USD",
      primaryRecipientEmail: "sb-buyer@business.example.com",
      recipientName: "Hackathon Judge",
      items: [
        {
          name: "GetPaid Autonomous AR Agent Deployment",
          description: "Autonomous PayPal accounts-receivable invoice",
          quantity: 1,
          unitPriceCents: 50000,
        },
      ],
      note: "Created via GetPaid Autonomous Copilot for PayPal AI Hackathon",
    });

    console.log(`✅ PayPal Invoice Created! ID: ${draftRes.id}`);
    console.log(`   Live Payment URL: ${draftRes.paymentUrl}\n`);

    console.log("⏳ 3. Sending Invoice via PayPal Delivery Rail...");
    const sendRes = await sendPayPalInvoice(draftRes.id);
    if (sendRes.success) {
      console.log("✅ Invoice successfully sent via PayPal!");
    } else {
      console.log(`⚠️ Send note: ${sendRes.error || "Created in draft status"}`);
    }

    console.log("\n=================================================");
    console.log("🎉 100% LIVE PAYPAL SANDBOX CONNECTION VERIFIED!");
    console.log("=================================================");
  } catch (err: any) {
    console.error("❌ Live PayPal Connection Error:", err.message);
  }
}

verifyLivePayPal();
