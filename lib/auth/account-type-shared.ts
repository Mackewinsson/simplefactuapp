export const ACCOUNT_TYPES = ["autonomo", "integrator"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export function isAccountType(value: unknown): value is AccountType {
  return value === "autonomo" || value === "integrator";
}
