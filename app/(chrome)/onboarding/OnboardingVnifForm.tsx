"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { verifyNifAction, type VerifactuSettingsState } from "@/app/(chrome)/settings/verifactu/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Comprobando…" : "Comprobar con Hacienda"}
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
    <div className="mt-4">
      {state?.ok === false ? (
        <ul className="mb-3 list-inside list-disc text-sm text-danger-foreground">
          {state.errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ) : null}
      {state?.ok ? (
        <p className="mb-3 text-sm text-success-emphasis">{state.message}</p>
      ) : null}
      <form action={action} className="space-y-3">
        <label className="block">
          <span className="text-sm text-fg-muted">NIF / CIF del emisor</span>
          <input
            name="verifyNif"
            defaultValue={defaultNif}
            className="mt-1 block w-full max-w-md rounded border border-outline px-3 py-2 text-sm"
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="text-sm text-fg-muted">Razón social o nombre completo</span>
          <input
            name="verifyNombre"
            defaultValue={defaultNombre}
            className="mt-1 block w-full max-w-md rounded border border-outline px-3 py-2 text-sm"
          />
        </label>
        <SubmitButton />
      </form>
      <p className="mt-2 text-xs text-fg-subtle">
        Opcional: puedes omitir este paso y continuar con el certificado.
      </p>
    </div>
  );
}
