"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomerAction, type CustomerRow } from "./actions";
import { CustomerModal } from "./CustomerModal";

type Props = {
  customers: CustomerRow[];
  onRequestCreate: () => void;
};

export function CustomerList({ customers, onRequestCreate }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CustomerRow | null>(null);

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

  if (customers.length === 0) {
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="mb-1 text-sm font-bold text-fg">No hay clientes guardados</p>
        <p className="mb-4 font-sans text-xs font-medium text-fg-muted">
          Añade tu primer cliente al catálogo para reutilizarlo al facturar.
        </p>
        <button type="button" onClick={onRequestCreate} className="btn btn-sm btn-accent">
          Añadir primer cliente
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3.5 md:hidden">
        {customers.map((c) => (
          <article
            key={c.id}
            onClick={() => setEditing(c)}
            className="panel-premium cursor-pointer rounded-2xl border border-outline-soft/80 bg-surface/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-outline hover:bg-surface-hover/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-extrabold tracking-tight text-fg">{c.name}</p>
                <code className="mt-1 block w-fit rounded border border-outline-soft/40 bg-surface-muted px-2 py-0.5 text-xs font-bold text-fg-subtle">
                  {customerIdLabel(c)}
                </code>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  c.tipoPersona === "J"
                    ? "border border-accent-outline/25 bg-accent/10 text-accent"
                    : "border border-outline-soft/60 bg-surface-muted text-fg-subtle"
                }`}
              >
                {c.tipoPersona === "J" ? "Jurídica" : c.tipoPersona === "F" ? "Física" : "—"}
              </span>
            </div>

            {c.email ? (
              <div className="mt-3.5 flex items-center gap-1.5 border-t border-outline-soft/40 pt-3.5 font-sans text-xs font-semibold text-fg-muted">
                <svg className="h-3.5 w-3.5 text-fg-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {c.email}
              </div>
            ) : null}

            <div className="mt-4 flex justify-end gap-2 border-t border-outline-soft/40 pt-3.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(c);
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
                  onDelete(c.id);
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
        <table className="w-full min-w-[520px] text-left text-sm font-sans">
          <thead>
            <tr className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">
                Identificación
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">
                Correo electrónico
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="w-40 px-4 py-3 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => setEditing(c)}
                className="cursor-pointer border-b border-outline-soft/50 font-medium transition-colors last:border-0 hover:bg-surface-hover/80"
              >
                <td className="px-4 py-3.5 font-display font-extrabold text-fg">{c.name}</td>
                <td className="px-4 py-3.5">
                  <code className="rounded border border-outline-soft/40 bg-surface-muted/80 px-2 py-0.5 font-mono text-xs font-bold text-fg-subtle">
                    {customerIdLabel(c)}
                  </code>
                </td>
                <td className="px-4 py-3.5 font-sans text-xs text-fg-muted">{c.email ?? "—"}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      c.tipoPersona === "J"
                        ? "border border-accent-outline/25 bg-accent/10 text-accent"
                        : "border border-outline-soft/60 bg-surface-muted text-fg-subtle"
                    }`}
                  >
                    {c.tipoPersona === "J" ? "Jurídica" : c.tipoPersona === "F" ? "Física" : "—"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(c);
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
                        onDelete(c.id);
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

      {editing ? <CustomerModal customer={editing} onClose={() => setEditing(null)} /> : null}
    </>
  );
}
