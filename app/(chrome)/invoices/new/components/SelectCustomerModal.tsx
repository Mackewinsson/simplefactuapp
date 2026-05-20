"use client";

import { useEffect, useState } from "react";
import { getCustomersAction, type CustomerRow } from "@/app/(chrome)/customers/actions";

type SelectCustomerModalProps = {
  onSelect: (c: CustomerRow) => void;
  onClose: () => void;
};

export function SelectCustomerModal({ onSelect, onClose }: SelectCustomerModalProps) {
  const [customers, setCustomers] = useState<CustomerRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    getCustomersAction().then((r) => {
      if (cancelled) return;
      setCustomers(r.customers);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = (customers ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      (c.nif ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg border border-outline-soft bg-surface p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-fg">Seleccionar destinatario</h3>
          <button type="button" onClick={onClose} className="text-fg-subtle hover:text-fg-muted">
            ✕
          </button>
        </div>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar por nombre o NIF…"
          className="mb-3 w-full rounded border border-outline px-3 py-2 text-sm"
        />

        {loading ? (
          <p className="text-sm text-fg-subtle">Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-fg-subtle">Sin clientes guardados.</p>
        ) : (
          <ul className="max-h-64 divide-y divide-outline-soft overflow-y-auto">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    onClose();
                  }}
                  className="w-full px-3 py-2.5 text-left hover:bg-surface-hover"
                >
                  <span className="block text-sm font-medium text-fg">{c.name}</span>
                  {c.nif ? <span className="text-xs text-fg-subtle">{c.nif}</span> : null}
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
