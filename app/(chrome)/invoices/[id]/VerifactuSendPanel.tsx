"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, useRef } from "react";
import {
  sendInvoiceToVerifactuAction,
  refreshVerifactuJobAction,
  resyncVerifactuQrAction,
  cancelInvoiceVerifactuAction,
} from "./verifactu-actions";
import { humanizeAeatError } from "@/lib/simplefactu/aeat-error-messages";
import {
  registrationStatusDetailLabel,
  cancellationStatusDetailLabel,
  registrationStatusBadgeClass,
  cancellationStatusBadgeClass,
  resolveRegistrationUiStatus,
} from "@/lib/simplefactu/aeat-status-ui";
import { APP_DISPLAY_NAME } from "@/lib/branding";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import { IssueCorrectionButton } from "./IssueCorrectionButton";

type Props = {
  invoiceId: string;
  invoiceNumber: string;
  pdfHref: string;
  aeatStatus: string;
  aeatEstadoEnvio?: string | null;
  aeatLastError: string | null;
  aeatCsv: string | null;
  aeatJobId: string | null;
  aeatQrText: string | null;
  aeatQrDataUrl: string | null;
  aeatCancellationStatus: string;
  aeatCancellationLastError: string | null;
  autoSend?: boolean;
};

export function VerifactuSendPanel({
  invoiceId,
  invoiceNumber,
  pdfHref,
  aeatStatus,
  aeatEstadoEnvio,
  aeatLastError,
  aeatCsv,
  aeatJobId,
  aeatQrText,
  aeatQrDataUrl,
  aeatCancellationStatus,
  aeatCancellationLastError,
  autoSend,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "ok" | "err" } | null>(null);
  const [polling, setPolling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const autoSendFired = useRef(false);

  const sendConfirmRef = useRef<HTMLDivElement>(null);
  const cancelConfirmRef = useRef<HTMLDivElement>(null);

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
  const isRetry = aeatStatus === "FAILED";
  const uiStatus = resolveRegistrationUiStatus(aeatStatus, aeatEstadoEnvio);
  const canRefresh = pollActive;
  const canResyncQr =
    aeatStatus === "SUCCEEDED" && !!aeatJobId && !!(aeatCsv?.trim() || aeatQrText?.trim());

  // Copy CSV function
  function copyCsv() {
    if (!aeatCsv) return;
    navigator.clipboard.writeText(aeatCsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
        setMessage({ text: formatVerifactuActionError(e), type: "err" });
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

  // Focus trap and Escape key for Send Confirm Modal
  const sendConfirmTriggerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (sendConfirmOpen) {
      sendConfirmTriggerRef.current = document.activeElement as HTMLElement;
    } else {
      sendConfirmTriggerRef.current?.focus();
      sendConfirmTriggerRef.current = null;
    }
  }, [sendConfirmOpen]);

  useEffect(() => {
    if (!sendConfirmOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) setSendConfirmOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sendConfirmOpen, pending]);

  useEffect(() => {
    if (!sendConfirmOpen) return;
    const container = sendConfirmRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [sendConfirmOpen]);

  // Focus trap and Escape key for Cancel Modal
  const cancelTriggerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (cancelModalOpen) {
      cancelTriggerRef.current = document.activeElement as HTMLElement;
    } else {
      cancelTriggerRef.current?.focus();
      cancelTriggerRef.current = null;
    }
  }, [cancelModalOpen]);

  useEffect(() => {
    if (!cancelModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) setCancelModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelModalOpen, pending]);

  useEffect(() => {
    if (!cancelModalOpen) return;
    const container = cancelConfirmRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [cancelModalOpen]);

  const canCancelAeat =
    aeatStatus === "SUCCEEDED" &&
    aeatCancellationStatus !== "SUCCEEDED" &&
    aeatCancellationStatus !== "PENDING";

  const isRegistered = aeatStatus === "SUCCEEDED" && !!(aeatCsv?.trim());
  const partialSuccess = aeatEstadoEnvio === "ParcialmenteCorrecto";

  function run(
    action: (id: string) => Promise<{ ok: boolean; message: string }>,
    id: string
  ) {
    setMessage(null);
    startTransition(async () => {
      try {
        const r = await action(id);
        setMessage({ text: r.message, type: r.ok ? "ok" : "err" });
      } catch (e) {
        setMessage({ text: formatVerifactuActionError(e), type: "err" });
      }
      router.refresh();
    });
  }

  function confirmCancelVerifactu() {
    setMessage(null);
    startTransition(async () => {
      try {
        const r = await cancelInvoiceVerifactuAction(invoiceId);
        setMessage({ text: r.message, type: r.ok ? "ok" : "err" });
      } catch (e) {
        setMessage({ text: formatVerifactuActionError(e), type: "err" });
      }
      setCancelModalOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="rounded border border-outline-soft bg-surface p-4">
      <h2 className="text-sm font-semibold text-fg">Verifactu (AEAT)</h2>

      {isRegistered ? (
        <div
          className={
            partialSuccess
              ? "alert-warning mt-3"
              : "mt-3 rounded-lg border border-success-outline bg-success p-4 text-success-foreground"
          }
        >
          <p className="text-base font-semibold text-fg">
            {partialSuccess
              ? "Factura aceptada con advertencias AEAT"
              : "Factura registrada en AEAT"}
          </p>
          <p className={`mt-1 text-sm ${partialSuccess ? "text-warning-deep" : "text-success-emphasis"}`}>
            La factura <span className="font-mono">{invoiceNumber}</span> está en Verifactu.
            Guarda el CSV y descarga el PDF con el QR de verificación.
          </p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="font-medium text-fg">Código seguro de verificación (CSV)</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <code className="rounded bg-surface px-2 py-1 font-mono text-sm text-fg">
                  {aeatCsv}
                </code>
                <button
                  type="button"
                  onClick={copyCsv}
                  className="btn btn-sm btn-secondary"
                  aria-label="Copiar CSV al portapapeles"
                >
                  {copied ? "✓ Copiado" : "Copiar"}
                </button>
                {aeatQrText ? (
                  <a
                    href={aeatQrText}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fg-link underline hover:text-fg"
                  >
                    Comprobar en AEAT ↗
                  </a>
                ) : null}
              </dd>
            </div>
          </dl>
          {aeatQrDataUrl ? (
            <div className="mt-4 flex flex-wrap items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={aeatQrDataUrl}
                alt="QR de verificación AEAT (Veri*Factu)"
                className="h-28 w-28 rounded border border-outline-soft bg-surface p-1"
                width={112}
                height={112}
              />
              <p className="max-w-xs text-xs text-fg-muted">
                Incluye este QR en el PDF que entregues al cliente. La leyenda{" "}
                <span className="font-mono font-semibold text-fg">VERI*FACTU</span> identifica el
                registro ante Hacienda.
              </p>
            </div>
          ) : null}
          <div className="mt-4">
            <a href={pdfHref} download className="btn btn-sm btn-cta">
              Descargar PDF
            </a>
          </div>
        </div>
      ) : null}

      <dl className="mt-3 grid gap-2 text-sm text-fg-muted">
        {!isRegistered ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Estado del alta:</span>
            <span className={registrationStatusBadgeClass(aeatStatus, aeatEstadoEnvio)}>
              {registrationStatusDetailLabel(uiStatus)}
            </span>
          </div>
        ) : null}
        {aeatLastError ? (
          <div className="text-danger-foreground">
            <span className="font-medium">Error de alta:</span>{" "}
            {humanizeAeatError(aeatLastError)}
          </div>
        ) : null}
        {aeatStatus === "DEAD" ? (
          <div>
            <IssueCorrectionButton invoiceId={invoiceId} originalNumSerie={invoiceNumber} />
          </div>
        ) : null}
        {(isRegistered || aeatCancellationStatus !== "NOT_SENT") && (
          <div
            className={`flex flex-wrap items-center gap-2${isRegistered ? " border-t border-outline-soft pt-3" : ""}`}
          >
            <span className="font-medium">Estado de la anulación:</span>
            <span className={cancellationStatusBadgeClass(aeatCancellationStatus)}>
              {cancellationStatusDetailLabel(aeatCancellationStatus)}
            </span>
          </div>
        )}
        {aeatCancellationLastError ? (
          <div className="text-danger-foreground">
            <span className="font-medium">Error de anulación:</span>{" "}
            {humanizeAeatError(aeatCancellationLastError)}
          </div>
        ) : null}
      </dl>
      {message ? (
        <p
          className={`mt-2 text-sm ${message.type === "ok" ? "text-success-foreground" : "text-danger-foreground"}`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}
      {polling ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-warning-muted">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-warning-pulse" />
          Actualizando automáticamente…
        </p>
      ) : canRefresh ? (
        <p className="mt-2 text-sm text-warning-deep">
          Trabajo en curso. Usa «Actualizar estado» para refrescar.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {canSend ? (
          <button
            type="button"
            onClick={() => setSendConfirmOpen(true)}
            disabled={pending}
            className="btn btn-sm btn-cta"
          >
            {pending
              ? "Procesando…"
              : isRetry
                ? "Reintentar envío a Verifactu"
                : "Enviar a Verifactu"}
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
        {canResyncQr ? (
          <button
            type="button"
            onClick={() => run(resyncVerifactuQrAction, invoiceId)}
            disabled={pending}
            className="btn btn-sm btn-secondary"
            title="Vuelve a leer la URL de verificación desde la API (entorno AEAT actual)"
          >
            {pending ? "…" : "Actualizar enlace QR"}
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

      {sendConfirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setSendConfirmOpen(false);
          }}
        >
          <div
            ref={sendConfirmRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verifactu-send-title"
            className="w-full max-w-md rounded-lg border border-outline-soft bg-surface p-5 shadow-xl"
          >
            <h3 id="verifactu-send-title" className="text-base font-semibold text-fg">
              {isRetry ? "¿Reintentar el envío a Verifactu?" : "¿Enviar a Verifactu?"}
            </h3>
            <p className="mt-2 text-sm text-fg-muted">
              La factura <span className="font-mono">{invoiceNumber}</span> quedará registrada ante AEAT.
              <strong> No podrás editarla después</strong> — las correcciones requieren facturas rectificativas
              (R1–R5).
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setSendConfirmOpen(false)}
                className="btn btn-sm btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setSendConfirmOpen(false);
                  run(sendInvoiceToVerifactuAction, invoiceId);
                }}
                className="btn btn-sm btn-cta"
              >
                {pending ? "Enviando…" : isRetry ? "Sí, reintentar" : "Sí, enviar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {cancelModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setCancelModalOpen(false);
          }}
        >
          <div
            ref={cancelConfirmRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verifactu-cancel-title"
            className="w-full max-w-md rounded-lg border border-outline-soft bg-surface p-5 shadow-xl"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 id="verifactu-cancel-title" className="text-base font-semibold text-fg">
                ¿Anular esta factura en Verifactu?
              </h3>
              <button
                type="button"
                disabled={pending}
                onClick={() => setCancelModalOpen(false)}
                className="shrink-0 text-fg-subtle hover:text-fg-muted disabled:opacity-40"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-fg-muted">
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
