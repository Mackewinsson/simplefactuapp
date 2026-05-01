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
      className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
    >
      {pending ? "…" : label}
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
      <section className="rounded border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900">Issuer (Obligado emisión)</h2>
        <p className="mt-1 text-sm text-gray-600">
          Must match your certificate and AEAT registration. Used for every invoice sent to Verifactu.
        </p>
        {issuerState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-red-700">
            {issuerState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {issuerState?.ok ? (
          <p className="mt-3 text-sm text-green-700">{issuerState.message}</p>
        ) : null}
        <form action={issuerAction} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Issuer NIF / CIF</span>
            <input
              name="issuerNif"
              defaultValue={initialIssuerNif}
              className="w-full max-w-md rounded border border-gray-300 px-3 py-2"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Legal name</span>
            <input
              name="issuerLegalName"
              defaultValue={initialIssuerLegalName}
              className="w-full max-w-md rounded border border-gray-300 px-3 py-2"
              autoComplete="organization"
            />
          </label>
          <SubmitButton label="Save issuer" />
        </form>
      </section>

      <section className="rounded border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900">AEAT certificate (.pfx / .p12)</h2>
        <p className="mt-1 text-sm text-gray-600">
          Uploaded only through this server form — never from the browser directly to the API.
        </p>
        <dl className="mt-3 grid gap-1 text-sm text-gray-700">
          <div>
            <span className="font-medium">Last upload (app):</span>{" "}
            {certUploadedAt ? certUploadedAt.toLocaleString() : "—"}
          </div>
          <div>
            <span className="font-medium">API reports certificate:</span>{" "}
            {remoteHasCertificate === null
              ? "Could not load"
              : remoteHasCertificate
                ? "Yes"
                : "No"}
            {remoteUpdatedAt ? ` (updated ${remoteUpdatedAt})` : ""}
          </div>
        </dl>
        {certState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-red-700">
            {certState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {certState?.ok ? (
          <p className="mt-3 text-sm text-green-700">{certState.message}</p>
        ) : null}
        <form action={certAction} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">PFX file</span>
            <input
              name="pfxFile"
              type="file"
              accept=".pfx,.p12,application/x-pkcs12"
              className="block w-full max-w-md text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">PFX passphrase</span>
            <input
              name="pfxPassphrase"
              type="password"
              className="w-full max-w-md rounded border border-gray-300 px-3 py-2"
              autoComplete="new-password"
            />
          </label>
          <SubmitButton label="Upload certificate" />
        </form>
      </section>

      <section className="rounded border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900">Verify NIF (AEAT VNIF)</h2>
        <p className="mt-1 text-sm text-gray-600">
          Optional check against AEAT. Requires API key scope <code className="text-xs">nif:read</code>{" "}
          (new provisions include it; older accounts may need to clear Verifactu account data and
          reprovision).
        </p>
        {vnifState?.ok === false ? (
          <ul className="mt-3 list-inside list-disc text-sm text-red-700">
            {vnifState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {vnifState?.ok ? (
          <p className="mt-3 text-sm text-green-700">{vnifState.message}</p>
        ) : null}
        <form action={vnifAction} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">NIF / CIF</span>
            <input
              name="verifyNif"
              className="w-full max-w-md rounded border border-gray-300 px-3 py-2"
              placeholder="e.g. B12345678"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Name (must match AEAT)</span>
            <input
              name="verifyNombre"
              className="w-full max-w-md rounded border border-gray-300 px-3 py-2"
              placeholder="Company or full name"
            />
          </label>
          <SubmitButton label="Verify with AEAT" />
        </form>
      </section>
    </div>
  );
}
