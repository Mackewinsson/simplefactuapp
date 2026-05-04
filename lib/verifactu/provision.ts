import { prisma } from "@/lib/prisma";
import { encryptSecret, decryptSecret } from "@/lib/verifactu/crypto";
import { getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { adminFetch } from "@/lib/simplefactu/admin-server";

/** Scopes for app-provisioned API keys (also used when creating keys from the admin panel). */
export const BFF_KEY_SCOPES = [
  "invoices:write",
  "invoices:read",
  "nif:read",
  "tenant:certificates:read",
  "tenant:certificates:write",
] as const;

function tenantIdForUser(userId: string): string {
  if (userId.includes("/") || userId.includes("\\") || userId.includes("..")) {
    throw new Error("Identificador de usuario no válido para el mapeo de tenant");
  }
  return `sf_${userId}`;
}

/**
 * Provisions a fresh tenant + API key on simplefactu and returns the plain key.
 * Does NOT touch the local DB row — the caller decides whether to insert or rotate.
 */
async function provisionTenantAndKey(
  userId: string,
  preferredTenantId?: string
): Promise<{ tenantId: string; plainKey: string }> {
  const tenantId = preferredTenantId ?? tenantIdForUser(userId);

  const tenantRes = await adminFetch("/admin/tenants", {
    method: "POST",
    body: JSON.stringify({
      id: tenantId,
      name: `App user ${userId}`,
      planId: "free",
    }),
  });

  if (tenantRes.status !== 201 && tenantRes.status !== 409) {
    const t = await tenantRes.text();
    throw new Error(`simplefactu POST /admin/tenants falló: ${tenantRes.status} ${t}`);
  }

  const keyRes = await adminFetch("/admin/api-keys", {
    method: "POST",
    body: JSON.stringify({
      tenantId,
      name: "bff-user-key",
      scopes: [...BFF_KEY_SCOPES],
    }),
  });

  if (keyRes.status !== 201) {
    const t = await keyRes.text();
    throw new Error(`simplefactu POST /admin/api-keys falló: ${keyRes.status} ${t}`);
  }

  const body = (await keyRes.json()) as { apiKey?: { key?: string } };
  const plainKey = body.apiKey?.key;
  if (!plainKey) {
    throw new Error("simplefactu no devolvió la API key");
  }

  return { tenantId, plainKey };
}

/**
 * Ensures a DB row with encrypted API key; creates tenant + key on simplefactu when missing
 * or when the existing key is genuinely revoked (401). The user-managed issuer profile
 * (issuerNif, issuerLegalName) is preserved across key rotations and is NEVER wiped just
 * because the upstream API is briefly unreachable.
 */
export async function ensureVerifactuApiKey(userId: string): Promise<{ apiKey: string; tenantId: string }> {
  const existing = await prisma.userVerifactuAccount.findUnique({ where: { userId } });

  if (existing) {
    const candidateKey = decryptSecret(existing.apiKeyEncrypted);

    // Probe the API to detect a revoked key. We treat ONLY a definitive 401 as
    // "stale". Network errors, timeouts, 5xx, etc. must not trigger a rotation —
    // wiping the row in those cases would lose issuer profile and certificate
    // metadata just because the upstream is briefly down.
    const probe = await fetch(
      `${getSimplefactuBaseUrl().replace(/\/$/, "")}/jobs/__probe_nonexistent__`,
      { headers: { "x-api-key": candidateKey } }
    ).catch(() => null);

    if (!probe || probe.status !== 401) {
      return { tenantId: existing.simplefactuTenantId, apiKey: candidateKey };
    }

    // 401 → rotate the key in place. Reuse the existing tenantId so the URL/QR
    // chain on stored invoices keeps working, and preserve issuer fields.
    // certificateUploadedAt is cleared because the new tenant has no certificate.
    const { tenantId, plainKey } = await provisionTenantAndKey(
      userId,
      existing.simplefactuTenantId
    );
    await prisma.userVerifactuAccount.update({
      where: { userId },
      data: {
        simplefactuTenantId: tenantId,
        apiKeyEncrypted: encryptSecret(plainKey),
        certificateUploadedAt: null,
      },
    });
    return { tenantId, apiKey: plainKey };
  }

  // No row yet → first-time provisioning.
  const { tenantId, plainKey } = await provisionTenantAndKey(userId);
  try {
    await prisma.userVerifactuAccount.create({
      data: {
        userId,
        simplefactuTenantId: tenantId,
        apiKeyEncrypted: encryptSecret(plainKey),
      },
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      // Race: another request created the row first. Return its key.
      const row = await prisma.userVerifactuAccount.findUniqueOrThrow({ where: { userId } });
      return { tenantId: row.simplefactuTenantId, apiKey: decryptSecret(row.apiKeyEncrypted) };
    }
    throw e;
  }

  return { tenantId, apiKey: plainKey };
}
