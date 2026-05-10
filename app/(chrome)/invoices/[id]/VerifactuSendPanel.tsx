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
import { APP_DISPLAY_NAME } from "@/lib/branding";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import { IssueCorrectionButton } from "./IssueCorrectionButton";

type Props = {
  invoiceId: string;
  invoiceNumber: string;
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
  invoiceNumber,
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
  const [polling, setPolling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
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
  const pollActive = sendPending || cancelPending;
  const canSend = canSendNow;
  const canRefresh = pollActive;

  // Auto-poll every 3 s while a job is PENDING. Stops when terminal or after
  // 60 attempts (~3 min), at which point the manual button remains as fallback.
  useEffect(() => {
    if (!pollActive) {
      setPolling(false);
      return;
    }
    setPolling(true);
    let attempts = 0;
    let stopped = false;
    const id = setInterval(async () => {
      if (stopped) return;
      attempts++;
      try {
        const r = await refreshVerifactuJobAction(invoiceId);
        if (stopped) return;
        if (r.terminal || attempts >= 60) {
          stopped = true;
          clearInterval(id);
          setPolling(false);
        }
      } catch (e) {
        stopped = true;
        clearInterval(id);
        setPolling(false);
        setMessage(formatVerifactuActionError(e));
      }
      router.refresh();
    }, 3000);
    return () => {
      stopped = true;
      clearInterval(id);
      setPolling(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollActive, invoiceId]);

  useEffect(() => {
    if (!cancelModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) setCancelModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelModalOpen, pending]);

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
      try {
        const r = await action(id);
        setMessage(r.message);
      } catch (e) {
        setMessage(formatVerifactuActionError(e));
      }
      router.refresh();
    });
  }

  function confirmCancelVerifactu() {
    setMessage(null);
    startTransition(async () => {
      try {
        const r = await cancelInvoiceVerifactuAction(invoiceId);
        setMessage(r.message);
      } catch (e) {
        setMessage(formatVerifactuActionError(e));
      }
      setCancelModalOpen(false);
      router.refresh();
    });
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
        {aeatStatus === "DEAD" ? (
          <div className="mt-2">
            <IssueCorrectionButton invoiceId={invoiceId} originalNumSerie={invoiceNumber} />
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
      {polling ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-700">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          Actualizando automáticamente…
        </p>
      ) : canRefresh ? (
        <p className="mt-2 text-sm text-amber-800">
          Trabajo en curso. Usa «Actualizar estado» para refrescar.
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
            onClick={() => setCancelModalOpen(true)}
            disabled={pending}
            className="btn btn-sm btn-danger"
          >
            Anular en Verifactu
          </button>
        ) : null}
      </div>

      {cancelModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setCancelModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verifactu-cancel-title"
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 id="verifactu-cancel-title" className="text-base font-semibold text-gray-900">
                ¿Anular esta factura en Verifactu?
              </h3>
              <button
                type="button"
                disabled={pending}
                onClick={() => setCancelModalOpen(false)}
                className="shrink-0 text-gray-400 hover:text-gray-700 disabled:opacity-40"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-700">
              Se enviará un registro de <strong>anulación</strong> a la Agencia Tributaria para la factura{" "}
              <span className="font-mono">{invoiceNumber}</span>. Esta acción no se puede deshacer desde{" "}
              {APP_DISPLAY_NAME}.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setCancelModalOpen(false)}
                className="btn btn-sm btn-secondary"
              >
                No, mantener
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirmCancelVerifactu}
                className="btn btn-sm btn-danger"
              >
                {pending ? "Enviando…" : "Sí, anular en Veri*Factu"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
