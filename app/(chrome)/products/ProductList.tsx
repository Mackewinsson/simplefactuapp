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
      <p className="text-sm text-fg-muted">
        No hay productos en catálogo. Añade líneas en{" "}
        <Link href="/invoices/new" className="text-accent hover:underline">
          Nueva factura
        </Link>{" "}
        y guárdalos desde el flujo de productos, o crea uno aquí más adelante.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2 md:hidden">
        {products.map((p) => (
          <article key={p.id} className="rounded border border-outline-soft bg-surface p-3">
            <p className="font-medium text-fg">{p.description}</p>
            <p className="mt-1 text-sm text-fg-muted">
              Precio: {formatCents("EUR", p.unitPriceCents)}
            </p>
            <p className="text-sm text-fg-muted">IVA: {p.tipoImpositivo}</p>
            <p className="text-sm text-fg-muted">Clave: {p.claveRegimen}</p>
            <p className="text-sm text-fg-muted">Calif.: {p.calificacion}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startEdit(p)}
                disabled={pending}
                className="rounded border border-outline bg-surface px-2 py-1 text-xs hover:bg-surface-hover"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                disabled={pending}
                className="rounded border border-danger-outline bg-danger px-2 py-1 text-xs text-danger-foreground hover:bg-danger-hover"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded border border-outline-soft bg-surface md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-outline-soft bg-surface-hover">
              <th className="px-3 py-2 font-medium text-fg">Descripción</th>
              <th className="px-3 py-2 font-medium text-fg">Precio</th>
              <th className="px-3 py-2 font-medium text-fg">IVA %</th>
              <th className="px-3 py-2 font-medium text-fg">Clave</th>
              <th className="px-3 py-2 font-medium text-fg">Calif.</th>
              <th className="px-3 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-outline-soft last:border-0">
                <td className="px-3 py-2 font-medium">{p.description}</td>
                <td className="px-3 py-2">{formatCents("EUR", p.unitPriceCents)}</td>
                <td className="px-3 py-2 text-fg-muted">{p.tipoImpositivo}</td>
                <td className="px-3 py-2 text-fg-muted">{p.claveRegimen}</td>
                <td className="px-3 py-2 text-fg-muted">{p.calificacion}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      disabled={pending}
                      className="rounded border border-outline bg-surface px-2 py-1 text-xs hover:bg-surface-hover"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      disabled={pending}
                      className="rounded border border-danger-outline bg-danger px-2 py-1 text-xs text-danger-foreground hover:bg-danger-hover"
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

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-16"
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <form
            onSubmit={onSaveEdit}
            className="w-full max-w-md rounded-lg border border-outline-soft bg-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-base font-semibold">Editar producto</h2>
            {error ? <p className="mb-2 text-sm text-danger-foreground">{error}</p> : null}
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-fg-muted">Descripción</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded border border-outline px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-fg-muted">Precio (€)</span>
                <input
                  value={form.unitPrice}
                  onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                  className="w-full rounded border border-outline px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-fg-muted">Tipo impositivo</span>
                <select
                  value={form.tipoImpositivo}
                  onChange={(e) => setForm((f) => ({ ...f, tipoImpositivo: e.target.value }))}
                  className="w-full rounded border border-outline px-3 py-2 text-sm"
                >
                  {TIPO_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}%
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-fg-muted">Clave régimen</span>
                <input
                  value={form.claveRegimen}
                  onChange={(e) => setForm((f) => ({ ...f, claveRegimen: e.target.value }))}
                  className="w-full rounded border border-outline px-3 py-2 text-sm"
                  maxLength={2}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-fg-muted">Calificación</span>
                <input
                  value={form.calificacion}
                  onChange={(e) => setForm((f) => ({ ...f, calificacion: e.target.value }))}
                  className="w-full rounded border border-outline px-3 py-2 text-sm"
                  maxLength={2}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded border border-outline px-3 py-1.5 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-60"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
