import { AeatCancellationStatus, AeatJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SimplefactuClient } from "@/lib/simplefactu/client";

type AeatError = {
  code?: string | null;
  description?: string | null;
  category?: string | null;
};

type JobJson = {
  status?: string;
  type?: string;
  lastError?: string | null;
  result?: {
    qrInfo?: { csv?: string; qrText?: string } | null;
    aeatErrors?: AeatError[] | null;
  } | null;
};

/**
 * Build a concise error string from structured AEAT errors returned by the backend.
 * Falls back to `lastError` when no structured errors are present.
 */
function buildErrorMessage(job: JobJson): string {
  const errors = job.result?.aeatErrors;
  if (errors && errors.length > 0) {
    const parts = errors
      .filter((e) => e.code || e.description)
      .map((e) => (e.description ? `[${e.code}] ${e.description}` : `Error ${e.code}`));
    if (parts.length) return parts.join(" | ").slice(0, 2000);
  }
  return (job.lastError || "Verifactu job failed").slice(0, 2000);
}

/**
 * Fetches job status from simplefactu and persists terminal state to the invoice.
 */
export async function syncJobStatusToInvoice(
  client: SimplefactuClient,
  params: {
    invoiceId: string;
    userId: string;
    jobId: string;
    kind: "SEND_INVOICE" | "CANCEL_INVOICE";
  }
): Promise<{ ok: boolean; message: string; terminal: boolean }> {
  const { invoiceId, userId, jobId, kind } = params;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
  });
  if (!invoice) {
    return { ok: false, message: "Invoice not found.", terminal: true };
  }

  const jr = await client.getJob(jobId);
  const job = (await jr.json().catch(() => ({}))) as JobJson;

  if (!jr.ok) {
    return {
      ok: false,
      message: `Could not load job (${jr.status}).`,
      terminal: false,
    };
  }

  const st = job.status;

  if (kind === "SEND_INVOICE") {
    if (st === "SUCCEEDED") {
      const csv = job.result?.qrInfo?.csv ?? null;
      const qrText = job.result?.qrInfo?.qrText ?? null;
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          aeatStatus: AeatJobStatus.SUCCEEDED,
          aeatCsv: csv,
          aeatQrText: qrText,
          aeatLastError: null,
          aeatUpdatedAt: new Date(),
        },
      });
      return {
        ok: true,
        message: csv ? `Accepted (CSV: ${csv})` : "Accepted by Verifactu.",
        terminal: true,
      };
    }
    if (st === "FAILED" || st === "DEAD") {
      const err = buildErrorMessage(job);
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          aeatStatus: st === "DEAD" ? AeatJobStatus.DEAD : AeatJobStatus.FAILED,
          aeatLastError: err,
          aeatUpdatedAt: new Date(),
        },
      });
      return { ok: false, message: err, terminal: true };
    }
    return {
      ok: true,
      message: "Job still processing (PENDING or PROCESSING).",
      terminal: false,
    };
  }

  // CANCEL_INVOICE
  if (st === "SUCCEEDED") {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        aeatCancellationStatus: AeatCancellationStatus.SUCCEEDED,
        aeatCancellationLastError: null,
        aeatUpdatedAt: new Date(),
      },
    });
    return { ok: true, message: "Cancellation accepted by Verifactu.", terminal: true };
  }
  if (st === "FAILED" || st === "DEAD") {
    const err = buildErrorMessage(job);
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        aeatCancellationStatus: st === "DEAD" ? AeatCancellationStatus.DEAD : AeatCancellationStatus.FAILED,
        aeatCancellationLastError: err,
        aeatUpdatedAt: new Date(),
      },
    });
    return { ok: false, message: err, terminal: true };
  }

  return {
    ok: true,
    message: "Cancellation job still processing.",
    terminal: false,
  };
}
