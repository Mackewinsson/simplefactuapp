import { AeatCancellationStatus, AeatJobStatus } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { SimplefactuClient } from "@/lib/simplefactu/client";
import { formatSimplefactuNetworkError, formatUserFacingError } from "@/lib/simplefactu/api-errors";
import {
  sendCancellationAcceptedEmail,
  sendCancellationFailedEmail,
  sendInvoiceAcceptedEmail,
  sendInvoiceFailedEmail,
} from "@/lib/email/invoice-notifications";

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
      .map((e) =>
        e.description ? `[${e.code}] ${e.description}` : `Error ${e.code}`
      );
    if (parts.length) return parts.join(" | ").slice(0, 2000);
  }
  return (job.lastError || "El trabajo Verifactu falló").slice(0, 2000);
}

/**
 * Fetches job status from simplefactu and persists terminal state to the invoice.
 */
export type SyncJobStatusResult = {
  ok: boolean;
  message: string;
  terminal: boolean;
  /** Fallo de red antes de respuesta HTTP; no actualizar estado terminal en BD. */
  networkFailure?: boolean;
};

export async function syncJobStatusToInvoice(
  client: SimplefactuClient,
  params: {
    invoiceId: string;
    userId: string;
    jobId: string;
    kind: "SEND_INVOICE" | "CANCEL_INVOICE";
  }
): Promise<SyncJobStatusResult> {
  const { invoiceId, userId, jobId, kind } = params;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
  });
  if (!invoice) {
    return { ok: false, message: "Factura no encontrada.", terminal: true };
  }

  let jr: Response;
  try {
    jr = await client.getJob(jobId);
  } catch (e) {
    return {
      ok: false,
      message: formatSimplefactuNetworkError(e),
      terminal: false,
      networkFailure: true,
    };
  }

  const job = (await jr.json().catch(() => ({}))) as JobJson;

  if (!jr.ok) {
    return {
      ok: false,
      message: `No se pudo cargar el trabajo (${jr.status}).`,
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
      void notifyByEmail(userId, (email) =>
        sendInvoiceAcceptedEmail({ to: email, invoiceNumber: invoice.number, csv })
      );
      return {
        ok: true,
        message: csv ? `Aceptada (CSV: ${csv})` : "Aceptada por Verifactu.",
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
      // Only notify on DEAD (permanent failure) to avoid noise on transient retries.
      if (st === "DEAD") {
        void notifyByEmail(userId, (email) =>
          sendInvoiceFailedEmail({ to: email, invoiceNumber: invoice.number, errorMessage: err })
        );
      }
      return { ok: false, message: formatUserFacingError(err), terminal: true };
    }
    return {
      ok: true,
      message: "El trabajo sigue en curso (PENDING o PROCESSING).",
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
    void notifyByEmail(userId, (email) =>
      sendCancellationAcceptedEmail({ to: email, invoiceNumber: invoice.number })
    );
    return { ok: true, message: "Anulación aceptada por Verifactu.", terminal: true };
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
    if (st === "DEAD") {
        void notifyByEmail(userId, (email) =>
          sendCancellationFailedEmail({ to: email, invoiceNumber: invoice.number, errorMessage: err })
        );
    }
    return { ok: false, message: err, terminal: true };
  }

  return {
    ok: true,
    message: "La anulación sigue en curso.",
    terminal: false,
  };
}

/**
 * Resolves the user's primary email from Clerk and calls the provided send
 * function with it. Fire-and-forget: errors are silenced so email failures
 * never break the invoice flow.
 */
async function notifyByEmail(
  userId: string,
  send: (userEmail: string) => Promise<unknown>
): Promise<void> {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
    if (!email) return;
    await send(email);
  } catch {
    // Best-effort: never let email errors surface to the user.
  }
}

/**
 * Re-fetches a succeeded SEND_INVOICE job and updates stored QR URL from the API
 * (authoritative AEAT environment). Use after API QR-base fixes for legacy rows.
 */
export async function resyncVerifactuQrFromJob(
  client: SimplefactuClient,
  params: { invoiceId: string; userId: string; jobId: string }
): Promise<SyncJobStatusResult> {
  const { invoiceId, userId, jobId } = params;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
  });
  if (!invoice) {
    return { ok: false, message: "Factura no encontrada.", terminal: true };
  }
  if (invoice.aeatStatus !== AeatJobStatus.SUCCEEDED) {
    return {
      ok: false,
      message: "Solo se puede actualizar el enlace QR en facturas aceptadas por Verifactu.",
      terminal: true,
    };
  }

  let jr: Response;
  try {
    jr = await client.getJob(jobId);
  } catch (e) {
    return {
      ok: false,
      message: formatSimplefactuNetworkError(e),
      terminal: false,
      networkFailure: true,
    };
  }

  const job = (await jr.json().catch(() => ({}))) as JobJson;
  if (!jr.ok) {
    return {
      ok: false,
      message: `No se pudo cargar el trabajo (${jr.status}).`,
      terminal: false,
    };
  }
  if (job.status !== "SUCCEEDED") {
    return {
      ok: false,
      message: "El trabajo Verifactu ya no está en estado Aceptado.",
      terminal: true,
    };
  }

  const qrText = job.result?.qrInfo?.qrText?.trim() ?? null;
  if (!qrText) {
    return {
      ok: false,
      message: "La API no devolvió URL de verificación para este envío.",
      terminal: true,
    };
  }

  const csvFromJob = job.result?.qrInfo?.csv?.trim();
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      aeatQrText: qrText,
      ...(csvFromJob ? { aeatCsv: csvFromJob } : {}),
      aeatUpdatedAt: new Date(),
    },
  });

  return {
    ok: true,
    message: "Enlace y QR de verificación actualizados desde la API.",
    terminal: true,
  };
}
