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
      : "rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50";

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
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
