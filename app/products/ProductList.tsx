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
      <p className="text-sm text-gray-600">
        No hay productos en catálogo. Añade líneas en{" "}
        <Link href="/invoices/new" className="text-blue-600 hover:underline">
          Nueva factura
        </Link>{" "}
        y guárdalos desde el flujo de productos, o crea uno aquí más adelante.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2 font-medium text-gray-900">Descripción</th>
              <th className="px-3 py-2 font-medium text-gray-900">Precio</th>
              <th className="px-3 py-2 font-medium text-gray-900">IVA %</th>
              <th className="px-3 py-2 font-medium text-gray-900">Clave</th>
              <th className="px-3 py-2 font-medium text-gray-900">Calif.</th>
              <th className="px-3 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2 font-medium">{p.description}</td>
                <td className="px-3 py-2">{formatCents("EUR", p.unitPriceCents)}</td>
                <td className="px-3 py-2 text-gray-600">{p.tipoImpositivo}</td>
                <td className="px-3 py-2 text-gray-600">{p.claveRegimen}</td>
                <td className="px-3 py-2 text-gray-600">{p.calificacion}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      disabled={pending}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      disabled={pending}
                      className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-800 hover:bg-red-100"
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
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-base font-semibold">Editar producto</h2>
            {error ? <p className="mb-2 text-sm text-red-700">{error}</p> : null}
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">Descripción</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">Precio (€)</span>
                <input
                  value={form.unitPrice}
                  onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">Tipo impositivo</span>
                <select
                  value={form.tipoImpositivo}
                  onChange={(e) => setForm((f) => ({ ...f, tipoImpositivo: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  {TIPO_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}%
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">Clave régimen</span>
                <input
                  value={form.claveRegimen}
                  onChange={(e) => setForm((f) => ({ ...f, claveRegimen: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  maxLength={2}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">Calificación</span>
                <input
                  value={form.calificacion}
                  onChange={(e) => setForm((f) => ({ ...f, calificacion: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  maxLength={2}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-60"
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
