"use client";

import { useActionState } from "react";
import { adminRetryJobAction, type ActionState } from "@/app/admin/actions";

export function RetryJobButton({ jobId, status }: { jobId: string; status: string }) {
  const [state, action, pending] = useActionState(adminRetryJobAction, null);

  const isFailed = status === "FAILED";
  const isDead = status === "DEAD";

  if (!isFailed && !isDead) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (isDead) {
      const ok = window.confirm(
        "Este job está DEAD (agotó todos los reintentos).\n\n" +
          "Antes de continuar verifica en AEAT (consulta) que la factura NO está ya registrada.\n\n" +
          "¿Reintentar de todas formas?"
      );
      if (!ok) e.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="hidden" name="jobId" value={jobId} />
      {isDead && <input type="hidden" name="force" value="true" />}
      <button
        type="submit"
        disabled={pending}
        className={`w-fit rounded px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${
          isDead ? "bg-red-700 hover:bg-red-800" : "bg-amber-600 hover:bg-amber-700"
        }`}
      >
        {pending
          ? "Enviando…"
          : isDead
            ? "Reintentar (force — DEAD)"
            : "Reintentar job"}
      </button>
      {state?.ok === true && (
        <p className="text-sm text-green-800">{state.message}</p>
      )}
      {state?.ok === false && (
        <p className="text-sm text-red-700">{state.error}</p>
      )}
    </form>
  );
}
