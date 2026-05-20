"use client";

import { useActionState } from "react";
import {
  adminCreateApiKeyAction,
  adminDeleteCertificateAction,
  adminRevokeApiKeyAction,
  adminUploadCertificateAction,
  type ActionState,
} from "@/app/(chrome)/admin/actions";
import type { AdminApiKeyRow } from "@/lib/simplefactu/admin-server";

function Msg({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.ok && state.plainKey) {
    return (
      <div className="rounded border border-warning-outline bg-warning p-3 text-sm text-warning-deeper">
        <p className="font-medium">Clave creada (cópiala ahora; no se mostrará de nuevo):</p>
        <code className="mt-2 block break-all font-mono text-xs">{state.plainKey}</code>
      </div>
    );
  }
  if (state.ok && state.message) {
    return <p className="text-sm text-success-foreground">{state.message}</p>;
  }
  if (!state.ok && state.error) {
    return <p className="text-sm text-danger-foreground">{state.error}</p>;
  }
  return null;
}

export function TenantKeysAndCert({
  tenantId,
  initialKeys,
  hasCertificate,
}: {
  tenantId: string;
  initialKeys: AdminApiKeyRow[];
  hasCertificate: boolean;
}) {
  const [createState, createAction, createPending] = useActionState(adminCreateApiKeyAction, null);
  const [revokeState, revokeAction, revokePending] = useActionState(adminRevokeApiKeyAction, null);
  const [uploadState, uploadAction, uploadPending] = useActionState(adminUploadCertificateAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(adminDeleteCertificateAction, null);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-fg">API keys</h2>
        <p className="mb-3 text-xs text-fg-subtle">
          Las claves no se muestran completas. Crear una nueva clave muestra el secreto una sola vez. Revocar
          invalida la clave de inmediato.
        </p>
        <div className="overflow-x-auto rounded border border-outline-soft">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-outline-soft bg-surface-hover">
              <tr>
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">Nombre</th>
                <th className="px-2 py-2">Estado</th>
                <th className="px-2 py-2">Scopes</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {initialKeys.map((k) => (
                <tr key={k.id} className="border-b border-outline-soft">
                  <td className="px-2 py-2 font-mono">{k.id.slice(0, 8)}…</td>
                  <td className="px-2 py-2">{k.name ?? "—"}</td>
                  <td className="px-2 py-2">{k.status}</td>
                  <td className="px-2 py-2">{k.scopes?.join(", ")}</td>
                  <td className="px-2 py-2">
                    {k.status === "active" ? (
                      <form action={revokeAction}>
                        <input type="hidden" name="tenantId" value={tenantId} />
                        <input type="hidden" name="keyId" value={k.id} />
                        <button
                          type="submit"
                          disabled={revokePending}
                          className="text-danger-foreground hover:underline disabled:opacity-50"
                        >
                          Revocar
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Msg state={revokeState} />

        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase text-fg-muted">Nueva clave</h3>
        <form action={createAction} className="max-w-md space-y-2">
          <input type="hidden" name="tenantId" value={tenantId} />
          <label className="block text-sm">
            <span className="text-fg-muted">Nombre (opcional)</span>
            <input
              name="keyName"
              type="text"
              placeholder="admin-panel"
              className="mt-1 w-full rounded border border-outline px-2 py-1 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={createPending}
            className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {createPending ? "Creando…" : "Crear clave (scopes estándar app)"}
          </button>
        </form>
        <Msg state={createState} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-fg">Certificado PKCS#12</h2>
        <p className="mb-3 text-xs text-fg-subtle">
          Subida cifrada en simplefactu. No guardes la contraseña en el repositorio. Eliminar hace fallback al
          certificado global del servidor si existe.
        </p>
        <form action={uploadAction} className="max-w-md space-y-2">
          <input type="hidden" name="tenantId" value={tenantId} />
          <label className="block text-sm">
            <span className="text-fg-muted">Archivo .pfx / .p12</span>
            <input
              name="pfx"
              type="file"
              accept=".pfx,.p12,application/x-pkcs12"
              required
              className="mt-1 block w-full text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-fg-muted">Contraseña</span>
            <input
              name="pfxPassphrase"
              type="password"
              required
              autoComplete="off"
              className="mt-1 w-full rounded border border-outline px-2 py-1 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={uploadPending}
            className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {uploadPending ? "Subiendo…" : "Subir certificado"}
          </button>
        </form>
        <Msg state={uploadState} />

        {hasCertificate ? (
          <>
            <h3 className="mb-2 mt-4 text-xs font-semibold uppercase text-danger-foreground">Zona peligrosa</h3>
            <form action={deleteAction} className="max-w-md space-y-2 rounded border border-danger-outline bg-danger p-3">
              <input type="hidden" name="tenantId" value={tenantId} />
              <label className="block text-sm">
                <span className="text-fg">Escribe DELETE para confirmar borrado del certificado en DB</span>
                <input
                  name="confirm"
                  type="text"
                  required
                  placeholder="DELETE"
                  className="mt-1 w-full rounded border border-outline px-2 py-1 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={deletePending}
                className="rounded border border-danger-border bg-surface px-3 py-2 text-sm text-danger-foreground hover:bg-danger-hover disabled:opacity-50"
              >
                {deletePending ? "…" : "Eliminar certificado del tenant"}
              </button>
            </form>
            <Msg state={deleteState} />
          </>
        ) : null}
      </section>
    </div>
  );
}
