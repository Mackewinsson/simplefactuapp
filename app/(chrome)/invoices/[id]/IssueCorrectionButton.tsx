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

const MODOS = [
  {
    value: "I" as const,
    label: "I — Por diferencias / íntegra",
    help: "Los importes del Desglose son los corregidos totales (la factura nueva sustituye a la original). Más simple.",
  },
  {
    value: "S" as const,
    label: "S — Sustitución",
    help: "Los importes del Desglose son la diferencia entre lo nuevo y lo original. Requiere informar los importes ORIGINALES en ImporteRectificacion.",
  },
] as const;

type ModoRectificacion = (typeof MODOS)[number]["value"];

/**
 * Inline modal that lets the user emit an R1-R5 corrective invoice when
 * the original invoice ended up DEAD in AEAT. Calls issueCorrectionAction
 * which validates ownership server-side and proxies to the simplefactu
 * admin endpoint /admin/jobs/:id/issue-correction.
 *
 * Veri*Factu requires `tipoRectificativa` (S/I) for any R1-R5 (AEAT rule
 * 1114). Default mode is "I" because it does not need additional importes.
 */
export function IssueCorrectionButton({ invoiceId, originalNumSerie }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["value"]>("R1");
  const [numSerie, setNumSerie] = useState(`${originalNumSerie}-RECT`);
  const [modo, setModo] = useState<ModoRectificacion>("I");
  const [baseRectificada, setBaseRectificada] = useState("");
  const [cuotaRectificada, setCuotaRectificada] = useState("");
  const [cuotaRecargoRectificado, setCuotaRecargoRectificado] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    setInfo(null);

    let importeRectificacion: {
      baseRectificada: number;
      cuotaRectificada: number;
      cuotaRecargoRectificado?: number;
    } | undefined;

    if (modo === "S") {
      const base = Number(baseRectificada);
      const cuota = Number(cuotaRectificada);
      if (!Number.isFinite(base) || !Number.isFinite(cuota)) {
        setError(
          "En modo sustitución, baseRectificada y cuotaRectificada deben ser números válidos."
        );
        return;
      }
      importeRectificacion = { baseRectificada: base, cuotaRectificada: cuota };
      if (cuotaRecargoRectificado.trim() !== "") {
        const recargo = Number(cuotaRecargoRectificado);
        if (!Number.isFinite(recargo)) {
          setError("cuotaRecargoRectificado debe ser un número válido o quedar en blanco.");
          return;
        }
        importeRectificacion.cuotaRecargoRectificado = recargo;
      }
    }

    startTransition(async () => {
      const r = await issueCorrectionAction(invoiceId, {
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
      >
        Emitir factura rectificativa
      </button>
    );
  }

  const modoHelp = MODOS.find((m) => m.value === modo)?.help ?? "";

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
        <label className="text-xs sm:col-span-2">
          <span className="block font-medium">Modo de rectificación (AEAT)</span>
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value as ModoRectificacion)}
            disabled={pending}
            className="mt-1 w-full rounded border border-amber-300 bg-white p-1.5 text-sm"
          >
            {MODOS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-amber-700">{modoHelp}</span>
        </label>
      </div>
      {modo === "S" ? (
        <div className="mt-3 grid gap-2 rounded border border-amber-300 bg-white/60 p-2 sm:grid-cols-3">
          <p className="text-[11px] font-medium text-amber-900 sm:col-span-3">
            Importe rectificación (importes ORIGINALES de la factura rectificada)
          </p>
          <label className="text-xs">
            <span className="block font-medium">Base rectificada</span>
            <input
              type="number"
              step="0.01"
              value={baseRectificada}
              onChange={(e) => setBaseRectificada(e.target.value)}
              disabled={pending}
              className="mt-1 w-full rounded border border-amber-300 bg-white p-1.5 font-mono text-sm"
              placeholder="100.00"
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
              className="mt-1 w-full rounded border border-amber-300 bg-white p-1.5 font-mono text-sm"
              placeholder="21.00"
            />
          </label>
          <label className="text-xs">
            <span className="block font-medium">
              Cuota recargo <span className="font-normal text-amber-700">(opcional)</span>
            </span>
            <input
              type="number"
              step="0.01"
              value={cuotaRecargoRectificado}
              onChange={(e) => setCuotaRecargoRectificado(e.target.value)}
              disabled={pending}
              className="mt-1 w-full rounded border border-amber-300 bg-white p-1.5 font-mono text-sm"
              placeholder="5.20"
            />
          </label>
        </div>
      ) : null}
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
          disabled={
            pending ||
            !numSerie.trim() ||
            (modo === "S" && (baseRectificada.trim() === "" || cuotaRectificada.trim() === ""))
          }
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
