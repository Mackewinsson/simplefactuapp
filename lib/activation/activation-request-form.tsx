"use client";

import { useActionState } from "react";

export type ActivationFormState = {
  ok: boolean;
  error?: string;
  message?: string;
} | null;

type Props = {
  defaultEmail: string;
  defaultCompanyName?: string;
  defaultNif?: string;
  title?: string;
  description?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  action: (
    prev: ActivationFormState,
    formData: FormData
  ) => Promise<ActivationFormState>;
};

export function SharedActivationRequestForm({
  defaultEmail,
  defaultCompanyName = "",
  defaultNif = "",
  title = "Solicitar activación de cuenta",
  description = "Revisamos cada solicitud a mano. Te avisaremos por email cuando esté lista.",
  messageLabel = "Comentario (opcional)",
  messagePlaceholder = "Cuéntanos tu caso de uso o cualquier detalle útil…",
  action,
}: Props) {
  const [state, formAction, pending] = useActionState<ActivationFormState, FormData>(
    action,
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
            "Te avisaremos por email cuando revisemos tu solicitud de activación."}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-outline-soft bg-surface p-5 shadow-sm"
    >
      <div>
        <h2 className="text-base font-extrabold text-fg font-display">{title}</h2>
        <p className="mt-1 text-xs text-fg-muted font-sans font-medium">{description}</p>
      </div>

      <label className="block text-sm">
        <span className="text-fg-muted">Empresa / razón social</span>
        <input
          name="companyName"
          required
          maxLength={120}
          defaultValue={defaultCompanyName}
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
          defaultValue={defaultNif}
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
        <span className="text-fg-muted">{messageLabel}</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          className="input mt-1 w-full"
          placeholder={messagePlaceholder}
        />
      </label>

      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger-outline bg-danger/40 px-3 py-2 text-sm text-danger-foreground"
        >
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
