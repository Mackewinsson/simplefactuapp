"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  PartnerOnboardingStatus,
  PartnerOnboardingStepId,
} from "@/lib/partner/onboarding-status";
import { ActivateNifButton, ApiKeyStep, CertUploadForm, SubtenantForm } from "./StepForms";

type Props = {
  status: PartnerOnboardingStatus;
  apiBaseUrl: string;
};

function stepIndex(id: PartnerOnboardingStepId): number {
  const order: PartnerOnboardingStepId[] = ["subtenant", "cert", "apiKey", "activate", "invoice"];
  return order.indexOf(id);
}

export function OnboardingSteps({ status, apiBaseUrl }: Props) {
  const router = useRouter();
  const [apiKeyLocalDone, setApiKeyLocalDone] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [refreshPending, startRefresh] = useTransition();

  const effectiveSteps = useMemo(() => {
    return status.steps.map((s) => {
      if (s.id === "apiKey" && apiKeyLocalDone) {
        return { ...s, done: true };
      }
      return s;
    });
  }, [status.steps, apiKeyLocalDone]);

  const completed = effectiveSteps.filter((s) => s.done).length;
  const pct = Math.round((completed / effectiveSteps.length) * 100);
  const activeId =
    effectiveSteps.find((s) => !s.done)?.id ??
    (status.complete ? null : ("invoice" as PartnerOnboardingStepId));

  useEffect(() => {
    if (status.firstInvoiceDone) setApiKeyLocalDone(true);
  }, [status.firstInvoiceDone]);

  function refresh() {
    startRefresh(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-outline-soft/80 bg-surface/40 backdrop-blur-xl p-5 shadow-sm">
        <div className="flex justify-between items-baseline text-[11px] font-black text-fg-subtle uppercase tracking-wider mb-2.5 font-display">
          <span>Progreso de integración</span>
          <span className="text-fg font-black">
            {completed} de {effectiveSteps.length} pasos
          </span>
        </div>
        <div
          className="progress-track h-2.5 bg-surface-muted/65 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-fill h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {status.complete ? (
        <div className="rounded-2xl border border-success-outline/50 bg-success/30 p-6 space-y-3 animate-fade-in-up">
          <p className="text-lg font-extrabold text-success-foreground font-display">
            Integración lista
          </p>
          <p className="text-sm text-fg-muted font-medium">
            Ya tienes un NIF emisor con certificado y al menos un envío AEAT correcto.
            La consola completa te espera.
          </p>
          <Link href="/partner" className="btn btn-md btn-accent inline-flex">
            Ir a la consola →
          </Link>
        </div>
      ) : null}

      <ol className="relative space-y-0">
        {effectiveSteps.map((step, i) => {
          const isActive = step.id === activeId;
          const isExpanded =
            isActive ||
            (step.id === "apiKey" && Boolean(generatedKey) && !status.firstInvoiceDone) ||
            (step.id === "invoice" && status.isActive && !status.firstInvoiceDone);
          const lineDone = i > 0 && effectiveSteps[i - 1]?.done;

          return (
            <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Vertical rail */}
              {i < effectiveSteps.length - 1 ? (
                <span
                  aria-hidden
                  className={`absolute left-[17px] top-10 bottom-0 w-0.5 ${
                    step.done || lineDone
                      ? "bg-gradient-to-b from-accent to-accent-hover"
                      : "bg-outline-soft"
                  }`}
                />
              ) : null}

              <div
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black font-display transition-all ${
                  step.done
                    ? "border-success-outline bg-success-emphasis text-white scale-105"
                    : isActive
                      ? "border-accent bg-accent text-accent-foreground shadow-md"
                      : "border-outline-soft bg-surface text-fg-subtle"
                }`}
              >
                {step.done ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepIndex(step.id) + 1
                )}
              </div>

              <div
                className={`min-w-0 flex-1 rounded-2xl border p-5 transition-all duration-300 ${
                  step.done && !isExpanded
                    ? "border-success-outline/40 bg-success/15"
                    : isActive || isExpanded
                      ? "panel-premium border-accent/30 shadow-md"
                      : "border-outline-soft/70 bg-surface/50"
                }`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-fg font-display tracking-tight">
                      {step.label}
                    </h3>
                    <p className="mt-1 text-xs text-fg-muted font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      step.done
                        ? "bg-success/40 text-success-foreground border border-success-outline/40"
                        : isActive
                          ? "bg-accent-muted text-accent border border-accent/30"
                          : "bg-surface-muted text-fg-subtle border border-outline-soft"
                    }`}
                  >
                    {step.done ? "Hecho" : isActive ? "Ahora" : "Pendiente"}
                  </span>
                </div>

                {isExpanded && !step.done ? (
                  <div className="mt-4 border-t border-outline-soft/50 pt-4">
                    {step.id === "subtenant" ? (
                      <SubtenantForm onSuccess={refresh} />
                    ) : null}
                    {step.id === "cert" && status.primaryChild ? (
                      <CertUploadForm childId={status.primaryChild.id} onSuccess={refresh} />
                    ) : null}
                    {step.id === "apiKey" && status.primaryChild ? (
                      <ApiKeyStep
                        childId={status.primaryChild.id}
                        generatedKey={generatedKey}
                        onGenerated={(key) => {
                          setGeneratedKey(key);
                          setApiKeyLocalDone(true);
                        }}
                      />
                    ) : null}
                    {step.id === "activate" && status.primaryChild ? (
                      <ActivateNifButton
                        childId={status.primaryChild.id}
                        canActivate={status.hasCertificate && (status.apiKeyDone || apiKeyLocalDone)}
                        missingHint={
                          !status.hasCertificate
                            ? "Sube primero el certificado PFX."
                            : "Genera primero la API key del emisor."
                        }
                        onSuccess={refresh}
                      />
                    ) : null}
                    {step.id === "invoice" && status.primaryChild ? (
                      <StepFirstInvoice
                        apiBaseUrl={apiBaseUrl}
                        nif={status.primaryChild.allowed_nif}
                        name={status.primaryChild.name}
                        apiKey={generatedKey}
                        lastJobStatus={status.lastJobStatus}
                        refreshPending={refreshPending}
                        onRefresh={refresh}
                      />
                    ) : null}
                  </div>
                ) : null}

                {step.done && step.id === "subtenant" && status.primaryChild ? (
                  <p className="mt-3 text-xs font-mono text-fg-subtle">
                    {status.primaryChild.id}
                    {status.primaryChild.allowed_nif
                      ? ` · ${status.primaryChild.allowed_nif}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepFirstInvoice({
  apiBaseUrl,
  nif,
  name,
  apiKey,
  lastJobStatus,
  refreshPending,
  onRefresh,
}: {
  apiBaseUrl: string;
  nif: string | null;
  name: string | null;
  apiKey: string | null;
  lastJobStatus: string | null;
  refreshPending: boolean;
  onRefresh: () => void;
}) {
  const keyPlaceholder = apiKey || "vf_...";
  const snippet = `export API_BASE="${apiBaseUrl}"
export API_KEY="${keyPlaceholder}"
export NIF="${nif || "<NIF>"}"
export NOMBRE="${name || "Razón social"}"

curl -s -X POST "$API_BASE/send-invoice" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $API_KEY" \\
  -H "x-idempotency-key: $(uuidgen)" \\
  -d "{
    \\"nif\\": \\"$NIF\\",
    \\"nombre\\": \\"$NOMBRE\\",
    \\"numSerie\\": \\"2026/F-001\\",
    \\"fecha\\": \\"$(date +%d-%m-%Y)\\",
    \\"tipoFactura\\": \\"F1\\",
    \\"descripcion\\": \\"Servicios de consultoría\\",
    \\"destNombre\\": \\"FNMT-RCM\\",
    \\"destNif\\": \\"Q2826004J\\",
    \\"cuotaTotal\\": 21.00,
    \\"total\\": 121.00,
    \\"detalles\\": [{
      \\"clave\\": \\"01\\",
      \\"calif\\": \\"S1\\",
      \\"tipo\\": 21,
      \\"base\\": 100.00,
      \\"cuota\\": 21.00
    }]
  }"
# → 202 + jobId; GET $API_BASE/jobs/:jobId hasta SUCCEEDED`;

  return (
    <div className="space-y-3">
      {!apiKey ? (
        <p className="text-xs text-warning-foreground font-medium rounded-lg border border-warning-outline/40 bg-warning/50 px-3 py-2">
          Sustituye <code className="font-mono">vf_...</code> por la API key del paso 3 si ya la
          generaste.
        </p>
      ) : null}
      <pre className="max-h-64 overflow-auto rounded-xl border border-outline-soft/40 bg-code p-4 font-mono text-[11px] text-code-foreground whitespace-pre-wrap">
        {snippet}
      </pre>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onRefresh} disabled={refreshPending} className="btn btn-sm btn-secondary">
          {refreshPending ? "Comprobando…" : "Comprobar estado"}
        </button>
        {lastJobStatus ? (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
              lastJobStatus === "SUCCEEDED"
                ? "bg-success/40 text-success-foreground border-success-outline/40"
                : lastJobStatus === "DEAD" || lastJobStatus === "FAILED"
                  ? "bg-danger/40 text-danger-foreground border-danger-outline/40"
                  : "bg-surface-muted text-fg-muted border-outline-soft"
            }`}
          >
            Último job: {lastJobStatus}
          </span>
        ) : (
          <span className="text-xs text-fg-subtle font-medium">Sin jobs todavía</span>
        )}
        <Link href="/docs/quickstart" className="text-xs font-bold text-accent hover:underline font-display">
          Docs inicio rápido
        </Link>
      </div>
    </div>
  );
}
