import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  getSandboxUrl,
  getUserAccountType,
  isPendingIntegrator,
  isSandboxAutoApproveIntegrators,
} from "@/lib/auth/account-type";
import { isUserPartner } from "@/lib/auth/partner";
import { ActivationRequestForm } from "./ActivationRequestForm";

export const dynamic = "force-dynamic";

export default async function PartnerActivationPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  if (await isUserPartner(userId)) {
    redirect("/partner");
  }

  const accountType = await getUserAccountType(userId);
  if (accountType !== "integrator" && !(await isPendingIntegrator(userId))) {
    // Autónomos or unset → welcome / invoices, not this page.
    if (!accountType) redirect("/welcome");
    redirect("/invoices");
  }

  if (isSandboxAutoApproveIntegrators()) {
    // Should already have partner role; if not, send them to welcome to retry.
    redirect("/welcome");
  }

  const sandboxUrl = getSandboxUrl();
  const user = await currentUser();
  const defaultEmail =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    "";

  const latestRequest = await prisma.activationRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const pending = latestRequest?.status === "PENDING";
  const rejected = latestRequest?.status === "REJECTED";

  return (
    <div className="mx-auto max-w-2xl space-y-8 font-display">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Integrador API</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-fg">
          Primero sandbox, luego producción
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-fg-muted font-sans">
          La API de producción queda desactivada hasta que apruebemos tu solicitud.
          Prueba tu integración en el entorno QA (mismos endpoints, AEAT preproducción)
          y, cuando esté lista, pídenos la activación aquí.
        </p>
      </div>

      <div className="rounded-2xl border border-accent/30 bg-accent-muted/40 p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-fg">1. Prueba en sandbox</h2>
        <p className="mt-2 text-sm text-fg-muted font-sans font-medium">
          Regístrate en QA (Clerk y datos separados de producción) y elige de nuevo
          «integrador» — allí el acceso a la consola se otorga al instante.
        </p>
        <a
          href={`${sandboxUrl}/sign-up`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-4 inline-flex"
        >
          Ir a {sandboxUrl.replace(/^https?:\/\//, "")} →
        </a>
        <p className="mt-3 text-xs text-fg-subtle font-sans">
          Documentación:{" "}
          <Link href="/docs" className="link-accent font-semibold">
            /docs
          </Link>
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-fg">2. Solicitar producción</h2>

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

        {!pending ? <ActivationRequestForm defaultEmail={defaultEmail} /> : null}
      </div>
    </div>
  );
}
