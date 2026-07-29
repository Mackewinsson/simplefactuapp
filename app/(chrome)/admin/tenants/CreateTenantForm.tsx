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
export function CreateTenantForm({
  defaultParentTenantId,
  buttonLabel = "+ Nuevo tenant",
}: {
  defaultParentTenantId?: string;
  buttonLabel?: string;
} = {}) {
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
          className="btn btn-sm btn-accent"
        >
          {buttonLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded border border-outline-soft bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-fg">
          {defaultParentTenantId ? `Crear NIF emisor para ${defaultParentTenantId}` : "Crear tenant"}
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-fg-subtle hover:text-fg-muted"
        >
          Cerrar
        </button>
      </div>
      <p className="mt-1 text-xs text-fg-muted">
        {defaultParentTenantId
          ? "Añadir un nuevo NIF emisor dependiente de esta cuenta gestoría."
          : "Pensado para integradores externos que usan la API directamente. Tras crear el tenant podrás generar su API key y subirle un certificado desde la vista de detalle."}
      </p>
      <form action={formAction} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-fg-muted">
            Identificador <span className="text-danger-emphasis">*</span>
          </span>
          <input
            type="text"
            name="id"
            required
            placeholder={defaultParentTenantId ? "empresa_cliente_nif" : "ext_acme"}
            pattern="[a-zA-Z0-9_\-]+"
            className="mt-1 w-full rounded border border-outline px-3 py-2 font-mono text-sm"
          />
          <span className="mt-1 block text-xs text-fg-subtle">
            Letras, números, guiones y guiones bajos. Inmutable después de crear.
          </span>
        </label>
        <label className="block text-sm">
          <span className="text-fg-muted">Nombre comercial / Razón social</span>
          <input
            type="text"
            name="name"
            placeholder="Empresa Cliente SL"
            className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-fg-muted">NIF Emisor autorizado (`allowed_nif`)</span>
          <input
            type="text"
            name="allowedNif"
            placeholder="B12345678"
            className="mt-1 w-full rounded border border-outline px-3 py-2 font-mono text-sm uppercase"
          />
        </label>
        <label className="block text-sm">
          <span className="text-fg-muted">Plan</span>
          <select
            name="planId"
            defaultValue="free"
            className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
          >
            <option value="free">free</option>
            <option value="pro">pro</option>
            <option value="enterprise">enterprise</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-fg-muted">Tenant padre (opcional)</span>
          <input
            type="text"
            name="parentTenantId"
            defaultValue={defaultParentTenantId ?? ""}
            placeholder="acme_holding"
            className="mt-1 w-full rounded border border-outline px-3 py-2 font-mono text-sm"
          />
          <span className="mt-1 block text-xs text-fg-subtle">
            Si este tenant pertenece a un grupo o gestoría, ID del tenant padre.
          </span>
        </label>
        <label className="block text-sm">
          <span className="text-fg-muted">NIF autorizado (opcional)</span>
          <input
            type="text"
            name="allowedNif"
            placeholder="B12345678"
            className="mt-1 w-full rounded border border-outline px-3 py-2 font-mono text-sm uppercase"
          />
          <span className="mt-1 block text-xs text-fg-subtle">
            Si se especifica, este tenant <strong className="font-medium">solo podrá emitir facturas</strong> para
            ese NIF. Útil cuando cada tienda o filial tiene un NIF propio.
          </span>
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="btn btn-sm btn-accent disabled:opacity-50"
          >
            {pending ? "Creando..." : "Crear tenant"}
          </button>
          {state && !state.ok && state.error ? (
            <p role="alert" className="mt-2 text-sm text-danger-foreground">
              {state.error}
            </p>
          ) : null}
          {state && state.ok && state.message ? (
            <div className="mt-2 text-sm text-success-foreground">
              <p>{state.message}</p>
              {state.tenantId ? (
                <p className="mt-1">
                  <Link
                    href={`/admin/tenants/${encodeURIComponent(state.tenantId)}`}
                    className="text-accent hover:underline"
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
