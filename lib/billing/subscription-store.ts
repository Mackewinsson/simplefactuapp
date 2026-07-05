import { prisma } from "@/lib/prisma";
import type { BillablePlanId } from "@/lib/billing/plans";
import type { LemonSqueezyWebhookPayload } from "@/lib/lemonsqueezy/types";
import {
  mapLemonSqueezySubscriptionToTenantSync,
  mapWebhookEventToTenantSync,
} from "@/lib/lemonsqueezy/map-status";
import { syncTenantBillingState } from "@/lib/lemonsqueezy/sync-tenant";

export type UpsertSubscriptionInput = {
  userId: string;
  tenantId: string;
  lsSubscriptionId: string;
  lsCustomerId?: string | null;
  lsVariantId: string;
  status: string;
  planId: BillablePlanId;
  renewsAt?: Date | null;
  endsAt?: Date | null;
  customerPortalUrl?: string | null;
};

export async function getSubscriptionByUserId(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function upsertSubscription(input: UpsertSubscriptionInput) {
  return prisma.subscription.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      simplefactuTenantId: input.tenantId,
      lsSubscriptionId: input.lsSubscriptionId,
      lsCustomerId: input.lsCustomerId ?? null,
      lsVariantId: input.lsVariantId,
      status: input.status,
      planId: input.planId,
      renewsAt: input.renewsAt ?? null,
      endsAt: input.endsAt ?? null,
      customerPortalUrl: input.customerPortalUrl ?? null,
    },
    update: {
      simplefactuTenantId: input.tenantId,
      lsSubscriptionId: input.lsSubscriptionId,
      lsCustomerId: input.lsCustomerId ?? null,
      lsVariantId: input.lsVariantId,
      status: input.status,
      planId: input.planId,
      renewsAt: input.renewsAt ?? null,
      endsAt: input.endsAt ?? null,
      customerPortalUrl: input.customerPortalUrl ?? null,
    },
  });
}

export async function applyLemonSqueezyWebhook(
  payload: LemonSqueezyWebhookPayload,
  proVariantId: string
): Promise<void> {
  const eventName = payload.meta?.event_name ?? "";
  const attrs = payload.data?.attributes;
  const lsSubscriptionId = payload.data?.id != null ? String(payload.data.id) : null;
  const lsStatus = attrs?.status ?? "unknown";
  const variantId = attrs?.variant_id ?? "";
  const { tenantId, userId } = readCustomDataFromPayload(payload);

  if (!tenantId) {
    throw new Error("Webhook missing tenant_id in custom_data");
  }

  let sync = mapLemonSqueezySubscriptionToTenantSync(lsStatus, variantId, proVariantId);
  sync = mapWebhookEventToTenantSync(eventName, sync);

  if (userId && lsSubscriptionId) {
    await upsertSubscription({
      userId,
      tenantId,
      lsSubscriptionId,
      lsCustomerId: attrs?.customer_id != null ? String(attrs.customer_id) : null,
      lsVariantId: String(variantId),
      status: lsStatus,
      planId: sync.planId,
      renewsAt: attrs?.renews_at ? new Date(attrs.renews_at) : null,
      endsAt: attrs?.ends_at ? new Date(attrs.ends_at) : null,
      customerPortalUrl: attrs?.urls?.customer_portal ?? null,
    });
  }

  await syncTenantBillingState(tenantId, sync);
}

function readCustomDataFromPayload(payload: LemonSqueezyWebhookPayload): {
  tenantId: string | null;
  userId: string | null;
} {
  const custom = payload.meta?.custom_data ?? {};
  const tenantId =
    typeof custom.tenant_id === "string"
      ? custom.tenant_id
      : typeof custom.tenantId === "string"
        ? custom.tenantId
        : null;
  const userId =
    typeof custom.user_id === "string"
      ? custom.user_id
      : typeof custom.userId === "string"
        ? custom.userId
        : null;
  return { tenantId, userId };
}
