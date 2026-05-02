"use client";

import { useActionState } from "react";
import {
  adminPatchTenantAction,
  adminMaintenanceOnAction,
  adminMaintenanceOffAction,
  type ActionState,
} from "@/app/admin/actions";
import type { AdminTenant } from "@/lib/simplefactu/admin-server";

function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.ok && state.message) {
    return <p className="text-sm text-green-800">{state.message}</p>;
  }
  if (!state.ok && state.error) {
    return <p className="text-sm text-red-700">{state.error}</p>;
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
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Editar tenant</h2>
        <form action={patchAction} className="max-w-md space-y-3">
          <input type="hidden" name="tenantId" value={tenant.id} />
          <label className="block text-sm">
            <span className="text-gray-600">Nombre</span>
            <input
              name="name"
              type="text"
              defaultValue={tenant.name ?? ""}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">Plan</span>
            <select
              name="planId"
              defaultValue={tenant.plan_id}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="free">free</option>
              <option value="pro">pro</option>
              <option value="enterprise">enterprise</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">Estado</span>
            <select
              name="status"
              defaultValue={tenant.status}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="TRIAL">TRIAL</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={patchPending}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {patchPending ? "Guardando…" : "Guardar cambios"}
          </button>
          <FormMessage state={patchState} />
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Mantenimiento (tenant)</h2>
        <p className="mb-3 text-xs text-gray-500">
          Bloquea operaciones de escritura para este tenant según la API simplefactu.
        </p>
        <div className="flex flex-wrap gap-3">
          <form action={onAction}>
            <input type="hidden" name="tenantId" value={tenant.id} />
            <button
              type="submit"
              disabled={onPending}
              className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            >
              {onPending ? "…" : "Maintenance ON"}
            </button>
          </form>
          <form action={offAction}>
            <input type="hidden" name="tenantId" value={tenant.id} />
            <button
              type="submit"
              disabled={offPending}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-50"
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
