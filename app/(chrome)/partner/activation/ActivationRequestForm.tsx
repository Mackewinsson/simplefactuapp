"use client";

import { useActionState } from "react";
import {
  submitActivationRequestAction,
  type ActivationRequestState,
} from "./actions";

type Props = {
  defaultEmail: string;
};

export function ActivationRequestForm({ defaultEmail }: Props) {
  const [state, formAction, pending] = useActionState<ActivationRequestState, FormData>(
    submitActivationRequestAction,
    null
  );

  if (state?.ok) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-success-outline/60 bg-success/40 px-5 py-4 text-sm text-success-foreground"
      >
        <p className="font-bold font-display">Solicitud enviada</p>
        <p className="mt-1 text-fg-muted font-sans font-medium">
          {state.message ??
            "Te avisaremos por email cuando revisemos tu solicitud de producción."}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-outline-soft bg-surface p-5 shadow-sm">
      <div>
        <h2 className="text-base font-extrabold text-fg font-display">
          Solicitar activación de producción
        </h2>
        <p className="mt-1 text-xs text-fg-muted font-sans font-medium">
          Cuéntanos quién eres y qué has probado en sandbox. Revisamos cada solicitud a mano.
        </p>
      </div>

      <label className="block text-sm">
        <span className="text-fg-muted">Empresa / razón social</span>
        <input
          name="companyName"
          required
          maxLength={120}
          className="input mt-1 w-full"
          placeholder="Mi Software SL"
        />
      </label>

      <label className="block text-sm">
        <span className="text-fg-muted">NIF</span>
        <input
          name="nif"
          required
          maxLength={20}
          className="input mt-1 w-full uppercase"
          placeholder="B12345678"
        />
      </label>

      <label className="block text-sm">
        <span className="text-fg-muted">Email de contacto</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          maxLength={200}
          className="input mt-1 w-full"
        />
      </label>

      <label className="block text-sm">
        <span className="text-fg-muted">Resumen de pruebas / integración</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          className="input mt-1 w-full"
          placeholder="He integrado send-invoice en QA, NIF de pruebas…, jobId de ejemplo…"
        />
      </label>

      {state?.error ? (
        <p role="alert" className="rounded-lg border border-danger-outline bg-danger/40 px-3 py-2 text-sm text-danger-foreground">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
