import Link from "next/link";
import type { AdminDiagnostics } from "@/lib/simplefactu/admin-server";
import { getSimplefactuApiOrigin, type PublicReadyProbe } from "@/lib/simplefactu/public-health";

type Props = {
  diag: AdminDiagnostics | null;
  ready: PublicReadyProbe;
};

function boolLabel(ok: boolean) {
  return ok ? (
    <span className="text-success-emphasis">Sí</span>
  ) : (
    <span className="text-danger-foreground">No</span>
  );
}

export function AdminOpsAlerts({ diag, ready }: Props) {
  const deadCount = diag?.jobs?.byStatus?.DEAD ?? 0;
  const alerts = diag?.alerts;
  const origin = getSimplefactuApiOrigin();

  return (
    <section className="panel-premium rounded-2xl p-6 sm:col-span-2">
      <h2 className="mb-4 text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2">Operaciones y Alertas</h2>
      <dl className="grid gap-4 text-sm sm:grid-cols-2 font-display">
        <div className="border-b border-outline-soft/30 pb-2">
          <dt className="text-fg-subtle font-semibold">Sonda GET /ready</dt>
          <dd className="mt-1 flex items-center gap-2">
            {boolLabel(ready.ok)}{" "}
            <span className="text-xs text-fg-muted font-mono bg-surface-muted px-1.5 py-0.5 rounded border border-outline-soft/40">
              (HTTP {ready.status || "—"})
            </span>
            <a
              href={`${origin}/ready`}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-accent-muted px-2 py-0.5 text-[11px] font-bold text-accent hover:bg-accent-muted-hover transition-colors"
            >
              Probar ↗
            </a>
          </dd>
          {!ready.ok && ready.errors?.length ? (
            <ul className="mt-2 list-inside list-disc text-xs text-danger-foreground font-semibold bg-danger/40 p-2 rounded-lg border border-danger-outline/40">
              {ready.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="border-b border-outline-soft/30 pb-2">
          <dt className="text-fg-subtle font-semibold">Jobs DEAD (requieren revisión)</dt>
          <dd
            className={`mt-1 font-bold ${deadCount > 0 ? "text-danger-foreground" : "text-fg-muted"}`}
          >
            {deadCount}
            {deadCount > 0 ? (
              <span className="ml-2 font-semibold">
                —{" "}
                <Link href="/admin/jobs?status=DEAD" className="text-accent hover:underline">
                  Ver en jobs
                </Link>
              </span>
            ) : null}
          </dd>
        </div>
        <div className="border-b border-outline-soft/30 pb-2 sm:border-0 sm:pb-0">
          <dt className="text-fg-subtle font-semibold">EMAILS_ENABLED (usuarios)</dt>
          <dd className="mt-1 font-semibold">{boolLabel(Boolean(alerts?.emailsEnabled))}</dd>
        </div>
        <div className="border-b border-outline-soft/30 pb-2 sm:border-0 sm:pb-0">
          <dt className="text-fg-subtle font-semibold">RESEND_API_KEY</dt>
          <dd className="mt-1 font-semibold">{boolLabel(Boolean(alerts?.resendConfigured))}</dd>
        </div>
        <div className="sm:col-span-2 pt-2">
          <dt className="text-fg-subtle font-semibold">Alertas operador (DEAD_JOB_NOTIFY_*)</dt>
          <dd className="mt-1.5 text-fg-muted font-semibold flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg border border-outline-soft bg-surface-muted/40 px-2 py-1 flex items-center gap-1.5">
              Slack: {boolLabel(Boolean(alerts?.deadJobNotify?.slack))}
            </span>
            <span className="rounded-lg border border-outline-soft bg-surface-muted/40 px-2 py-1 flex items-center gap-1.5">
              Discord: {boolLabel(Boolean(alerts?.deadJobNotify?.discord))}
            </span>
            <span className="rounded-lg border border-outline-soft bg-surface-muted/40 px-2 py-1 flex items-center gap-1.5">
              Email: {boolLabel(Boolean(alerts?.deadJobNotify?.email))}
            </span>
            {!alerts?.anyDeadJobNotify ? (
              <div className="mt-3 w-full rounded-xl border border-warning-outline bg-warning/50 p-3 text-xs text-warning-deep leading-relaxed">
                <p className="font-bold">Aviso del Sistema</p>
                <p className="mt-0.5 font-medium">Sin canal configurado en el VPS: los jobs DEAD solo aparecerán en logs. Consulta la documentación para configurar Upptime o Resend.</p>
              </div>
            ) : null}
          </dd>
        </div>
      </dl>
    </section>
  );
}
