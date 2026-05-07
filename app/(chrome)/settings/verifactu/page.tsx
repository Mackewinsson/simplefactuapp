import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { VerifactuSettingsForm } from "./VerifactuSettingsForm";

export const dynamic = "force-dynamic";

export default async function VerifactuSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let account = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
  if (!account) {
    await ensureVerifactuApiKey(userId);
    account = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
  }

  let remoteHasCertificate: boolean | null = null;
  let remoteUpdatedAt: string | null = null;
  try {
    const { apiKey } = await ensureVerifactuApiKey(userId);
    const client = createSimplefactuClient({
      baseUrl: getSimplefactuBaseUrl(),
      apiKey,
    });
    const res = await client.getMeCertificate();
    if (res.ok) {
      const j = (await res.json()) as { hasCertificate?: boolean; updatedAt?: string };
      remoteHasCertificate = Boolean(j.hasCertificate);
      remoteUpdatedAt = j.updatedAt ?? null;

      // Self-heal: if the API confirms a certificate but the local timestamp
      // is missing (e.g. wiped by an earlier key rotation), backfill it from
      // the API's updatedAt so the "Última subida" line stops showing "—".
      if (remoteHasCertificate && remoteUpdatedAt && !account?.certificateUploadedAt) {
        const parsed = new Date(remoteUpdatedAt);
        if (!Number.isNaN(parsed.getTime())) {
          account = await prisma.userVerifactuAccount.update({
            where: { userId },
            data: { certificateUploadedAt: parsed },
          });
        }
      }
    }
  } catch {
    remoteHasCertificate = null;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/invoices" className="text-sm text-gray-600 hover:text-gray-900">
          ← Volver
        </Link>
      </div>
      <h1 className="mb-2 text-2xl font-semibold">Verifactu (AEAT)</h1>
      <p className="mb-8 text-sm text-gray-600">
        Tenant en el API:{" "}
        <code className="rounded bg-gray-100 px-1">{account?.simplefactuTenantId}</code>
      </p>
      <VerifactuSettingsForm
        initialIssuerNif={account?.issuerNif ?? ""}
        initialIssuerLegalName={account?.issuerLegalName ?? ""}
        certUploadedAt={account?.certificateUploadedAt ?? null}
        remoteHasCertificate={remoteHasCertificate}
        remoteUpdatedAt={remoteUpdatedAt}
      />
    </div>
  );
}
