"use client";

import { useState, useTransition } from "react";
import { startUpgradeAction } from "./actions";

type Props = {
  planId: "pro" | "enterprise";
  label: string;
  variant?: "primary" | "secondary";
};

/**
 * Client component that triggers the server action and redirects the user
 * to the Stripe Checkout URL. We keep this as a separate component so the
 * billing page can stay a pure server component (faster initial render).
 */
export function UpgradeButton({ planId, label, variant = "primary" }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await startUpgradeAction(planId);
      if (result.ok) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setError(result.message);
    });
  };

  const baseClasses =
    variant === "primary"
      ? "btn btn-cta"
      : "rounded border border-outline bg-surface px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-hover";

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={baseClasses}
        aria-label={label}
      >
        {pending ? "Redirigiendo..." : label}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-danger-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
