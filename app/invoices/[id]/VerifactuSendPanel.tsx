"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, useRef } from "react";
import {
  sendInvoiceToVerifactuAction,
  refreshVerifactuJobAction,
  cancelInvoiceVerifactuAction,
} from "./verifactu-actions";
import { humanizeAeatError } from "@/lib/simplefactu/aeat-error-messages";
import {
  registrationStatusDetailLabel,
  cancellationStatusDetailLabel,
  registrationStatusBadgeClass,
  cancellationStatusBadgeClass,
} from "@/lib/simplefactu/aeat-status-ui";

type Props = {
  invoiceId: string;
  aeatStatus: string;
  aeatJobId: string | null;
  aeatLastError: string | null;
  aeatCsv: string | null;
  aeatQrText: string | null;
  aeatQrDataUrl: string | null;
  aeatCancellationStatus: string;
  aeatCancellationJobId: string | null;
  aeatCancellationLastError: string | null;
  autoSend?: boolean;
};

export function VerifactuSendPanel({
  invoiceId,
  aeatStatus,
  aeatJobId,
  aeatLastError,
  aeatCsv,
  aeatQrText,
  aeatQrDataUrl,
  aeatCancellationStatus,
  aeatCancellationJobId,
  aeatCancellationLastError,
  autoSend,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const autoSendFired = useRef(false);

  const canSendNow = aeatStatus !== "SUCCEEDED" && aeatStatus !== "PENDING";

  // Auto-trigger send when ?send=1 is present and invoice hasn't been sent yet
  useEffect(() => {
    if (autoSend && canSendNow && !autoSendFired.current) {
      autoSendFired.current = true;
      run(sendInvoiceToVerifactuAction, invoiceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendPending = aeatStatus === "PENDING";
  const cancelPending = aeatCancellationStatus === "PENDING";
  const canSend = canSendNow;
  const canRefresh = sendPending || cancelPending;
  const canCancelAeat =
    aeatStatus === "SUCCEEDED" &&
    aeatCancellationStatus !== "SUCCEEDED" &&
    aeatCancellationStatus !== "PENDING";

  function run(
    action: (id: string) => Promise<{ ok: boolean; message: string }>,
    id: string
  ) {
    setMessage(null);
    startTransition(async () => {
      const r = await action(id);
      setMessage(r.message);
      router.refresh();
    });
  }

  function onCancelClick() {
    if (
      !window.confirm(
        "¿Anular esta factura en Verifactu (AEAT)? Se enviará un registro de anulación a la Agencia Tributaria."
      )
    ) {
      return;
    }
    run(cancelInvoiceVerifactuAction, invoiceId);
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900">Verifactu (AEAT)</h2>
      <dl className="mt-2 grid gap-1 text-sm text-gray-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Estado del alta:</span>
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${registrationStatusBadgeClass(aeatStatus)}`}
          >
            {registrationStatusDetailLabel(aeatStatus)}
          </span>
        </div>
        {aeatJobId ? (
          <div>
            <span className="font-medium">Trabajo (job) de alta:</span>{" "}
            <code className="text-xs">{aeatJobId}</code>
          </div>
        ) : null}
        {aeatCsv ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">CSV:</span>
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              {aeatCsv}
            </code>
            {aeatQrText ? (
              <a
                href={aeatQrText}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-fg-link hover:underline"
              >
                Comprobar en AEAT ↗
              </a>
            ) : null}
          </div>
        ) : null}
        {aeatQrDataUrl ? (
          <div className="mt-3 flex flex-wrap items-start gap-3">
            {/* QR is mandated by RD 1007/2023 art. 25. The leyenda VERI*FACTU
                next to it is the consumer-facing trust mark required when
                the issuer operates under Veri*Factu rules.
                next/image would offer no optimization here: the source is an
                inline data: URL already produced server-side. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={aeatQrDataUrl}
              alt="QR de verificación AEAT (Veri*Factu)"
              className="h-32 w-32 rounded border border-gray-200 bg-white p-1"
              width={128}
              height={128}
            />
            <div className="text-xs text-gray-700">
              <p className="font-semibold">Factura verificable en sede AEAT</p>
              <p className="font-mono tracking-wide text-gray-900">VERI*FACTU</p>
              <p className="mt-1 text-gray-500">
                Escanea o haz clic en «Comprobar en AEAT» para validar este
                registro en la sede electrónica de la Agencia Tributaria.
              </p>
            </div>
          </div>
        ) : null}
        {aeatLastError ? (
          <div className="text-red-700">
            <span className="font-medium">Error de alta:</span>{" "}
            {humanizeAeatError(aeatLastError)}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Estado de la anulación:</span>
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${cancellationStatusBadgeClass(aeatCancellationStatus)}`}
          >
            {cancellationStatusDetailLabel(aeatCancellationStatus)}
          </span>
        </div>
        {aeatCancellationJobId ? (
          <div>
            <span className="font-medium">Trabajo (job) de anulación:</span>{" "}
            <code className="text-xs">{aeatCancellationJobId}</code>
          </div>
        ) : null}
        {aeatCancellationLastError ? (
          <div className="text-red-700">
            <span className="font-medium">Error de anulación:</span>{" "}
            {humanizeAeatError(aeatCancellationLastError)}
          </div>
        ) : null}
      </dl>
      {message ? (
        <p className="mt-2 text-sm text-gray-800" role="status">
          {message}
        </p>
      ) : null}
      {canRefresh ? (
        <p className="mt-2 text-sm text-amber-800">
          Trabajo en curso. Usa «Actualizar estado» para refrescar sin salir de la página.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {canSend ? (
          <button
            type="button"
            onClick={() => run(sendInvoiceToVerifactuAction, invoiceId)}
            disabled={pending}
            className="btn btn-sm btn-cta"
          >
            {pending ? "Procesando…" : "Enviar a Verifactu"}
          </button>
        ) : null}
        {canRefresh ? (
          <button
            type="button"
            onClick={() => run(refreshVerifactuJobAction, invoiceId)}
            disabled={pending}
            className="btn btn-sm btn-secondary"
          >
            {pending ? "…" : "Actualizar estado"}
          </button>
        ) : null}
        {canCancelAeat ? (
          <button
            type="button"
            onClick={onCancelClick}
            disabled={pending}
            className="btn btn-sm btn-danger"
          >
            {pending ? "…" : "Anular en Verifactu"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
