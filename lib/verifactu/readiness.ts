import { prisma } from "@/lib/prisma";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { getEffectiveUserId } from "@/lib/auth/admin-impersonate";

export type VerifactuReadiness = {
  issuerReady: boolean;
  certificateReady: boolean;
  provisionError: string | null;
};

/**
 * Whether the user can send invoices to AEAT (issuer profile + certificate on API).
 * `sessionUserId` is the Clerk session (admin when impersonating).
 */
export async function getVerifactuReadiness(sessionUserId: string): Promise<VerifactuReadiness> {
  const dataUserId = await getEffectiveUserId(sessionUserId);
  const account = await prisma.userVerifactuAccount.findUnique({ where: { userId: dataUserId } });
  const issuerReady = Boolean(account?.issuerNif?.trim() && account?.issuerLegalName?.trim());

  let certificateReady = Boolean(account?.certificateUploadedAt);
  let provisionError: string | null = null;

  try {
    const { apiKey } = await ensureVerifactuApiKey(sessionUserId);
    const client = createSimplefactuClient({
      baseUrl: getSimplefactuBaseUrl(),
      apiKey,
    });
    const res = await client.getMeCertificate();
    if (res.ok) {
      const j = (await res.json()) as { hasCertificate?: boolean };
      certificateReady = Boolean(j.hasCertificate);
    }
  } catch (e) {
    provisionError = formatVerifactuActionError(e);
  }

  return { issuerReady, certificateReady, provisionError };
}
