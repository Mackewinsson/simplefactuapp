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
    trust: string[];
    cta: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    ctaTertiary?: { label: string; href: string };
    note?: string;
  }
> = {
  autonomos: {
    headline: "Cumple Veri·Factu. Sin coste.",
    sub: "Factura, envía a Hacienda y guarda el CSV en segundos. Huellas, encadenamiento y firma SOAP gestionados por nosotros — en el plan gratuito.",
    bullets: [
      "Alta en minutos con tu certificado FNMT",
      "Facturas válidas con PDF descargable y QR tributario",
      "Plan gratuito — sin tarjeta ni permanencia",
    ],
    trust: [
      "Tus facturas no se pierden aunque Hacienda esté caída — reintentos automáticos",
      "Cada envío queda firmado y registrado. No hay forma de borrarlo.",
      "Conexión directa y cifrada con la AEAT — tu certificado nunca sale de nuestros servidores",
      "Puedes recibir avisos por email cuando AEAT acepta o rechaza una factura",
    ],
    cta: { label: "Crear cuenta — es gratis", href: "/sign-up" },
    ctaSecondary: { label: "Ver documentación", href: "/docs" },
    note: "Sin tarjeta · Sin permanencia · Gratis",
  },
  empresas: {
    headline: "API Veri·Factu lista para integrar.",
    sub: "REST con idempotencia, jobs asíncronos y firma mTLS por tenant. Tu sistema sigue emitiendo; nosotros hablamos con AEAT.",
    bullets: [
      "POST /send-invoice, polling de jobs y webhooks salientes",
      "Multi-tenant con certificado por empresa",
      "OpenAPI público, jobs async y métricas por tenant",
    ],
    trust: [
      "Backoff exponencial y watchdog — ningún job se queda atascado",
      "Encadenamiento SHA-256 por instalación según RD 1007/2023",
      "Registro append-only: trazabilidad completa para auditoría",
      "mTLS con AEAT — idempotencia garantizada por clave única de envío",
    ],
    cta: { label: "Ver referencia API", href: "/docs/api-reference" },
    ctaSecondary: { label: "Crear cuenta", href: "/sign-up" },
    ctaTertiary: { label: "Solicitar acceso", href: "#contacto" },
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
        className="inline-flex rounded-xl bg-surface-muted/80 border border-outline-soft/45 p-1 backdrop-blur-sm shadow-inner font-display"
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
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-ring focus-visible:ring-offset-1",
              mode === m
                ? "bg-surface shadow-sm text-fg border border-outline-soft/40"
                : "text-fg-muted hover:text-fg hover:bg-surface/50 border border-transparent",
            ].join(" ")}
          >
            {LABELS[m]}
            {m === "autonomos" && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold leading-none text-accent-foreground shadow-sm">
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
        className="mt-8 animate-fade-in-up"
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-fg font-display sm:text-4xl lg:text-5xl leading-tight">
          {content.headline}
        </h1>
        <p className="mt-4 max-w-xl text-base text-fg-muted sm:text-lg leading-relaxed">
          {content.sub}
        </p>

        <ul className="mt-6 space-y-3">
          {content.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-fg-muted font-medium">
              <CheckIcon />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap font-display">
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
          {content.ctaTertiary && (
            <a
              href={content.ctaTertiary.href}
              className="btn btn-md btn-ghost w-full justify-center sm:w-auto"
            >
              {content.ctaTertiary.label}
            </a>
          )}
        </div>
        {content.note && (
          <p className="mt-4 text-xs font-semibold text-fg-subtle/80 font-display">{content.note}</p>
        )}

        {/* Garantías técnicas — adaptadas al perfil */}
        <ul className="mt-10 space-y-2.5 border-t border-outline-soft/60 pt-8">
          {content.trust.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-fg-subtle leading-relaxed">
              <span aria-hidden className="mt-0.5 shrink-0 text-accent/60 font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
