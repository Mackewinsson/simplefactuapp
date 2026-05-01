"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { AeatJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildSendInvoicePayload } from "@/lib/simplefactu/build-send-invoice-payload";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type SendVerifactuResult = { ok: boolean; message: string };

export async function sendInvoiceToVerifactuAction(invoiceId: string): Promise<SendVerifactuResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Sign in required." };

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: { items: true },
  });
  if (!invoice) return { ok: false, message: "Invoice not found." };

  if (invoice.aeatStatus === AeatJobStatus.SUCCEEDED) {
    return { ok: false, message: "This invoice was already accepted by Verifactu." };
  }

  const account = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
  if (!account?.issuerNif || !account.issuerLegalName) {
    return { ok: false, message: "Set issuer NIF and legal name under Settings → Verifactu." };
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
      return { ok: false, message: "Upload your PFX certificate under Settings → Verifactu first." };
    }
  }

  let body: Record<string, unknown>;
  try {
    body = buildSendInvoicePayload(invoice, account);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Invalid invoice for Verifactu." };
  }

  const idempotencyKey = invoice.aeatIdempotencyKey || invoice.id;
  if (!invoice.aeatIdempotencyKey) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { aeatIdempotencyKey: idempotencyKey },
    });
  }

  const post = await client.postSendInvoice(body, idempotencyKey);
  const postJson = (await post.json().catch(() => ({}))) as {
    jobId?: string;
    message?: string;
    error?: string;
  };

  if (post.status !== 202) {
    const msg =
      postJson.message ||
      postJson.error ||
      `Verifactu returned HTTP ${post.status}`;
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

  const jobId = postJson.jobId;
  if (!jobId) {
    return { ok: false, message: "No jobId returned from Verifactu." };
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

  for (let i = 0; i < 10; i++) {
    await sleep(1500);
    const jr = await client.getJob(jobId);
    const job = (await jr.json().catch(() => ({}))) as {
      status?: string;
      lastError?: string | null;
      result?: { qrInfo?: { csv?: string; qrText?: string } | null };
    };

    const st = job.status;
    if (st === "SUCCEEDED") {
      const csv = job.result?.qrInfo?.csv ?? null;
      const qrText = job.result?.qrInfo?.qrText ?? null;
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          aeatStatus: AeatJobStatus.SUCCEEDED,
          aeatCsv: csv,
          aeatQrText: qrText,
          aeatLastError: null,
          aeatUpdatedAt: new Date(),
        },
      });
      revalidatePath(`/invoices/${invoice.id}`);
      return {
        ok: true,
        message: csv ? `Accepted (CSV: ${csv})` : "Accepted by Verifactu.",
      };
    }

    if (st === "FAILED" || st === "DEAD") {
      const err = (job.lastError || "Verifactu job failed").slice(0, 2000);
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          aeatStatus: st === "DEAD" ? AeatJobStatus.DEAD : AeatJobStatus.FAILED,
          aeatLastError: err,
          aeatUpdatedAt: new Date(),
        },
      });
      revalidatePath(`/invoices/${invoice.id}`);
      return { ok: false, message: err };
    }
  }

  revalidatePath(`/invoices/${invoice.id}`);
  return {
    ok: true,
    message: "Still processing — refresh this page in a few seconds to see the final status.",
  };
}
