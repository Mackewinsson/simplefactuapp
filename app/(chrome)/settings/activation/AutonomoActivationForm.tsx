"use client";

import { SharedActivationRequestForm } from "@/lib/activation/activation-request-form";
import {
  submitAutonomoActivationRequestAction,
  type AutonomoActivationRequestState,
} from "./actions";

type Props = {
  defaultEmail: string;
  defaultCompanyName?: string;
  defaultNif?: string;
};

export function AutonomoActivationForm({
  defaultEmail,
  defaultCompanyName,
  defaultNif,
}: Props) {
  return (
    <SharedActivationRequestForm
      defaultEmail={defaultEmail}
      defaultCompanyName={defaultCompanyName}
      defaultNif={defaultNif}
      title="Solicitar activación de cuenta"
      description="Cuando completes emisor y certificado, envía la solicitud. Revisamos a mano y te avisamos por email."
      messageLabel="Comentario (opcional)"
      messagePlaceholder="Actividad, volumen estimado, o cualquier detalle útil…"
      action={submitAutonomoActivationRequestAction as (
        prev: AutonomoActivationRequestState,
        formData: FormData
      ) => Promise<AutonomoActivationRequestState>}
    />
  );
}
