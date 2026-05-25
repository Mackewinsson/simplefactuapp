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
    <form action={formAction} className="panel-premium rounded-2xl p-6 space-y-5">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-fg font-display">
            NIF del cliente <span className="text-danger-emphasis">*</span>
          </span>
          <input
            type="text"
            name="allowedNif"
            required
            placeholder="12345678Z"
            className="input mt-1.5 font-mono uppercase"
          />
          <span className="mt-1 block text-xs text-fg-subtle">
            Debe coincidir con el titular del certificado que subas después.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-fg font-display">
            Nombre o razón social <span className="text-danger-emphasis">*</span>
          </span>
          <input
            type="text"
            name="name"
            required
            placeholder="García López S.L."
            className="input mt-1.5"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-fg font-display">
            Identificador interno <span className="text-danger-emphasis">*</span>
          </span>
          <input
            type="text"
            name="id"
            required
            placeholder="garcia_lopez"
            pattern="[a-zA-Z0-9_\-]+"
            className="input mt-1.5 font-mono"
          />
          <span className="mt-1 block text-xs text-fg-subtle">
            Código único para identificar al cliente en el sistema (letras, números, guiones).
          </span>
        </label>
      </div>

      {state && !state.ok ? (
        <div className="rounded-lg border border-danger-outline/50 bg-danger/60 px-3 py-2 text-sm text-danger-foreground font-semibold">
          {state.errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      ) : null}
      {state?.ok ? (
        <div className="rounded-lg border border-success-outline/50 bg-success/60 px-3 py-2 text-sm text-success-foreground font-semibold">
          {state.message}
        </div>
      ) : null}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-md btn-primary"
        >
          {pending ? "Creando…" : "Agregar cliente"}
        </button>
        <Link href="/partner" className="text-sm font-semibold text-fg-muted hover:text-fg font-display transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
