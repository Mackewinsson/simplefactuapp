"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { AeatCancellationStatus, AeatJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildSendInvoicePayload } from "@/lib/simplefactu/build-send-invoice-payload";
import { buildCancelInvoicePayload } from "@/lib/simplefactu/build-cancel-invoice-payload";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { formatSimplefactuHttpError } from "@/lib/simplefactu/api-errors";
import { syncJobStatusToInvoice } from "@/lib/simplefactu/job-sync";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type SendVerifactuResult = { ok: boolean; message: string };

async function pollUntilTerminal(
  client: ReturnType<typeof createSimplefactuClient>,
  params: {
    invoiceId: string;
    userId: string;
    jobId: string;
    kind: "SEND_INVOICE" | "CANCEL_INVOICE";
    maxRounds?: number;
  }
): Promise<SendVerifactuResult> {
  const max = params.maxRounds ?? 10;
  for (let i = 0; i < max; i++) {
    await sleep(1500);
    const r = await syncJobStatusToInvoice(client, {
      invoiceId: params.invoiceId,
      userId: params.userId,
      jobId: params.jobId,
      kind: params.kind,
    });
    if (r.terminal) {
      revalidatePath(`/invoices/${params.invoiceId}`);
      return { ok: r.ok, message: r.message };
    }
  }
  revalidatePath(`/invoices/${params.invoiceId}`);
  return {
    ok: true,
    message:
      "Sigue procesándose — usa «Actualizar estado» o recarga la página.",
  };
}

export async function sendInvoiceToVerifactuAction(invoiceId: string): Promise<SendVerifactuResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Debes iniciar sesión." };

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: { items: true },
  });
  if (!invoice) return { ok: false, message: "Factura no encontrada." };

  if (invoice.aeatStatus === AeatJobStatus.SUCCEEDED) {
    return { ok: false, message: "Esta factura ya fue aceptada por Verifactu." };
  }

  const account = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
  if (!account?.issuerNif || !account.issuerLegalName) {
    return {
      ok: false,
      message:
        "Configura el NIF y la razón social del emisor en Ajustes → Verifactu.",
    };
  }

  const { apiKey } = await ensureVerifactuApiKey(userId);
  const client = createSimplefactuClient({
    baseUrl: getSimplefactuBaseUrl(),
    apiKey,
  });

  const certRes = await client.getMeCertificate();
  if (certRes.ok) {
    const cj = (await certRes.json()) as { hasCertificate?: boolean };
    if (!cj.hasCertificate) {
      return {
        ok: false,
        message:
          "Sube primero tu certificado PFX en Ajustes → Verifactu.",
      };
    }
  }

  let body: Record<string, unknown>;
  try {
    body = buildSendInvoicePayload(invoice, account);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Factura no válida para Verifactu.",
    };
  }

  const idempotencyKey = invoice.aeatIdempotencyKey || invoice.id;
  if (!invoice.aeatIdempotencyKey) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { aeatIdempotencyKey: idempotencyKey },
    });
  }

  const post = await client.postSendInvoice(body, idempotencyKey);
  const postJson = (await post.json().catch(() => ({}))) as Record<string, unknown>;

  if (post.status !== 202) {
    const msg = formatSimplefactuHttpError(post.status, postJson);
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        aeatStatus: AeatJobStatus.NOT_SENT,
        aeatLastError: msg.slice(0, 2000),
        aeatUpdatedAt: new Date(),
      },
    });
    revalidatePath(`/invoices/${invoice.id}`);
    return { ok: false, message: msg };
  }

  const jobId = postJson.jobId as string | undefined;
  if (!jobId) {
    return { ok: false, message: "El API no devolvió jobId (Verifactu)." };
  }

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      aeatJobId: jobId,
      aeatStatus: AeatJobStatus.PENDING,
      aeatLastError: null,
      aeatUpdatedAt: new Date(),
    },
  });

  return pollUntilTerminal(client, {
    invoiceId: invoice.id,
    userId,
    jobId,
    kind: "SEND_INVOICE",
  });
}

export async function refreshVerifactuJobAction(invoiceId: string): Promise<SendVerifactuResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Debes iniciar sesión." };

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
  });
  if (!invoice) return { ok: false, message: "Factura no encontrada." };

  let kind: "SEND_INVOICE" | "CANCEL_INVOICE" | null = null;
  let jobId: string | null = null;

  if (
    invoice.aeatCancellationStatus === AeatCancellationStatus.PENDING &&
    invoice.aeatCancellationJobId
  ) {
    kind = "CANCEL_INVOICE";
    jobId = invoice.aeatCancellationJobId;
  } else if (invoice.aeatStatus === AeatJobStatus.PENDING && invoice.aeatJobId) {
    kind = "SEND_INVOICE";
    jobId = invoice.aeatJobId;
  }

  if (!kind || !jobId) {
    return { ok: false, message: "No hay ningún trabajo Verifactu pendiente de actualizar." };
  }

  const { apiKey } = await ensureVerifactuApiKey(userId);
  const client = createSimplefactuClient({
    baseUrl: getSimplefactuBaseUrl(),
    apiKey,
  });

  const r = await syncJobStatusToInvoice(client, {
    invoiceId,
    userId,
    jobId,
    kind,
  });
  revalidatePath(`/invoices/${invoiceId}`);
  return { ok: r.ok, message: r.message };
}

export async function cancelInvoiceVerifactuAction(invoiceId: string): Promise<SendVerifactuResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Debes iniciar sesión." };

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
  });
  if (!invoice) return { ok: false, message: "Factura no encontrada." };

  if (invoice.aeatStatus !== AeatJobStatus.SUCCEEDED) {
    return {
      ok: false,
      message: "Solo se pueden anular en AEAT las facturas ya aceptadas por Verifactu.",
    };
  }

  if (invoice.aeatCancellationStatus === AeatCancellationStatus.SUCCEEDED) {
    return { ok: false, message: "Esta factura ya está anulada en Verifactu." };
  }

  if (invoice.aeatCancellationStatus === AeatCancellationStatus.PENDING) {
    return {
      ok: false,
      message: "La anulación ya está en curso. Usa «Actualizar estado».",
    };
  }

  const needsNewCancelKey =
    invoice.aeatCancellationStatus === AeatCancellationStatus.FAILED ||
    invoice.aeatCancellationStatus === AeatCancellationStatus.DEAD;

  const account = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
  if (!account?.issuerNif || !account.issuerLegalName) {
    return {
      ok: false,
      message:
        "Configura el NIF y la razón social del emisor en Ajustes → Verifactu.",
    };
  }

  const { apiKey } = await ensureVerifactuApiKey(userId);
  const client = createSimplefactuClient({
    baseUrl: getSimplefactuBaseUrl(),
    apiKey,
  });

  const certRes = await client.getMeCertificate();
  if (certRes.ok) {
    const cj = (await certRes.json()) as { hasCertificate?: boolean };
    if (!cj.hasCertificate) {
      return {
        ok: false,
        message:
          "Sube primero tu certificado PFX en Ajustes → Verifactu.",
      };
    }
  }

  let body: Record<string, unknown>;
  try {
    body = buildCancelInvoicePayload(invoice, account);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Datos de anulación no válidos.",
    };
  }

  let cancelKey =
    invoice.aeatCancellationIdempotencyKey || `cancel-inv-${invoice.id}`;
  if (needsNewCancelKey) {
    cancelKey = `cancel-inv-${invoice.id}-${Date.now()}`;
  }
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { aeatCancellationIdempotencyKey: cancelKey },
  });

  const post = await client.postCancelInvoice(body, cancelKey);
  const postJson = (await post.json().catch(() => ({}))) as Record<string, unknown>;

  if (post.status !== 202) {
    const msg = formatSimplefactuHttpError(post.status, postJson);
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        aeatCancellationLastError: msg.slice(0, 2000),
        aeatUpdatedAt: new Date(),
      },
    });
    revalidatePath(`/invoices/${invoice.id}`);
    return { ok: false, message: msg };
  }

  const jobId = postJson.jobId as string | undefined;
  if (!jobId) {
    return { ok: false, message: "El API no devolvió jobId de anulación (Verifactu)." };
  }

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      aeatCancellationJobId: jobId,
      aeatCancellationStatus: AeatCancellationStatus.PENDING,
      aeatCancellationLastError: null,
      aeatUpdatedAt: new Date(),
    },
  });

  return pollUntilTerminal(client, {
    invoiceId: invoice.id,
    userId,
    jobId,
    kind: "CANCEL_INVOICE",
  });
}
