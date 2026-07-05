import { createCheckout, lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import { getLemonSqueezyConfig } from "@/lib/lemonsqueezy/config";

let configured = false;

function ensureLemonSqueezySetup(): void {
  if (configured) return;
  const { apiKey } = getLemonSqueezyConfig();
  lemonSqueezySetup({ apiKey });
  configured = true;
}

export type CreateProCheckoutParams = {
  tenantId: string;
  userId: string;
  email?: string | null;
  name?: string | null;
  successUrl: string;
};

export async function createProCheckout(params: CreateProCheckoutParams): Promise<string> {
  ensureLemonSqueezySetup();
  const { storeId, proVariantId, testMode } = getLemonSqueezyConfig();

  const response = await createCheckout(storeId, proVariantId, {
    productOptions: {
      redirectUrl: params.successUrl,
    },
    checkoutData: {
      email: params.email ?? undefined,
      name: params.name ?? undefined,
      custom: {
        tenant_id: params.tenantId,
        user_id: params.userId,
      },
    },
    checkoutOptions: {
      embed: false,
      logo: true,
    },
    testMode,
  });

  if (response.error) {
    throw new Error(response.error.message || "Lemon Squeezy checkout failed");
  }

  const checkoutUrl = response.data?.data.attributes.url;
  if (!checkoutUrl) {
    throw new Error("Lemon Squeezy no devolvió URL de checkout");
  }

  return checkoutUrl;
}
