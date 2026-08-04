"use client";

import { useActionState } from "react";
import {
  adminApproveActivationRequestAction,
  adminRejectActivationRequestAction,
  type ActivationDecisionState,
} from "./actions";

export function ApproveRequestButton({ requestId }: { requestId: string }) {
  const [state, formAction, pending] = useActionState<ActivationDecisionState, FormData>(
    adminApproveActivationRequestAction,
    null
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="requestId" value={requestId} />
      <button type="submit" disabled={pending} className="btn btn-sm btn-primary">
        {pending ? "…" : "Aprobar"}
      </button>
      {state?.error ? (
        <span className="ml-2 text-xs text-danger-foreground">{state.error}</span>
      ) : null}
      {state?.ok ? (
        <span className="ml-2 text-xs text-success-foreground">{state.message}</span>
      ) : null}
    </form>
  );
}

export function RejectRequestForm({ requestId }: { requestId: string }) {
  const [state, formAction, pending] = useActionState<ActivationDecisionState, FormData>(
    adminRejectActivationRequestAction,
    null
  );

  return (
    <form action={formAction} className="mt-2 flex flex-wrap items-end gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <label className="block min-w-[12rem] flex-1 text-xs">
        <span className="text-fg-subtle">Nota (opcional)</span>
        <input
          name="decisionNote"
          maxLength={500}
          className="input mt-0.5 w-full text-xs"
          placeholder="Motivo del rechazo"
        />
      </label>
      <button type="submit" disabled={pending} className="btn btn-sm btn-secondary">
        {pending ? "…" : "Rechazar"}
      </button>
      {state?.error ? (
        <span className="w-full text-xs text-danger-foreground">{state.error}</span>
      ) : null}
      {state?.ok ? (
        <span className="w-full text-xs text-success-foreground">{state.message}</span>
      ) : null}
    </form>
  );
}
