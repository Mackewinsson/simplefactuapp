"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  patchTenant,
  postMaintenanceOn,
  postMaintenanceOff,
  postJobRetry,
} from "@/lib/simplefactu/admin-server";

export type ActionState = { ok: boolean; error?: string; message?: string } | null;

export async function adminPatchTenantAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  const name = formData.get("name")?.toString()?.trim() ?? "";
  const planId = formData.get("planId")?.toString()?.trim() ?? "";
  const status = formData.get("status")?.toString()?.trim() ?? "";
  try {
    const body: { name?: string; planId?: string; status?: string } = {};
    if (name !== "") body.name = name;
    if (planId) body.planId = planId;
    if (status) body.status = status;
    await patchTenant(tenantId, body);
    revalidatePath("/admin/tenants");
    revalidatePath(`/admin/tenants/${tenantId}`);
    return { ok: true, message: "Tenant actualizado." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminMaintenanceOnAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  try {
    await postMaintenanceOn(tenantId);
    revalidatePath("/admin/tenants");
    revalidatePath(`/admin/tenants/${tenantId}`);
    return { ok: true, message: "Maintenance activado." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminMaintenanceOffAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const tenantId = formData.get("tenantId")?.toString()?.trim();
  if (!tenantId) return { ok: false, error: "Falta tenantId" };
  try {
    await postMaintenanceOff(tenantId);
    revalidatePath("/admin/tenants");
    revalidatePath(`/admin/tenants/${tenantId}`);
    return { ok: true, message: "Maintenance desactivado." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}

export async function adminRetryJobAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const jobId = formData.get("jobId")?.toString()?.trim() ?? "";
  if (!jobId) return { ok: false, error: "Job ID requerido" };
  try {
    const r = await postJobRetry(jobId);
    revalidatePath("/admin/jobs");
    revalidatePath("/admin/support");
    return { ok: true, message: r.message ?? "Job encolado de nuevo." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return { ok: false, error: msg };
  }
}
