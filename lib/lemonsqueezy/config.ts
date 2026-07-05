export type LemonSqueezyConfig = {
  apiKey: string;
  storeId: string;
  proVariantId: string;
  webhookSecret: string;
  testMode: boolean;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} no está definida`);
  }
  return value;
}

export function getLemonSqueezyConfig(): LemonSqueezyConfig {
  return {
    apiKey: requireEnv("LEMONSQUEEZY_API_KEY"),
    storeId: requireEnv("LEMONSQUEEZY_STORE_ID"),
    proVariantId: requireEnv("LEMONSQUEEZY_VARIANT_ID_PRO"),
    webhookSecret: requireEnv("LEMONSQUEEZY_WEBHOOK_SECRET"),
    testMode: String(process.env.LEMONSQUEEZY_TEST_MODE || "").toLowerCase() === "true",
  };
}

export function isLemonSqueezyConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY?.trim() &&
      process.env.LEMONSQUEEZY_STORE_ID?.trim() &&
      process.env.LEMONSQUEEZY_VARIANT_ID_PRO?.trim() &&
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim()
  );
}
