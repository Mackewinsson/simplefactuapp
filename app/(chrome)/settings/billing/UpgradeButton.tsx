"use client";

import { useState, useTransition } from "react";
import { startUpgradeAction } from "./actions";

type Props = {
  label: string;
  variant?: "primary" | "secondary";
};

/**
 * Client component that triggers the server action and redirects the user
 * to the Lemon Squeezy checkout URL.
 */
export function UpgradeButton({ label, variant = "primary" }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await startUpgradeAction();
      if (result.ok) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setError(result.message);
    });
  };

  const baseClasses =
    variant === "primary"
      ? "btn btn-lg btn-cta w-full sm:w-auto"
      : "btn btn-lg btn-secondary w-full sm:w-auto";

  return (
    <div className="space-y-1.5 w-full sm:w-auto">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={baseClasses}
        aria-label={label}
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirigiendo...
          </span>
        ) : (
          label
        )}
      </button>
      {error ? (
        <div role="alert" className="text-xs text-danger-foreground font-semibold bg-danger/10 px-3 py-1.5 rounded-lg border border-danger-outline/35 backdrop-blur-sm animate-fade-in-up">
          {error}
        </div>
      ) : null}
    </div>
  );
}
