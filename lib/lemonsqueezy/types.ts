export type LemonSqueezyWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    id?: string | number;
    attributes?: {
      store_id?: number | string;
      customer_id?: number | string;
      variant_id?: number | string;
      status?: string;
      renews_at?: string | null;
      ends_at?: string | null;
      urls?: {
        customer_portal?: string | null;
        update_payment_method?: string | null;
      };
    };
  };
};

export function readCustomData(payload: LemonSqueezyWebhookPayload): {
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
