import { prisma } from "@/lib/prisma";
import { adminFetch } from "@/lib/simplefactu/admin-server";
import { encryptSecret, decryptSecret } from "@/lib/verifactu/crypto";
import { getAdminImpersonatedTenant } from "@/lib/auth/admin-impersonate";

export const PARTNER_KEY_SCOPES = ["partner:tenants:read", "partner:tenants:write"] as const;

function partnerTenantIdForUser(userId: string): string {
  if (userId.includes("/") || userId.includes("\\") || userId.includes("..")) {
    throw new Error("Identificador de usuario no válido para el tenant de gestoría");
  }
  return `rp_${userId}`;
}

async function provisionPartnerTenantAndKey(userId: string): Promise<{
  partnerTenantId: string;
  plainKey: string;
}> {
  const partnerTenantId = partnerTenantIdForUser(userId);

  const tenantRes = await adminFetch("/admin/tenants", {
    method: "POST",
    body: JSON.stringify({
      id: partnerTenantId,
      name: `Gestoría ${userId.slice(0, 8)}`,
      planId: "free",
      source: "PARTNER",
    }),
  });

  if (tenantRes.status === 401) {
    throw new Error(
      "simplefactu rechazó la clave de administración (401). SIMPLEFACTU_ADMIN_KEY debe coincidir con ADMIN_KEY del API."
    );
  }
  if (tenantRes.status !== 201 && tenantRes.status !== 409) {
    const t = await tenantRes.text();
    throw new Error(`simplefactu POST /admin/tenants (partner) falló: ${tenantRes.status} ${t}`);
  }

  const keyRes = await adminFetch("/admin/api-keys", {
    method: "POST",
    body: JSON.stringify({
      tenantId: partnerTenantId,
      name: "Partner UI",
      scopes: [...PARTNER_KEY_SCOPES],
    }),
  });

  if (!keyRes.ok) {
    const t = await keyRes.text();
    throw new Error(`simplefactu POST /admin/api-keys (partner) falló: ${keyRes.status} ${t}`);
  }

  const keyJson = (await keyRes.json()) as { apiKey?: { key?: string } };
  const plainKey = keyJson.apiKey?.key;
  if (!plainKey) {
    throw new Error("simplefactu no devolvió la clave partner en claro");
  }

  return { partnerTenantId, plainKey };
}

/**
 * Returns decrypted partner API key for BFF calls to /partner/*.
 * When an admin is impersonating an `rp_*` tenant, returns that tenant's key
 * (from Neon mapping, or a short-lived admin-minted key).
 */
export async function ensurePartnerApiKey(userId: string): Promise<{
  partnerTenantId: string;
  apiKey: string;
}> {
  const imp = await getAdminImpersonatedTenant(userId);
  if (imp?.tenantId?.startsWith("rp_")) {
    const impTargetId = imp.tenantId;
    const impRow = await prisma.userPartnerAccount.findFirst({
      where: { partnerTenantId: impTargetId },
    });
    if (impRow) {
      return {
        partnerTenantId: impRow.partnerTenantId,
        apiKey: decryptSecret(impRow.apiKeyEncrypted),
      };
    }
    const keyRes = await adminFetch("/admin/api-keys", {
      method: "POST",
      body: JSON.stringify({
        tenantId: impTargetId,
        name: "Admin Impersonation Key",
        scopes: [...PARTNER_KEY_SCOPES],
      }),
    });
    if (keyRes.ok) {
      const keyJson = (await keyRes.json()) as { apiKey?: { key?: string } };
      if (keyJson.apiKey?.key) {
        return { partnerTenantId: impTargetId, apiKey: keyJson.apiKey.key };
      }
    }
    throw new Error(
      `No se pudo obtener API key de partner para impersonar ${impTargetId}`
    );
  }

  const existing = await prisma.userPartnerAccount.findUnique({ where: { userId } });
  if (existing) {
    return {
      partnerTenantId: existing.partnerTenantId,
      apiKey: decryptSecret(existing.apiKeyEncrypted),
    };
  }

  const { partnerTenantId, plainKey } = await provisionPartnerTenantAndKey(userId);

  await prisma.userPartnerAccount.create({
    data: {
      userId,
      partnerTenantId,
      apiKeyEncrypted: encryptSecret(plainKey),
    },
  });

  return { partnerTenantId, apiKey: plainKey };
}
