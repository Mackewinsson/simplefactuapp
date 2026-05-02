"use client";

import Link from "next/link";
import { useActionState, useState, useRef, useEffect, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { createInvoiceAction, type CreateInvoiceState } from "./actions";
import {
  InvoiceItemsEditor,
  type InvoiceItemRow,
  DEFAULT_ITEM,
} from "./InvoiceItemsEditor";
import {
  getCustomersAction,
  createCustomerAction,
  type CustomerRow,
} from "@/app/customers/actions";
import {
  getProductsAction,
  type ProductRow,
} from "@/app/products/actions";
import { parseDecimalToCents, formatCents } from "@/lib/money";
import { verifyRecipientNif } from "./verify-recipient-nif";

const today = () => new Date().toISOString().slice(0, 10);

type NewInvoiceFormProps = {
  defaultCreatedByFirstName: string;
  defaultCreatedByLastName: string;
  existingSeries: string[];
};

// ─── Series picker modal ────────────────────────────────────────────────────

type SeriesModalProps = {
  existingSeries: string[];
  onSelect: (serie: string) => void;
  onClose: () => void;
};

function SeriesModal({ existingSeries, onSelect, onClose }: SeriesModalProps) {
  const [newSerie, setNewSerie] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Gestión de series</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        {existingSeries.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Series existentes
            </p>
            <ul className="space-y-1">
              {existingSeries.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(s);
                      onClose();
                    }}
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Nueva serie
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSerie}
              onChange={(e) => setNewSerie(e.target.value)}
              placeholder="p.ej. 2026"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newSerie.trim()) {
                  onSelect(newSerie.trim());
                  onClose();
                }
              }}
            />
            <button
              type="button"
              disabled={!newSerie.trim()}
              onClick={() => {
                if (newSerie.trim()) {
                  onSelect(newSerie.trim());
                  onClose();
                }
              }}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Customer new modal ─────────────────────────────────────────────────────

type CustomerFormModalProps = {
  onSave: (c: { name: string; nif: string; email: string; tipoPersona: string }) => void;
  onClose: () => void;
};

function CustomerFormModal({ onSave, onClose }: CustomerFormModalProps) {
  const [name, setName] = useState("");
  const [nif, setNif] = useState("");
  const [email, setEmail] = useState("");
  const [tipoPersona, setTipoPersona] = useState("J");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) { setError("El nombre es obligatorio."); return; }
    setSaving(true);
    const r = await createCustomerAction({ name: name.trim(), nif: nif.trim(), email: email.trim(), tipoPersona });
    setSaving(false);
    if (!r.ok) { setError(r.error ?? "Error al guardar."); return; }
    onSave({ name: name.trim(), nif: nif.trim(), email: email.trim(), tipoPersona });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Nuevo destinatario</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        {error ? (
          <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Razón social / Nombre <span className="text-red-500">*</span></span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">NIF / CIF</span>
            <input type="text" value={nif} onChange={(e) => setNif(e.target.value)} placeholder="B12345678" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Tipo de persona</span>
            <select value={tipoPersona} onChange={(e) => setTipoPersona(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="J">J – Persona jurídica</option>
              <option value="F">F – Persona física</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button type="button" onClick={handleSave} disabled={saving} className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
            {saving ? "Guardando…" : "Guardar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Select customer modal ───────────────────────────────────────────────────

type SelectCustomerModalProps = {
  onSelect: (c: CustomerRow) => void;
  onClose: () => void;
};

function SelectCustomerModal({ onSelect, onClose }: SelectCustomerModalProps) {
  const [customers, setCustomers] = useState<CustomerRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    getCustomersAction().then((r) => {
      if (cancelled) return;
      setCustomers(r.customers);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = (customers ?? []).filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    (c.nif ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Seleccionar destinatario</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar por nombre o NIF…"
          className="mb-3 w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />

        {loading ? (
          <p className="text-sm text-gray-500">Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500">Sin clientes guardados.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => { onSelect(c); onClose(); }}
                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50"
                >
                  <span className="block text-sm font-medium text-gray-900">{c.name}</span>
                  {c.nif ? <span className="text-xs text-gray-500">{c.nif}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 border-t border-gray-100 pt-3">
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:underline">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Select product modal ────────────────────────────────────────────────────

type SelectProductModalProps = {
  onSelect: (p: ProductRow) => void;
  onClose: () => void;
};

function SelectProductModal({ onSelect, onClose }: SelectProductModalProps) {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProductsAction().then((r) => {
      if (cancelled) return;
      setProducts(r.products);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = (products ?? []).filter((p) =>
    p.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Recuperar producto/servicio</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar producto…"
          className="mb-3 w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />

        {loading ? (
          <p className="text-sm text-gray-500">Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500">Sin productos guardados.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => { onSelect(p); onClose(); }}
                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50"
                >
                  <span className="block text-sm font-medium text-gray-900">{p.description}</span>
                  <span className="text-xs text-gray-500">
                    {formatCents("EUR", p.unitPriceCents)} · {p.tipoImpositivo}% IVA
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 border-t border-gray-100 pt-3">
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:underline">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main form ───────────────────────────────────────────────────────────────

export function NewInvoiceForm({
  defaultCreatedByFirstName,
  defaultCreatedByLastName,
  existingSeries,
}: NewInvoiceFormProps) {
  const [state, formAction] = useActionState<CreateInvoiceState, FormData>(
    createInvoiceAction,
    null
  );

  // Invoice number state
  const [serie, setSerie] = useState<string>(existingSeries[0] ?? "");
  const [numero, setNumero] = useState("");
  const [showSeriesModal, setShowSeriesModal] = useState(false);

  // Customer state
  const [customerName, setCustomerName] = useState("");
  const [customerNif, setCustomerNif] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerTipoPersona, setCustomerTipoPersona] = useState("J");
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showSelectCustomerModal, setShowSelectCustomerModal] = useState(false);

  const [vnifPending, startVnifTransition] = useTransition();
  const [vnifFeedback, setVnifFeedback] = useState<{
    variant: "ok" | "warn" | "err";
    text: string;
  } | null>(null);

  // Items state
  const [items, setItems] = useState<InvoiceItemRow[]>([{ ...DEFAULT_ITEM }]);
  const [showProductModal, setShowProductModal] = useState(false);

  // Send intent
  const sendToAeatRef = useRef<HTMLInputElement>(null);

  const composedNumber = serie && numero ? `${serie}/${numero}` : numero;

  function fillCustomer(c: { name: string; nif: string; email: string; tipoPersona: string } | CustomerRow) {
    setVnifFeedback(null);
    setCustomerName(c.name);
    setCustomerNif(c.nif ?? "");
    setCustomerEmail(c.email ?? "");
    setCustomerTipoPersona(c.tipoPersona ?? "J");
  }

  function addProductAsItem(p: ProductRow) {
    setItems((prev) => [
      ...prev,
      {
        description: p.description,
        quantity: 1,
        unitPrice: (p.unitPriceCents / 100).toFixed(2),
        discountCents: 0,
        discountConcept: "",
        claveRegimen: p.claveRegimen,
        calificacion: p.calificacion,
        tipoImpositivo: p.tipoImpositivo,
      },
    ]);
  }

  // Totals preview
  const totals = items.reduce(
    (acc, item) => {
      const unit = parseDecimalToCents(item.unitPrice);
      const base = Math.max(0, item.quantity * unit - item.discountCents);
      const taxRate = parseFloat(item.tipoImpositivo) || 0;
      const cuota = Math.round((base * taxRate) / 100);
      return { base: acc.base + base, cuota: acc.cuota + cuota };
    },
    { base: 0, cuota: 0 }
  );
  const totalCents = totals.base + totals.cuota;

  const isNewSeries = serie && existingSeries.length > 0 && !existingSeries.includes(serie);

  function runVerifyRecipientNif() {
    setVnifFeedback(null);
    startVnifTransition(async () => {
      const r = await verifyRecipientNif(customerNif, customerName);
      if (r.kind === "identified") {
        setCustomerNif(r.nif);
        setCustomerName(r.nombre);
        setVnifFeedback({
          variant: "ok",
          text: `VNIF AEAT: ${r.resultado}. NIF y nombre actualizados con los datos devueltos.`,
        });
      } else if (r.kind === "not_identified") {
        setVnifFeedback({
          variant: "warn",
          text: r.message ?? r.resultado,
        });
      } else {
        setVnifFeedback({ variant: "err", text: r.error });
      }
    });
  }

  return (
    <>
      <form action={formAction} className="space-y-8">
        {/* Hidden computed fields */}
        <input type="hidden" name="number" value={composedNumber} />
        <input type="hidden" name="items" value={JSON.stringify(items)} />
        <input type="hidden" name="customerName" value={customerName} />
        <input type="hidden" name="customerNif" value={customerNif} />
        <input type="hidden" name="customerEmail" value={customerEmail} />
        <input type="hidden" name="customerTipoPersona" value={customerTipoPersona} />
        <input type="hidden" name="sendToAeat" value="0" ref={sendToAeatRef} />

        {state?.errors?.length ? (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <ul className="list-inside list-disc space-y-0.5">
              {state.errors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* ── Identificación de la factura ─────────────────────────────── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Identificación
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Serie</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={serie}
                  placeholder="Sin serie"
                  className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowSeriesModal(true)}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cambiar
                </button>
              </div>
              {isNewSeries ? (
                <p className="mt-1 text-xs text-amber-700">
                  Nueva serie — iniciará una cadena AEAT nueva con primerRegistro.
                </p>
              ) : serie && !isNewSeries && existingSeries.includes(serie) ? (
                <p className="mt-1 text-xs text-green-700">
                  Continúa la serie «{serie}» — se encadenará con facturas anteriores.
                </p>
              ) : null}
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Número <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="F-001"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              {composedNumber ? (
                <p className="mt-1 text-xs text-gray-400">NumSerie: {composedNumber}</p>
              ) : null}
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Fecha de expedición <span className="text-red-500">*</span>
              </span>
              <input
                type="date"
                name="issueDate"
                defaultValue={today()}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Fecha de operación{" "}
                <span className="font-normal text-gray-400">(si difiere)</span>
              </span>
              <input
                type="date"
                name="fechaOperacion"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        {/* ── Datos del destinatario ───────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Destinatario
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSelectCustomerModal(true)}
                className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
              >
                Seleccionar cliente
              </button>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                + Nuevo destinatario
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            La verificación VNIF (calidad de datos identificativos AEAT) solo aplica a{" "}
            <strong>NIF/CIF españoles</strong>. No sustituye identificadores extranjeros u otros (ID_OTRO
            en Verifactu).
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Razón social / Nombre <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setVnifFeedback(null);
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-end">
              <label className="block min-w-0 flex-1">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  NIF / CIF <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={customerNif}
                  onChange={(e) => {
                    setCustomerNif(e.target.value);
                    setVnifFeedback(null);
                  }}
                  placeholder="B12345678"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={runVerifyRecipientNif}
                disabled={
                  vnifPending || !customerNif.trim() || !customerName.trim()
                }
                className="shrink-0 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
              >
                {vnifPending ? "Verificando…" : "Verificar con AEAT (VNIF)"}
              </button>
            </div>
            {vnifFeedback ? (
              <div
                className={`sm:col-span-2 rounded border px-3 py-2 text-sm ${
                  vnifFeedback.variant === "ok"
                    ? "border-green-200 bg-green-50 text-green-900"
                    : vnifFeedback.variant === "warn"
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {vnifFeedback.text}
              </div>
            ) : null}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Tipo de persona</span>
              <select
                value={customerTipoPersona}
                onChange={(e) => setCustomerTipoPersona(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="J">J – Persona jurídica</option>
                <option value="F">F – Persona física</option>
              </select>
            </label>
          </div>
        </section>

        {/* ── Emisor ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Emisor
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Nombre</span>
              <input
                type="text"
                name="createdByFirstName"
                defaultValue={defaultCreatedByFirstName}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Apellidos</span>
              <input
                type="text"
                name="createdByLastName"
                defaultValue={defaultCreatedByLastName}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        {/* ── Descripción de la operación ──────────────────────────────── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Descripción de la operación
          </h2>
          <label className="block">
            <textarea
              name="notes"
              rows={2}
              maxLength={500}
              placeholder="Descripción de los bienes/servicios facturados (máx. 500 caracteres)"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </section>

        {/* ── Líneas ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Productos / Servicios
          </h2>
          <InvoiceItemsEditor
            items={items}
            onChange={setItems}
            onAddFromCatalog={() => setShowProductModal(true)}
          />
        </section>

        {/* ── Totales ──────────────────────────────────────────────────── */}
        <div className="ml-auto max-w-xs rounded border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="flex justify-between gap-4 text-gray-600">
            <span>Base imponible</span>
            <span>{formatCents("EUR", totals.base)}</span>
          </div>
          <div className="flex justify-between gap-4 text-gray-600">
            <span>Cuota IVA</span>
            <span>{formatCents("EUR", totals.cuota)}</span>
          </div>
          <div className="mt-2 flex justify-between gap-4 border-t border-gray-200 pt-2 font-semibold">
            <span>Importe total</span>
            <span>{formatCents("EUR", totalCents)}</span>
          </div>
        </div>

        {/* ── Buttons ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <SubmitButton
            label="Guardar borrador"
            secondary
            onClick={() => {
              if (sendToAeatRef.current) sendToAeatRef.current.value = "0";
            }}
          />
          <SubmitButton
            label="Validar y enviar a AEAT"
            onClick={() => {
              if (sendToAeatRef.current) sendToAeatRef.current.value = "1";
            }}
          />
          <Link
            href="/invoices"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {showSeriesModal && (
        <SeriesModal
          existingSeries={existingSeries}
          onSelect={setSerie}
          onClose={() => setShowSeriesModal(false)}
        />
      )}

      {showNewCustomerModal && (
        <CustomerFormModal
          onSave={fillCustomer}
          onClose={() => setShowNewCustomerModal(false)}
        />
      )}

      {showSelectCustomerModal && (
        <SelectCustomerModal
          onSelect={fillCustomer}
          onClose={() => setShowSelectCustomerModal(false)}
        />
      )}

      {showProductModal && (
        <SelectProductModal
          onSelect={addProductAsItem}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </>
  );
}

type SubmitButtonProps = {
  label: string;
  secondary?: boolean;
  onClick?: () => void;
};

function SubmitButton({ label, secondary, onClick }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={onClick}
      className={`rounded px-4 py-2 text-sm font-medium disabled:opacity-70 disabled:pointer-events-none ${
        secondary
          ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          : "bg-gray-900 text-white hover:bg-gray-800"
      }`}
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}
