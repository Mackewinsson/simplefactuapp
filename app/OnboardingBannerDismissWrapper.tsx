"use client";

import { useState, useEffect } from "react";

const KEY = "onboarding-banner-dismissed-until";

export function OnboardingBannerDismissWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const until = localStorage.getItem(KEY);
    if (until && Date.now() < parseInt(until, 10)) {
      setDismissed(true);
    }
  }, []);

  if (!mounted || dismissed) return null;

  return (
    <div className="relative">
      {children}
      <button
        type="button"
        aria-label="Cerrar banner de configuración"
        onClick={() => {
          // Dismiss for 24 hours
          localStorage.setItem(KEY, String(Date.now() + 24 * 60 * 60 * 1000));
          setDismissed(true);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-fg-subtle hover:bg-surface-muted hover:text-fg-muted transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
