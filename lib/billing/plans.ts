export type BillablePlanId = "free" | "pro" | "enterprise";

export type BillingPlan = {
  id: BillablePlanId;
  name: string;
  priceCents: number;
  maxRequestsPerMonth: number;
  maxInvoicesPerMonth: number;
  selfServe: boolean;
  contactEmail?: string;
};

/** Single source of truth for tier cards and Lemon Squeezy mapping (MVP). */
export const BILLING_PLANS: Record<BillablePlanId, BillingPlan> = {
  free: {
    id: "free",
    name: "FREE",
    priceCents: 0,
    maxRequestsPerMonth: 100,
    maxInvoicesPerMonth: 50,
    selfServe: false,
  },
  pro: {
    id: "pro",
    name: "PRO",
    priceCents: 9900,
    maxRequestsPerMonth: 10_000,
    maxInvoicesPerMonth: 5_000,
    selfServe: true,
  },
  enterprise: {
    id: "enterprise",
    name: "ENTERPRISE",
    priceCents: 99_900,
    maxRequestsPerMonth: 100_000,
    maxInvoicesPerMonth: 50_000,
    selfServe: false,
    contactEmail: "soporte@simplefactu.com",
  },
};

export function formatPlanPrice(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
