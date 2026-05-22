/**
 * Semantic badge class names — align with globals.css (.badge-*).
 */

export type StatusBadgeVariant = "success" | "warning" | "danger" | "neutral" | "pending";

const VARIANT_CLASS: Record<StatusBadgeVariant, string> = {
  success: "badge badge-success",
  warning: "badge badge-warning",
  danger: "badge badge-danger",
  neutral: "badge badge-neutral",
  /** Config / draft pending — neutral, not fiscal warning */
  pending: "badge badge-neutral",
};

export function statusBadgeClass(variant: StatusBadgeVariant): string {
  return VARIANT_CLASS[variant];
}
