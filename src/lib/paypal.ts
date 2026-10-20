import { PayPalCredentials } from "./types";

const DEFAULT_SANDBOX_BASE = "https://api-m.sandbox.paypal.com";

function getCredentials(): PayPalCredentials {
  return {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb-demo-client-id",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "sb-demo-client-secret",
    apiBase: process.env.PAYPAL_API_BASE || DEFAULT_SANDBOX_BASE,
  };
}

const isMockMode = (creds: PayPalCredentials) => {
  return (
    !creds.clientId ||
    !creds.clientSecret ||
    creds.clientId === "sb-demo-client-id" ||
    creds.clientId === "your_paypal_sandbox_client_id"
  );
};

/**
 * Obtain OAuth2 Access Token from PayPal Sandbox
 */
export async function getPayPalAccessToken(customCreds?: Partial<PayPalCredentials>): Promise<string> {
  const creds = { ...getCredentials(), ...customCreds };

  if (isMockMode(creds)) {
    return "MOCK_SANDBOX_ACCESS_TOKEN_" + Math.random().toString(36).substring(7);
  }

  const auth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
  const response = await fetch(`${creds.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal OAuth Failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal Order (Orders v2) to fund a bounty into escrow
 */
export async function createPayPalOrder({
  amount,
  currency = "USD",
  bountyId,
  title,
  customCreds,
}: {
  amount: number;
  currency?: string;
  bountyId: string;
  title: string;
  customCreds?: Partial<PayPalCredentials>;
}) {
  const creds = { ...getCredentials(), ...customCreds };

  if (isMockMode(creds)) {
    const mockId = "MOCK-ORDER-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      id: mockId,
      status: "CREATED",
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`,
          rel: "approve",
          method: "GET",
        },
      ],
      isMock: true,
    };
  }

  const token = await getPayPalAccessToken(customCreds);
  const response = await fetch(`${creds.apiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `bounty_${bountyId}`,
          description: `GitBounty Escrow Funding: ${title.substring(0, 100)}`,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "GitBounty AI Protocol",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create PayPal Order: ${errorText}`);
  }

  const data = await response.json();
  return { ...data, isMock: false };
}

/**
 * Capture a PayPal Order once approved by funder
 */
export async function capturePayPalOrder(orderId: string, customCreds?: Partial<PayPalCredentials>) {
  const creds = { ...getCredentials(), ...customCreds };

  if (isMockMode(creds) || orderId.startsWith("MOCK-ORDER")) {
    return {
      id: orderId,
      status: "COMPLETED",
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: "MOCK-CAPTURE-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
                status: "COMPLETED",
                amount: { value: "100.00", currency_code: "USD" },
              },
            ],
          },
        },
      ],
      isMock: true,
    };
  }

  const token = await getPayPalAccessToken(customCreds);
  const response = await fetch(`${creds.apiBase}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to capture PayPal Order: ${errorText}`);
  }

  const data = await response.json();
  return { ...data, isMock: false };
}

export interface PayoutItemInput {
  recipientEmail: string;
  amount: number;
  currency?: string;
  note?: string;
  senderItemId?: string;
}

/**
 * Execute PayPal Payout (Payouts v1) directly to contributor(s) email address
 * Supports single contributor or atomic multi-contributor batch split payouts!
 */
export async function executePayPalPayout({
  items,
  emailSubject = "You received a GitBounty AI payout!",
  customCreds,
}: {
  items: PayoutItemInput[];
  emailSubject?: string;
  customCreds?: Partial<PayPalCredentials>;
}) {
  const creds = { ...getCredentials(), ...customCreds };

  if (isMockMode(creds)) {
    const mockBatchId = "MOCK-BATCH-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    return {
      batch_header: {
        payout_batch_id: mockBatchId,
        batch_status: "SUCCESS",
        sender_batch_header: {
          email_subject: emailSubject,
        },
      },
      items: items.map((item, idx) => ({
        payout_item_id: `MOCK-ITEM-${idx + 1}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        transaction_id: `5TY${Math.floor(10000000 + Math.random() * 90000000)}SANDBOX`,
        payout_item_fee: { currency: "USD", value: "0.25" },
        payout_batch_id: mockBatchId,
        payout_item: {
          recipient_type: "EMAIL",
          amount: { value: item.amount.toFixed(2), currency: item.currency || "USD" },
          note: item.note || "Automated GitBounty Bug Fix Bounty",
          receiver: item.recipientEmail,
          sender_item_id: item.senderItemId || `bounty_item_${Date.now()}_${idx}`,
        },
        transaction_status: "SUCCESS",
      })),
      isMock: true,
    };
  }

  const token = await getPayPalAccessToken(customCreds);
  const senderBatchId = `GitBounty_batch_${Date.now()}`;

  const payload = {
    sender_batch_header: {
      sender_batch_id: senderBatchId,
      email_subject: emailSubject,
      email_message: "Congratulations! Your PR successfully passed our AI Proof-of-Fix & Security Audit on GitBounty.",
    },
    items: items.map((item, idx) => ({
      recipient_type: "EMAIL",
      amount: {
        value: item.amount.toFixed(2),
        currency: item.currency || "USD",
      },
      receiver: item.recipientEmail,
      note: item.note || "GitBounty Automated Bounty Disbursement",
      sender_item_id: item.senderItemId || `item_${Date.now()}_${idx}`,
    })),
  };

  const response = await fetch(`${creds.apiBase}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Payouts Failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return { ...data, isMock: false };
}
