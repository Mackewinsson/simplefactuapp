"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCents } from "@/lib/money";
import { deleteProductAction, type ProductRow } from "./actions";
import { ProductModal } from "./ProductModal";

type Props = {
  products: ProductRow[];
  onRequestCreate: () => void;
};

export function ProductList({ products, onRequestCreate }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<ProductRow | null>(null);

  function onDelete(id: string) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    startTransition(async () => {
      await deleteProductAction(id);
      router.refresh();
    });
  }

  if (products.length === 0) {
    return (
      <div className="panel-premium mx-auto my-6 max-w-md rounded-2xl border border-outline-soft/75 p-8 text-center backdrop-blur-md">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-fg-subtle"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="mb-1 text-sm font-bold text-fg">Tu catálogo está vacío</p>
        <p className="mb-4 font-sans text-xs font-medium text-fg-muted">
          Añade productos o servicios para reutilizarlos en tus facturas.
        </p>
        <button type="button" onClick={onRequestCreate} className="btn btn-sm btn-accent">
          Añadir primer producto
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3.5 md:hidden">
        {products.map((p) => (
          <article
            key={p.id}
            onClick={() => setEditing(p)}
            className="panel-premium cursor-pointer rounded-2xl border border-outline-soft/80 bg-surface/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-outline hover:bg-surface-hover/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-extrabold leading-snug tracking-tight text-fg">{p.description}</p>
                <p className="mt-1.5 text-sm font-extrabold text-accent">{formatCents("EUR", p.unitPriceCents)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-success-outline/40 bg-success-outline/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-success-foreground">
                IVA {p.tipoImpositivo}%
              </span>
            </div>

            <div className="mt-3.5 flex items-center justify-between border-t border-outline-soft/40 pt-3.5 text-xs font-semibold text-fg-subtle">
              <span>
                Clave: <strong className="text-fg">{p.claveRegimen}</strong>
              </span>
              <span>
                Calif: <strong className="text-fg">{p.calificacion}</strong>
              </span>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-outline-soft/40 pt-3.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(p);
                }}
                disabled={pending}
                className="btn btn-sm btn-secondary"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(p.id);
                }}
                disabled={pending}
                className="btn btn-sm btn-danger"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-outline-soft/80 bg-surface/50 shadow-sm backdrop-blur-md md:block">
        <table className="w-full min-w-[640px] text-left text-sm font-sans">
          <thead>
            <tr className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">
                Concepto / descripción
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">
                Precio unitario
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">
                IVA
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">
                Clave régimen
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">
                Calificación
              </th>
              <th scope="col" className="w-40 px-4 py-3 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                onClick={() => setEditing(p)}
                className="cursor-pointer border-b border-outline-soft/50 font-medium transition-colors last:border-0 hover:bg-surface-hover/80"
              >
                <td className="px-4 py-3.5 font-display font-extrabold leading-snug text-fg">{p.description}</td>
                <td className="px-4 py-3.5 font-extrabold text-fg">{formatCents("EUR", p.unitPriceCents)}</td>
                <td className="px-4 py-3.5">
                  <span className="rounded-full border border-success-outline/40 bg-success-outline/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-success-foreground">
                    {p.tipoImpositivo}%
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <code className="rounded border border-outline-soft/40 bg-surface-muted/80 px-2.5 py-0.5 font-mono text-xs font-bold text-fg-subtle">
                    {p.claveRegimen}
                  </code>
                </td>
                <td className="px-4 py-3.5">
                  <code className="rounded border border-outline-soft/40 bg-surface-muted/80 px-2.5 py-0.5 font-mono text-xs font-bold text-fg-subtle">
                    {p.calificacion}
                  </code>
                </td>
                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(p);
                      }}
                      disabled={pending}
                      className="btn btn-sm btn-secondary"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(p.id);
                      }}
                      disabled={pending}
                      className="btn btn-sm btn-danger"
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

      {editing ? <ProductModal product={editing} onClose={() => setEditing(null)} /> : null}
    </>
  );
}
