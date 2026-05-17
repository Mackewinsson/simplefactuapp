"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

type Mode = "autonomos" | "empresas";

const CONTENT: Record<
  Mode,
  {
    headline: string;
    sub: string;
    bullets: string[];
    cta: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    note?: string;
  }
> = {
  autonomos: {
    headline: "Cumple Veri\u00b7Factu. Sin coste.",
    sub: "Factura, env\u00eda a Hacienda y guarda el CSV en segundos. Huellas, encadenamiento y firma SOAP gestionados por nosotros \u2014 en el plan gratuito.",
    bullets: [
      "Alta en minutos con tu certificado FNMT",
      "Facturas v\u00e1lidas con PDF descargable y QR tributario",
      "Plan gratuito \u2014 sin tarjeta ni permanencia",
    ],
    cta: { label: "Crear cuenta \u2014 es gratis", href: "/sign-up" },
    ctaSecondary: { label: "Ver documentaci\u00f3n", href: "/docs" },
    note: "Sin tarjeta \u00b7 Sin permanencia \u00b7 Gratis",
  },
  empresas: {
    headline: "API Veri\u00b7Factu lista para integrar.",
    sub: "REST con idempotencia, jobs as\u00edncronos y firma mTLS por tenant. Tu sistema sigue emitiendo; nosotros hablamos con AEAT.",
    bullets: [
      "POST /send-invoice, polling de jobs y webhooks salientes",
      "Multi-tenant con certificado por empresa",
      "OpenAPI completo, panel admin y m\u00e9tricas por tenant",
    ],
    cta: { label: "Ver API Reference", href: "/docs/api-reference" },
    ctaSecondary: { label: "Crear cuenta", href: "/sign-up" },
  },
};

const LABELS: Record<Mode, string> = {
  autonomos: "Aut\u00f3nomos",
  empresas: "Empresas \u00b7 API",
};

const MODES: Mode[] = ["autonomos", "empresas"];

function CheckIcon() {
  return (
    <svg
      aria-hidden
      className="mt-0.5 h-4 w-4 shrink-0 text-fg-muted"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="2,8 6,12 14,4" />
    </svg>
  );
}

export function HeroTabs() {
  const [mode, setMode] = useState<Mode>("autonomos");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const next =
          e.key === "ArrowRight"
            ? (idx + 1) % MODES.length
            : (idx - 1 + MODES.length) % MODES.length;
        setMode(MODES[next]);
        tabRefs.current[next]?.focus();
      }
    },
    [],
  );

  const content = CONTENT[mode];

  return (
    <div>
      {/* Segmented control */}
      <div
        role="tablist"
        aria-label="Tipo de usuario"
        className="inline-flex rounded-lg bg-surface-muted p-1"
      >
        {MODES.map((m, idx) => (
          <button
            key={m}
            role="tab"
            id={`tab-${m}`}
            aria-selected={mode === m}
            aria-controls={`panel-${m}`}
            ref={(el) => { tabRefs.current[idx] = el; }}
            onClick={() => setMode(m)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={[
              "inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-ring focus-visible:ring-offset-1",
              mode === m
                ? "bg-surface shadow-sm text-fg"
                : "text-fg-muted hover:text-fg",
            ].join(" ")}
          >
            {LABELS[m]}
            {m === "autonomos" && (
              <span className="rounded-full bg-fg px-1.5 py-0.5 text-[10px] font-semibold leading-none text-surface">
                Gratis
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div
        id={`panel-${mode}`}
        role="tabpanel"
        aria-labelledby={`tab-${mode}`}
        className="mt-8"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl lg:text-5xl">
          {content.headline}
        </h1>
        <p className="mt-4 max-w-xl text-base text-fg-muted sm:text-lg">
          {content.sub}
        </p>

        <ul className="mt-6 space-y-3">
          {content.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-fg-muted">
              <CheckIcon />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={content.cta.href}
            className="btn btn-md btn-primary w-full justify-center sm:w-auto"
          >
            {content.cta.label}
          </Link>
          <Link
            href={content.ctaSecondary.href}
            className="btn btn-md btn-secondary w-full justify-center sm:w-auto"
          >
            {content.ctaSecondary.label}
          </Link>
        </div>
        {content.note && (
          <p className="mt-4 text-xs text-fg-subtle">{content.note}</p>
        )}
      </div>
    </div>
  );
}
