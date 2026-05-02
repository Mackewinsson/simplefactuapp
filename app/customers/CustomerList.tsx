"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomerAction, updateCustomerAction, type CustomerRow } from "./actions";

type Props = { customers: CustomerRow[] };

export function CustomerList({ customers }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [form, setForm] = useState({ name: "", nif: "", email: "", tipoPersona: "J" as "F" | "J" });
  const [error, setError] = useState<string | null>(null);

  function startEdit(c: CustomerRow) {
    setEditing(c);
    setForm({
      name: c.name,
      nif: c.nif ?? "",
      email: c.email ?? "",
      tipoPersona: (c.tipoPersona === "F" ? "F" : "J") as "F" | "J",
    });
    setError(null);
  }

  function onDelete(id: string) {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    startTransition(async () => {
      await deleteCustomerAction(id);
      router.refresh();
    });
  }

  function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const r = await updateCustomerAction(editing.id, form);
      if (!r.ok) {
        setError(r.error ?? "Error al guardar.");
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  if (customers.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No hay clientes guardados. Puedes crear uno desde{" "}
        <a href="/invoices/new" className="text-blue-600 hover:underline">
          Nueva factura
        </a>
        .
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2 font-medium text-gray-900">Nombre</th>
              <th className="px-3 py-2 font-medium text-gray-900">NIF</th>
              <th className="px-3 py-2 font-medium text-gray-900">Email</th>
              <th className="px-3 py-2 font-medium text-gray-900">Tipo</th>
              <th className="px-3 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2 text-gray-600">{c.nif ?? "—"}</td>
                <td className="px-3 py-2 text-gray-600">{c.email ?? "—"}</td>
                <td className="px-3 py-2 text-gray-600">{c.tipoPersona ?? "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      disabled={pending}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
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
            <h2 className="mb-3 text-base font-semibold">Editar cliente</h2>
            {error ? <p className="mb-2 text-sm text-red-700">{error}</p> : null}
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">Nombre</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">NIF</span>
                <input
                  value={form.nif}
                  onChange={(e) => setForm((f) => ({ ...f, nif: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700">Tipo persona</span>
                <select
                  value={form.tipoPersona}
                  onChange={(e) => setForm((f) => ({ ...f, tipoPersona: e.target.value as "F" | "J" }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="J">Jurídica</option>
                  <option value="F">Física</option>
                </select>
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
