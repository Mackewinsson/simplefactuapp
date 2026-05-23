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
      <div className="panel-premium rounded-2xl p-8 text-center max-w-md mx-auto my-6 border border-outline-soft/75 backdrop-blur-md">
        <svg className="h-10 w-10 text-fg-subtle mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-sm font-bold text-fg mb-1">No hay clientes guardados</p>
        <p className="text-xs text-fg-muted mb-4 font-sans font-medium">Puedes añadir un cliente automáticamente al emitir una factura.</p>
        <Link href="/invoices/new" className="btn btn-sm btn-accent rounded-xl px-4 py-2 font-bold shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-[0.5px] transition-all">
          Emitir primera factura
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="space-y-3.5 md:hidden">
        {customers.map((c) => (
          <article
            key={c.id}
            onClick={() => startEdit(c)}
            className="panel-premium rounded-2xl p-5 border border-outline-soft/80 bg-surface/50 backdrop-blur-sm cursor-pointer hover:bg-surface-hover/50 hover:border-outline transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold text-fg text-base tracking-tight">{c.name}</p>
                <code className="mt-1 block text-xs font-bold text-fg-subtle bg-surface-muted px-2 py-0.5 rounded border border-outline-soft/40 w-fit">
                  {customerIdLabel(c)}
                </code>
              </div>
              <span className={`shrink-0 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                c.tipoPersona === "J" 
                  ? "text-accent bg-accent/10 border border-accent-outline/25" 
                  : "text-fg-subtle bg-surface-muted border border-outline-soft/60"
              }`}>
                {c.tipoPersona === "J" ? "Jurídica" : c.tipoPersona === "F" ? "Física" : "—"}
              </span>
            </div>
            
            {c.email && (
              <div className="mt-3.5 pt-3.5 border-t border-outline-soft/40 text-xs text-fg-muted font-sans font-semibold flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-fg-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {c.email}
              </div>
            )}
            
            <div className="mt-4 pt-3.5 border-t border-outline-soft/40 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(c);
                }}
                disabled={pending}
                className="btn btn-sm btn-secondary rounded-xl font-bold px-4 py-2 border-outline-soft text-xs shadow-sm hover:bg-surface-muted transition-all"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
                disabled={pending}
                className="btn btn-sm btn-danger rounded-xl font-bold px-4 py-2 text-xs shadow-sm transition-all"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md shadow-sm overflow-hidden md:block">
        <table className="w-full min-w-[520px] text-left text-sm font-sans">
          <thead>
            <tr className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Identificación</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Correo electrónico</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Tipo</th>
              <th scope="col" className="px-4 py-3 w-40 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => startEdit(c)}
                className="border-b border-outline-soft/50 last:border-0 hover:bg-surface-hover/80 transition-colors font-medium cursor-pointer"
              >
                <td className="px-4 py-3.5 text-fg font-extrabold font-display">{c.name}</td>
                <td className="px-4 py-3.5">
                  <code className="text-xs font-bold text-fg-subtle bg-surface-muted/80 px-2 py-0.5 rounded border border-outline-soft/40 font-mono">
                    {customerIdLabel(c)}
                  </code>
                </td>
                <td className="px-4 py-3.5 text-fg-muted font-sans text-xs">{c.email ?? "—"}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                    c.tipoPersona === "J" 
                      ? "text-accent bg-accent/10 border border-accent-outline/25" 
                      : "text-fg-subtle bg-surface-muted border border-outline-soft/60"
                  }`}>
                    {c.tipoPersona === "J" ? "Jurídica" : c.tipoPersona === "F" ? "Física" : "—"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(c);
                      }}
                      disabled={pending}
                      className="btn btn-sm btn-secondary rounded-xl font-bold px-3 py-1.5 border-outline-soft text-xs shadow-sm hover:bg-surface-muted transition-all"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                      disabled={pending}
                      className="btn btn-sm btn-danger rounded-xl font-bold px-3 py-1.5 text-xs shadow-sm transition-all"
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

      {/* Modal Dialog Editor */}
      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 animate-fade-in-up"
          onClick={(e) => e.target === e.currentTarget && !pending && setEditing(null)}
        >
          <form
            ref={editFormRef}
            onSubmit={onSaveEdit}
            className="w-full max-w-md rounded-2xl border border-outline-soft bg-surface/90 backdrop-blur-xl p-6 shadow-2xl animate-[modal-enter_200ms_cubic-bezier(0.16,1,0.3,1)] font-display"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-soft/50">
              <h2 className="text-lg font-black tracking-tight text-fg">Editar cliente</h2>
              <button
                type="button"
                onClick={() => !pending && setEditing(null)}
                className="text-fg-subtle hover:text-fg rounded-lg p-1 hover:bg-surface-muted transition-colors"
                aria-label="Cerrar modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error ? (
              <div className="mb-4 text-xs text-danger-foreground font-semibold bg-danger/10 p-3.5 rounded-xl border border-danger-outline/40 backdrop-blur-md flex items-start gap-2">
                <svg className="h-4.5 w-4.5 text-danger-emphasis shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            ) : null}

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">Nombre o Razón social</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50"
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
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">Correo electrónico</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">Tipo de persona</span>
                <select
                  value={form.tipoPersona}
                  onChange={(e) => setForm((f) => ({ ...f, tipoPersona: e.target.value as "F" | "J" }))}
                  className="input rounded-xl border-outline-soft/80 py-2.5 px-3.5 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50"
                >
                  <option value="J">Jurídica</option>
                  <option value="F">Física</option>
                </select>
              </label>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-soft/50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={pending}
                className="btn btn-sm btn-secondary rounded-xl font-bold px-4 py-2 border-outline-soft shadow-sm text-xs hover:bg-surface-muted transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="btn btn-sm btn-primary rounded-xl px-5 py-2 font-bold shadow-md hover:-translate-y-[0.5px] transition-all text-xs disabled:opacity-60"
              >
                {pending ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
