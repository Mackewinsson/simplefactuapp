"use client";

import { useState } from "react";
import { createCustomerAction } from "@/app/(chrome)/customers/actions";
import { DestinatarioIdFields } from "./DestinatarioIdFields";
import type { CustomerIdScheme } from "@/lib/invoices/destinatario-id";
import type { CustomerRow } from "@/app/(chrome)/customers/actions";

type CustomerFormModalProps = {
  onSave: (c: CustomerRow) => void;
  onClose: () => void;
};

export function CustomerFormModal({ onSave, onClose }: CustomerFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tipoPersona, setTipoPersona] = useState("J");
  const [idScheme, setIdScheme] = useState<CustomerIdScheme>("NIF");
  const [nif, setNif] = useState("");
  const [idType, setIdType] = useState("");
  const [codigoPais, setCodigoPais] = useState("");
  const [foreignId, setForeignId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    const r = await createCustomerAction({
      name: name.trim(),
      nif: nif.trim(),
      email: email.trim(),
      tipoPersona,
      idScheme,
      idType,
      codigoPais,
      foreignId,
    });
    setSaving(false);
    if (!r.ok || !r.customer) {
      setError(r.error ?? "Error al guardar.");
      return;
    }
    onSave(r.customer);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg border border-outline-soft bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-fg">Nuevo destinatario</h3>
          <button type="button" onClick={onClose} className="text-fg-subtle hover:text-fg-muted">
            ✕
          </button>
        </div>

        {error ? (
          <p className="mb-3 rounded border border-danger-outline bg-danger px-3 py-2 text-sm text-danger-foreground">
            {error}
          </p>
        ) : null}

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-muted">
              Razón social / Nombre <span className="text-danger-emphasis">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-outline px-3 py-2 text-sm"
            />
          </label>

          <DestinatarioIdFields
            idScheme={idScheme}
            onSchemeChange={(s) => {
              setIdScheme(s);
              if (s === "NIF") {
                setIdType("");
                setCodigoPais("");
                setForeignId("");
              } else {
                setNif("");
              }
            }}
            nif={nif}
            onNifChange={setNif}
            idType={idType}
            onIdTypeChange={setIdType}
            codigoPais={codigoPais}
            onCodigoPaisChange={setCodigoPais}
            foreignId={foreignId}
            onForeignIdChange={setForeignId}
            showVnif={false}
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-muted">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-outline px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-muted">Tipo de persona</span>
            <select
              value={tipoPersona}
              onChange={(e) => setTipoPersona(e.target.value)}
              className="w-full rounded border border-outline px-3 py-2 text-sm"
            >
              <option value="J">J – Persona jurídica</option>
              <option value="F">F – Persona física</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-outline bg-surface px-4 py-2 text-sm font-medium text-fg-muted hover:bg-surface-hover"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}
