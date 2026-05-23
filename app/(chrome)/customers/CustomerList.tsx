"use client";

import Link from "next/link";
import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomerAction, updateCustomerAction, type CustomerRow } from "./actions";
import { DestinatarioIdFields } from "@/app/(chrome)/invoices/new/components/DestinatarioIdFields";
import {
  destinatarioIdFromCustomer,
  type CustomerIdScheme,
} from "@/lib/invoices/destinatario-id";

type Props = { customers: CustomerRow[] };

export function CustomerList({ customers }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  
  const editFormRef = useRef<HTMLFormElement>(null);

  // Focus trap and Escape key for Editing Customer Modal
  const editTriggerRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (editing) {
      editTriggerRef.current = document.activeElement as HTMLElement;
    } else {
      editTriggerRef.current?.focus();
      editTriggerRef.current = null;
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) setEditing(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, pending]);

  useEffect(() => {
    if (!editing) return;
    const container = editFormRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [editing]);
  const [form, setForm] = useState({
    name: "",
    nif: "",
    email: "",
    tipoPersona: "J" as "F" | "J",
    idScheme: "NIF" as CustomerIdScheme,
    idType: "",
    codigoPais: "",
    foreignId: "",
  });
  const [error, setError] = useState<string | null>(null);

  function startEdit(c: CustomerRow) {
    setEditing(c);
    const id = destinatarioIdFromCustomer(c);
    setForm({
      name: c.name,
      nif: id.nif,
      email: c.email ?? "",
      tipoPersona: (c.tipoPersona === "F" ? "F" : "J") as "F" | "J",
      idScheme: id.idScheme,
      idType: id.idType,
      codigoPais: id.codigoPais,
      foreignId: id.foreignId,
    });
    setError(null);
  }

  function customerIdLabel(c: CustomerRow): string {
    if (c.idScheme === "ID_OTRO") {
      const parts = [c.idType, c.foreignId, c.codigoPais].filter(Boolean);
      return parts.length ? parts.join(" · ") : "ID_OTRO";
    }
    return c.nif ?? "—";
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
      <p className="text-sm text-fg-muted">
        No hay clientes guardados. Puedes crear uno desde{" "}
        <Link href="/invoices/new" className="text-accent hover:underline">
          Nueva factura
        </Link>
        .
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2 md:hidden">
        {customers.map((c) => (
          <article key={c.id} className="rounded border border-outline-soft bg-surface p-3">
            <p className="font-medium text-fg">{c.name}</p>
            <p className="mt-1 text-sm text-fg-muted">ID: {customerIdLabel(c)}</p>
            <p className="text-sm text-fg-muted">Correo: {c.email ?? "—"}</p>
            <p className="text-sm text-fg-muted">Tipo: {c.tipoPersona === "J" ? "Jurídica" : c.tipoPersona === "F" ? "Física" : "—"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startEdit(c)}
                disabled={pending}
                className="btn btn-sm btn-secondary"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                disabled={pending}
                className="btn btn-sm btn-danger"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded border border-outline-soft bg-surface md:block">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-outline-soft bg-surface-muted bg-surface-hover">
              <th scope="col" className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Nombre</th>
              <th scope="col" className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Identificación</th>
              <th scope="col" className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Correo</th>
              <th scope="col" className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Tipo</th>
              <th scope="col" className="px-3 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-outline-soft last:border-0">
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2 text-fg-muted">{customerIdLabel(c)}</td>
                <td className="px-3 py-2 text-fg-muted">{c.email ?? "—"}</td>
                <td className="px-3 py-2 text-fg-muted">
                  {c.tipoPersona === "J" ? "Jurídica" : c.tipoPersona === "F" ? "Física" : "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      disabled={pending}
                      className="btn btn-sm btn-secondary"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
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

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-16"
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <form
            ref={editFormRef}
            onSubmit={onSaveEdit}
            className="w-full max-w-md rounded-lg border border-outline-soft bg-surface p-5 shadow-xl animate-[modal-enter_150ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-base font-semibold">Editar cliente</h2>
            {error ? <p className="mb-2 text-sm text-danger-foreground">{error}</p> : null}
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-fg-muted">Nombre</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded border border-outline px-3 py-2 text-sm"
                  required
                />
              </label>
              <DestinatarioIdFields
                idScheme={form.idScheme}
                onSchemeChange={(s) =>
                  setForm((f) => ({
                    ...f,
                    idScheme: s,
                    ...(s === "NIF"
                      ? { idType: "", codigoPais: "", foreignId: "" }
                      : { nif: "" }),
                  }))
                }
                nif={form.nif}
                onNifChange={(v) => setForm((f) => ({ ...f, nif: v }))}
                idType={form.idType}
                onIdTypeChange={(v) => setForm((f) => ({ ...f, idType: v }))}
                codigoPais={form.codigoPais}
                onCodigoPaisChange={(v) => setForm((f) => ({ ...f, codigoPais: v }))}
                foreignId={form.foreignId}
                onForeignIdChange={(v) => setForm((f) => ({ ...f, foreignId: v }))}
                showVnif={false}
              />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-fg-muted">Correo</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded border border-outline px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-fg-muted">Tipo persona</span>
                <select
                  value={form.tipoPersona}
                  onChange={(e) => setForm((f) => ({ ...f, tipoPersona: e.target.value as "F" | "J" }))}
                  className="w-full rounded border border-outline px-3 py-2 text-sm"
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
