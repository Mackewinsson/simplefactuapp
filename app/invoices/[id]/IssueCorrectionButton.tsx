"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { issueCorrectionAction } from "./verifactu-actions";

type Props = {
  invoiceId: string;
  originalNumSerie: string;
};

const TIPOS = [
  { value: "R1", label: "R1 — Error de derecho / art. 80 LIVA" },
  { value: "R2", label: "R2 — Concurso de acreedores" },
  { value: "R3", label: "R3 — Crédito incobrable" },
  { value: "R4", label: "R4 — Otras causas" },
  { value: "R5", label: "R5 — Rectificativa de simplificada" },
] as const;

/**
 * Inline modal that lets the user emit an R1-R5 corrective invoice when
 * the original invoice ended up DEAD in AEAT. Calls issueCorrectionAction
 * which validates ownership server-side and proxies to the simplefactu
 * admin endpoint /admin/jobs/:id/issue-correction.
 */
export function IssueCorrectionButton({ invoiceId, originalNumSerie }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["value"]>("R1");
  const [numSerie, setNumSerie] = useState(`${originalNumSerie}-RECT`);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const r = await issueCorrectionAction(invoiceId, { tipoFactura: tipo, numSerie });
      if (!r.ok) {
        setError(r.message);
        return;
      }
      setInfo(r.message);
      router.refresh();
      setTimeout(() => setOpen(false), 1500);
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
      >
        Emitir factura rectificativa
      </button>
    );
  }

  return (
    <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="font-medium">Emitir rectificativa para {originalNumSerie}</p>
      <p className="mt-1 text-xs text-amber-800">
        AEAT no permite editar facturas registradas. Lo correcto es emitir una factura nueva
        con tipo R1-R5 que apunte a la original. El worker la enviará a AEAT con la
        cadena recalculada.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-xs">
          <span className="block font-medium">Tipo de rectificativa</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as typeof tipo)}
            disabled={pending}
            className="mt-1 w-full rounded border border-amber-300 bg-white p-1.5 text-sm"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="block font-medium">Nuevo número de serie</span>
          <input
            type="text"
            value={numSerie}
            onChange={(e) => setNumSerie(e.target.value)}
            disabled={pending}
            className="mt-1 w-full rounded border border-amber-300 bg-white p-1.5 font-mono text-sm"
          />
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      {info ? (
        <p role="status" className="mt-2 text-xs text-green-800">
          {info}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending || !numSerie.trim()}
          className="rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {pending ? "Enviando..." : "Emitir rectificativa"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="rounded border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
