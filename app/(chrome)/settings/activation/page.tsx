import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserAccountType, isPendingIntegrator } from "@/lib/auth/account-type";
import {
  getLatestActivationRequest,
  isSandboxAutoApproveActivation,
} from "@/lib/verifactu/activation";
import { AutonomoActivationForm } from "./AutonomoActivationForm";

export const dynamic = "force-dynamic";

export default async function SettingsActivationPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  if (await isPendingIntegrator(userId)) {
    redirect("/partner/activation");
  }
  const accountType = await getUserAccountType(userId);
  if (accountType === "integrator") {
    redirect("/partner/activation");
  }

  const user = await currentUser();
  const defaultEmail =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    "";

  const [account, latestRequest] = await Promise.all([
    prisma.userVerifactuAccount.findUnique({
      where: { userId },
      select: { issuerNif: true, issuerLegalName: true },
    }),
    getLatestActivationRequest(userId, "AUTONOMO"),
  ]);

  const pending = latestRequest?.status === "PENDING";
  const approved = latestRequest?.status === "APPROVED";
  const rejected = latestRequest?.status === "REJECTED";
  const sandbox = isSandboxAutoApproveActivation();

  return (
    <div className="mx-auto max-w-2xl space-y-8 font-display">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Cuenta</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-fg">
          Activación de cuenta
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-fg-muted font-sans">
          El envío de facturas a AEAT permanece desactivado hasta que aprobemos tu solicitud.
          Completa antes el emisor y el certificado en{" "}
          <Link href="/settings/verifactu" className="link-accent font-semibold">
            Ajustes Veri*Factu
          </Link>
          .
        </p>
      </div>

      {sandbox ? (
        <div
          role="status"
          className="rounded-2xl border border-success-outline/60 bg-success/30 px-5 py-4 text-sm"
        >
          <p className="font-bold text-success-foreground font-display">
            Entorno sandbox / QA
          </p>
          <p className="mt-1 text-fg-muted font-sans font-medium">
            En este entorno la activación se otorga automáticamente; puedes enviar facturas sin
            solicitud.
          </p>
        </div>
      ) : null}

      {approved && latestRequest ? (
        <div
          role="status"
          className="rounded-2xl border border-success-outline/60 bg-success/40 px-5 py-4 text-sm"
        >
          <p className="font-bold text-success-foreground font-display">Cuenta activada</p>
          <p className="mt-1 text-fg-muted font-sans font-medium">
            Ya puedes enviar facturas a Veri*Factu / AEAT.
          </p>
          <Link href="/invoices/new" className="btn btn-primary mt-4 inline-flex">
            Nueva factura
          </Link>
        </div>
      ) : null}

      {pending && latestRequest ? (
        <div
          role="status"
          className="rounded-2xl border border-outline-soft bg-surface-muted/60 px-5 py-4 text-sm"
        >
          <p className="font-bold text-fg font-display">Solicitud pendiente de revisión</p>
          <p className="mt-1 text-fg-muted font-sans font-medium">
            Enviada el{" "}
            {new Date(latestRequest.createdAt).toLocaleString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            . Te avisaremos por email ({latestRequest.email}).
          </p>
        </div>
      ) : null}

      {rejected && latestRequest ? (
        <div
          role="status"
          className="rounded-2xl border border-warning-outline/60 bg-warning/40 px-5 py-4 text-sm"
        >
          <p className="font-bold text-warning-foreground font-display">
            Solicitud anterior rechazada
          </p>
          {latestRequest.decisionNote ? (
            <p className="mt-1 text-fg-muted font-sans font-medium whitespace-pre-wrap">
              {latestRequest.decisionNote}
            </p>
          ) : (
            <p className="mt-1 text-fg-muted font-sans font-medium">
              Puedes corregir detalles y volver a solicitarla.
            </p>
          )}
        </div>
      ) : null}

      {!sandbox && !pending && !approved ? (
        <AutonomoActivationForm
          defaultEmail={defaultEmail}
          defaultCompanyName={account?.issuerLegalName ?? ""}
          defaultNif={account?.issuerNif ?? ""}
        />
      ) : null}

      <p className="text-sm text-fg-muted font-sans">
        <Link href="/onboarding" className="link-accent font-semibold">
          Volver a la guía de configuración
        </Link>
      </p>
    </div>
  );
}
