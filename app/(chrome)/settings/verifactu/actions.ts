"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { formatSimplefactuHttpError, formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import {
  NIF_VERIFY_MATCH_USER,
  NIF_VERIFY_NEED_BOTH_USER,
  NIF_VERIFY_NOT_MATCH_USER,
  NIF_VERIFY_PERMISSION_USER,
} from "@/lib/invoices/nif-verify-user-messages";

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

  try {
    await ensureVerifactuApiKey(userId);
  } catch (e) {
    return { ok: false, errors: [formatVerifactuActionError(e)] };
  }

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

  let res: Response;
  try {
    const { apiKey } = await ensureVerifactuApiKey(userId);
    const client = createSimplefactuClient({
      baseUrl: getSimplefactuBaseUrl(),
      apiKey,
    });
    res = await client.postMeCertificate({ pfxBase64, pfxPassphrase: passphrase });
  } catch (e) {
    return { ok: false, errors: [formatVerifactuActionError(e)] };
  }

  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
    code?: string;
    docsHint?: string;
    warnings?: string[];
    certificate?: { normalizedFromLegacy?: boolean };
  };

  if (!res.ok) {
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
    if (res.status === 422 && json.code === "legacy_rc2") {
      return {
        ok: false,
        errors: [
          "Tu certificado usa un formato antiguo (RC2) que el servidor no pudo reempaquetar.",
          "Conviértelo en tu Mac o Linux: openssl pkcs12 -legacy -in cert.p12 -passin pass:TU_PASS -nodes -out /tmp/cert.pem && openssl pkcs12 -export -in /tmp/cert.pem -out cert-modern.p12 -passout pass:TU_PASS && rm /tmp/cert.pem",
          "Vuelve a subir cert-modern.p12 desde este formulario.",
        ],
      };
    }
    if (res.status === 500 && /certificate|pfx|pkcs12/i.test(String(json.message ?? json.error ?? ""))) {
      return {
        ok: false,
        errors: [
          String(json.message || json.error || "Error al procesar el certificado."),
          "Si el archivo es antiguo (FNMT), prueba la conversión RC2 descrita arriba o contacta soporte.",
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

  const normalizedFromLegacy = json.certificate?.normalizedFromLegacy === true;

  let successMsg = "Certificado subido a Verifactu.";
  if (normalizedFromLegacy) {
    successMsg = "Certificado subido y convertido automáticamente al formato compatible con Verifactu.";
  } else if (json.warnings && json.warnings.length) {
    successMsg = `Certificado subido. Aviso: ${json.warnings.join(" ")}`;
  }

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
      errors: [NIF_VERIFY_NEED_BOTH_USER],
    };
  }

  let res: Response;
  let json: Record<string, unknown>;
  try {
    const { apiKey } = await ensureVerifactuApiKey(userId);
    const client = createSimplefactuClient({
      baseUrl: getSimplefactuBaseUrl(),
      apiKey,
    });
    res = await client.postVerifyNif({ nif, nombre });
    json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  } catch (e) {
    return { ok: false, errors: [formatVerifactuActionError(e)] };
  }

  if (!res.ok) {
    const msg =
      res.status === 403 ? NIF_VERIFY_PERMISSION_USER : formatSimplefactuHttpError(res.status, json);
    return { ok: false, errors: [msg] };
  }

  const success = json.success === true;

  revalidatePath("/settings/verifactu");
  if (success) {
    return { ok: true, message: NIF_VERIFY_MATCH_USER };
  }
  return { ok: false, errors: [NIF_VERIFY_NOT_MATCH_USER] };
}
