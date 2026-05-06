"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { adminCreateTenantAction, type ActionState } from "@/app/(chrome)/admin/actions";

/**
 * Inline collapsible form to create a new tenant from /admin/tenants.
 *
 * Used to onboard external integrators that talk to the simplefactu API
 * directly (server-to-server) without going through the Clerk auto-
 * provisioning flow.
 *
 * After a successful create the action returns `tenantId`, and we link to
 * the tenant detail page where the operator can immediately:
 *   - Issue an API key (existing TenantKeysAndCert form).
 *   - Upload a PFX certificate (existing form).
 */
export function CreateTenantForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    adminCreateTenantAction,
    null
  );
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-900 hover:bg-blue-100"
        >
          + Nuevo tenant
        </button>
      </div>
    );
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Crear tenant</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cerrar
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-600">
        Pensado para integradores externos que usan la API directamente. Tras crear el
        tenant podrás generar su API key y subirle un certificado desde la vista de
        detalle.
      </p>
      <form action={formAction} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-gray-700">
            Identificador <span className="text-red-600">*</span>
          </span>
          <input
            type="text"
            name="id"
            required
            placeholder="ext_acme"
            pattern="[a-zA-Z0-9_\-]+"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
          />
          <span className="mt-1 block text-xs text-gray-500">
            Letras, números, guiones y guiones bajos. Inmutable después de crear.
          </span>
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Nombre comercial</span>
          <input
            type="text"
            name="name"
            placeholder="ACME SL"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Plan</span>
          <select
            name="planId"
            defaultValue="free"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="free">free</option>
            <option value="pro">pro</option>
            <option value="enterprise">enterprise</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Email de notificaciones</span>
          <input
            type="email"
            name="notificationEmail"
            placeholder="contact@acme.es"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-gray-500">
            Opcional. Se usa para los emails transaccionales (welcome, primera factura,
            DEAD job).
          </span>
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? "Creando..." : "Crear tenant"}
          </button>
          {state && !state.ok && state.error ? (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          {state && state.ok && state.message ? (
            <div className="mt-2 text-sm text-green-800">
              <p>{state.message}</p>
              {state.tenantId ? (
                <p className="mt-1">
                  <Link
                    href={`/admin/tenants/${encodeURIComponent(state.tenantId)}`}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir el tenant para emitir API key y subir certificado →
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
