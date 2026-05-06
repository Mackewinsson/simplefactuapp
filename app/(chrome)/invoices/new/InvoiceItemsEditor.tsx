"use client";

import { useState } from "react";
import { parseDecimalToCents, formatCents } from "@/lib/money";

export type InvoiceItemRow = {
  description: string;
  quantity: number;
  unitPrice: string;
  discountCents: number;
  discountConcept: string;
  claveRegimen: string;
  calificacion: string;
  tipoImpositivo: string;
};

export const DEFAULT_ITEM: InvoiceItemRow = {
  description: "",
  quantity: 1,
  unitPrice: "",
  discountCents: 0,
  discountConcept: "",
  claveRegimen: "01",
  calificacion: "S1",
  tipoImpositivo: "21.0",
};

const CLAVE_REGIMEN_OPTIONS = [
  { value: "01", label: "01 – Régimen general" },
  { value: "02", label: "02 – Exportación" },
  { value: "03", label: "03 – Régimen especial bienes usados" },
  { value: "04", label: "04 – Régimen especial oro de inversión" },
  { value: "05", label: "05 – Régimen especial agencias de viajes" },
  { value: "06", label: "06 – Régimen especial grupo de entidades en IVA" },
  { value: "07", label: "07 – Régimen especial criterio de caja" },
  { value: "08", label: "08 – Operaciones sujetas al IPSI/IGIC" },
  { value: "09", label: "09 – Facturación de los prestadores de servicios de telecomunicación" },
  { value: "10", label: "10 – Cobros por cuenta de terceros" },
  { value: "11", label: "11 – Operaciones de arrendamiento de local de negocio" },
  { value: "14", label: "14 – Factura con IVA pendiente de devengo" },
  { value: "15", label: "15 – Régimen especial del grupo de entidades en IVA – entidad dependiente" },
];

const CALIFICACION_OPTIONS = [
  { value: "S1", label: "S1 – Sujeta – No exenta" },
  { value: "S2", label: "S2 – Sujeta – No exenta con inversión del sujeto pasivo" },
  { value: "N1", label: "N1 – No sujeta: artículos 7, 14, otros" },
  { value: "N2", label: "N2 – No sujeta: reglas de localización" },
  { value: "E1", label: "E1 – Exenta: artículo 20" },
  { value: "E2", label: "E2 – Exenta: artículo 21" },
  { value: "E3", label: "E3 – Exenta: artículo 22" },
  { value: "E4", label: "E4 – Exenta: artículo 23 y 24" },
  { value: "E5", label: "E5 – Exenta: artículo 25" },
  { value: "E6", label: "E6 – Exenta: otro" },
];

const TIPO_IMPOSITIVO_OPTIONS = [
  { value: "0.0", label: "0%" },
  { value: "4.0", label: "4%" },
  { value: "10.0", label: "10%" },
  { value: "21.0", label: "21%" },
];

function calcLine(item: InvoiceItemRow): { base: number; cuota: number; total: number } {
  const unitCents = parseDecimalToCents(item.unitPrice);
  const baseCents = Math.max(0, item.quantity * unitCents - item.discountCents);
  const taxRate = parseFloat(item.tipoImpositivo) || 0;
  const cuotaCents = Math.round((baseCents * taxRate) / 100);
  return { base: baseCents, cuota: cuotaCents, total: baseCents + cuotaCents };
}

type ItemModalProps = {
  initial: InvoiceItemRow;
  onSave: (item: InvoiceItemRow) => void;
  onClose: () => void;
};

function ItemModal({ initial, onSave, onClose }: ItemModalProps) {
  const [item, setItem] = useState<InvoiceItemRow>(initial);
  const [hasDiscount, setHasDiscount] = useState(initial.discountCents > 0);
  const [discountInput, setDiscountInput] = useState(
    initial.discountCents > 0 ? (initial.discountCents / 100).toFixed(2) : ""
  );
  const [discountConceptInput, setDiscountConceptInput] = useState(initial.discountConcept || "");

  const line = calcLine(item);
  const currency = "EUR";

  function set<K extends keyof InvoiceItemRow>(k: K, v: InvoiceItemRow[K]) {
    setItem((prev) => ({ ...prev, [k]: v }));
  }

  function handleDiscountInput(val: string) {
    setDiscountInput(val);
    set("discountCents", parseDecimalToCents(val));
  }

  function handleSave() {
    if (!item.description.trim()) return;
    if (!item.unitPrice) return;
    onSave({
      ...item,
      discountCents: hasDiscount ? item.discountCents : 0,
      discountConcept: hasDiscount ? discountConceptInput.trim().slice(0, 250) : "",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Línea de factura</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Descripción <span className="text-red-500">*</span>
            </span>
            <textarea
              value={item.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Descripción del producto o servicio"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Cantidad</span>
              <input
                type="number"
                min={1}
                value={item.quantity || ""}
                onChange={(e) => set("quantity", parseInt(e.target.value, 10) || 1)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Importe unitario (€) <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={item.unitPrice}
                onChange={(e) => set("unitPrice", e.target.value)}
                placeholder="0.00"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={hasDiscount}
                onChange={(e) => {
                  setHasDiscount(e.target.checked);
                  if (!e.target.checked) {
                    set("discountCents", 0);
                    setDiscountInput("");
                    setDiscountConceptInput("");
                  }
                }}
              />
              Añadir descuento
            </label>
            {hasDiscount && (
              <div className="mt-2 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-600">
                    Descuento (€)
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={discountInput}
                    onChange={(e) => handleDiscountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-600">
                    Concepto del descuento (opcional)
                  </span>
                  <input
                    type="text"
                    value={discountConceptInput}
                    onChange={(e) => setDiscountConceptInput(e.target.value.slice(0, 250))}
                    maxLength={250}
                    placeholder="p. ej. Pronto pago"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
                  />
                </label>
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Tipo impositivo</span>
            <select
              value={item.tipoImpositivo}
              onChange={(e) => set("tipoImpositivo", e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {TIPO_IMPOSITIVO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Clave de régimen</span>
            <select
              value={item.claveRegimen}
              onChange={(e) => set("claveRegimen", e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {CLAVE_REGIMEN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Calificación de la operación
            </span>
            <select
              value={item.calificacion}
              onChange={(e) => set("calificacion", e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {CALIFICACION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded border border-gray-100 bg-gray-50 p-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Base imponible</span>
              <span>{formatCents(currency, line.base)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Cuota ({item.tipoImpositivo}%)</span>
              <span>{formatCents(currency, line.cuota)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 font-medium">
              <span>Total línea</span>
              <span>{formatCents(currency, line.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!item.description.trim() || !item.unitPrice}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            Guardar línea
          </button>
        </div>
      </div>
    </div>
  );
}

type Props = {
  items: InvoiceItemRow[];
  onChange: (items: InvoiceItemRow[]) => void;
  onAddFromCatalog?: () => void;
};

export function InvoiceItemsEditor({ items, onChange, onAddFromCatalog }: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const currency = "EUR";

  function saveItem(idx: number, item: InvoiceItemRow) {
    const next = [...items];
    next[idx] = item;
    onChange(next);
    setEditingIdx(null);
  }

  function addItem(item: InvoiceItemRow) {
    onChange([...items, item]);
    setIsAdding(false);
  }

  function removeItem(idx: number) {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== idx));
  }

  const totals = items.reduce(
    (acc, item) => {
      const line = calcLine(item);
      return { base: acc.base + line.base, cuota: acc.cuota + line.cuota };
    },
    { base: 0, cuota: 0 }
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Líneas</span>
        <div className="flex gap-2">
          {onAddFromCatalog ? (
            <button
              type="button"
              onClick={onAddFromCatalog}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              Recuperar producto/servicio
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Añadir producto/servicio
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2 font-medium text-gray-700">Descripción</th>
                <th className="px-3 py-2 font-medium text-gray-700 text-right">Cant.</th>
                <th className="px-3 py-2 font-medium text-gray-700 text-right">Precio u.</th>
                <th className="px-3 py-2 font-medium text-gray-700 text-right">Base</th>
                <th className="px-3 py-2 font-medium text-gray-700 text-right">IVA</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => {
                const line = calcLine(row);
                return (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="px-3 py-2">
                      <span className="line-clamp-1">{row.description || "—"}</span>
                      {row.claveRegimen !== "01" || row.calificacion !== "S1" ? (
                        <span className="block text-xs text-gray-400">
                          {row.claveRegimen} · {row.calificacion} · {row.tipoImpositivo}%
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-right">{row.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatCents(currency, parseDecimalToCents(row.unitPrice))}</td>
                    <td className="px-3 py-2 text-right">{formatCents(currency, line.base)}</td>
                    <td className="px-3 py-2 text-right">{formatCents(currency, line.cuota)}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingIdx(i)}
                          className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                        >
                          Editar
                        </button>
                        {items.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeItem(i)}
                            className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-3 py-2 text-right text-xs font-medium text-gray-600">
                  Totales:
                </td>
                <td className="px-3 py-2 text-right text-sm font-medium">
                  {formatCents(currency, totals.base)}
                </td>
                <td className="px-3 py-2 text-right text-sm font-medium">
                  {formatCents(currency, totals.cuota)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {isAdding && (
        <ItemModal
          initial={DEFAULT_ITEM}
          onSave={addItem}
          onClose={() => setIsAdding(false)}
        />
      )}
      {editingIdx !== null && (
        <ItemModal
          initial={items[editingIdx]}
          onSave={(item) => saveItem(editingIdx, item)}
          onClose={() => setEditingIdx(null)}
        />
      )}
    </div>
  );
}
