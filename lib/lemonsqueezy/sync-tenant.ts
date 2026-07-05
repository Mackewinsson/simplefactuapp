import { adminFetch } from "@/lib/simplefactu/admin-server";
import type { TenantSyncState } from "@/lib/lemonsqueezy/map-status";

export async function syncTenantBillingState(
  tenantId: string,
  sync: TenantSyncState
): Promise<void> {
  const res = await adminFetch(`/admin/tenants/${encodeURIComponent(tenantId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      planId: sync.planId,
      status: sync.status,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to sync tenant billing (${res.status}): ${text.slice(0, 500)}`
    );
  }
}
