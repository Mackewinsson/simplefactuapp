"use client";

import { useState, useTransition } from "react";
import { setAccountTypeAction } from "./actions";
import type { AccountType } from "@/lib/auth/account-type-shared";

const OPTIONS: {
  type: AccountType;
  title: string;
  subtitle: string;
  bullets: string[];
}[] = [
  {
    type: "autonomo",
    title: "Soy autónomo o pyme",
    subtitle: "Facturo desde la web con Veri*Factu",
    bullets: [
      "Crear y enviar facturas a AEAT",
      "Clientes, productos y PDF",
      "Onboarding guiado paso a paso",
    ],
  },
  {
    type: "integrator",
    title: "Soy integrador API / gestoría",
    subtitle: "Conecto mi software o gestiono clientes",
    bullets: [
      "Consola de integrador y sub-tenants",
      "Prueba primero en sandbox (QA)",
      "Producción solo tras aprobación",
    ],
  },
];

export function WelcomeAccountTypePicker() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AccountType | null>(null);

  function choose(type: AccountType) {
    setError(null);
    setSelected(type);
    startTransition(async () => {
      const result = await setAccountTypeAction(type);
      // redirect() throws; only handle soft errors
      if (result && !result.ok) {
        setError(result.error ?? "No se pudo guardar. Inténtalo de nuevo.");
        setSelected(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              disabled={pending}
              onClick={() => choose(opt.type)}
              className={[
                "group flex flex-col rounded-2xl border p-5 text-left transition-all",
                "hover:border-accent/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isActive
                  ? "border-accent bg-accent-muted/40 shadow-md"
                  : "border-outline-soft bg-surface",
                pending && !isActive ? "opacity-50" : "",
              ].join(" ")}
            >
              <span className="text-lg font-extrabold text-fg font-display tracking-tight">
                {opt.title}
              </span>
              <span className="mt-1 text-sm text-fg-muted font-medium">{opt.subtitle}</span>
              <ul className="mt-4 space-y-1.5 text-xs text-fg-subtle font-sans">
                {opt.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <span className="mt-5 inline-flex items-center text-sm font-bold text-accent font-display">
                {pending && isActive ? "Guardando…" : "Continuar →"}
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="rounded-lg border border-danger-outline bg-danger/40 px-3 py-2 text-sm text-danger-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
