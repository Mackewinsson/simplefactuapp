/**
 * Unit tests for Lemon Squeezy billing helpers (signature + status mapping).
 */
import { createHmac } from "node:crypto";
import {
  mapLemonSqueezySubscriptionToTenantSync,
  mapWebhookEventToTenantSync,
} from "../lib/lemonsqueezy/map-status";
import { verifyLemonSqueezyWebhookSignature } from "../lib/lemonsqueezy/verify-webhook";

const PRO_VARIANT = "123456";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`OK: ${message}`);
  }
}

// --- map-status ---
{
  const active = mapLemonSqueezySubscriptionToTenantSync("active", PRO_VARIANT, PRO_VARIANT);
  assert(active.planId === "pro" && active.status === "ACTIVE", "active → pro ACTIVE");

  const trial = mapLemonSqueezySubscriptionToTenantSync("on_trial", PRO_VARIANT, PRO_VARIANT);
  assert(trial.planId === "pro" && trial.status === "TRIAL", "on_trial → pro TRIAL");

  const pastDue = mapLemonSqueezySubscriptionToTenantSync("past_due", PRO_VARIANT, PRO_VARIANT);
  assert(pastDue.planId === "pro" && pastDue.status === "SUSPENDED", "past_due → pro SUSPENDED");

  const cancelled = mapLemonSqueezySubscriptionToTenantSync("cancelled", PRO_VARIANT, PRO_VARIANT);
  assert(cancelled.planId === "free" && cancelled.status === "ACTIVE", "cancelled → free ACTIVE");

  const wrongVariant = mapLemonSqueezySubscriptionToTenantSync("active", "999", PRO_VARIANT);
  assert(wrongVariant.planId === "free", "unknown variant → free");

  const paymentFailed = mapWebhookEventToTenantSync("subscription_payment_failed", {
    planId: "pro",
    status: "ACTIVE",
  });
  assert(
    paymentFailed.planId === "pro" && paymentFailed.status === "SUSPENDED",
    "payment_failed event → SUSPENDED"
  );

  const paymentSuccess = mapWebhookEventToTenantSync("subscription_payment_success", {
    planId: "free",
    status: "SUSPENDED",
  });
  assert(
    paymentSuccess.planId === "pro" && paymentSuccess.status === "ACTIVE",
    "payment_success event → pro ACTIVE"
  );

  const expired = mapWebhookEventToTenantSync("subscription_expired", {
    planId: "pro",
    status: "ACTIVE",
  });
  assert(expired.planId === "free" && expired.status === "ACTIVE", "expired event → free ACTIVE");
}

// --- webhook signature ---
{
  const secret = "test-webhook-secret";
  const body = JSON.stringify({ meta: { event_name: "subscription_created" } });
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  assert(
    verifyLemonSqueezyWebhookSignature(body, signature, secret),
    "valid signature accepted"
  );
  assert(
    !verifyLemonSqueezyWebhookSignature(body, "bad-signature", secret),
    "invalid signature rejected"
  );
  assert(!verifyLemonSqueezyWebhookSignature(body, null, secret), "missing signature rejected");
}

if (process.exitCode) {
  console.error("\nSome Lemon Squeezy billing tests failed.");
  process.exit(process.exitCode);
}

console.log("\nAll Lemon Squeezy billing tests passed.");
