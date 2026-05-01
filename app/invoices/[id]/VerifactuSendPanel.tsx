"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendInvoiceToVerifactuAction } from "./verifactu-actions";

type Props = {
  invoiceId: string;
  aeatStatus: string;
  aeatJobId: string | null;
  aeatLastError: string | null;
  aeatCsv: string | null;
  aeatQrText: string | null;
};

export function VerifactuSendPanel({
  invoiceId,
  aeatStatus,
  aeatJobId,
  aeatLastError,
  aeatCsv,
  aeatQrText,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const canSend = aeatStatus !== "SUCCEEDED" && aeatStatus !== "PENDING";

  function onSend() {
    setMessage(null);
    startTransition(async () => {
      const r = await sendInvoiceToVerifactuAction(invoiceId);
      setMessage(r.message);
      router.refresh();
    });
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900">Verifactu (AEAT)</h2>
      <dl className="mt-2 grid gap-1 text-sm text-gray-700">
        <div>
          <span className="font-medium">Status:</span> {aeatStatus}
        </div>
        {aeatJobId ? (
          <div>
            <span className="font-medium">Job:</span>{" "}
            <code className="text-xs">{aeatJobId}</code>
          </div>
        ) : null}
        {aeatCsv ? (
          <div>
            <span className="font-medium">CSV:</span> {aeatCsv}
          </div>
        ) : null}
        {aeatQrText ? (
          <div className="break-all">
            <span className="font-medium">QR / URL:</span> {aeatQrText}
          </div>
        ) : null}
        {aeatLastError ? (
          <div className="text-red-700">
            <span className="font-medium">Last error:</span> {aeatLastError}
          </div>
        ) : null}
      </dl>
      {message ? (
        <p className="mt-2 text-sm text-gray-800" role="status">
          {message}
        </p>
      ) : null}
      {aeatStatus === "PENDING" ? (
        <p className="mt-2 text-sm text-amber-800">
          Job is still running. Refresh the page to update status.
        </p>
      ) : null}
      {canSend ? (
        <button
          type="button"
          onClick={onSend}
          disabled={pending}
          className="mt-3 rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send to Verifactu"}
        </button>
      ) : null}
    </div>
  );
}
