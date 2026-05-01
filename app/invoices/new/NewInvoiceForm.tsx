"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createInvoiceAction, type CreateInvoiceState } from "./actions";
import { InvoiceItemsEditor, type InvoiceItemRow } from "./InvoiceItemsEditor";
import { extractSerie } from "@/lib/simplefactu/invoice-series";

const today = () => new Date().toISOString().slice(0, 10);

const defaultItems: InvoiceItemRow[] = [
  { description: "", quantity: 1, unitPrice: "" },
];

type NewInvoiceFormProps = {
  defaultCreatedByFirstName: string;
  defaultCreatedByLastName: string;
  existingSeries: string[];
};

export function NewInvoiceForm({
  defaultCreatedByFirstName,
  defaultCreatedByLastName,
  existingSeries,
}: NewInvoiceFormProps) {
  const [state, formAction] = useActionState<CreateInvoiceState, FormData>(
    createInvoiceAction,
    null
  );
  const [numberValue, setNumberValue] = useState("");

  const detectedSerie = numberValue.trim() ? extractSerie(numberValue.trim()) : null;
  const isNewSeries =
    detectedSerie !== null && !existingSeries.includes(detectedSerie);
  const hasExistingSeries = existingSeries.length > 0;

  const seriesHint =
    detectedSerie && hasExistingSeries
      ? isNewSeries
        ? {
            type: "warn" as const,
            text: `Nueva serie — esta factura iniciará una cadena nueva en AEAT. Si quieres continuar la serie existente "${existingSeries[0]}", usa un número como "${existingSeries[0]}/F-001".`,
          }
        : {
            type: "ok" as const,
            text: `Continúa la serie "${detectedSerie}" — se encadenará con las facturas anteriores.`,
          }
      : detectedSerie && !hasExistingSeries
      ? {
          type: "info" as const,
          text: `Serie detectada: "${detectedSerie}". Esta será la primera factura enviada a AEAT.`,
        }
      : null;

  return (
    <form action={formAction} className="space-y-6">
      {state?.errors?.length ? (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <ul className="list-inside list-disc space-y-0.5">
            {state.errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="block">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Number</span>
            <input
              type="text"
              name="number"
              list="series-suggestions"
              placeholder={
                hasExistingSeries ? `${existingSeries[0]}/F-001` : "2026/F-001"
              }
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              autoComplete="off"
            />
          </label>
          {hasExistingSeries ? (
            <datalist id="series-suggestions">
              {existingSeries.map((s) => (
                <option key={s} value={`${s}/`} />
              ))}
            </datalist>
          ) : null}
          {seriesHint ? (
            <p
              className={`mt-1.5 text-xs ${
                seriesHint.type === "warn"
                  ? "text-amber-700"
                  : seriesHint.type === "ok"
                  ? "text-green-700"
                  : "text-gray-500"
              }`}
            >
              {seriesHint.text}
            </p>
          ) : null}
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Issue date</span>
          <input
            type="date"
            name="issueDate"
            defaultValue={today()}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Due date</span>
          <input
            type="date"
            name="dueDate"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Issued by (first name)</span>
          <input
            type="text"
            name="createdByFirstName"
            defaultValue={defaultCreatedByFirstName}
            placeholder="First name"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Issued by (last name)</span>
          <input
            type="text"
            name="createdByLastName"
            defaultValue={defaultCreatedByLastName}
            placeholder="Last name"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Customer name</span>
          <input
            type="text"
            name="customerName"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Customer email</span>
          <input
            type="email"
            name="customerEmail"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Customer NIF / CIF (Verifactu)
          </span>
          <input
            type="text"
            name="customerNif"
            placeholder="e.g. B12345678"
            className="w-full max-w-md rounded border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Notes</span>
        <textarea
          name="notes"
          rows={2}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="block w-24">
        <span className="mb-1 block text-sm font-medium text-gray-700">Tax rate %</span>
        <input
          type="number"
          name="taxRatePercent"
          min={0}
          max={100}
          step={0.01}
          defaultValue={21}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <ItemsSection />

      <div className="flex gap-3">
        <SubmitButton />
        <Link
          href="/invoices"
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-70 disabled:pointer-events-none"
    >
      {pending ? "Saving…" : "Create invoice"}
    </button>
  );
}

function ItemsSection() {
  const [items, setItems] = useState<InvoiceItemRow[]>(defaultItems);
  return (
    <>
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <InvoiceItemsEditor items={items} onChange={setItems} />
    </>
  );
}
