"use client";

import { useActionState, useState } from "react";
import {
  createSubtenantApiKeyFormAction,
  updateSubtenantStatusAction,
  uploadSubtenantCertificateAction,
  type PartnerActionState,
} from "@/app/(chrome)/partner/actions";

export function PartnerSubtenantActions({
  childId,
  status,
}: {
  childId: string;
  status: string;
}) {
  const [keyState, keyAction, keyPending] = useActionState(
    createSubtenantApiKeyFormAction,
    null as PartnerActionState | null
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusPending, setStatusPending] = useState(false);
  const [certState, certAction, certPending] = useActionState(
    uploadSubtenantCertificateAction.bind(null, childId),
    null as PartnerActionState | null
  );

  async function toggleStatus() {
    setStatusPending(true);
    setStatusMsg(null);
    const next = status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    const res = await updateSubtenantStatusAction(childId, next);
    setStatusMsg(res.ok ? res.message : res.errors.join(", "));
    setStatusPending(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void toggleStatus()}
          disabled={statusPending}
          className={`btn btn-sm ${status === "SUSPENDED" ? "btn-accent" : "btn-danger"}`}
        >
          {statusPending
            ? "…"
            : status === "SUSPENDED"
              ? "Reactivar cliente"
              : "Suspender cliente"}
        </button>
        {statusMsg ? <p className="text-sm text-fg-muted font-medium">{statusMsg}</p> : null}
      </div>

      <div className="rounded-xl border border-outline-soft/60 bg-surface/80 p-4 space-y-3">
        <h3 className="text-sm font-bold text-fg font-display">Clave API del cliente</h3>
        <p className="text-xs text-fg-muted">
          Para integraciones directas con simplefactu (envío de facturas, certificado, etc.).
        </p>
        <form action={keyAction}>
          <input type="hidden" name="childId" value={childId} />
          <button type="submit" disabled={keyPending} className="btn btn-sm btn-primary">
            {keyPending ? "Generando…" : "Generar clave API"}
          </button>
        </form>
        {keyState && !keyState.ok ? (
          <p className="text-sm text-danger-emphasis font-semibold">{keyState.errors.join(", ")}</p>
        ) : null}
        {keyState?.ok && keyState.apiKey ? (
          <div className="rounded-lg bg-surface-muted p-3 border border-outline-soft/40">
            <p className="text-xs text-warning-deeper font-semibold">{keyState.message}</p>
            <code className="mt-2 block break-all text-xs font-mono">{keyState.apiKey}</code>
          </div>
        ) : keyState?.ok ? (
          <p className="text-sm text-success-emphasis font-semibold">{keyState.message}</p>
        ) : null}
      </div>

      <form
        action={certAction}
        className="rounded-xl border border-outline-soft/60 bg-surface/80 p-4 space-y-3"
      >
        <h3 className="text-sm font-bold text-fg font-display">Certificado AEAT (.pfx)</h3>
        <label className="block">
          <span className="text-xs font-semibold text-fg-muted">Archivo PFX</span>
          <input
            type="file"
            name="pfx"
            accept=".pfx,.p12"
            required
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-outline-soft file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-fg file:cursor-pointer"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-fg-muted">Contraseña del certificado</span>
          <input
            type="password"
            name="pfxPassphrase"
            required
            className="input mt-1"
          />
        </label>
        {certState && !certState.ok ? (
          <p className="text-sm text-danger-emphasis font-semibold">{certState.errors.join(", ")}</p>
        ) : null}
        {certState?.ok ? (
          <p className="text-sm text-success-emphasis font-semibold">{certState.message}</p>
        ) : null}
        <button type="submit" disabled={certPending} className="btn btn-sm btn-primary">
          {certPending ? "Subiendo…" : "Subir certificado"}
        </button>
      </form>
    </div>
  );
}
