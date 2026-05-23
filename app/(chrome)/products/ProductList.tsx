"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCents } from "@/lib/money";
import { deleteProductAction, updateProductAction, type ProductRow } from "./actions";

const TIPO_OPTIONS = ["0.0", "4.0", "10.0", "21.0"] as const;

type Props = { products: ProductRow[] };

export function ProductList({ products }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [form, setForm] = useState({
    description: "",
    unitPrice: "",
    tipoImpositivo: "21.0",
    claveRegimen: "01",
    calificacion: "S1",
  });
  const [error, setError] = useState<string | null>(null);

  function startEdit(p: ProductRow) {
    setEditing(p);
    setForm({
      description: p.description,
      unitPrice: (p.unitPriceCents / 100).toFixed(2),
      tipoImpositivo: p.tipoImpositivo,
      claveRegimen: p.claveRegimen,
      calificacion: p.calificacion,
    });
    setError(null);
  }

  function onDelete(id: string) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    startTransition(async () => {
      await deleteProductAction(id);
      router.refresh();
    });
  }

  function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const r = await updateProductAction(editing.id, form);
      if (!r.ok) {
        setError(r.error ?? "Error al guardar.");
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  if (products.length === 0) {
    return (
      <div className="panel-premium rounded-2xl p-8 text-center max-w-md mx-auto my-6 border border-outline-soft/75 backdrop-blur-md">
        <svg className="h-10 w-10 text-fg-subtle mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm font-bold text-fg mb-1">Tu catálogo está vacío</p>
        <p className="text-xs text-fg-muted mb-4 font-sans font-medium">Añade líneas en tu factura y guárdalas directamente en el catálogo, o gestiónalas aquí.</p>
        <Link href="/invoices/new" className="btn btn-sm btn-accent rounded-xl px-4 py-2 font-bold shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-[0.5px] transition-all">
          Crear concepto en factura
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="space-y-3.5 md:hidden animate-fade-in-up">
        {products.map((p) => (
          <article key={p.id} className="panel-premium rounded-2xl p-5 border border-outline-soft/80 bg-surface/50 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold text-fg text-base tracking-tight leading-snug">{p.description}</p>
                <p className="mt-1.5 text-sm font-extrabold text-accent">
                  {formatCents("EUR", p.unitPriceCents)}
                </p>
              </div>
              <span className="shrink-0 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full text-success-foreground bg-success-outline/30 border border-success-outline/40">
                IVA {p.tipoImpositivo}%
              </span>
            </div>
            
            <div className="mt-3.5 pt-3.5 border-t border-outline-soft/40 flex items-center justify-between text-xs text-fg-subtle font-semibold">
              <span>Clave: <strong className="text-fg">{p.claveRegimen}</strong></span>
              <span>Calif: <strong className="text-fg">{p.calificacion}</strong></span>
            </div>
            
            <div className="mt-4 pt-3.5 border-t border-outline-soft/40 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => startEdit(p)}
                disabled={pending}
                className="btn btn-sm btn-secondary rounded-xl font-bold px-4 py-2 border-outline-soft text-xs shadow-sm hover:bg-surface-muted transition-all"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                disabled={pending}
                className="btn btn-sm btn-danger rounded-xl font-bold px-4 py-2 text-xs shadow-sm transition-all"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md shadow-sm overflow-hidden md:block">
        <table className="w-full min-w-[640px] text-left text-sm font-sans">
          <thead>
            <tr className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Concepto / Descripción</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Precio unitario</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">IVA</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Clave Régimen</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Calificación</th>
              <th scope="col" className="px-4 py-3 w-40 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-outline-soft/50 last:border-0 hover:bg-surface/65 transition-colors font-medium">
                <td className="px-4 py-3.5 text-fg font-extrabold font-display leading-snug">{p.description}</td>
                <td className="px-4 py-3.5 text-fg font-extrabold">{formatCents("EUR", p.unitPriceCents)}</td>
                <td className="px-4 py-3.5">
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full text-success-foreground bg-success-outline/30 border border-success-outline/40">
                    {p.tipoImpositivo}%
                  </span>
                </td>
                <td className="px-4 py-3.5"><code className="text-xs font-bold text-fg-subtle bg-surface-muted/80 px-2.5 py-0.5 rounded border border-outline-soft/40 font-mono">{p.claveRegimen}</code></td>
                <td className="px-4 py-3.5"><code className="text-xs font-bold text-fg-subtle bg-surface-muted/80 px-2.5 py-0.5 rounded border border-outline-soft/40 font-mono">{p.calificacion}</code></td>
                <td className="px-4 py-3.5 text-right">
                  <div className="inline-flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      disabled={pending}
                      className="btn btn-sm btn-secondary rounded-xl font-bold px-3 py-1.5 border-outline-soft text-xs shadow-sm hover:bg-surface-muted transition-all"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      disabled={pending}
                      className="btn btn-sm btn-danger rounded-xl font-bold px-3 py-1.5 text-xs shadow-sm transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog Editor */}
      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 animate-fade-in-up"
          onClick={(e) => e.target === e.currentTarget && !pending && setEditing(null)}
        >
          <form
            onSubmit={onSaveEdit}
            className="w-full max-w-md rounded-2xl border border-outline-soft bg-surface/90 backdrop-blur-xl p-6 shadow-2xl animate-[modal-enter_200ms_cubic-bezier(0.16,1,0.3,1)] font-display"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-soft/50">
              <h2 className="text-lg font-black tracking-tight text-fg">Editar producto</h2>
              <button
                type="button"
                onClick={() => !pending && setEditing(null)}
                className="text-fg-subtle hover:text-fg rounded-lg p-1 hover:bg-surface-muted transition-colors"
                aria-label="Cerrar modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error ? (
              <div className="mb-4 text-xs text-danger-foreground font-semibold bg-danger/10 p-3.5 rounded-xl border border-danger-outline/40 backdrop-blur-md flex items-start gap-2">
                <svg className="h-4.5 w-4.5 text-danger-emphasis shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            ) : null}

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">Descripción / Concepto</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="input rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">Precio unitario (€)</span>
                <input
                  value={form.unitPrice}
                  onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                  className="input rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">Tipo impositivo (IVA)</span>
                <select
                  value={form.tipoImpositivo}
                  onChange={(e) => setForm((f) => ({ ...f, tipoImpositivo: e.target.value }))}
                  className="input rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50"
                >
                  {TIPO_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}%
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">Clave régimen</span>
                  <input
                    value={form.claveRegimen}
                    onChange={(e) => setForm((f) => ({ ...f, claveRegimen: e.target.value }))}
                    className="input rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50"
                    maxLength={2}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">Calificación</span>
                  <input
                    value={form.calificacion}
                    onChange={(e) => setForm((f) => ({ ...f, calificacion: e.target.value }))}
                    className="input rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50"
                    maxLength={2}
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-soft/50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={pending}
                className="btn btn-sm btn-secondary rounded-xl font-bold px-4 py-2 border-outline-soft shadow-sm text-xs hover:bg-surface-muted transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="btn btn-sm btn-primary rounded-xl px-5 py-2 font-bold shadow-md hover:-translate-y-[0.5px] transition-all text-xs disabled:opacity-60"
              >
                {pending ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
