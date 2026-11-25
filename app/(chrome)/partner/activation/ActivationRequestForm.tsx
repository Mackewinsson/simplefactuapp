"use client";

import { SharedActivationRequestForm } from "@/lib/activation/activation-request-form";
import {
  submitActivationRequestAction,
  type ActivationRequestState,
} from "./actions";

type Props = {
  defaultEmail: string;
};

export function ActivationRequestForm({ defaultEmail }: Props) {
  return (
    <SharedActivationRequestForm
      defaultEmail={defaultEmail}
      title="Solicitar activación de producción"
      description="Cuéntanos quién eres y qué has probado en sandbox. Revisamos cada solicitud a mano."
      messageLabel="Resumen de pruebas / integración"
      messagePlaceholder="He integrado send-invoice en QA, NIF de pruebas…, jobId de ejemplo…"
      action={submitActivationRequestAction as (
        prev: ActivationRequestState,
        formData: FormData
      ) => Promise<ActivationRequestState>}
    />
  );
}
