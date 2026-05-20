import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { VerifactuSettingsForm } from "./VerifactuSettingsForm";

export const dynamic = "force-dynamic";

export default async function VerifactuSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let account = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
  let provisionError: string | null = null;
  if (!account) {
    try {
      await ensureVerifactuApiKey(userId);
      account = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
    } catch (e) {
      provisionError = formatVerifactuActionError(e);
    }
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

  if (!account) {
    return (
      <div>
        <div className="mb-6">
          <Link href="/invoices" className="text-sm text-fg-muted hover:text-fg">
            ← Volver
          </Link>
        </div>
        <h1 className="mb-2 text-2xl font-semibold">Verifactu (AEAT)</h1>
        <div className="rounded border border-warning-outline bg-warning p-4 text-sm text-warning-deeper">
          <p className="font-medium">No se pudo preparar tu cuenta de Verifactu</p>
          <p className="mt-2 text-warning-foreground">{provisionError ?? "Intenta de nuevo cuando el API esté disponible."}</p>
          <p className="mt-3 text-warning-deep">
            Comprueba que el servicio de registro Verifactu está disponible y vuelve a cargar esta página. Si el
            problema continúa, contacta con soporte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/invoices" className="text-sm text-fg-muted hover:text-fg">
          ← Volver
        </Link>
      </div>
      <h1 className="mb-8 text-2xl font-semibold">Verifactu (AEAT)</h1>
      <VerifactuSettingsForm
        initialIssuerNif={account.issuerNif ?? ""}
        initialIssuerLegalName={account.issuerLegalName ?? ""}
        certUploadedAt={account.certificateUploadedAt ?? null}
        remoteHasCertificate={remoteHasCertificate}
        remoteUpdatedAt={remoteUpdatedAt}
      />
    </div>
  );
}
