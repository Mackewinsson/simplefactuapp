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
    <section className="rounded-lg border border-outline-soft bg-surface p-4 shadow-sm sm:col-span-2">
      <h2 className="mb-2 text-sm font-semibold text-fg-muted">Operaciones y alertas</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-fg-subtle">Sonda GET /ready</dt>
          <dd className="mt-0.5">
            {boolLabel(ready.ok)}{" "}
            <span className="text-fg-muted">
              (HTTP {ready.status || "—"})
            </span>
            <a
              href={`${origin}/ready`}
              target="_blank"
              rel="noreferrer"
              className="ml-2 text-xs text-accent hover:underline"
            >
              Abrir ↗
            </a>
          </dd>
          {!ready.ok && ready.errors?.length ? (
            <ul className="mt-1 list-inside list-disc text-xs text-danger-foreground">
              {ready.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <dt className="text-fg-subtle">Jobs DEAD (requieren revisión)</dt>
          <dd
            className={`mt-0.5 font-medium ${deadCount > 0 ? "text-danger-foreground" : "text-fg-muted"}`}
          >
            {deadCount}
            {deadCount > 0 ? (
              <span className="ml-2 font-normal text-fg-muted">
                —{" "}
                <Link href="/admin/jobs?status=DEAD" className="text-accent hover:underline">
                  Ver en jobs
                </Link>
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-fg-subtle">EMAILS_ENABLED (usuarios)</dt>
          <dd className="mt-0.5">{boolLabel(Boolean(alerts?.emailsEnabled))}</dd>
        </div>
        <div>
          <dt className="text-fg-subtle">RESEND_API_KEY</dt>
          <dd className="mt-0.5">{boolLabel(Boolean(alerts?.resendConfigured))}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-fg-subtle">Alertas operador (DEAD_JOB_NOTIFY_*)</dt>
          <dd className="mt-0.5 text-fg-muted">
            Slack: {boolLabel(Boolean(alerts?.deadJobNotify?.slack))} · Discord:{" "}
            {boolLabel(Boolean(alerts?.deadJobNotify?.discord))} · Email:{" "}
            {boolLabel(Boolean(alerts?.deadJobNotify?.email))}
            {!alerts?.anyDeadJobNotify ? (
              <p className="mt-2 text-xs text-warning-deep">
                Sin canal configurado en el VPS: los jobs DEAD solo aparecen en logs. Ver{" "}
                <code className="rounded bg-surface-muted px-1">docs/RUNBOOK.md</code> en el repo API
                (Upptime + Resend).
              </p>
            ) : null}
          </dd>
        </div>
      </dl>
    </section>
  );
}
