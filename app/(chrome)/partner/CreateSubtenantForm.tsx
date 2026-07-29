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
            placeholder="B12345678"
            className="input mt-1.5 font-mono uppercase"
          />
          <span className="mt-1 block text-xs text-fg-subtle">
            NIF del emisor de facturas (debe coincidir con el certificado PFX que subas después).
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
            ID Empresa / Tenant <span className="text-danger-emphasis">*</span>
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
          <p className="font-bold text-fg font-display">💡 Nota de Integración Marca Blanca:</p>
          <p className="text-fg-muted">
            Podrás emitir facturas para este NIF directamente usando tu <strong>API Key Partner principal</strong>. Si necesitas una API Key dedicada propia para este cliente, podrás emitirla en 1 clic tras completar el alta.
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
