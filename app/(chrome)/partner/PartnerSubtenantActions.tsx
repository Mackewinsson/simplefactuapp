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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void toggleStatus()}
          disabled={statusPending}
          className="btn btn-sm btn-secondary disabled:opacity-50"
        >
          {statusPending
            ? "…"
            : status === "SUSPENDED"
              ? "Reactivar autónomo"
              : "Suspender autónomo"}
        </button>
        {statusMsg ? <p className="text-sm text-fg-muted">{statusMsg}</p> : null}
      </div>

      <div className="rounded border border-outline-soft bg-surface p-4">
        <h3 className="text-sm font-semibold text-fg">API key del autónomo</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Para integraciones directas con simplefactu (envío de facturas, certificado, etc.).
        </p>
        <form action={keyAction} className="mt-3">
          <input type="hidden" name="childId" value={childId} />
          <button
            type="submit"
            disabled={keyPending}
            className="btn btn-sm btn-primary disabled:opacity-50"
          >
            {keyPending ? "Generando…" : "Generar API key"}
          </button>
        </form>
        {keyState && !keyState.ok ? (
          <p className="mt-2 text-sm text-danger-emphasis">{keyState.errors.join(", ")}</p>
        ) : null}
        {keyState?.ok && keyState.apiKey ? (
          <div className="mt-3 rounded bg-surface-muted p-3">
            <p className="text-xs text-warning-deeper">{keyState.message}</p>
            <code className="mt-2 block break-all text-xs">{keyState.apiKey}</code>
          </div>
        ) : keyState?.ok ? (
          <p className="mt-2 text-sm text-success-emphasis">{keyState.message}</p>
        ) : null}
      </div>

      <form
        action={certAction}
        className="space-y-3 rounded border border-outline-soft bg-surface p-4"
      >
        <h3 className="text-sm font-semibold text-fg">Certificado AEAT (.pfx)</h3>
        <label className="block text-sm">
          <span className="text-fg-muted">Archivo PFX</span>
          <input
            type="file"
            name="pfx"
            accept=".pfx,.p12"
            required
            className="mt-1 block w-full text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-fg-muted">Contraseña</span>
          <input
            type="password"
            name="pfxPassphrase"
            required
            className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
          />
        </label>
        {certState && !certState.ok ? (
          <p className="text-sm text-danger-emphasis">{certState.errors.join(", ")}</p>
        ) : null}
        {certState?.ok ? (
          <p className="text-sm text-success-emphasis">{certState.message}</p>
        ) : null}
        <button
          type="submit"
          disabled={certPending}
          className="btn btn-sm btn-primary disabled:opacity-50"
        >
          {certPending ? "Subiendo…" : "Subir certificado"}
        </button>
      </form>
    </div>
  );
}
