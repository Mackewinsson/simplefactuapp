"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";

export type VerifactuSettingsState = { ok: true; message: string } | { ok: false; errors: string[] };

export async function saveIssuerProfileAction(
  _prev: VerifactuSettingsState | null,
  formData: FormData
): Promise<VerifactuSettingsState> {
  const { userId } = await auth();
  if (!userId) return { ok: false, errors: ["Sign in required."] };

  const issuerNif = String(formData.get("issuerNif") ?? "").trim();
  const issuerLegalName = String(formData.get("issuerLegalName") ?? "").trim();
  if (!issuerNif || !issuerLegalName) {
    return { ok: false, errors: ["Issuer NIF and legal name are required."] };
  }

  await ensureVerifactuApiKey(userId);
  await prisma.userVerifactuAccount.update({
    where: { userId },
    data: { issuerNif, issuerLegalName },
  });

  revalidatePath("/settings/verifactu");
  return { ok: true, message: "Issuer profile saved." };
}

export async function uploadCertificateAction(
  _prev: VerifactuSettingsState | null,
  formData: FormData
): Promise<VerifactuSettingsState> {
  const { userId } = await auth();
  if (!userId) return { ok: false, errors: ["Sign in required."] };

  const file = formData.get("pfxFile");
  const passphrase = String(formData.get("pfxPassphrase") ?? "");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, errors: ["Choose a .pfx / .p12 file."] };
  }
  if (!passphrase) {
    return { ok: false, errors: ["PFX passphrase is required."] };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const pfxBase64 = buf.toString("base64");

  const { apiKey } = await ensureVerifactuApiKey(userId);
  const client = createSimplefactuClient({
    baseUrl: getSimplefactuBaseUrl(),
    apiKey,
  });

  const res = await client.postMeCertificate({ pfxBase64, pfxPassphrase: passphrase });
  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  if (!res.ok) {
    const msg = json.message || json.error || `HTTP ${res.status}`;
    return { ok: false, errors: [msg] };
  }

  await prisma.userVerifactuAccount.update({
    where: { userId },
    data: { certificateUploadedAt: new Date() },
  });

  revalidatePath("/settings/verifactu");
  return { ok: true, message: "Certificate uploaded to Verifactu." };
}
