"use server";

import { revalidatePath } from "next/cache";
import { requirePartner } from "@/lib/auth/partner";
import { partnerFetch } from "@/lib/simplefactu/partner-server";

export type PartnerActionState =
  | { ok: true; message: string; apiKey?: string }
  | { ok: false; errors: string[] };

export async function createSubtenantAction(
  _prev: PartnerActionState | null,
  formData: FormData
): Promise<PartnerActionState> {
  const { userId } = await requirePartner();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const allowedNif = String(formData.get("allowedNif") ?? "").trim();

  if (!id || !allowedNif) {
    return { ok: false, errors: ["El identificador y el NIF son obligatorios."] };
  }

  const res = await partnerFetch(userId, "/partner/tenants", {
    method: "POST",
    body: JSON.stringify({ id, name: name || undefined, allowedNif }),
  });
  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  if (!res.ok) {
    return {
      ok: false,
      errors: [json.message || json.error || `Error ${res.status} al registrar NIF Emisor`],
    };
  }

  revalidatePath("/partner");
  return { ok: true, message: `NIF Emisor ${name || id} registrado correctamente.` };
}

export async function updateSubtenantStatusAction(
  childId: string,
  status: "ACTIVE" | "SUSPENDED"
): Promise<PartnerActionState> {
  const { userId } = await requirePartner();

  const res = await partnerFetch(userId, `/partner/tenants/${encodeURIComponent(childId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  const json = (await res.json().catch(() => ({}))) as { message?: string };

  if (!res.ok) {
    return { ok: false, errors: [json.message || `Error ${res.status}`] };
  }

  revalidatePath("/partner");
  revalidatePath(`/partner/tenants/${childId}`);
  return {
    ok: true,
    message: status === "SUSPENDED" ? "NIF Emisor suspendido." : "NIF Emisor reactivado.",
  };
}

export async function createSubtenantApiKeyFormAction(
  _prev: PartnerActionState | null,
  formData: FormData
): Promise<PartnerActionState> {
  const childId = String(formData.get("childId") ?? "").trim();
  if (!childId) {
    return { ok: false, errors: ["Falta identificador del NIF Emisor."] };
  }

  const { userId } = await requirePartner();

  const res = await partnerFetch(
    userId,
    `/partner/tenants/${encodeURIComponent(childId)}/api-keys`,
    { method: "POST", body: JSON.stringify({ name: "Clave integración" }) }
  );
  const json = (await res.json().catch(() => ({}))) as {
    apiKey?: { key?: string };
    message?: string;
  };

  if (!res.ok) {
    return { ok: false, errors: [json.message || `Error ${res.status}`] };
  }

  const key = json.apiKey?.key;
  if (!key) {
    return { ok: false, errors: ["El API no devolvió la clave."] };
  }

  revalidatePath(`/partner/tenants/${childId}`);
  return {
    ok: true,
    message: "Clave creada. Cópiala ahora; no se volverá a mostrar.",
    apiKey: key,
  };
}

export async function uploadSubtenantCertificateAction(
  childId: string,
  _prev: PartnerActionState | null,
  formData: FormData
): Promise<PartnerActionState> {
  const { userId } = await requirePartner();

  const file = formData.get("pfx");
  const passphrase = String(formData.get("pfxPassphrase") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, errors: ["Selecciona un archivo .pfx o .p12."] };
  }
  if (!passphrase) {
    return { ok: false, errors: ["La contraseña del certificado es obligatoria."] };
  }

  const body = new FormData();
  body.append("pfx", file);
  body.append("pfxPassphrase", passphrase);

  const res = await partnerFetch(
    userId,
    `/partner/tenants/${encodeURIComponent(childId)}/certificate`,
    { method: "POST", body }
  );
  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    certificate?: { nif?: string; notAfter?: string };
  };

  if (!res.ok) {
    return { ok: false, errors: [json.message || `Error ${res.status} al subir certificado`] };
  }

  revalidatePath(`/partner/tenants/${childId}`);
  revalidatePath("/partner");
  const nif = json.certificate?.nif;
  return {
    ok: true,
    message: nif
      ? `Certificado actualizado (NIF ${nif}).`
      : "Certificado actualizado.",
  };
}
