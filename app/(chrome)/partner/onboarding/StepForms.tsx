"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  createSubtenantAction,
  createSubtenantApiKeyFormAction,
  updateSubtenantStatusAction,
  uploadSubtenantCertificateAction,
  type PartnerActionState,
} from "@/app/(chrome)/partner/actions";

/**
 * Shared step forms used by the onboarding guide (first NIF, on page)
 * and by AddNifModal (subsequent NIFs, modal wizard).
 */

export function SubtenantForm({
  onSuccess,
  showIntro = true,
}: {
  onSuccess: (childId: string) => void;
  showIntro?: boolean;
}) {
  const [state, formAction, pending] = useActionState<PartnerActionState | null, FormData>(
    createSubtenantAction,
    null
  );
  const submittedId = useRef("");

  useEffect(() => {
    if (state?.ok) onSuccess(submittedId.current);
  }, [state, onSuccess]);

  return (
    <form
      action={(formData: FormData) => {
        submittedId.current = String(formData.get("id") ?? "").trim();
        formAction(formData);
      }}
      className="space-y-3"
    >
      {showIntro ? (
        <p className="text-xs text-fg-muted font-medium rounded-lg border border-accent/20 bg-accent-muted/30 px-3 py-2">
          La cuenta gestoría (<code className="font-mono">rp_*</code>) no emite facturas. Cada emisor
          es un sub-tenant con su propio NIF, certificado y API key.
        </p>
      ) : null}
      <label className="block">
        <span className="text-xs font-semibold text-fg-muted">NIF emisor *</span>
        <input
          name="allowedNif"
          required
          placeholder="B12345678"
          className="input mt-1 font-mono uppercase"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-fg-muted">Nombre / razón social *</span>
        <input name="name" required placeholder="Mi Empresa SL" className="input mt-1" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-fg-muted">ID cuenta *</span>
        <input
          name="id"
          required
          pattern="[a-zA-Z0-9_\-]+"
          placeholder="mi_empresa_sl"
          className="input mt-1 font-mono"
        />
      </label>
      {state && !state.ok ? (
        <p className="text-sm text-danger-emphasis font-semibold">{state.errors.join(", ")}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-success-emphasis font-semibold">{state.message}</p>
      ) : null}
      <button type="submit" disabled={pending} className="btn btn-md btn-accent">
        {pending ? "Registrando…" : "Registrar NIF emisor"}
      </button>
    </form>
  );
}

export function CertUploadForm({
  childId,
  onSuccess,
}: {
  childId: string;
  onSuccess: () => void;
}) {
  const bound = uploadSubtenantCertificateAction.bind(null, childId);
  const [state, formAction, pending] = useActionState<PartnerActionState | null, FormData>(
    bound,
    null
  );

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="text-xs font-semibold text-fg-muted">Archivo .pfx / .p12 *</span>
        <input
          type="file"
          name="pfx"
          accept=".pfx,.p12"
          required
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-outline-soft file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-fg"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-fg-muted">Contraseña del certificado *</span>
        <input type="password" name="pfxPassphrase" required className="input mt-1" />
      </label>
      {state && !state.ok ? (
        <p className="text-sm text-danger-emphasis font-semibold">{state.errors.join(", ")}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-success-emphasis font-semibold">{state.message}</p>
      ) : null}
      <button type="submit" disabled={pending} className="btn btn-md btn-primary">
        {pending ? "Subiendo…" : "Subir certificado"}
      </button>
    </form>
  );
}

export function ApiKeyStep({
  childId,
  generatedKey,
  onGenerated,
}: {
  childId: string;
  generatedKey: string | null;
  onGenerated: (key: string) => void;
}) {
  const [state, formAction, pending] = useActionState<PartnerActionState | null, FormData>(
    createSubtenantApiKeyFormAction,
    null
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state?.ok && state.apiKey) onGenerated(state.apiKey);
  }, [state, onGenerated]);

  function copy() {
    if (!generatedKey) return;
    void navigator.clipboard.writeText(generatedKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-muted font-medium">
        Esta clave es del <strong>emisor</strong> (scopes de factura). La clave de gestoría solo
        administra cuentas hijas.
      </p>
      {!generatedKey ? (
        <form action={formAction}>
          <input type="hidden" name="childId" value={childId} />
          <button type="submit" disabled={pending} className="btn btn-md btn-primary">
            {pending ? "Generando…" : "Generar API key"}
          </button>
        </form>
      ) : null}
      {state && !state.ok ? (
        <p className="text-sm text-danger-emphasis font-semibold">{state.errors.join(", ")}</p>
      ) : null}
      {generatedKey ? (
        <div className="rounded-xl border border-warning-outline/50 bg-warning/40 p-4 space-y-3">
          <p className="text-xs font-bold text-warning-foreground font-display">
            Cópiala ahora — no se volverá a mostrar
          </p>
          <code className="block break-all rounded-lg bg-code px-3 py-2 font-mono text-[11px] text-code-foreground">
            {generatedKey}
          </code>
          <button type="button" onClick={copy} className="btn btn-sm btn-secondary">
            {copied ? "Copiada ✓" : "Copiar clave"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ActivateNifButton({
  childId,
  canActivate,
  missingHint,
  onSuccess,
}: {
  childId: string;
  canActivate: boolean;
  /** Shown when requirements are not met yet. */
  missingHint?: string;
  onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function activate() {
    setError(null);
    startTransition(async () => {
      const res = await updateSubtenantStatusAction(childId, "ACTIVE");
      if (res.ok) {
        onSuccess();
      } else {
        setError(res.errors.join(", "));
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={activate}
        disabled={!canActivate || pending}
        className="btn btn-md btn-accent"
        title={!canActivate ? missingHint : undefined}
      >
        {pending ? "Activando…" : "Activar NIF emisor"}
      </button>
      {!canActivate && missingHint ? (
        <p className="text-xs text-warning-emphasis font-semibold">{missingHint}</p>
      ) : null}
      {error ? <p className="text-sm text-danger-emphasis font-semibold">{error}</p> : null}
    </div>
  );
}
