"use client";

import Link from "next/link";
import { useActionState, useState, useRef, useEffect, useTransition, useCallback, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { createInvoiceAction } from "./actions";
import type {
  CreateInvoiceState,
  InvoiceFormFieldErrors,
  InvoiceItemFieldErrorsMap,
} from "./invoice-form-state";
import {
  InvoiceItemsEditor,
  type InvoiceItemRow,
  DEFAULT_ITEM,
} from "./InvoiceItemsEditor";
import type { CustomerRow } from "@/app/(chrome)/customers/actions";
import type { ProductRow } from "@/app/(chrome)/products/actions";
import { parseDecimalToCents, formatCents } from "@/lib/money";
import {
  collectInlineErrorMessages,
  stripFormFieldErrors,
  validateCreateInvoiceClientPayload,
} from "@/lib/invoices/create-invoice-validation";
import { verifyRecipientNif } from "./verify-recipient-nif";
import { NIF_VERIFY_SUCCESS_UPDATED_USER } from "@/lib/invoices/nif-verify-user-messages";
import { focusFirstInvoiceError } from "./focus-first-invoice-error";
import { SeriesModal } from "./components/SeriesModal";
import { CustomerFormModal } from "./components/CustomerFormModal";
import { SelectCustomerModal } from "./components/SelectCustomerModal";
import { SelectProductModal } from "./components/SelectProductModal";

const today = () => new Date().toISOString().slice(0, 10);

const inputErrorRing = "border-red-500 ring-1 ring-red-200";
const inputNormal = "border-gray-300";

type NewInvoiceFormProps = {
  defaultCreatedByFirstName: string;
  defaultCreatedByLastName: string;
  existingSeries: string[];
};

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

  const [itemFieldErrors, setItemFieldErrors] = useState<InvoiceItemFieldErrorsMap | undefined>();
  const [formFieldErrors, setFormFieldErrors] = useState<InvoiceFormFieldErrors | undefined>();
  const [showOperationDescription, setShowOperationDescription] = useState(false);
  const [operationNotes, setOperationNotes] = useState("");
  const [suppressServerBanner, setSuppressServerBanner] = useState(false);

  useEffect(() => {
    setSuppressServerBanner(false);
  }, [state]);

  useEffect(() => {
    setItemFieldErrors(state?.itemFieldErrors);
    setFormFieldErrors(state?.formFieldErrors);
  }, [state]);

  const bannerErrorsFiltered = useMemo(() => {
    if (!state?.errors?.length) return [];
    const inline = collectInlineErrorMessages(state.formFieldErrors, state.itemFieldErrors);
    return state.errors.filter((m) => !inline.has(m));
  }, [state]);

  useEffect(() => {
    if (!state?.errors?.length) return;
    const hasField = Boolean(state.itemFieldErrors) || Boolean(state.formFieldErrors);
    requestAnimationFrame(() => {
      if (hasField) focusFirstInvoiceError(state.formFieldErrors, state.itemFieldErrors);
      else document.getElementById("invoice-form-banner")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [state]);

  // Invoice number state
  const [serie, setSerie] = useState<string>(existingSeries[0] ?? "");
  const [numero, setNumero] = useState("");
  const [showSeriesModal, setShowSeriesModal] = useState(false);

  const [issueDate, setIssueDate] = useState<string>(today());
  const [fechaOperacion, setFechaOperacion] = useState<string>("");

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

  const handleItemsChange = useCallback((next: InvoiceItemRow[]) => {
    setItems(next);
    setItemFieldErrors(undefined);
  }, []);

  // Send intent
  const sendToAeatRef = useRef<HTMLInputElement>(null);

  const composedNumber = serie && numero ? `${serie}/${numero}` : numero;

  // AEAT rule 1146: fechaOperacion may only be later than issueDate when at least
  // one detail uses ClaveRegimen 14 or 15. Surface it inline so the user does not
  // have to wait for a server round-trip.
  const allowsFutureOp = items.some(
    (i) => i.claveRegimen === "14" || i.claveRegimen === "15"
  );
  const fechaOperacionInvalid =
    Boolean(fechaOperacion) &&
    Boolean(issueDate) &&
    fechaOperacion > issueDate &&
    !allowsFutureOp;

  const fechaOperacionErrorMessage =
    formFieldErrors?.fechaOperacion ??
    (fechaOperacionInvalid
      ? "La fecha de operación no puede ser posterior a la de expedición (salvo régimen 14 o 15)."
      : undefined);

  function fillCustomer(c: { name: string; nif: string; email: string; tipoPersona: string } | CustomerRow) {
    setVnifFeedback(null);
    setCustomerName(c.name);
    setCustomerNif(c.nif ?? "");
    setCustomerEmail(c.email ?? "");
    setCustomerTipoPersona(c.tipoPersona ?? "J");
    setFormFieldErrors((p) => stripFormFieldErrors(p, "customerName", "customerNif", "customerEmail"));
  }

  function addProductAsItem(p: ProductRow) {
    setItemFieldErrors(undefined);
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
        setFormFieldErrors((p) => stripFormFieldErrors(p, "customerNif", "customerName"));
        setVnifFeedback({
          variant: "ok",
          text: NIF_VERIFY_SUCCESS_UPDATED_USER,
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
      <form
        action={formAction}
        className="space-y-8"
        onSubmit={(e) => {
          const parsed = validateCreateInvoiceClientPayload({
            number: composedNumber,
            issueDate,
            dueDate: undefined,
            fechaOperacion: fechaOperacion || undefined,
            customerName,
            customerNif,
            customerEmail: customerEmail || undefined,
            customerTipoPersona:
              customerTipoPersona === "F" || customerTipoPersona === "J"
                ? customerTipoPersona
                : undefined,
            customerIdScheme: "NIF",
            customerIdType: undefined,
            customerCodigoPais: undefined,
            customerForeignId: undefined,
            notes: operationNotes.trim() || undefined,
            createdByFirstName: null,
            createdByLastName: null,
            sendToAeat: (sendToAeatRef.current?.value as "0" | "1") || "0",
            items,
          });
          if (!parsed.ok) {
            e.preventDefault();
            setSuppressServerBanner(true);
            setItemFieldErrors(parsed.itemFieldErrors);
            setFormFieldErrors(parsed.formFieldErrors);
            requestAnimationFrame(() => focusFirstInvoiceError(parsed.formFieldErrors, parsed.itemFieldErrors));
            return;
          }
          setItemFieldErrors(undefined);
          setFormFieldErrors(undefined);
        }}
      >
        {/* Hidden computed fields */}
        <input type="hidden" name="number" value={composedNumber} />
        <input type="hidden" name="items" value={JSON.stringify(items)} />
        <input type="hidden" name="customerName" value={customerName} />
        <input type="hidden" name="customerNif" value={customerNif} />
        <input type="hidden" name="customerEmail" value={customerEmail} />
        <input type="hidden" name="customerTipoPersona" value={customerTipoPersona} />
        <input type="hidden" name="customerIdScheme" value="NIF" />
        <input type="hidden" name="sendToAeat" value="0" ref={sendToAeatRef} />

        {!suppressServerBanner && bannerErrorsFiltered.length > 0 ? (
          <div
            id="invoice-form-banner"
            className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <ul className="list-inside list-disc space-y-0.5">
              {bannerErrorsFiltered.map((msg, i) => (
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
                id="invoice-field-number"
                type="text"
                value={numero}
                onChange={(e) => {
                  setNumero(e.target.value);
                  setFormFieldErrors((p) => stripFormFieldErrors(p, "number"));
                }}
                placeholder="F-001"
                aria-invalid={formFieldErrors?.number ? true : undefined}
                aria-describedby={formFieldErrors?.number ? "invoice-error-number" : undefined}
                className={`w-full rounded border px-3 py-2 text-sm ${
                  formFieldErrors?.number ? inputErrorRing : inputNormal
                }`}
              />
              {formFieldErrors?.number ? (
                <p id="invoice-error-number" className="mt-1 text-sm text-red-600">
                  {formFieldErrors.number}
                </p>
              ) : null}
              {composedNumber ? (
                <p className="mt-1 text-xs text-gray-400">
                  Número completo (serie + correlativo): {composedNumber}
                </p>
              ) : null}
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Fecha de expedición <span className="text-red-500">*</span>
              </span>
              <input
                id="invoice-field-issueDate"
                type="date"
                name="issueDate"
                value={issueDate}
                onChange={(e) => {
                  setIssueDate(e.target.value);
                  setFormFieldErrors((p) => stripFormFieldErrors(p, "issueDate", "fechaOperacion"));
                }}
                aria-invalid={formFieldErrors?.issueDate ? true : undefined}
                aria-describedby={
                  formFieldErrors?.issueDate ? "invoice-error-issueDate" : undefined
                }
                className={`w-full rounded border px-3 py-2 text-sm ${
                  formFieldErrors?.issueDate ? inputErrorRing : inputNormal
                }`}
              />
              {formFieldErrors?.issueDate ? (
                <p id="invoice-error-issueDate" className="mt-1 text-sm text-red-600">
                  {formFieldErrors.issueDate}
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Fecha de operación{" "}
                <span className="font-normal text-gray-400">(si difiere)</span>
              </span>
              <input
                id="invoice-field-fechaOperacion"
                type="date"
                name="fechaOperacion"
                value={fechaOperacion}
                onChange={(e) => {
                  setFechaOperacion(e.target.value);
                  setFormFieldErrors((p) => stripFormFieldErrors(p, "fechaOperacion"));
                }}
                max={allowsFutureOp ? undefined : issueDate || undefined}
                aria-invalid={fechaOperacionErrorMessage ? true : undefined}
                aria-describedby={
                  [formFieldErrors?.fechaOperacion ? "invoice-error-fechaOperacion" : null, "fechaOperacionHint"]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                className={`w-full rounded border px-3 py-2 text-sm ${
                  fechaOperacionErrorMessage ? inputErrorRing : inputNormal
                }`}
              />
              {formFieldErrors?.fechaOperacion ? (
                <p id="invoice-error-fechaOperacion" className="mt-1 text-sm text-red-600">
                  {formFieldErrors.fechaOperacion}
                </p>
              ) : null}
              <p id="fechaOperacionHint" className="mt-1 text-xs text-gray-400">
                No puede ser posterior a la fecha de expedición (salvo régimen 14 o 15).
              </p>
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
            El botón «Comprobar con Hacienda» consulta si el <strong>nombre o razón social</strong> que has
            escrito <strong>coincide con el que tiene registrado Hacienda</strong> para ese NIF o CIF. Solo
            aplica a <strong>identificadores españoles</strong>; no sirve para NIF-IVA intracomunitario ni
            otros tipos de identificación extranjeros.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Razón social / Nombre <span className="text-red-500">*</span>
              </span>
              <input
                id="invoice-field-customerName"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setVnifFeedback(null);
                  setFormFieldErrors((p) => stripFormFieldErrors(p, "customerName"));
                }}
                aria-invalid={formFieldErrors?.customerName ? true : undefined}
                aria-describedby={
                  formFieldErrors?.customerName ? "invoice-error-customerName" : undefined
                }
                className={`w-full rounded border px-3 py-2 text-sm ${
                  formFieldErrors?.customerName ? inputErrorRing : inputNormal
                }`}
              />
              {formFieldErrors?.customerName ? (
                <p id="invoice-error-customerName" className="mt-1 text-sm text-red-600">
                  {formFieldErrors.customerName}
                </p>
              ) : null}
            </label>
            <div className="sm:col-span-2">
              <label
                htmlFor="invoice-field-customerNif"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                NIF / CIF <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="invoice-field-customerNif"
                  type="text"
                  value={customerNif}
                  onChange={(e) => {
                    setCustomerNif(e.target.value);
                    setVnifFeedback(null);
                    setFormFieldErrors((p) => stripFormFieldErrors(p, "customerNif"));
                  }}
                  placeholder="B12345678"
                  aria-invalid={formFieldErrors?.customerNif ? true : undefined}
                  aria-describedby={
                    formFieldErrors?.customerNif ? "invoice-error-customerNif" : undefined
                  }
                  className={`min-w-0 flex-1 rounded border px-3 py-2 text-sm ${
                    formFieldErrors?.customerNif ? inputErrorRing : inputNormal
                  }`}
                />
                <button
                  type="button"
                  onClick={runVerifyRecipientNif}
                  disabled={
                    vnifPending || !customerNif.trim() || !customerName.trim()
                  }
                  className="shrink-0 self-start rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  {vnifPending ? "Comprobando…" : "Comprobar con Hacienda"}
                </button>
              </div>
              {formFieldErrors?.customerNif ? (
                <p id="invoice-error-customerNif" className="mt-1 text-sm text-red-600">
                  {formFieldErrors.customerNif}
                </p>
              ) : null}
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
              <span className="mb-1 block text-sm font-medium text-gray-700">Correo</span>
              <input
                id="invoice-field-customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  setFormFieldErrors((p) => stripFormFieldErrors(p, "customerEmail"));
                }}
                aria-invalid={formFieldErrors?.customerEmail ? true : undefined}
                aria-describedby={
                  formFieldErrors?.customerEmail ? "invoice-error-customerEmail" : undefined
                }
                className={`w-full rounded border px-3 py-2 text-sm ${
                  formFieldErrors?.customerEmail ? inputErrorRing : inputNormal
                }`}
              />
              {formFieldErrors?.customerEmail ? (
                <p id="invoice-error-customerEmail" className="mt-1 text-sm text-red-600">
                  {formFieldErrors.customerEmail}
                </p>
              ) : null}
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

        {/* ── Descripción de la operación (opcional, colapsada por defecto) ─ */}
        <section>
          {!showOperationDescription && !operationNotes.trim() ? (
            <button
              type="button"
              onClick={() => setShowOperationDescription(true)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              + Añadir descripción de la operación (opcional)
            </button>
          ) : !showOperationDescription && operationNotes.trim() ? (
            <div className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="notes" value={operationNotes} />
              <p className="text-sm text-gray-700">Descripción de la operación añadida.</p>
              <button
                type="button"
                onClick={() => setShowOperationDescription(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Editar
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Descripción de la operación
                </h2>
                <button
                  type="button"
                  onClick={() => setShowOperationDescription(false)}
                  className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
                >
                  Ocultar
                </button>
              </div>
              <label className="block">
                <textarea
                  name="notes"
                  value={operationNotes}
                  onChange={(e) => setOperationNotes(e.target.value.slice(0, 500))}
                  rows={2}
                  maxLength={500}
                  placeholder="Descripción de los bienes/servicios facturados (máx. 500 caracteres)"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-gray-500">
                  Si lo dejas en blanco, usaremos las descripciones de las líneas como
                  <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-[11px]">
                    DescripcionOperacion
                  </code>
                  para AEAT. Es obligatorio que haya algún texto entre este campo y las líneas.
                </span>
              </label>
            </>
          )}
        </section>

        {/* ── Líneas ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Productos / Servicios
          </h2>
          <InvoiceItemsEditor
            items={items}
            onChange={handleItemsChange}
            onAddFromCatalog={() => setShowProductModal(true)}
            itemFieldErrors={itemFieldErrors}
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
            label="Validar y enviar a Veri*Factu"
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
          onSelect={(s) => {
            setSerie(s);
            setFormFieldErrors((p) => stripFormFieldErrors(p, "number"));
          }}
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
