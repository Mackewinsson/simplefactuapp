"use client";

import { useEffect, useState } from "react";
import { getProductsAction, type ProductRow } from "@/app/(chrome)/products/actions";
import { formatCents } from "@/lib/money";

type SelectProductModalProps = {
  onSelect: (p: ProductRow) => void;
  onClose: () => void;
};

export function SelectProductModal({ onSelect, onClose }: SelectProductModalProps) {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProductsAction().then((r) => {
      if (cancelled) return;
      setProducts(r.products);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = (products ?? []).filter((p) =>
    p.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg border border-outline-soft bg-surface p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-fg">Recuperar producto/servicio</h3>
          <button type="button" onClick={onClose} className="text-fg-subtle hover:text-fg-muted">
            ✕
          </button>
        </div>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar producto…"
          className="mb-3 w-full rounded border border-outline px-3 py-2 text-sm"
        />

        {loading ? (
          <p className="text-sm text-fg-subtle">Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-fg-subtle">Sin productos guardados.</p>
        ) : (
          <ul className="max-h-64 divide-y divide-outline-soft overflow-y-auto">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                  className="w-full px-3 py-2.5 text-left hover:bg-surface-hover"
                >
                  <span className="block text-sm font-medium text-fg">{p.description}</span>
                  <span className="text-xs text-fg-subtle">
                    {formatCents("EUR", p.unitPriceCents)} · {p.tipoImpositivo}% IVA
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 border-t border-outline-soft pt-3">
          <button type="button" onClick={onClose} className="text-sm text-fg-subtle hover:underline">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
