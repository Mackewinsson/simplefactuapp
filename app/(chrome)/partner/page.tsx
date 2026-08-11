import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePartner } from "@/lib/auth/partner";
import { getPartnerOnboardingStatus } from "@/lib/partner/onboarding-status";
import { listPartnerSubtenants } from "@/lib/simplefactu/partner-server";
import { AddNifModalButton } from "@/app/(chrome)/partner/AddNifModal";
import { PartnerHierarchyTree } from "@/app/(chrome)/partner/PartnerHierarchyTree";
import { PartnerOnboardingBanner } from "@/app/(chrome)/partner/PartnerOnboardingBanner";

export default async function PartnerHomePage() {
  const { userId } = await requirePartner();
  const partnerId = `rp_${userId}`;

  let err: string | null = null;
  let subtenants: Awaited<ReturnType<typeof listPartnerSubtenants>> = [];
  try {
    subtenants = await listPartnerSubtenants(userId);
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "Error al cargar NIFs emisores";
  }

  // Soft redirect: empty console → guided onboarding
  if (!err && subtenants.length === 0) {
    redirect("/partner/onboarding");
  }

  let onboardingIncomplete = false;
  let onboardingCompleted = 0;
  let onboardingTotal = 4;
  try {
    const status = await getPartnerOnboardingStatus(userId);
    onboardingIncomplete = !status.complete;
    onboardingCompleted = status.steps.filter((s) => s.done).length;
    onboardingTotal = status.steps.length;
  } catch {
    // ignore — banner optional
  }

  const active = subtenants.filter((t) => t.status === "ACTIVE");
  const inactive = subtenants.filter((t) => t.status !== "ACTIVE");
  const noCert = subtenants.filter((t) => !t.has_certificate);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {onboardingIncomplete ? (
        <PartnerOnboardingBanner completed={onboardingCompleted} total={onboardingTotal} />
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-fg font-display">
            Consola de integración y gestoría
          </h1>
          <p className="mt-1 text-sm text-fg-muted font-display font-medium">
            NIFs emisores gestionados bajo tu cuenta, certificados digitales y facturación AEAT.
          </p>
        </div>
        <AddNifModalButton />
      </div>

      {err && (
        <p className="rounded-xl border border-danger-outline/50 bg-danger/80 px-4 py-3 text-sm text-danger-foreground font-semibold">
          {err}
        </p>
      )}

      {/* KPI cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="NIFs Emisores Total" value={subtenants.length} delay={0} />
        <KpiCard label="NIFs Activos" value={active.length} accent="success" delay={1} />
        <KpiCard
          label="NIFs Inactivos"
          value={inactive.length}
          accent={inactive.length > 0 ? "warning" : undefined}
          delay={2}
        />
        <KpiCard
          label="Certificado Pendiente"
          value={noCert.length}
          accent={noCert.length > 0 ? "warning" : undefined}
          delay={3}
        />
      </div>

      {/* Visual Hierarchy Tree Map */}
      <PartnerHierarchyTree
        partnerId={partnerId}
        subtenants={subtenants}
      />

      {/* Clients table */}
      {subtenants.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-fg font-display tracking-tight mb-4">
            NIFs Emisores Gestionados ({subtenants.length})
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md shadow-sm overflow-hidden">
            <table className="w-full min-w-[640px] text-left text-sm font-sans">
              <thead className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">ID Empresa</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Nombre / Razón Social</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">NIF Emisor</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Certificado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-soft/40 font-medium">
                {subtenants.map((t) => {
                  const href = `/partner/tenants/${encodeURIComponent(t.id)}`;
                  return (
                    <tr key={t.id} className="group hover:bg-surface-hover/80 transition-colors duration-200">
                      <td className="px-5 py-4">
                        <Link href={href} className="font-mono text-[13px] font-bold text-accent hover:underline">
                          {t.id}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-fg font-extrabold font-display">
                        <Link href={href} className="hover:text-accent transition-colors">
                          {t.name || "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-fg font-mono text-[12px]">{t.allowed_nif || "—"}</td>
                      <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                      <td className="px-5 py-4"><CertBadge hasCert={!!t.has_certificate} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
  delay,
}: {
  label: string;
  value: number;
  accent?: "success" | "danger" | "warning";
  delay: number;
}) {
  const accentText: Record<string, string> = {
    success: "text-success-emphasis",
    danger: "text-danger-emphasis",
    warning: "text-warning-emphasis",
  };
  const valueColor = accent && value > 0 ? accentText[accent] : "text-fg";

  return (
    <div
      className="panel-premium rounded-2xl p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-fg-subtle font-display mb-2">{label}</p>
      <p className={`text-3xl font-extrabold font-display tracking-tight ${valueColor}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
        isActive
          ? "text-success-foreground bg-success/60 border border-success-outline/25"
          : "text-fg-subtle bg-surface-muted border border-outline-soft/60"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-success-emphasis" : "bg-fg-subtle/40"}`} />
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}

function CertBadge({ hasCert }: { hasCert: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
        hasCert
          ? "text-success-foreground bg-success/60 border border-success-outline/25"
          : "text-fg-subtle bg-surface-muted border border-outline-soft/60"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${hasCert ? "bg-success-emphasis" : "bg-fg-subtle/40"}`} />
      {hasCert ? "Sí" : "Pendiente"}
    </span>
  );
}
