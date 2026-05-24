"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createSubtenantAction,
  type PartnerActionState,
} from "@/app/(chrome)/partner/actions";

export function CreateSubtenantForm() {
  const [state, formAction, pending] = useActionState<PartnerActionState | null, FormData>(
    createSubtenantAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4 rounded border border-outline-soft bg-surface p-4">
      <label className="block text-sm">
        <span className="text-fg-muted">
          Identificador <span className="text-danger-emphasis">*</span>
        </span>
        <input
          type="text"
          name="id"
          required
          placeholder="autonomo_garcia"
          pattern="[a-zA-Z0-9_\-]+"
          className="mt-1 w-full rounded border border-outline px-3 py-2 font-mono text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="text-fg-muted">Nombre</span>
        <input
          type="text"
          name="name"
          placeholder="García López"
          className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="text-fg-muted">
          NIF autorizado <span className="text-danger-emphasis">*</span>
        </span>
        <input
          type="text"
          name="allowedNif"
          required
          placeholder="12345678Z"
          className="mt-1 w-full rounded border border-outline px-3 py-2 font-mono text-sm uppercase"
        />
        <span className="mt-1 block text-xs text-fg-subtle">
          Debe coincidir con el titular del certificado que subas después.
        </span>
      </label>

      {state && !state.ok ? (
        <ul className="text-sm text-danger-emphasis">
          {state.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-success-emphasis">{state.message}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-sm btn-primary disabled:opacity-50"
        >
          {pending ? "Creando…" : "Crear autónomo"}
        </button>
        <Link href="/partner" className="text-sm text-fg-muted hover:text-fg">
          Volver al listado
        </Link>
      </div>
    </form>
  );
}
