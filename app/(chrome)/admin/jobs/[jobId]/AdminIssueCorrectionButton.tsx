"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminIssueCorrectionAction } from "@/app/(chrome)/admin/actions";

const TIPOS = [
  { value: "R1", label: "R1 — Error de derecho / art. 80 LIVA" },
  { value: "R2", label: "R2 — Concurso de acreedores" },
  { value: "R3", label: "R3 — Crédito incobrable" },
  { value: "R4", label: "R4 — Otras causas" },
  { value: "R5", label: "R5 — Rectificativa de simplificada" },
] as const;

const MODOS = [
  {
    value: "I" as const,
    label: "I — Por diferencias / íntegra",
    help: "Importes del Desglose = totales corregidos. Más simple.",
  },
  {
    value: "S" as const,
    label: "S — Sustitución",
    help: "Desglose = diferencia. Requiere importes ORIGINALES en ImporteRectificacion.",
  },
] as const;

type Modo = (typeof MODOS)[number]["value"];

/**
 * Admin shortcut to POST /admin/jobs/:id/issue-correction for DEAD SEND_INVOICE jobs.
 */
export function AdminIssueCorrectionButton({
  jobId,
  jobType,
  jobStatus,
  originalNumSerie,
}: {
  jobId: string;
  jobType: string;
  jobStatus: string;
  originalNumSerie: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["value"]>("R1");
  const [numSerie, setNumSerie] = useState(
    originalNumSerie ? `${originalNumSerie}-RECT` : ""
  );
  const [modo, setModo] = useState<Modo>("I");
  const [baseRectificada, setBaseRectificada] = useState("");
  const [cuotaRectificada, setCuotaRectificada] = useState("");
  const [cuotaRecargoRectificado, setCuotaRecargoRectificado] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (jobType !== "SEND_INVOICE" || jobStatus !== "DEAD") return null;

  const handleSubmit = () => {
    setError(null);
    setInfo(null);
    let importeRectificacion:
      | {
          baseRectificada: number;
          cuotaRectificada: number;
          cuotaRecargoRectificado?: number;
        }
      | undefined;

    if (modo === "S") {
      const base = Number(baseRectificada);
      const cuota = Number(cuotaRectificada);
      if (!Number.isFinite(base) || !Number.isFinite(cuota)) {
        setError("En modo S, baseRectificada y cuotaRectificada deben ser números.");
        return;
      }
      importeRectificacion = { baseRectificada: base, cuotaRectificada: cuota };
      if (cuotaRecargoRectificado.trim() !== "") {
        const recargo = Number(cuotaRecargoRectificado);
        if (!Number.isFinite(recargo)) {
          setError("cuotaRecargoRectificado debe ser un número o vacío.");
          return;
        }
        importeRectificacion.cuotaRecargoRectificado = recargo;
      }
    }

    startTransition(async () => {
      const r = await adminIssueCorrectionAction({
        jobId,
        tipoFactura: tipo,
        numSerie,
        tipoRectificativa: modo,
        importeRectificacion,
      });
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
      <button type="button" onClick={() => setOpen(true)} className="btn btn-sm btn-warning">
        Emitir factura rectificativa
      </button>
    );
  }

  const modoHelp = MODOS.find((m) => m.value === modo)?.help ?? "";

  return (
    <div className="rounded border border-warning-outline bg-warning p-3 text-sm text-warning-foreground">
      <p className="font-medium">Emitir rectificativa desde job DEAD</p>
      <p className="mt-1 text-xs text-warning-deep">
        Encola un nuevo SEND_INVOICE R1–R5 referenciando la factura del payload original. Verifica
        antes en Consulta AEAT que no esté ya registrada.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-xs">
          <span className="block font-medium">Tipo</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as typeof tipo)}
            disabled={pending}
            className="mt-1 w-full rounded border border-warning-outline bg-surface p-1.5 text-sm"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="block font-medium">Nuevo numSerie</span>
          <input
            type="text"
            value={numSerie}
            onChange={(e) => setNumSerie(e.target.value)}
            disabled={pending}
            className="mt-1 w-full rounded border border-warning-outline bg-surface p-1.5 font-mono text-sm"
          />
        </label>
        <label className="text-xs sm:col-span-2">
          <span className="block font-medium">Modo (tipoRectificativa)</span>
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value as Modo)}
            disabled={pending}
            className="mt-1 w-full rounded border border-warning-outline bg-surface p-1.5 text-sm"
          >
            {MODOS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-warning-muted">{modoHelp}</span>
        </label>
      </div>
      {modo === "S" ? (
        <div className="mt-3 grid gap-2 rounded border border-warning-outline bg-surface/60 p-2 sm:grid-cols-3">
          <label className="text-xs">
            <span className="block font-medium">Base rectificada</span>
            <input
              type="number"
              step="0.01"
              value={baseRectificada}
              onChange={(e) => setBaseRectificada(e.target.value)}
              disabled={pending}
              className="mt-1 w-full rounded border border-warning-outline bg-surface p-1.5 font-mono text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="block font-medium">Cuota rectificada</span>
            <input
              type="number"
              step="0.01"
              value={cuotaRectificada}
              onChange={(e) => setCuotaRectificada(e.target.value)}
              disabled={pending}
              className="mt-1 w-full rounded border border-warning-outline bg-surface p-1.5 font-mono text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="block font-medium">Cuota recargo (opc.)</span>
            <input
              type="number"
              step="0.01"
              value={cuotaRecargoRectificado}
              onChange={(e) => setCuotaRecargoRectificado(e.target.value)}
              disabled={pending}
              className="mt-1 w-full rounded border border-warning-outline bg-surface p-1.5 font-mono text-sm"
            />
          </label>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-danger-foreground">
          {error}
        </p>
      ) : null}
      {info ? (
        <p role="status" className="mt-2 text-xs text-success-foreground">
          {info}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            pending ||
            !numSerie.trim() ||
            (modo === "S" &&
              (baseRectificada.trim() === "" || cuotaRectificada.trim() === ""))
          }
          className="btn btn-sm btn-warning disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Emitir rectificativa"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="btn btn-sm btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
