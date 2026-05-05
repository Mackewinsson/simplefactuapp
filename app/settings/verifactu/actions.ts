"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { formatSimplefactuHttpError } from "@/lib/simplefactu/api-errors";

export type VerifactuSettingsState = { ok: true; message: string } | { ok: false; errors: string[] };

export async function saveIssuerProfileAction(
  _prev: VerifactuSettingsState | null,
  formData: FormData
): Promise<VerifactuSettingsState> {
  const { userId } = await auth();
  if (!userId) return { ok: false, errors: ["Debes iniciar sesión."] };

  const issuerNif = String(formData.get("issuerNif") ?? "").trim();
  const issuerLegalName = String(formData.get("issuerLegalName") ?? "").trim();
  if (!issuerNif || !issuerLegalName) {
    return { ok: false, errors: ["El NIF y la razón social del emisor son obligatorios."] };
  }

  await ensureVerifactuApiKey(userId);
  await prisma.userVerifactuAccount.update({
    where: { userId },
    data: { issuerNif, issuerLegalName },
  });

  revalidatePath("/settings/verifactu");
  return { ok: true, message: "Datos del emisor guardados." };
}

export async function uploadCertificateAction(
  _prev: VerifactuSettingsState | null,
  formData: FormData
): Promise<VerifactuSettingsState> {
  const { userId } = await auth();
  if (!userId) return { ok: false, errors: ["Debes iniciar sesión."] };

  const file = formData.get("pfxFile");
  const passphrase = String(formData.get("pfxPassphrase") ?? "");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, errors: ["Elige un archivo .pfx o .p12."] };
  }
  if (!passphrase) {
    return { ok: false, errors: ["La contraseña del PFX es obligatoria."] };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const pfxBase64 = buf.toString("base64");

  const { apiKey } = await ensureVerifactuApiKey(userId);
  const client = createSimplefactuClient({
    baseUrl: getSimplefactuBaseUrl(),
    apiKey,
  });

  const res = await client.postMeCertificate({ pfxBase64, pfxPassphrase: passphrase });
  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
    code?: string;
    docsHint?: string;
    warnings?: string[];
  };

  if (!res.ok) {
    // 422 with code=legacy_rc2 means the cert is in the old FNMT format
    // OpenSSL 3 cannot read. Tell the user how to convert it.
    if (res.status === 422 && json.code === "legacy_rc2") {
      return {
        ok: false,
        errors: [
          "Tu certificado usa el formato heredado RC2-40 (típico de FNMT antes de 2023) que ya no se admite.",
          "Conviértelo abriendo una terminal: `openssl pkcs12 -legacy -in cert.p12 -nodes -out cert.pem` y luego `openssl pkcs12 -export -in cert.pem -out cert-modern.p12`. Sube el `cert-modern.p12`.",
        ],
      };
    }
    if (res.status === 422 && json.code === "wrong_passphrase") {
      return { ok: false, errors: ["La contraseña no coincide con el certificado."] };
    }
    if (res.status === 422 && json.code === "malformed") {
      return {
        ok: false,
        errors: [
          "El archivo no parece ser un PFX válido.",
          json.message || "Comprueba que es un .p12 / .pfx genuino y no un PEM o un certificado vacío.",
        ],
      };
    }
    const msg = json.message || json.error || `HTTP ${res.status}`;
    return { ok: false, errors: [msg] };
  }

  await prisma.userVerifactuAccount.update({
    where: { userId },
    data: { certificateUploadedAt: new Date() },
  });

  revalidatePath("/settings/verifactu");

  const successMsg =
    json.warnings && json.warnings.length
      ? `Certificado subido. Aviso: ${json.warnings.join(" ")}`
      : "Certificado subido a Verifactu.";

  return { ok: true, message: successMsg };
}

export async function verifyNifAction(
  _prev: VerifactuSettingsState | null,
  formData: FormData
): Promise<VerifactuSettingsState> {
  const { userId } = await auth();
  if (!userId) return { ok: false, errors: ["Debes iniciar sesión."] };

  const nif = String(formData.get("verifyNif") ?? "").trim();
  const nombre = String(formData.get("verifyNombre") ?? "").trim();
  if (!nif || !nombre) {
    return {
      ok: false,
      errors: ["El NIF y el nombre (razón social) son obligatorios para VNIF."],
    };
  }

  const { apiKey } = await ensureVerifactuApiKey(userId);
  const client = createSimplefactuClient({
    baseUrl: getSimplefactuBaseUrl(),
    apiKey,
  });

  const res = await client.postVerifyNif({ nif, nombre });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const msg =
      res.status === 403
        ? "La API key no tiene nif:read. Borra la fila UserVerifactuAccount o revoca la clave e inicia sesión de nuevo para reprovisionar."
        : formatSimplefactuHttpError(res.status, json);
    return { ok: false, errors: [msg] };
  }

  const success = json.success === true;
  const resultado = json.resultado != null ? String(json.resultado) : "";
  const summary = success
    ? `VNIF: identificado (${resultado || "OK"})`
    : typeof json.message === "string"
      ? json.message
      : resultado
        ? `VNIF: ${resultado}`
        : "Consulta VNIF finalizada.";

  revalidatePath("/settings/verifactu");
  return { ok: true, message: summary };
}
