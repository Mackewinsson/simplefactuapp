import { prisma } from "@/lib/prisma";
import { encryptSecret, decryptSecret } from "@/lib/verifactu/crypto";
import { getSimplefactuBaseUrl } from "@/lib/simplefactu/client";

const BFF_KEY_SCOPES = [
  "invoices:write",
  "invoices:read",
  "tenant:certificates:read",
  "tenant:certificates:write",
] as const;

function tenantIdForUser(userId: string): string {
  if (userId.includes("/") || userId.includes("\\") || userId.includes("..")) {
    throw new Error("Invalid user id for tenant mapping");
  }
  return `sf_${userId}`;
}

async function adminFetch(path: string, init: RequestInit): Promise<Response> {
  const adminKey = process.env.SIMPLEFACTU_ADMIN_KEY?.trim();
  if (!adminKey) {
    throw new Error("SIMPLEFACTU_ADMIN_KEY is not set (server-only tenant provisioning)");
  }
  const base = getSimplefactuBaseUrl();
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
      ...init.headers,
    },
  });
}

/**
 * Ensures a DB row with encrypted API key; creates tenant + key on simplefactu when missing.
 */
export async function ensureVerifactuApiKey(userId: string): Promise<{ apiKey: string; tenantId: string }> {
  const existing = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
  if (existing) {
    return {
      tenantId: existing.simplefactuTenantId,
      apiKey: decryptSecret(existing.apiKeyEncrypted),
    };
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
