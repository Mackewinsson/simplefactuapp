/**
 * Billing feature flag for the front.
 *
 * Mirrors the simplefactu API's BILLING_ENABLED flag. When off:
 *   - The "Plan" link is hidden from the top nav.
 *   - The /settings/billing page shows a "coming soon" placeholder
 *     instead of the upgrade UI.
 *
 * Read via NEXT_PUBLIC_BILLING_ENABLED so it's available both on the
 * server (Server Components) and on the client (UpgradeButton).
 */
export function isBillingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BILLING_ENABLED === "true";
}
