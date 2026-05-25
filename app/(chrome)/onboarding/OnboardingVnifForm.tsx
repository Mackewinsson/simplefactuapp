"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { verifyNifAction } from "@/app/(chrome)/settings/verifactu/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-lg btn-primary"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Comprobando…
        </span>
      ) : (
        "Comprobar con Hacienda"
      )}
    </button>
  );
}

type Props = {
  defaultNif: string;
  defaultNombre: string;
};

export function OnboardingVnifForm({ defaultNif, defaultNombre }: Props) {
  const [state, action] = useActionState(verifyNifAction, null);

  return (
    <div className="font-display">
      {state?.ok === false ? (
        <div className="mb-4 text-sm text-danger-foreground font-semibold bg-danger/10 p-4 rounded-xl border border-danger-outline/45 backdrop-blur-md flex items-start gap-2.5">
          <svg className="h-5 w-5 text-danger-emphasis shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-danger-foreground">
            {state.errors.map((e, i) => (
              <li key={i} className="font-medium">{e}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {state?.ok ? (
        <div className="mb-4 text-sm text-success-foreground font-semibold bg-success/20 p-4 rounded-xl border border-success-outline/40 backdrop-blur-md flex items-start gap-2.5">
          <svg className="h-5 w-5 text-success-emphasis shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-success-foreground font-medium">{state.message}</p>
        </div>
      ) : null}
      <form action={action} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">NIF / CIF del emisor</span>
          <input
            name="verifyNif"
            defaultValue={defaultNif}
            className="input max-w-md rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline/80 focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50 backdrop-blur-sm"
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">Razón social o nombre completo</span>
          <input
            name="verifyNombre"
            defaultValue={defaultNombre}
            className="input max-w-md rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline/80 focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50 backdrop-blur-sm"
          />
        </label>
        <div className="pt-1">
          <SubmitButton />
        </div>
      </form>
      <p className="mt-3.5 text-xs text-fg-subtle leading-relaxed font-sans font-medium">
        Opcional: puedes omitir este paso y continuar con el certificado.
      </p>
    </div>
  );
}
