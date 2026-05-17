"use client";

import { useActionState } from "react";
import { submitLead } from "./actions/lead";

type State = { ok: boolean; error?: string } | null;

export function LeadForm() {
  const [state, action, pending] = useActionState<State, FormData>(submitLead, null);

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-outline-soft bg-surface-muted px-6 py-8 text-center">
        <p className="text-base font-medium text-fg">Mensaje recibido.</p>
        <p className="mt-1 text-sm text-fg-muted">
          Gracias, te respondemos en menos de 24&nbsp;h.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
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
          className="w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-fg focus:outline-none focus:ring-1 focus:ring-fg"
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
          placeholder="tu@empresa.com"
          className="w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-fg focus:outline-none focus:ring-1 focus:ring-fg"
        />
      </div>

      {/* Tipo */}
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-fg">Perfil</legend>
        <div className="inline-flex rounded-lg border border-outline bg-surface-muted p-1">
          {[
            { value: "autonomo", label: "Autónomo" },
            { value: "empresa", label: "Empresa" },
          ].map(({ value, label }) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value={value}
                defaultChecked={value === "autonomo"}
                className="sr-only"
              />
              <span className="block rounded-md px-4 py-1.5 text-sm font-medium transition-all has-[:checked]:bg-surface has-[:checked]:shadow-sm has-[:checked]:text-fg text-fg-muted hover:text-fg">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Error */}
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-md btn-primary disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
