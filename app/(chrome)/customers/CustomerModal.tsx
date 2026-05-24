"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DestinatarioIdFields } from "@/app/(chrome)/invoices/new/components/DestinatarioIdFields";
import { ModalOverlay } from "@/app/components/ModalOverlay";
import {
  createCustomerAction,
  updateCustomerAction,
  type CustomerRow,
} from "./actions";
import {
  destinatarioIdFromCustomer,
  type CustomerIdScheme,
} from "@/lib/invoices/destinatario-id";

type CustomerModalProps = {
  customer?: CustomerRow;
  onClose: () => void;
  onSaved?: (c: CustomerRow) => void;
};

function emptyForm() {
  return {
    name: "",
    nif: "",
    email: "",
    tipoPersona: "J" as "F" | "J",
    idScheme: "NIF" as CustomerIdScheme,
    idType: "",
    codigoPais: "",
    foreignId: "",
  };
}

function formFromCustomer(c: CustomerRow) {
  const id = destinatarioIdFromCustomer(c);
  return {
    name: c.name,
    nif: id.nif,
    email: c.email ?? "",
    tipoPersona: (c.tipoPersona === "F" ? "F" : "J") as "F" | "J",
    idScheme: id.idScheme,
    idType: id.idType,
    codigoPais: id.codigoPais,
    foreignId: id.foreignId,
  };
}

export function CustomerModal({ customer, onClose, onSaved }: CustomerModalProps) {
  const router = useRouter();
  const isEdit = Boolean(customer);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(() => (customer ? formFromCustomer(customer) : emptyForm()));
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    return () => {
      triggerRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  useEffect(() => {
    const container = formRef.current;
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
      } else if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      if (isEdit && customer) {
        const r = await updateCustomerAction(customer.id, form);
        if (!r.ok) {
          setError(r.error ?? "Error al guardar.");
          return;
        }
        onSaved?.(customer);
        onClose();
        router.refresh();
        return;
      }

      const r = await createCustomerAction(form);
      if (!r.ok || !r.customer) {
        setError(r.error ?? "Error al guardar.");
        return;
      }
      onSaved?.(r.customer);
      onClose();
      router.refresh();
    });
  }

  return (
    <ModalOverlay
      className="flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 animate-fade-in-up"
      onClick={(e) => e.target === e.currentTarget && !pending && onClose()}
    >
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-outline-soft bg-surface/90 backdrop-blur-xl p-6 shadow-2xl animate-[modal-enter_200ms_cubic-bezier(0.16,1,0.3,1)] font-display"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-outline-soft/50 pb-3">
          <h2 className="text-lg font-black tracking-tight text-fg">
            {isEdit ? "Editar cliente" : "Nuevo cliente"}
          </h2>
          <button
            type="button"
            onClick={() => !pending && onClose()}
            className="rounded-lg p-1 text-fg-subtle hover:bg-surface-muted hover:text-fg transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger-outline/40 bg-danger/10 p-3.5 text-xs font-semibold text-danger-foreground backdrop-blur-md">
            <svg className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger-emphasis" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">
              Nombre o razón social <span className="text-danger-emphasis">*</span>
            </span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input rounded-xl border-outline-soft/80 bg-surface/50 py-2.5 px-3.5 font-sans font-medium text-fg shadow-sm transition-all focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20"
              required
            />
          </label>

          <DestinatarioIdFields
            idScheme={form.idScheme}
            onSchemeChange={(s) =>
              setForm((f) => ({
                ...f,
                idScheme: s,
                ...(s === "NIF" ? { idType: "", codigoPais: "", foreignId: "" } : { nif: "" }),
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
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">
              Correo electrónico
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input rounded-xl border-outline-soft/80 bg-surface/50 py-2.5 px-3.5 font-sans font-medium text-fg shadow-sm transition-all focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-fg-subtle">
              Tipo de persona
            </span>
            <select
              value={form.tipoPersona}
              onChange={(e) => setForm((f) => ({ ...f, tipoPersona: e.target.value as "F" | "J" }))}
              className="input rounded-xl border-outline-soft/80 bg-surface/50 py-2.5 px-3.5 font-sans font-medium text-fg shadow-sm transition-all focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20"
            >
              <option value="J">Jurídica</option>
              <option value="F">Física</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2.5 border-t border-outline-soft/50 pt-4">
          <button type="button" onClick={onClose} disabled={pending} className="btn btn-sm btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={pending} className="btn btn-sm btn-primary">
            {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Guardar cliente"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
