"use client";

import { useActionState } from "react";
import { adminPatchEmailPrefsAction, type ActionState } from "@/app/(chrome)/admin/actions";
import type { AdminEmailPrefs } from "@/lib/simplefactu/admin-server";

export function TenantEmailPrefsForm({
  tenantId,
  initial,
}: {
  tenantId: string;
  initial: AdminEmailPrefs | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    adminPatchEmailPrefsAction,
    null
  );

  return (
    <section className="rounded-lg border border-outline-soft bg-surface p-4">
      <h2 className="mb-1 text-sm font-semibold text-fg">Notificaciones por email</h2>
      <p className="mb-3 text-xs text-fg-muted">
        Alertas enviadas directamente al tenant (requiere <code className="rounded bg-surface-muted px-0.5">EMAILS_ENABLED</code> en el API).
      </p>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="tenantId" value={tenantId} />
        <label className="block text-sm">
          <span className="text-fg-muted">Email de notificaciones</span>
          <input
            name="notificationEmail"
            type="email"
            defaultValue={initial?.notificationEmail ?? ""}
            placeholder="contact@empresa.es"
            className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
          />
        </label>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="notifyOnDeadJobs"
              defaultChecked={initial?.notifyOnDeadJobs ?? false}
              className="rounded"
            />
            <span className="text-fg-muted">Alertar cuando un job quede DEAD</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="notifyOnCertExpiry"
              defaultChecked={initial?.notifyOnCertExpiry ?? false}
              className="rounded"
            />
            <span className="text-fg-muted">Alertar cuando el certificado esté próximo a expirar</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar preferencias"}
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
