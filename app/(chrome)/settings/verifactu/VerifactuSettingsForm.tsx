"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveIssuerProfileAction,
  uploadCertificateAction,
  verifyNifAction,
  type VerifactuSettingsState,
} from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

type Props = {
  initialIssuerNif: string;
  initialIssuerLegalName: string;
  certUploadedAt: Date | null;
  remoteHasCertificate: boolean | null;
  remoteUpdatedAt: string | null;
};

export function VerifactuSettingsForm({
  initialIssuerNif,
  initialIssuerLegalName,
  certUploadedAt,
  remoteHasCertificate,
  remoteUpdatedAt,
}: Props) {
  const [issuerState, issuerAction] = useActionState(saveIssuerProfileAction, null);
  const [certState, certAction] = useActionState(uploadCertificateAction, null);
  const [vnifState, vnifAction] = useActionState(verifyNifAction, null);

  return (
    <div className="space-y-10">
      <section className="rounded border border-outline-soft bg-surface p-6">
        <h2 className="text-lg font-medium text-fg">Emisor (obligado emisión)</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Debe coincidir con tu certificado y el alta en AEAT. Se usa en cada factura enviada a Verifactu.
        </p>
        {issuerState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-danger-foreground">
            {issuerState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {issuerState?.ok ? (
          <p className="mt-3 text-sm text-success-emphasis">{issuerState.message}</p>
        ) : null}
        <form action={issuerAction} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-muted">NIF / CIF del emisor</span>
            <input
              name="issuerNif"
              defaultValue={initialIssuerNif}
              className="w-full max-w-md rounded border border-outline px-3 py-2"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-muted">Razón social o nombre completo</span>
            <input
              name="issuerLegalName"
              defaultValue={initialIssuerLegalName}
              className="w-full max-w-md rounded border border-outline px-3 py-2"
              autoComplete="organization"
            />
          </label>
          <SubmitButton label="Guardar emisor" />
        </form>
      </section>

      <section className="rounded border border-outline-soft bg-surface p-6">
        <h2 className="text-lg font-medium text-fg">Certificado AEAT (.pfx / .p12)</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Solo se sube desde este formulario en servidor — nunca envíes el PFX directamente desde el
          navegador al API.
        </p>
        <dl className="mt-3 grid gap-1 text-sm text-fg-muted">
          <div>
            <span className="font-medium">Última subida (app):</span>{" "}
            {certUploadedAt ? certUploadedAt.toLocaleString("es") : "—"}
          </div>
          <div>
            <span className="font-medium">El API indica certificado:</span>{" "}
            {remoteHasCertificate === null
              ? "No se pudo consultar"
              : remoteHasCertificate
                ? "Sí"
                : "No"}
            {remoteUpdatedAt ? ` (actualizado ${remoteUpdatedAt})` : ""}
          </div>
        </dl>
        {certState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-danger-foreground">
            {certState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {certState?.ok ? (
          <p className="mt-3 text-sm text-success-emphasis">{certState.message}</p>
        ) : null}
        <form action={certAction} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-muted">Archivo PFX</span>
            <input
              name="pfxFile"
              type="file"
              accept=".pfx,.p12,application/x-pkcs12"
              className="block w-full max-w-md text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-muted">Contraseña del PFX</span>
            <input
              name="pfxPassphrase"
              type="password"
              className="w-full max-w-md rounded border border-outline px-3 py-2"
              autoComplete="new-password"
            />
          </label>
          <SubmitButton label="Subir certificado" />
        </form>
      </section>

      <section className="rounded border border-outline-soft bg-surface p-6">
        <h2 className="text-lg font-medium text-fg">Comprobar nombre con Hacienda</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Comprueba si el nombre o la razón social coinciden con el que tiene registrado Hacienda para un
          NIF o CIF español. Es opcional. Si falla la consulta, revisa también en Ajustes que la integración
          Verifactu esté bien conectada.
        </p>
        {vnifState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-danger-foreground">
            {vnifState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {vnifState?.ok ? (
          <p className="mt-3 text-sm text-success-emphasis">{vnifState.message}</p>
        ) : null}
        <form action={vnifAction} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-muted">NIF / CIF</span>
            <input
              name="verifyNif"
              className="w-full max-w-md rounded border border-outline px-3 py-2"
              placeholder="p. ej. B12345678"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-muted">
              Nombre o razón social (como en la documentación)
            </span>
            <input
              name="verifyNombre"
              className="w-full max-w-md rounded border border-outline px-3 py-2"
              placeholder="Razón social o nombre completo"
            />
          </label>
          <SubmitButton label="Comprobar con Hacienda" />
        </form>
      </section>
    </div>
  );
}
