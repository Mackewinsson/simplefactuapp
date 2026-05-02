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
    throw new Error("Invalid user id for tenant mapping");
  }
  return `sf_${userId}`;
}

/**
 * Ensures a DB row with encrypted API key; creates tenant + key on simplefactu when missing.
 */
export async function ensureVerifactuApiKey(userId: string): Promise<{ apiKey: string; tenantId: string }> {
  const existing = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
  if (existing) {
    const candidateKey = decryptSecret(existing.apiKeyEncrypted);
    // Verify the key is still valid in simplefactu (may have been lost if DB was reset).
    const probe = await fetch(
      `${getSimplefactuBaseUrl().replace(/\/$/, "")}/jobs/__probe_nonexistent__`,
      { headers: { "x-api-key": candidateKey } }
    ).catch(() => null);
    // 401 → stale key; anything else (404, 200, 5xx) → key is recognised, continue.
    if (probe && probe.status !== 401) {
      return { tenantId: existing.simplefactuTenantId, apiKey: candidateKey };
    }
    // Key is stale — delete the Neon row and fall through to re-provision.
    await prisma.userVerifactuAccount.delete({ where: { userId } });
  }

  const tenantId = tenantIdForUser(userId);

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
    throw new Error(`simplefactu POST /admin/tenants failed: ${tenantRes.status} ${t}`);
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
    throw new Error(`simplefactu POST /admin/api-keys failed: ${keyRes.status} ${t}`);
  }

  const body = (await keyRes.json()) as {
    apiKey?: { key?: string };
  };
  const plainKey = body.apiKey?.key;
  if (!plainKey) {
    throw new Error("simplefactu did not return api key");
  }

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
      const row = await prisma.userVerifactuAccount.findUniqueOrThrow({ where: { userId } });
      return { tenantId: row.simplefactuTenantId, apiKey: decryptSecret(row.apiKeyEncrypted) };
    }
    throw e;
  }

  return { tenantId, apiKey: plainKey };
}
