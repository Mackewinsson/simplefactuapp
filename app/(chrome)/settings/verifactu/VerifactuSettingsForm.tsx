"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveIssuerProfileAction,
  uploadCertificateAction,
  deleteCertificateAction,
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
  certNotAfter: string | null;
  certDaysUntilExpiry: number | null;
  certExpiresWithin30Days: boolean;
  certNif: string | null;
};

export function VerifactuSettingsForm({
  initialIssuerNif,
  initialIssuerLegalName,
  certUploadedAt,
  remoteHasCertificate,
  remoteUpdatedAt,
  certNotAfter,
  certDaysUntilExpiry,
  certExpiresWithin30Days,
  certNif,
}: Props) {
  const [issuerState, issuerAction] = useActionState(saveIssuerProfileAction, null);
  const [certState, certAction] = useActionState(uploadCertificateAction, null);
  const [deleteState, deleteAction] = useActionState(deleteCertificateAction, null);
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
        {certNif &&
        initialIssuerNif.trim().toUpperCase() !== certNif.trim().toUpperCase() ? (
          <form action={issuerAction} className="mt-4 rounded border border-warning-outline bg-warning-muted p-3">
            <p className="text-sm text-warning-foreground">
              El certificado pertenece al NIF <strong>{certNif}</strong>, distinto del emisor configurado (
              {initialIssuerNif || "vacío"}).
            </p>
            <input type="hidden" name="issuerNif" value={certNif} />
            <input type="hidden" name="issuerLegalName" value={initialIssuerLegalName} />
            <button
              type="submit"
              className="mt-3 rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Usar NIF del certificado ({certNif})
            </button>
          </form>
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
          {remoteHasCertificate && certNotAfter ? (
            <div>
              <span className="font-medium">Caducidad:</span>{" "}
              {new Date(certNotAfter).toLocaleDateString("es")}
              {certDaysUntilExpiry != null
                ? ` (${certDaysUntilExpiry} días restantes)`
                : ""}
              {certNif ? ` · NIF titular: ${certNif}` : ""}
            </div>
          ) : null}
        </dl>
        {certExpiresWithin30Days && certNotAfter ? (
          <div
            role="alert"
            className="mt-3 rounded border border-warning-outline bg-warning p-3 text-sm text-warning-foreground"
          >
            <p className="font-medium">El certificado caduca en menos de 30 días</p>
            <p className="mt-1">
              Renueva el PFX antes del{" "}
              {new Date(certNotAfter).toLocaleDateString("es")} para seguir enviando facturas a AEAT.
            </p>
          </div>
        ) : null}
        {deleteState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-danger-foreground">
            {deleteState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {deleteState?.ok ? (
          <p className="mt-3 text-sm text-success-emphasis">{deleteState.message}</p>
        ) : null}
        {certState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-danger-foreground">
            {certState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {certState?.ok ? (
          <div className="mt-3 text-sm text-success-emphasis">
            <p>{certState.message}</p>
            <Link
              href="/invoices/new"
              className="mt-2 inline-block font-medium text-fg-link underline hover:text-fg"
            >
              Crear tu primera factura →
            </Link>
          </div>
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
        {remoteHasCertificate ? (
          <form action={deleteAction} className="mt-6 border-t border-outline-soft pt-4">
            <p className="text-sm text-fg-muted">
              Elimina el certificado del tenant en el API. No podrás enviar facturas hasta subir uno nuevo.
            </p>
            <button
              type="submit"
              className="mt-3 rounded border border-danger-outline px-4 py-2 text-sm font-medium text-danger-foreground hover:bg-danger-muted"
            >
              Eliminar certificado
            </button>
          </form>
        ) : null}
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
