"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/app/components/SubmitButton";
import {
  saveIssuerProfileAction,
  uploadCertificateAction,
  deleteCertificateAction,
  verifyNifAction,
  type VerifactuSettingsState,
} from "./actions";

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
    <div className="space-y-8 max-w-4xl">
      <section className="panel-premium rounded-2xl p-6 md:p-8 animate-fade-in-up">
        <h2 className="text-xl font-bold text-fg font-display tracking-tight">Emisor (obligado emisión)</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Debe coincidir con tu certificado y el alta en AEAT. Se usa en cada factura enviada a Verifactu.
        </p>
        {issuerState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-danger-foreground font-medium bg-danger/50 p-3 rounded-lg border border-danger-outline/50">
            {issuerState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {issuerState?.ok ? (
          <p className="mt-3 text-sm text-success-foreground font-semibold bg-success/80 p-3 rounded-lg border border-success-outline/50">{issuerState.message}</p>
        ) : null}
        {certNif &&
        initialIssuerNif.trim().toUpperCase() !== certNif.trim().toUpperCase() ? (
          <form action={issuerAction} className="alert-warning mt-4 p-4 rounded-xl shadow-sm font-display flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-warning-foreground">NIF Incorrecto Detectado</p>
              <p className="text-xs mt-1 text-warning-deep">
                El certificado pertenece al NIF <strong>{certNif}</strong>, distinto del emisor configurado (
                {initialIssuerNif || "vacío"}).
              </p>
            </div>
            <input type="hidden" name="issuerNif" value={certNif} />
            <input type="hidden" name="issuerLegalName" value={initialIssuerLegalName} />
            <button
              type="submit"
              className="rounded-lg bg-warning-deeper text-white px-3 py-2 text-xs font-bold shadow-md hover:opacity-90 transition-all shrink-0"
            >
              Usar NIF del certificado ({certNif})
            </button>
          </form>
        ) : null}
        <form action={issuerAction} className="mt-6 space-y-5">
          <label className="block max-w-md">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-subtle font-display">NIF / CIF del emisor</span>
            <input
              name="issuerNif"
              defaultValue={initialIssuerNif}
              className="input rounded-lg border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-1 focus:ring-accent-outline transition-all"
              autoComplete="off"
            />
          </label>
          <label className="block max-w-md">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-subtle font-display">Razón social o nombre completo</span>
            <input
              name="issuerLegalName"
              defaultValue={initialIssuerLegalName}
              className="input rounded-lg border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-1 focus:ring-accent-outline transition-all"
              autoComplete="organization"
            />
          </label>
          <div className="pt-2 font-display">
            <SubmitButton label="Guardar emisor" />
          </div>
        </form>
      </section>

      <section className="panel-premium rounded-2xl p-6 md:p-8 animate-fade-in-up delay-100">
        <h2 className="text-xl font-bold text-fg font-display tracking-tight">Certificado AEAT (.pfx / .p12)</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Solo se sube desde este formulario en servidor — nunca envíes el PFX directamente desde el
          navegador al API.
        </p>

        {/* Dynamic micro cards for certificate details */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-xl border border-outline-soft/70 bg-surface-muted/30 p-3.5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle font-display">Última subida (app)</p>
            <p className="mt-1.5 text-sm font-semibold text-fg">
              {certUploadedAt ? certUploadedAt.toLocaleString("es") : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-outline-soft/70 bg-surface-muted/30 p-3.5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle font-display">API indica certificado</p>
            <p className="mt-1.5 text-sm font-semibold text-fg">
              {remoteHasCertificate === null
                ? "No se pudo consultar"
                : remoteHasCertificate
                  ? "Sí"
                  : "No"}
              {remoteUpdatedAt ? ` (${remoteUpdatedAt})` : ""}
            </p>
          </div>
          {remoteHasCertificate && certNotAfter ? (
            <div className="rounded-xl border border-outline-soft/70 bg-surface-muted/30 p-3.5 shadow-sm sm:col-span-2 md:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle font-display">Caducidad y titular</p>
              <p className="mt-1.5 text-sm font-semibold text-fg">
                {new Date(certNotAfter).toLocaleDateString("es")}
                {certDaysUntilExpiry != null
                  ? ` (${certDaysUntilExpiry} días)`
                  : ""}
              </p>
              {certNif ? <p className="text-[11px] mt-0.5 text-fg-muted font-mono">{certNif}</p> : null}
            </div>
          ) : null}
        </div>

        {certExpiresWithin30Days && certNotAfter ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-warning-outline bg-warning p-4 text-sm text-warning-foreground font-display shadow-sm animate-pulse"
          >
            <p className="font-bold">El certificado caduca en menos de 30 días</p>
            <p className="mt-1 text-xs text-warning-deep">
              Renueva el PFX antes del{" "}
              {new Date(certNotAfter).toLocaleDateString("es")} para seguir enviando facturas a AEAT.
            </p>
          </div>
        ) : null}
        {deleteState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-danger-foreground font-medium bg-danger/50 p-3 rounded-lg border border-danger-outline/50">
            {deleteState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {deleteState?.ok ? (
          <p className="mt-3 text-sm text-success-foreground font-semibold bg-success/80 p-3 rounded-lg border border-success-outline/50">{deleteState.message}</p>
        ) : null}
        {certState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-danger-foreground font-medium bg-danger/50 p-3 rounded-lg border border-danger-outline/50">
            {certState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {certState?.ok ? (
          <div className="mt-4 text-sm text-success-foreground font-semibold bg-success/80 p-3 rounded-lg border border-success-outline/50 font-display">
            <p>{certState.message}</p>
            <Link
              href="/invoices/new"
              className="mt-2 inline-block font-bold text-accent underline hover:no-underline"
            >
              Crear tu primera factura →
            </Link>
          </div>
        ) : null}

        <form action={certAction} className="mt-6 space-y-5">
          <label className="block group cursor-pointer max-w-md">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-subtle font-display">Archivo PFX / P12</span>
            <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-soft bg-surface-muted/30 p-8 text-center transition-all duration-300 group-hover:border-accent/40 group-hover:bg-surface shadow-inner">
              <div className="mb-3 rounded-full bg-accent-muted p-3 text-accent group-hover:scale-105 transition-transform duration-300">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-fg font-display">Arrastra tu certificado digital (.pfx / .p12)</p>
              <p className="mt-1 text-xs text-fg-subtle">o haz clic para explorar en tu equipo</p>
              <input
                name="pfxFile"
                type="file"
                accept=".pfx,.p12,application/x-pkcs12"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </label>
          <label className="block max-w-md">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-subtle font-display">Contraseña del PFX</span>
            <input
              name="pfxPassphrase"
              type="password"
              className="input rounded-lg border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-1 focus:ring-accent-outline transition-all"
              autoComplete="new-password"
            />
          </label>
          <div className="pt-2 font-display">
            <SubmitButton label="Subir certificado" />
          </div>
        </form>
        {remoteHasCertificate ? (
          <form action={deleteAction} className="mt-8 border-t border-outline-soft/65 pt-5">
            <p className="text-sm text-fg-muted">
              Elimina el certificado del tenant en el API. No podrás enviar facturas hasta subir uno nuevo.
            </p>
            <button
              type="submit"
              className="btn btn-md btn-danger rounded-lg font-semibold font-display shadow-sm hover:opacity-90 transition-all mt-4"
            >
              Eliminar certificado
            </button>
          </form>
        ) : null}
      </section>

      <section className="panel-premium rounded-2xl p-6 md:p-8 animate-fade-in-up delay-200">
        <h2 className="text-xl font-bold text-fg font-display tracking-tight">Comprobar nombre con Hacienda</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Comprueba si el nombre o la razón social coinciden con el que tiene registrado Hacienda para un
          NIF o CIF español. Es opcional. Si falla la consulta, revisa también en Ajustes que la integración
          Verifactu esté bien conectada.
        </p>
        {vnifState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-danger-foreground font-medium bg-danger/50 p-3 rounded-lg border border-danger-outline/50">
            {vnifState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {vnifState?.ok ? (
          <p className="mt-3 text-sm text-success-foreground font-semibold bg-success/80 p-3 rounded-lg border border-success-outline/50">{vnifState.message}</p>
        ) : null}
        <form action={vnifAction} className="mt-6 space-y-5">
          <label className="block max-w-md">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-subtle font-display">NIF / CIF</span>
            <input
              name="verifyNif"
              className="input rounded-lg border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-1 focus:ring-accent-outline transition-all"
              placeholder="p. ej. B12345678"
            />
          </label>
          <label className="block max-w-md">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-subtle font-display">
              Nombre o razón social (como en la documentación)
            </span>
            <input
              name="verifyNombre"
              className="input rounded-lg border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-1 focus:ring-accent-outline transition-all"
              placeholder="Razón social o nombre completo"
            />
          </label>
          <div className="pt-2 font-display">
            <SubmitButton label="Comprobar con Hacienda" />
          </div>
        </form>
      </section>
    </div>
  );
}
