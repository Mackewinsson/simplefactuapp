"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "partner-onboarding-banner-dismissed-until";

/**
 * Thin banner on /partner while integrator onboarding is incomplete.
 */
export function PartnerOnboardingBanner({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    setMounted(true);
    const until = localStorage.getItem(KEY);
    if (until && Date.now() < parseInt(until, 10)) {
      setDismissed(true);
    }
  }, []);

  if (!mounted || dismissed) return null;

  return (
    <div className="relative mb-6 rounded-2xl border border-accent/25 bg-accent-muted/40 px-4 py-3.5 shadow-sm backdrop-blur-md animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-fg font-display tracking-tight">
            Guía de inicio — {completed}/{total} pasos
          </p>
          <p className="mt-0.5 text-xs text-fg-muted font-medium font-sans">
            Completa NIF emisor, certificado y primera factura de prueba.
          </p>
          <div className="mt-2.5 h-1.5 max-w-xs rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <Link href="/partner/onboarding" className="btn btn-sm btn-accent shrink-0">
          Continuar guía →
        </Link>
      </div>
      <button
        type="button"
        aria-label="Cerrar banner de guía"
        onClick={() => {
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
