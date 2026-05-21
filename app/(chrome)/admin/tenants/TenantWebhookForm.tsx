"use client";

import { useActionState } from "react";
import { adminPatchWebhookAction, type ActionState } from "@/app/(chrome)/admin/actions";
import type { AdminWebhookConfig } from "@/lib/simplefactu/admin-server";

export function TenantWebhookForm({
  tenantId,
  initial,
}: {
  tenantId: string;
  initial: AdminWebhookConfig | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    adminPatchWebhookAction,
    null
  );

  return (
    <section className="rounded-lg border border-outline-soft bg-surface p-4">
      <h2 className="mb-1 text-sm font-semibold text-fg">Webhook (outbound)</h2>
      <p className="mb-3 text-xs text-fg-muted">
        Cuando un job termina (SUCCEEDED o DEAD), simplefactu hace un POST al webhook URL con el resultado.
        El secreto se usa para firmar el payload (header <code className="rounded bg-surface-muted px-0.5">x-webhook-signature</code>).
      </p>

      {initial && (
        <dl className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-fg-muted">
          <dt className="text-fg-subtle">URL actual</dt>
          <dd className="break-all font-mono">{initial.webhookUrl ?? "—"}</dd>
          <dt className="text-fg-subtle">Secreto</dt>
          <dd>{initial.hasSecret ? "configurado" : "sin secreto"}</dd>
        </dl>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="tenantId" value={tenantId} />
        <label className="block text-sm">
          <span className="text-fg-muted">Webhook URL</span>
          <input
            name="webhookUrl"
            type="url"
            defaultValue={initial?.webhookUrl ?? ""}
            placeholder="https://api.cliente.com/webhooks/verifactu"
            className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
          />
          <span className="mt-0.5 block text-xs text-fg-subtle">Deja vacío para eliminar el webhook.</span>
        </label>
        <label className="block text-sm">
          <span className="text-fg-muted">Nuevo secreto (opcional)</span>
          <input
            name="webhookSecret"
            type="text"
            placeholder="Deja vacío para no cambiarlo"
            className="mt-1 w-full rounded border border-outline px-3 py-2 font-mono text-sm"
          />
          <span className="mt-0.5 block text-xs text-fg-subtle">Si lo rellenas, reemplaza el secreto existente. Escribe un espacio para borrarlo.</span>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar webhook"}
        </button>
        {state && state.ok && state.message && (
          <p className="text-sm text-success-foreground">{state.message}</p>
        )}
        {state && !state.ok && state.error && (
          <p className="text-sm text-danger-foreground">{state.error}</p>
        )}
      </form>
    </section>
  );
}
