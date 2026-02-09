"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createInvoiceAction, type CreateInvoiceState } from "./actions";
import { InvoiceItemsEditor, type InvoiceItemRow } from "./InvoiceItemsEditor";

const today = () => new Date().toISOString().slice(0, 10);

const defaultItems: InvoiceItemRow[] = [
  { description: "", quantity: 1, unitPrice: "" },
];

export function NewInvoiceForm() {
  const [state, formAction] = useActionState<CreateInvoiceState, FormData>(
    createInvoiceAction,
    null
  );

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
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Number</span>
          <input
            type="text"
            name="number"
            placeholder="INV-0001"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
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
