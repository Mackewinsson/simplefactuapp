"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  sendInvoiceToVerifactuAction,
  refreshVerifactuJobAction,
  cancelInvoiceVerifactuAction,
} from "./verifactu-actions";
import { humanizeAeatError } from "@/lib/simplefactu/aeat-error-messages";

type Props = {
  invoiceId: string;
  aeatStatus: string;
  aeatJobId: string | null;
  aeatLastError: string | null;
  aeatCsv: string | null;
  aeatQrText: string | null;
  aeatCancellationStatus: string;
  aeatCancellationJobId: string | null;
  aeatCancellationLastError: string | null;
};

export function VerifactuSendPanel({
  invoiceId,
  aeatStatus,
  aeatJobId,
  aeatLastError,
  aeatCsv,
  aeatQrText,
  aeatCancellationStatus,
  aeatCancellationJobId,
  aeatCancellationLastError,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const sendPending = aeatStatus === "PENDING";
  const cancelPending = aeatCancellationStatus === "PENDING";
  const canSend = aeatStatus !== "SUCCEEDED" && aeatStatus !== "PENDING";
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
        "Cancel this invoice in AEAT Verifactu? This submits a cancellation record to the tax agency."
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
        <div>
          <span className="font-medium">Registration status:</span> {aeatStatus}
        </div>
        {aeatJobId ? (
          <div>
            <span className="font-medium">Registration job:</span>{" "}
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
                className="text-xs text-blue-600 hover:underline"
              >
                Verificar en AEAT ↗
              </a>
            ) : null}
          </div>
        ) : null}
        {aeatLastError ? (
          <div className="text-red-700">
            <span className="font-medium">Registration error:</span>{" "}
            {humanizeAeatError(aeatLastError)}
          </div>
        ) : null}
        <div>
          <span className="font-medium">Cancellation status:</span> {aeatCancellationStatus}
        </div>
        {aeatCancellationJobId ? (
          <div>
            <span className="font-medium">Cancellation job:</span>{" "}
            <code className="text-xs">{aeatCancellationJobId}</code>
          </div>
        ) : null}
        {aeatCancellationLastError ? (
          <div className="text-red-700">
            <span className="font-medium">Cancellation error:</span>{" "}
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
          Job in progress. Use refresh to update status without leaving the page.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {canSend ? (
          <button
            type="button"
            onClick={() => run(sendInvoiceToVerifactuAction, invoiceId)}
            disabled={pending}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {pending ? "Working…" : "Send to Verifactu"}
          </button>
        ) : null}
        {canRefresh ? (
          <button
            type="button"
            onClick={() => run(refreshVerifactuJobAction, invoiceId)}
            disabled={pending}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            {pending ? "…" : "Refresh status"}
          </button>
        ) : null}
        {canCancelAeat ? (
          <button
            type="button"
            onClick={onCancelClick}
            disabled={pending}
            className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
          >
            {pending ? "…" : "Cancel in Verifactu"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
