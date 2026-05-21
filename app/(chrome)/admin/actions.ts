"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin-audit";
import {
  patchTenant,
  postCreateTenant,
  postMaintenanceOn,
  postMaintenanceOff,
  postJobRetry,
  postCreateApiKey,
  postRevokeApiKey,
  postUploadTenantCertificate,
  deleteTenantCertificate,
  patchTenantWebhook,
  patchTenantEmailPrefs,
  SimplefactuAdminError,
} from "@/lib/simplefactu/admin-server";
import { BFF_KEY_SCOPES } from "@/lib/verifactu/provision";

export type ActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  plainKey?: string;
  tenantId?: string;
} | null;

/**
 * Create a brand-new tenant from the admin UI. Used to onboard external
 * integrators that talk to the simplefactu API directly (server-to-server)
 * without going through the Clerk-based auto-provisioning flow.
 *
 * Required: id (stable identifier, must be path-traversal-safe).
 * Optional: name, planId, notificationEmail (reference only — source is forced
 * to API so no tenant-facing Resend welcome / worker emails are sent).
 */
export async function adminCreateTenantAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const id = formData.get("id")?.toString()?.trim() ?? "";
  const name = formData.get("name")?.toString()?.trim() ?? "";
  const planIdRaw = formData.get("planId")?.toString()?.trim() ?? "free";
  const notificationEmail = formData.get("notificationEmail")?.toString()?.trim() ?? "";
  const parentTenantId = formData.get("parentTenantId")?.toString()?.trim() ?? "";
  const allowedNif = formData.get("allowedNif")?.toString()?.trim() ?? "";

  if (!id) return { ok: false, error: "Falta el identificador del tenant." };
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return {
      ok: false,
      error:
        "El id solo puede contener letras, números, guiones y guiones bajos (sin espacios ni caracteres especiales).",
    };
  }
  const plans = ["free", "pro", "enterprise"];
  if (!plans.includes(planIdRaw)) {
    return { ok: false, error: `planId debe ser uno de: ${plans.join(", ")}` };
  }

  try {
    const body: {
      id: string;
      name?: string;
      planId: "free" | "pro" | "enterprise";
      notificationEmail?: string;
      source: "API";
      parentTenantId?: string;
      allowedNif?: string;
    } = {
      id,
      planId: planIdRaw as "free" | "pro" | "enterprise",
      source: "API",
    };
    if (name) body.name = name;
    if (notificationEmail) body.notificationEmail = notificationEmail;
    if (parentTenantId) body.parentTenantId = parentTenantId;
    if (allowedNif) body.allowedNif = allowedNif;

    await postCreateTenant(body);
    await logAdminAction({
      userId,
      action: "tenant.create",
      target: id,
      metadata: { name, planId: planIdRaw, hasEmail: Boolean(notificationEmail), parentTenantId: parentTenantId || null, allowedNif: allowedNif || null },
    });
    revalidatePath("/admin/tenants");
    return {
      ok: true,
      message: `Tenant "${id}" creado.`,
      tenantId: id,
    };
  } catch (e: unknown) {
    if (e instanceof SimplefactuAdminError && e.status === 409) {
      return { ok: false, error: `Ya existe un tenant con id "${id}".` };
    }
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminPatchTenantAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  const name = formData.get("name")?.toString()?.trim() ?? "";
  const planId = formData.get("planId")?.toString()?.trim() ?? "";
  const status = formData.get("status")?.toString()?.trim() ?? "";
  // allowedNif: empty string means "clear the restriction" (send null); absent means "don't touch"
  const allowedNifRaw = formData.get("allowedNif");
  try {
    const body: { name?: string; planId?: string; status?: string; allowedNif?: string | null } = {};
    if (name !== "") body.name = name;
    if (planId) body.planId = planId;
    if (status) body.status = status;
    if (allowedNifRaw !== null) {
      body.allowedNif = allowedNifRaw.toString().trim() || null;
    }
    await patchTenant(tenantId, body);
    await logAdminAction({
      userId,
      action: "tenant.patch",
      target: tenantId,
      metadata: { body },
    });
    revalidatePath("/admin/tenants");
    revalidatePath(`/admin/tenants/${tenantId}`);
    return { ok: true, message: "Tenant actualizado." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminMaintenanceOnAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  try {
    await postMaintenanceOn(tenantId);
    await logAdminAction({ userId, action: "tenant.maintenance_on", target: tenantId });
    revalidatePath("/admin/tenants");
    revalidatePath(`/admin/tenants/${tenantId}`);
    return { ok: true, message: "Maintenance activado." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminMaintenanceOffAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  try {
    await postMaintenanceOff(tenantId);
    await logAdminAction({ userId, action: "tenant.maintenance_off", target: tenantId });
    revalidatePath("/admin/tenants");
    revalidatePath(`/admin/tenants/${tenantId}`);
    return { ok: true, message: "Maintenance desactivado." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminRetryJobAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const jobId = formData.get("jobId")?.toString()?.trim() ?? "";
  const force = formData.get("force") === "true";
  if (!jobId) return { ok: false, error: "Job ID requerido" };
  try {
    const r = await postJobRetry(jobId, force);
    await logAdminAction({ userId, action: force ? "job.retry.force" : "job.retry", target: jobId });
    revalidatePath("/admin/jobs");
    revalidatePath("/admin/support");
    revalidatePath(`/admin/jobs/${encodeURIComponent(jobId)}`);
    return { ok: true, message: r.message ?? "Job encolado de nuevo." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminRevokeApiKeyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const keyId = formData.get("keyId")?.toString()?.trim();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!keyId || !tenantId) return { ok: false, error: "Faltan datos" };
  try {
    await postRevokeApiKey(keyId);
    await logAdminAction({
      userId,
      action: "api_key.revoke",
      target: keyId,
      metadata: { tenantId },
    });
    revalidatePath(`/admin/tenants/${encodeURIComponent(tenantId)}`);
    return { ok: true, message: "Clave revocada." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminCreateApiKeyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  const name = formData.get("keyName")?.toString()?.trim() || "admin-panel";
  try {
    const r = await postCreateApiKey({
      tenantId,
      name,
      scopes: [...BFF_KEY_SCOPES],
    });
    const plain = r.apiKey?.key;
    await logAdminAction({
      userId,
      action: "api_key.create",
      target: tenantId,
      metadata: { keyId: r.apiKey?.id, name },
    });
    revalidatePath(`/admin/tenants/${encodeURIComponent(tenantId)}`);
    return {
      ok: true,
      message: plain ? undefined : "Clave creada.",
      plainKey: plain,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminUploadCertificateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  const passphrase = formData.get("pfxPassphrase")?.toString() ?? "";
  const file = formData.get("pfx");
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  if (!passphrase.trim()) return { ok: false, error: "Contraseña requerida" };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona un archivo .pfx" };
  }
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const pfxBase64 = buf.toString("base64");
    await postUploadTenantCertificate({
      tenantId,
      pfxBase64,
      pfxPassphrase: passphrase,
    });
    await logAdminAction({ userId, action: "certificate.upload", target: tenantId });
    revalidatePath(`/admin/tenants/${encodeURIComponent(tenantId)}`);
    return { ok: true, message: "Certificado actualizado." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminPatchWebhookAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  const webhookUrl = formData.get("webhookUrl")?.toString()?.trim() || null;
  const webhookSecret = formData.get("webhookSecret")?.toString()?.trim() || undefined;
  try {
    const body: { webhookUrl?: string | null; webhookSecret?: string | null } = { webhookUrl };
    if (webhookSecret !== undefined) body.webhookSecret = webhookSecret || null;
    await patchTenantWebhook(tenantId, body);
    await logAdminAction({ userId, action: "tenant.webhook.patch", target: tenantId, metadata: { hasUrl: Boolean(webhookUrl) } });
    revalidatePath(`/admin/tenants/${encodeURIComponent(tenantId)}`);
    return { ok: true, message: webhookUrl ? "Webhook configurado." : "Webhook eliminado." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminPatchEmailPrefsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  const notificationEmail = formData.get("notificationEmail")?.toString()?.trim() || null;
  const notifyOnDeadJobs = formData.get("notifyOnDeadJobs") === "on";
  const notifyOnCertExpiry = formData.get("notifyOnCertExpiry") === "on";
  try {
    await patchTenantEmailPrefs(tenantId, { notificationEmail, notifyOnDeadJobs, notifyOnCertExpiry });
    await logAdminAction({ userId, action: "tenant.email_prefs.patch", target: tenantId });
    revalidatePath(`/admin/tenants/${encodeURIComponent(tenantId)}`);
    return { ok: true, message: "Preferencias de notificación actualizadas." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminDeleteCertificateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  const confirm = formData.get("confirm")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  if (confirm !== "DELETE") {
    return { ok: false, error: "Escribe DELETE para confirmar." };
  }
  try {
    await deleteTenantCertificate(tenantId);
    await logAdminAction({ userId, action: "certificate.delete", target: tenantId });
    revalidatePath(`/admin/tenants/${encodeURIComponent(tenantId)}`);
    return { ok: true, message: "Certificado eliminado en simplefactu." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}
