"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ModalOverlay } from "@/app/components/ModalOverlay";
import {
  CALIFICACION_OPTIONS,
  CLAVE_REGIMEN_OPTIONS,
  TIPO_IMPOSITIVO_OPTIONS,
} from "@/lib/invoices/line-tax-options";
import {
  createProductAction,
  updateProductAction,
  type ProductRow,
} from "./actions";

type ProductModalProps = {
  product?: ProductRow;
  onClose: () => void;
};

function emptyForm() {
  return {
    description: "",
    unitPrice: "",
    tipoImpositivo: "21.0",
    claveRegimen: "01",
    calificacion: "S1",
  };
}

function formFromProduct(p: ProductRow) {
  return {
    description: p.description,
    unitPrice: (p.unitPriceCents / 100).toFixed(2),
    tipoImpositivo: p.tipoImpositivo,
    claveRegimen: p.claveRegimen,
    calificacion: p.calificacion,
  };
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(() => (product ? formFromProduct(product) : emptyForm()));
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      if (isEdit && product) {
        const r = await updateProductAction(product.id, form);
        if (!r.ok) {
          setError(r.error ?? "Error al guardar.");
          return;
        }
        onClose();
        router.refresh();
        return;
      }

      const r = await createProductAction(form);
      if (!r.ok) {
        setError(r.error ?? "Error al guardar.");
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <ModalOverlay
      className="flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 animate-fade-in-up"
      onClick={(e) => e.target === e.currentTarget && !pending && onClose()}
    >
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-outline-soft bg-surface/90 backdrop-blur-xl p-6 shadow-2xl animate-[modal-enter_200ms_cubic-bezier(0.16,1,0.3,1)] font-display"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-outline-soft/50 pb-3">
          <h2 className="text-lg font-black tracking-tight text-fg">
            {isEdit ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            type="button"
            onClick={() => !pending && onClose()}
            className="rounded-lg p-1 text-fg-subtle hover:bg-surface-muted hover:text-fg transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger-outline/40 bg-danger/10 p-3.5 text-xs font-semibold text-danger-foreground backdrop-blur-md">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">
              Descripción / concepto <span className="text-danger-emphasis">*</span>
            </span>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input rounded-xl border-outline-soft/80 bg-surface/50 py-2.5 px-3.5 font-sans font-medium text-fg shadow-sm transition-all focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">
              Precio unitario (€) <span className="text-danger-emphasis">*</span>
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={form.unitPrice}
              onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
              className="input rounded-xl border-outline-soft/80 bg-surface/50 py-2.5 px-3.5 font-sans font-medium text-fg shadow-sm transition-all focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">
              Tipo impositivo (IVA)
            </span>
            <select
              value={form.tipoImpositivo}
              onChange={(e) => setForm((f) => ({ ...f, tipoImpositivo: e.target.value }))}
              className="input rounded-xl border-outline-soft/80 bg-surface/50 py-2.5 px-3.5 font-sans font-medium text-fg shadow-sm transition-all focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20"
            >
              {TIPO_IMPOSITIVO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">
              Clave de régimen
            </span>
            <select
              value={form.claveRegimen}
              onChange={(e) => setForm((f) => ({ ...f, claveRegimen: e.target.value }))}
              className="input rounded-xl border-outline-soft/80 bg-surface/50 py-2.5 px-3.5 font-sans font-medium text-fg shadow-sm transition-all focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20"
            >
              {CLAVE_REGIMEN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">
              Calificación de la operación
            </span>
            <select
              value={form.calificacion}
              onChange={(e) => setForm((f) => ({ ...f, calificacion: e.target.value }))}
              className="input rounded-xl border-outline-soft/80 bg-surface/50 py-2.5 px-3.5 font-sans font-medium text-fg shadow-sm transition-all focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20"
            >
              {CALIFICACION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2.5 border-t border-outline-soft/50 pt-4">
          <button type="button" onClick={onClose} disabled={pending} className="btn btn-sm btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={pending} className="btn btn-sm btn-primary">
            {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Guardar producto"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
