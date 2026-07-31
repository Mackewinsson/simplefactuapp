import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { requireAppUser } from "@/lib/auth/app-user";
import { VerifactuSettingsForm } from "./VerifactuSettingsForm";

export const dynamic = "force-dynamic";

export default async function VerifactuSettingsPage() {
  const { sessionUserId, userId } = await requireAppUser();

  let account = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
  let provisionError: string | null = null;
  if (!account) {
    try {
      await ensureVerifactuApiKey(sessionUserId);
      account = await prisma.userVerifactuAccount.findUnique({ where: { userId } });
    } catch (e) {
      provisionError = formatVerifactuActionError(e);
    }
  }

  let remoteHasCertificate: boolean | null = null;
  let remoteUpdatedAt: string | null = null;
  let certNotAfter: string | null = null;
  let certDaysUntilExpiry: number | null = null;
  let certExpiresWithin30Days = false;
  let certNif: string | null = null;
  try {
    const { apiKey } = await ensureVerifactuApiKey(sessionUserId);
    const client = createSimplefactuClient({
      baseUrl: getSimplefactuBaseUrl(),
      apiKey,
    });
    const res = await client.getMeCertificate();
    if (res.ok) {
      const j = (await res.json()) as {
        hasCertificate?: boolean;
        updatedAt?: string;
        certificate?: {
          notAfter?: string;
          daysUntilExpiry?: number;
          expiresWithin30Days?: boolean;
          nif?: string;
        };
      };
      remoteHasCertificate = Boolean(j.hasCertificate);
      remoteUpdatedAt = j.updatedAt ?? null;
      certNotAfter = j.certificate?.notAfter ?? null;
      certDaysUntilExpiry = j.certificate?.daysUntilExpiry ?? null;
      certExpiresWithin30Days = Boolean(j.certificate?.expiresWithin30Days);
      certNif = j.certificate?.nif ?? null;

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
        <h1 className="mb-2 text-2xl font-semibold">Veri*Factu (AEAT)</h1>
        <div className="rounded border border-warning-outline bg-warning p-4 text-sm text-warning-deeper">
          <p className="font-medium">No se pudo preparar tu cuenta de Veri*Factu</p>
          <p className="mt-2 text-warning-foreground">{provisionError ?? "Intenta de nuevo cuando el API esté disponible."}</p>
          <p className="mt-3 text-warning-deep">
            Comprueba que el servicio de registro Veri*Factu está disponible y vuelve a cargar esta página. Si el
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
      <h1 className="mb-8 text-2xl font-semibold">Veri*Factu (AEAT)</h1>
      <VerifactuSettingsForm
        initialIssuerNif={account.issuerNif ?? ""}
        initialIssuerLegalName={account.issuerLegalName ?? ""}
        certUploadedAt={account.certificateUploadedAt ?? null}
        remoteHasCertificate={remoteHasCertificate}
        remoteUpdatedAt={remoteUpdatedAt}
        certNotAfter={certNotAfter}
        certDaysUntilExpiry={certDaysUntilExpiry}
        certExpiresWithin30Days={certExpiresWithin30Days}
        certNif={certNif}
      />
    </div>
  );
}
