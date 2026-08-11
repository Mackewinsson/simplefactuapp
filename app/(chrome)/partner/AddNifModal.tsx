"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalOverlay } from "@/app/components/ModalOverlay";
import {
  ActivateNifButton,
  ApiKeyStep,
  CertUploadForm,
  SubtenantForm,
} from "@/app/(chrome)/partner/onboarding/StepForms";

type WizardStep = "subtenant" | "cert" | "apiKey" | "activate" | "done";

const STEP_ORDER: WizardStep[] = ["subtenant", "cert", "apiKey", "activate"];

const STEP_LABELS: Record<Exclude<WizardStep, "done">, string> = {
  subtenant: "Alta del NIF",
  cert: "Certificado PFX",
  apiKey: "API key",
  activate: "Activar",
};

/**
 * Button + modal wizard to register additional NIF emisores once the first
 * one is fully onboarded. Same steps as the guide: alta → cert → API key.
 */
export function AddNifModalButton({
  label = "+ Alta de NIF Emisor",
  size = "md",
}: {
  label?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>("subtenant");
  const [childId, setChildId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setStep("subtenant");
    setChildId(null);
    setApiKey(null);
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        className={`btn btn-${size} btn-accent`}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>

      {open ? (
        <ModalOverlay
          className="flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-16 sm:pt-20 animate-fade-in-up"
          onClick={(e) => e.target === e.currentTarget && close()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-nif-title"
        >
          <div
            className="relative flex max-h-[min(88vh,800px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-outline-soft bg-surface/95 shadow-2xl backdrop-blur-xl animate-[modal-enter_200ms_cubic-bezier(0.16,1,0.3,1)] font-display"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-outline-soft/60 px-5 py-4">
              <div className="min-w-0">
                <h2 id="add-nif-title" className="text-lg font-black tracking-tight text-fg">
                  {step === "done" ? "NIF emisor listo" : "Nuevo NIF emisor"}
                </h2>
                {step !== "done" ? (
                  <div className="mt-2 flex items-center gap-2">
                    {STEP_ORDER.map((s, i) => {
                      const currentIdx = STEP_ORDER.indexOf(step);
                      const isDone = i < currentIdx;
                      const isCurrent = s === step;
                      return (
                        <span key={s} className="flex items-center gap-2">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-black ${
                              isDone
                                ? "border-success-outline bg-success-emphasis text-white"
                                : isCurrent
                                  ? "border-accent bg-accent text-accent-foreground"
                                  : "border-outline-soft bg-surface text-fg-subtle"
                            }`}
                          >
                            {isDone ? "✓" : i + 1}
                          </span>
                          <span
                            className={`text-[11px] font-bold ${
                              isCurrent ? "text-fg" : "text-fg-subtle"
                            }`}
                          >
                            {STEP_LABELS[s as Exclude<WizardStep, "done">]}
                          </span>
                          {i < STEP_ORDER.length - 1 ? (
                            <span className="h-px w-4 bg-outline-soft" aria-hidden />
                          ) : null}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 text-fg-subtle hover:bg-surface-muted hover:text-fg transition-colors shrink-0"
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 font-sans">
              {step === "subtenant" ? (
                <SubtenantForm
                  showIntro={false}
                  onSuccess={(id) => {
                    setChildId(id);
                    setStep("cert");
                  }}
                />
              ) : null}

              {step === "cert" && childId ? (
                <CertUploadForm childId={childId} onSuccess={() => setStep("apiKey")} />
              ) : null}

              {step === "apiKey" && childId ? (
                <div className="space-y-4">
                  <ApiKeyStep
                    childId={childId}
                    generatedKey={apiKey}
                    onGenerated={setApiKey}
                  />
                  {apiKey ? (
                    <button type="button" className="btn btn-md btn-accent" onClick={() => setStep("activate")}>
                      He guardado la clave →
                    </button>
                  ) : null}
                </div>
              ) : null}

              {step === "activate" && childId ? (
                <div className="space-y-4">
                  <p className="text-xs text-fg-muted font-medium">
                    Certificado y API key listos. Activa el NIF para permitir envíos a AEAT.
                  </p>
                  <ActivateNifButton
                    childId={childId}
                    canActivate
                    onSuccess={() => setStep("done")}
                  />
                </div>
              ) : null}

              {step === "done" ? (
                <div className="space-y-4 text-center py-4">
                  <p className="text-sm font-semibold text-success-emphasis">
                    NIF emisor registrado, con certificado, API key y activado.
                  </p>
                  <button type="button" className="btn btn-md btn-accent" onClick={close}>
                    Cerrar
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </ModalOverlay>
      ) : null}
    </>
  );
}
