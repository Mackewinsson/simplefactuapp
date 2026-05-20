"use client";

import { useActionState } from "react";
import {
  adminPatchTenantAction,
  adminMaintenanceOnAction,
  adminMaintenanceOffAction,
  type ActionState,
} from "@/app/(chrome)/admin/actions";
import type { AdminTenant } from "@/lib/simplefactu/admin-server";

function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.ok && state.message) {
    return <p className="text-sm text-success-foreground">{state.message}</p>;
  }
  if (!state.ok && state.error) {
    return <p className="text-sm text-danger-foreground">{state.error}</p>;
  }
  return null;
}

export function TenantDetailForms({ tenant }: { tenant: AdminTenant }) {
  const [patchState, patchAction, patchPending] = useActionState(adminPatchTenantAction, null);
  const [onState, onAction, onPending] = useActionState(adminMaintenanceOnAction, null);
  const [offState, offAction, offPending] = useActionState(adminMaintenanceOffAction, null);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-fg">Editar tenant</h2>
        <form action={patchAction} className="max-w-md space-y-3">
          <input type="hidden" name="tenantId" value={tenant.id} />
          <label className="block text-sm">
            <span className="text-fg-muted">Nombre</span>
            <input
              name="name"
              type="text"
              defaultValue={tenant.name ?? ""}
              className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-fg-muted">Plan</span>
            <select
              name="planId"
              defaultValue={tenant.plan_id}
              className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
            >
              <option value="free">free</option>
              <option value="pro">pro</option>
              <option value="enterprise">enterprise</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-fg-muted">Estado</span>
            <select
              name="status"
              defaultValue={tenant.status}
              className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="TRIAL">TRIAL</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={patchPending}
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {patchPending ? "Guardando…" : "Guardar cambios"}
          </button>
          <FormMessage state={patchState} />
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-fg">Mantenimiento (tenant)</h2>
        <p className="mb-3 text-xs text-fg-subtle">
          Bloquea operaciones de escritura para este tenant según la API simplefactu.
        </p>
        <div className="flex flex-wrap gap-3">
          <form action={onAction}>
            <input type="hidden" name="tenantId" value={tenant.id} />
            <button
              type="submit"
              disabled={onPending}
              className="rounded border border-warning-outline bg-warning px-3 py-2 text-sm text-warning-foreground hover:bg-warning-hover disabled:opacity-50"
            >
              {onPending ? "…" : "Maintenance ON"}
            </button>
          </form>
          <form action={offAction}>
            <input type="hidden" name="tenantId" value={tenant.id} />
            <button
              type="submit"
              disabled={offPending}
              className="rounded border border-outline bg-surface px-3 py-2 text-sm text-fg hover:bg-surface-hover disabled:opacity-50"
            >
              {offPending ? "…" : "Maintenance OFF"}
            </button>
          </form>
        </div>
        <div className="mt-2 space-y-1">
          <FormMessage state={onState} />
          <FormMessage state={offState} />
        </div>
      </section>
    </div>
  );
}
