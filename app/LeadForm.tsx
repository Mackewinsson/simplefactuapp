"use client";

import { useActionState, useState } from "react";
import { submitLead } from "./actions/lead";

type State = { ok: boolean; error?: string } | null;

export function LeadForm() {
  const [type, setType] = useState<"autonomo" | "empresa">("autonomo");
  const [state, action, pending] = useActionState<State, FormData>(submitLead, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-outline-soft bg-surface-muted px-6 py-10 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-lg">✓</span>
        <p className="text-sm font-semibold text-fg">Mensaje recibido</p>
        <p className="text-sm text-fg-muted">Gracias, te respondemos en menos de 24&nbsp;h.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">

      {/* Tipo — segmented control */}
      <fieldset>
        <legend className="mb-2 block text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Perfil
        </legend>
        <div className="flex rounded-lg border border-outline-soft bg-surface-muted p-1">
          {(["autonomo", "empresa"] as const).map((val) => {
            const label = val === "autonomo" ? "Autónomo" : "Empresa / API";
            const active = type === val;
            return (
              <label
                key={val}
                className={[
                  "flex flex-1 cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all select-none",
                  active
                    ? "bg-fg text-surface shadow-sm"
                    : "text-fg-muted hover:text-fg",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="type"
                  value={val}
                  checked={active}
                  onChange={() => setType(val)}
                  className="sr-only"
                />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Nombre */}
      <div>
        <label htmlFor="lf-name" className="mb-1.5 block text-sm font-medium text-fg">
          Nombre
        </label>
        <input
          id="lf-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Tu nombre"
          className="w-full rounded-lg border border-outline-soft bg-surface px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-fg focus:outline-none focus:ring-1 focus:ring-fg"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="lf-email" className="mb-1.5 block text-sm font-medium text-fg">
          Email
        </label>
        <input
          id="lf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={type === "empresa" ? "tu@empresa.com" : "tu@email.com"}
          className="w-full rounded-lg border border-outline-soft bg-surface px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-fg focus:outline-none focus:ring-1 focus:ring-fg"
        />
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="lf-message" className="mb-1.5 block text-sm font-medium text-fg">
          Mensaje
        </label>
        <textarea
          id="lf-message"
          name="message"
          rows={4}
          placeholder="Cuéntanos tu caso, duda o necesidad…"
          className="w-full resize-none rounded-lg border border-outline-soft bg-surface px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-fg focus:outline-none focus:ring-1 focus:ring-fg"
        />
      </div>

      {/* Consentimiento RGPD */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline accent-fg"
        />
        <span className="text-sm text-fg-muted">
          He leído y acepto la{" "}
          <a
            href="/legal/privacidad"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-2 hover:text-fg"
          >
            Política de Privacidad
          </a>
          . Mis datos se usarán exclusivamente para responder a mi consulta.
        </span>
      </label>

      {/* Error */}
      {state?.error && (
        <p role="alert" className="rounded-lg bg-danger px-3.5 py-2.5 text-sm text-danger-foreground">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-md btn-primary w-full disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>

      <p className="text-center text-xs text-fg-subtle">
        Sin spam. Te respondemos en menos de 24&nbsp;h.
      </p>
    </form>
  );
}
