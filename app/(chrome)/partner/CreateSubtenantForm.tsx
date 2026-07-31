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
            NIF Emisor <span className="text-danger-emphasis">*</span>
          </span>
          <input
            type="text"
            name="allowedNif"
            required
            placeholder="ej. B12345678"
            className="input mt-1.5 font-mono uppercase"
          />
          <span className="mt-1 block text-xs text-fg-subtle">
            NIF <strong>real</strong> del titular del certificado FNMT (AEAT no acepta NIFs
            inventados). Debe coincidir con el PFX que subas después.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-fg font-display">
            Nombre / Razón Social <span className="text-danger-emphasis">*</span>
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
            ID empresa / cuenta <span className="text-danger-emphasis">*</span>
          </span>
          <input
            type="text"
            name="id"
            required
            placeholder="garcia_lopez_sl"
            pattern="[a-zA-Z0-9_\-]+"
            className="input mt-1.5 font-mono"
          />
          <span className="mt-1 block text-xs text-fg-subtle">
            Identificador único para llamadas API y gestión (sólo letras, números y guiones).
          </span>
        </label>

        <div className="rounded-xl border border-accent/20 bg-accent-muted/20 p-3.5 text-xs space-y-1">
          <p className="font-bold text-fg font-display">Integración con la API</p>
          <p className="text-fg-muted">
            Tras el alta: sube el certificado del autónomo y genera una{" "}
            <strong>clave API del autónomo</strong> para{" "}
            <code className="font-mono">POST /send-invoice</code>. La clave de gestoría solo
            gestiona cuentas hijas; no envía facturas. Detalle en{" "}
            <Link href="/docs/gestoria" className="link-accent">
              Gestoría
            </Link>
            .
          </p>
        </div>
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
          {pending ? "Registrando…" : "Registrar NIF Emisor"}
        </button>
        <Link href="/partner" className="text-sm font-semibold text-fg-muted hover:text-fg font-display transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
