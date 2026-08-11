import Link from "next/link";
import { requirePartner } from "@/lib/auth/partner";
import { getPartnerOnboardingStatus } from "@/lib/partner/onboarding-status";
import { getSimplefactuBaseUrlForDocs } from "@/lib/simplefactu/client";
import { AddNifModalButton } from "@/app/(chrome)/partner/AddNifModal";
import { PartnerHierarchyTree } from "@/app/(chrome)/partner/PartnerHierarchyTree";
import { OnboardingSteps } from "./OnboardingSteps";

export const dynamic = "force-dynamic";

export default async function PartnerOnboardingPage() {
  const { userId } = await requirePartner();

  let err: string | null = null;
  let status: Awaited<ReturnType<typeof getPartnerOnboardingStatus>> | null = null;
  try {
    status = await getPartnerOnboardingStatus(userId);
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "No se pudo cargar el estado de onboarding";
  }

  let apiBaseUrl = process.env.NEXT_PUBLIC_SIMPLEFACTU_API_BASE_URL?.trim() || "";
  if (!apiBaseUrl) {
    try {
      apiBaseUrl = getSimplefactuBaseUrlForDocs();
    } catch {
      apiBaseUrl = "https://api.qa.simplefactu.com/v1";
    }
  }

  const hasSubtenant = Boolean(status?.hasSubtenant);
  const complete = Boolean(status?.complete);

  const subtitle = !hasSubtenant
    ? "Configura tu primer NIF emisor. Cuando lo registres, el árbol pasará al centro y la guía seguirá debajo."
    : !complete
      ? "Tu primer NIF ya está en el árbol. Termina su configuración con los pasos de abajo."
      : "Integración completa. Los siguientes NIFs se dan de alta desde el modal con los mismos pasos.";

  return (
    <div className="space-y-8 font-display">
      <div className={hasSubtenant ? "max-w-4xl" : "max-w-3xl"}>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Guía de inicio</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-fg sm:text-[2rem]">
          El árbol crece contigo
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-fg-muted font-sans">
          {subtitle}
        </p>
      </div>

      {err ? (
        <p className="rounded-xl border border-danger-outline/50 bg-danger/80 px-4 py-3 text-sm text-danger-foreground font-semibold">
          {err}
        </p>
      ) : null}

      {/* Estado 1 — sin NIFs: guía en 2 columnas con árbol lateral */}
      {status && !hasSubtenant ? (
        <div className="grid gap-8 lg:grid-cols-5 items-start">
          <div className="lg:col-span-3 space-y-4 animate-fade-in-up">
            <OnboardingSteps status={status} apiBaseUrl={apiBaseUrl} />
            <ConsoleEscapeLink />
          </div>

          <aside
            className="lg:col-span-2 lg:sticky lg:top-24 space-y-3 order-first lg:order-none animate-fade-in-up"
            style={{ animationDelay: "120ms" }}
          >
            <TreeSection partnerId={status.partnerId} subtenants={status.subtenants} />
          </aside>
        </div>
      ) : null}

      {/* Estado 2 — primer NIF a medias: árbol al centro, pasos debajo */}
      {status && hasSubtenant && !complete ? (
        <div className="space-y-10 animate-fade-in-up">
          <TreeSection partnerId={status.partnerId} subtenants={status.subtenants} />

          <section className="max-w-3xl space-y-4 border-t border-outline-soft/60 pt-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-accent">
                Siguientes pasos
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-fg">
                Termina la configuración del primer NIF
              </h2>
            </div>
            <OnboardingSteps status={status} apiBaseUrl={apiBaseUrl} />
            <ConsoleEscapeLink />
          </section>
        </div>
      ) : null}

      {/* Estado 3 — integración completa: árbol al centro, altas siguientes en modal */}
      {status && complete ? (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-success-outline/40 bg-success/25 px-4 py-3.5">
            <div>
              <p className="text-sm font-extrabold text-success-foreground font-display">
                Integración lista
              </p>
              <p className="mt-0.5 text-xs text-fg-muted font-medium font-sans">
                NIF emisor con certificado y envío AEAT correcto. Da de alta los demás desde aquí.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AddNifModalButton size="sm" />
              <Link href="/partner" className="btn btn-sm btn-secondary">
                Ir a la consola →
              </Link>
            </div>
          </div>

          <TreeSection partnerId={status.partnerId} subtenants={status.subtenants} />
        </div>
      ) : null}
    </div>
  );
}

function TreeSection({
  partnerId,
  subtenants,
}: {
  partnerId: string;
  subtenants: React.ComponentProps<typeof PartnerHierarchyTree>["subtenants"];
}) {
  return (
    <section className="space-y-3">
      <p className="text-[11px] font-black uppercase tracking-wider text-fg-subtle px-1">
        Jerarquía en vivo
      </p>
      <PartnerHierarchyTree partnerId={partnerId} subtenants={subtenants} />
      <p className="text-[11px] text-fg-subtle font-medium px-1 font-sans leading-relaxed max-w-3xl">
        Con el PFX el nodo pasa a verde. Sin certificado verás el aviso naranja.
      </p>
    </section>
  );
}

function ConsoleEscapeLink() {
  return (
    <p className="text-xs text-fg-subtle font-sans">
      ¿Prefieres la consola libre?{" "}
      <Link href="/partner" className="font-bold text-accent hover:underline">
        Ir al resumen
      </Link>
    </p>
  );
}
