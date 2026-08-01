/**
 * Unit checks for app/api/webhooks/lemonsqueezy/route.ts (run: npx tsx scripts/test-lemon-webhook.ts)
 */
import assert from "node:assert/strict";
import crypto from "crypto";

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";
process.env.SIMPLEFACTU_API_BASE_URL = "http://localhost:3000/v1";
process.env.SIMPLEFACTU_ADMIN_KEY = "test_admin_key";
process.env.LEMONSQUEEZY_API_KEY = "test_ls_key";
process.env.LEMONSQUEEZY_STORE_ID = "12345";
process.env.LEMONSQUEEZY_VARIANT_ID_PRO = "999";
process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "test_webhook_secret_123";

// Mock global fetch for admin sync tenant call
(globalThis as any).fetch = async (_url: string) => {
  return {
    ok: true,
    status: 200,
    json: async () => ({ ok: true }),
    text: async () => JSON.stringify({ ok: true }),
  };
};

// Mock Prisma
(globalThis as any).prisma = {
  subscription: {
    findFirst: async () => null,
    upsert: async () => ({}),
  },
  $transaction: async (cb: any) => cb((globalThis as any).prisma),
};

function signBody(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

async function runTests() {
  const { POST } = await import("../app/api/webhooks/lemonsqueezy/route");

  // Test 1: Invalid signature returns 401
  const reqInvalidSig = new Request("http://localhost/api/webhooks/lemonsqueezy", {
    method: "POST",
    headers: { "x-signature": "bad_sig" },
    body: JSON.stringify({ meta: { event_name: "subscription_created" } }),
  });
  const resInvalidSig = await POST(reqInvalidSig);
  assert.equal(resInvalidSig.status, 401);
  const jsonInvalidSig = await resInvalidSig.json();
  assert.equal(jsonInvalidSig.error, "Invalid signature");

  // Test 2: Invalid JSON body returns 400
  const invalidJsonStr = "INVALID_JSON_BODY{";
  const sigInvalidJson = signBody(invalidJsonStr, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
  const reqInvalidJson = new Request("http://localhost/api/webhooks/lemonsqueezy", {
    method: "POST",
    headers: { "x-signature": sigInvalidJson },
    body: invalidJsonStr,
  });
  const resInvalidJson = await POST(reqInvalidJson);
  assert.equal(resInvalidJson.status, 400);

  // Test 3: Unhandled event returns 200 with ignored: true
  const unhandledBody = JSON.stringify({ meta: { event_name: "order_created" } });
  const sigUnhandled = signBody(unhandledBody, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
  const reqUnhandled = new Request("http://localhost/api/webhooks/lemonsqueezy", {
    method: "POST",
    headers: { "x-signature": sigUnhandled },
    body: unhandledBody,
  });
  const resUnhandled = await POST(reqUnhandled);
  assert.equal(resUnhandled.status, 200);
  const jsonUnhandled = await resUnhandled.json();
  assert.equal(jsonUnhandled.ignored, true);
  assert.equal(jsonUnhandled.eventName, "order_created");

  // Test 4: Valid handled event succeeds
  const validBody = JSON.stringify({
    meta: {
      event_name: "subscription_created",
      custom_data: { tenant_id: "sf_user_1", user_id: "user_lemon_1" },
    },
    data: {
      id: "sub_100",
      attributes: {
        store_id: 12345,
        customer_id: 67890,
        order_id: 555,
        variant_id: 999,
        status: "active",
        card_brand: "visa",
        card_last_four: "4242",
        renews_at: new Date().toISOString(),
        ends_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        urls: { customer_portal: "https://lemonsqueezy.com/portal" },
      },
    },
  });
  const sigValid = signBody(validBody, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
  const reqValid = new Request("http://localhost/api/webhooks/lemonsqueezy", {
    method: "POST",
    headers: { "x-signature": sigValid },
    body: validBody,
  });
  const resValid = await POST(reqValid);
  assert.equal(resValid.status, 200);
  const jsonValid = await resValid.json();
  assert.equal(jsonValid.received, true);
  assert.equal(jsonValid.eventName, "subscription_created");

  console.log("✓ test-lemon-webhook: OK");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
