"use client";

import { useActionState } from "react";
import { adminRetryJobAction, type ActionState } from "@/app/admin/actions";

function Message({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.ok && state.message) {
    return <p className="text-sm text-green-800">{state.message}</p>;
  }
  if (!state.ok && state.error) {
    return <p className="text-sm text-red-700">{state.error}</p>;
  }
  return null;
}

export function RetryJobForm() {
  const [state, action, pending] = useActionState(adminRetryJobAction, null);

  return (
    <form action={action} className="max-w-md space-y-3">
      <label className="block text-sm">
        <span className="text-gray-600">Job ID (UUID)</span>
        <input
          name="jobId"
          type="text"
          required
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Reintentar job (solo FAILED)"}
      </button>
      <Message state={state} />
      <p className="text-xs text-gray-500">
        La API solo acepta reintento si el job está en estado FAILED. Comprueba el estado en Jobs AEAT.
      </p>
    </form>
  );
}
