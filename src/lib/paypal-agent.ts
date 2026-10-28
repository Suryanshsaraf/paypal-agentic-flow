import { ALL_TOOLS_ENABLED, PayPalAgentToolkit } from "@paypal/agent-toolkit/ai-sdk";

export function getPayPalToolkit(customCreds?: { clientId?: string; clientSecret?: string }) {
  const clientId =
    customCreds?.clientId ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    "sb-demo-client-id";
  const clientSecret =
    customCreds?.clientSecret ||
    process.env.PAYPAL_CLIENT_SECRET ||
    "sb-demo-client-secret";

  return new PayPalAgentToolkit({
    clientId,
    clientSecret,
    configuration: {
      actions: ALL_TOOLS_ENABLED,
      context: {
        sandbox: true,
      },
    },
  });
}
