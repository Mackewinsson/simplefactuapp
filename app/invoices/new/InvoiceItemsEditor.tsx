"use client";

export type InvoiceItemRow = {
  description: string;
  quantity: number;
  unitPrice: string;
};

type Props = {
  items: InvoiceItemRow[];
  onChange: (items: InvoiceItemRow[]) => void;
};

export function InvoiceItemsEditor({ items, onChange }: Props) {
  function update(i: number, field: keyof InvoiceItemRow, value: string | number) {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  }

  function add() {
    onChange([...items, { description: "", quantity: 1, unitPrice: "" }]);
  }

  function remove(i: number) {
    if (items.length <= 1) return;
    onChange(items.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Items</span>
        <button
          type="button"
          onClick={add}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add row
        </button>
      </div>
      <div className="space-y-2 rounded border border-gray-200 bg-gray-50/50 p-3">
        {items.map((row, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Description</span>
              <input
                type="text"
                name={`item_${i}_description`}
                value={row.description}
                onChange={(e) => update(i, "description", e.target.value)}
                placeholder="Description"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
              />
            </label>
            <label className="w-20">
              <span className="sr-only">Quantity</span>
              <input
                type="number"
                name={`item_${i}_quantity`}
                min={1}
                value={row.quantity || ""}
                onChange={(e) => update(i, "quantity", e.target.value ? parseInt(e.target.value, 10) : 1)}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
              />
            </label>
            <label className="w-28">
              <span className="sr-only">Unit price</span>
              <input
                type="text"
                name={`item_${i}_unitPrice`}
                inputMode="decimal"
                value={row.unitPrice}
                onChange={(e) => update(i, "unitPrice", e.target.value)}
                placeholder="0.00"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={items.length <= 1}
              className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
