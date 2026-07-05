import type { BillablePlanId } from "@/lib/billing/plans";

export type TenantSyncState = {
  planId: BillablePlanId;
  status: "ACTIVE" | "SUSPENDED" | "TRIAL";
};

/**
 * Map Lemon Squeezy subscription status (+ variant) to API tenant plan/status.
 * Only the Pro variant is self-serve in MVP; unknown variants downgrade to free.
 */
export function mapLemonSqueezySubscriptionToTenantSync(
  lsStatus: string,
  variantId: string | number,
  proVariantId: string
): TenantSyncState {
  const status = lsStatus.toLowerCase();
  const variant = String(variantId);
  const isProVariant = variant === String(proVariantId);

  if (!isProVariant) {
    return { planId: "free", status: "ACTIVE" };
  }

  if (["cancelled", "expired", "unpaid"].includes(status)) {
    return { planId: "free", status: "ACTIVE" };
  }

  if (status === "past_due") {
    return { planId: "pro", status: "SUSPENDED" };
  }

  if (["active", "on_trial", "paused"].includes(status)) {
    return {
      planId: "pro",
      status: status === "on_trial" ? "TRIAL" : "ACTIVE",
    };
  }

  return { planId: "free", status: "ACTIVE" };
}

/** Event-specific overrides when subscription payload is partial or ambiguous. */
export function mapWebhookEventToTenantSync(
  eventName: string,
  current: TenantSyncState
): TenantSyncState {
  switch (eventName) {
    case "subscription_payment_failed":
      return { planId: "pro", status: "SUSPENDED" };
    case "subscription_payment_success":
    case "subscription_payment_recovered":
      return { planId: "pro", status: "ACTIVE" };
    case "subscription_cancelled":
    case "subscription_expired":
      return { planId: "free", status: "ACTIVE" };
    default:
      return current;
  }
}
