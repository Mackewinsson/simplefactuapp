import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { encryptSecret, decryptSecret } from "@/lib/verifactu/crypto";
import { getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { adminFetch } from "@/lib/simplefactu/admin-server";

/**
 * Best-effort lookup of the user's primary email from Clerk. Returns null on
 * any failure (network, missing user) so provisioning can proceed without
 * email — the only consequence is that transactional emails get skipped.
 */
async function lookupClerkEmail(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primary = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    );
    return primary?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
  } catch {
    return null;
  }
}

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
 *
 * @param userId Clerk user id
 * @param preferredTenantId Optional override (used during key rotation to keep the same tenant)
 * @param notificationEmail Optional. Stored on the tenant; the simplefactu API
 *   uses it to send transactional emails (welcome on first creation, first
 *   invoice, dead-job notice). Pass the user's primary Clerk email when known.
 */
async function provisionTenantAndKey(
  userId: string,
  preferredTenantId?: string,
  notificationEmail?: string | null
): Promise<{ tenantId: string; plainKey: string }> {
  const tenantId = preferredTenantId ?? tenantIdForUser(userId);

  const tenantRes = await adminFetch("/admin/tenants", {
    method: "POST",
    body: JSON.stringify({
      id: tenantId,
      name: `App user ${userId}`,
      planId: "free",
      ...(notificationEmail ? { notificationEmail } : {}),
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
    // We don't pass notificationEmail on rotation: the tenant already exists
    // and the API only sets notification_email at creation. Updating it would
    // need a dedicated endpoint, deferred until needed.
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

  // No row yet → first-time provisioning. Look up the user's primary email
  // so the simplefactu API can send a welcome email immediately and so the
  // worker can later send first-invoice / dead-job emails.
  const email = await lookupClerkEmail(userId);
  const { tenantId, plainKey } = await provisionTenantAndKey(userId, undefined, email);
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
