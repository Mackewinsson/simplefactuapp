"use client";

import Link from "next/link";
import { useActionState, useState, useRef, useEffect, useTransition, useCallback, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/app/components/SubmitButton";
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
import { DestinatarioIdFields } from "./components/DestinatarioIdFields";
import {
  destinatarioIdFromCustomer,
  type CustomerIdScheme,
} from "@/lib/invoices/destinatario-id";

const today = () => new Date().toISOString().slice(0, 10);

const inputErrorRing = "border-danger-emphasis ring-1 ring-danger-ring";
const inputNormal = "border-outline";

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
  const [tipoFactura, setTipoFactura] = useState<"F1" | "F2">("F1");

  // Customer state
  const [customerName, setCustomerName] = useState("");
  const [customerNif, setCustomerNif] = useState("");
  const [customerIdScheme, setCustomerIdScheme] = useState<CustomerIdScheme>("NIF");
  const [customerIdType, setCustomerIdType] = useState("");
  const [customerCodigoPais, setCustomerCodigoPais] = useState("");
  const [customerForeignId, setCustomerForeignId] = useState("");
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

  function fillCustomer(c: CustomerRow) {
    setVnifFeedback(null);
    setCustomerName(c.name);
    setCustomerEmail(c.email ?? "");
    setCustomerTipoPersona(c.tipoPersona ?? "J");
    const id = destinatarioIdFromCustomer(c);
    setCustomerIdScheme(id.idScheme);
    setCustomerNif(id.nif);
    setCustomerIdType(id.idType);
    setCustomerCodigoPais(id.codigoPais);
    setCustomerForeignId(id.foreignId);
    setFormFieldErrors((p) =>
      stripFormFieldErrors(
        p,
        "customerName",
        "customerNif",
        "customerEmail",
        "customerIdType",
        "customerCodigoPais",
        "customerForeignId"
      )
    );
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

  function applyTipoFactura(next: "F1" | "F2") {
    if (next === "F2") {
      setVnifFeedback(null);
      setCustomerNif("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerIdScheme("NIF");
      setCustomerIdType("");
      setCustomerCodigoPais("");
      setCustomerForeignId("");
      setFormFieldErrors((p) =>
        stripFormFieldErrors(
          p,
          "customerNif",
          "customerName",
          "customerEmail",
          "customerIdType",
          "customerForeignId",
          "customerCodigoPais"
        )
      );
    }
    setTipoFactura(next);
  }

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
            customerName: tipoFactura === "F2" ? "—" : customerName,
            customerNif: tipoFactura === "F2" ? undefined : customerNif,
            tipoFactura,
            customerEmail: customerEmail || undefined,
            customerTipoPersona:
              customerTipoPersona === "F" || customerTipoPersona === "J"
                ? customerTipoPersona
                : undefined,
            customerIdScheme,
            customerIdType: customerIdType || undefined,
            customerCodigoPais: customerCodigoPais || undefined,
            customerForeignId: customerForeignId || undefined,
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
        <input type="hidden" name="customerName" value={tipoFactura === "F2" ? "—" : customerName} />
        <input type="hidden" name="tipoFactura" value={tipoFactura} />
        <input type="hidden" name="customerNif" value={tipoFactura === "F2" ? "" : customerNif} />
        <input type="hidden" name="customerEmail" value={tipoFactura === "F2" ? "" : customerEmail} />
        <input
          type="hidden"
          name="customerTipoPersona"
          value={tipoFactura === "F2" ? "" : customerTipoPersona}
        />
        <input
          type="hidden"
          name="customerIdScheme"
          value={tipoFactura === "F2" ? "NIF" : customerIdScheme}
        />
        <input type="hidden" name="customerIdType" value={tipoFactura === "F2" ? "" : customerIdType} />
        <input
          type="hidden"
          name="customerCodigoPais"
          value={tipoFactura === "F2" ? "" : customerCodigoPais}
        />
        <input
          type="hidden"
          name="customerForeignId"
          value={tipoFactura === "F2" ? "" : customerForeignId}
        />
        <input type="hidden" name="sendToAeat" value="0" ref={sendToAeatRef} />

        {!suppressServerBanner && bannerErrorsFiltered.length > 0 ? (
          <div
            id="invoice-form-banner"
            className="rounded border border-danger-outline bg-danger px-4 py-3 text-sm text-danger-foreground"
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
        <section className="rounded border border-outline-soft bg-surface p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-subtle">
            Identificación
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-sm font-medium text-fg-muted">Serie</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={serie}
                  placeholder="Sin serie"
                  className="flex-1 rounded border border-outline-soft bg-surface-hover px-3 py-2 text-sm text-fg-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowSeriesModal(true)}
                  className="btn btn-md btn-secondary"
                >
                  Cambiar
                </button>
              </div>
              {!serie && (
                <p className="mt-1 text-xs text-fg-subtle">
                  Pulsa «Cambiar» para crear tu primera serie (p. ej. <code className="rounded bg-surface-muted px-1 py-0.5 text-[11px]">2026</code>).
                </p>
              )}
              {isNewSeries ? (
                <p className="mt-1 text-xs text-warning-muted">
                  Nueva serie — iniciará una cadena AEAT nueva con primerRegistro.
                </p>
              ) : serie && !isNewSeries && existingSeries.includes(serie) ? (
                <p className="mt-1 text-xs text-success-emphasis">
                  Continúa la serie «{serie}» — se encadenará con facturas anteriores.
                </p>
              ) : null}
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-fg-muted">
                Número <span className="text-danger-emphasis">*</span>
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
                <p id="invoice-error-number" className="mt-1 text-sm text-danger-emphasis">
                  {formFieldErrors.number}
                </p>
              ) : null}
              {composedNumber ? (
                <p className="mt-1 text-xs text-fg-subtle">
                  Número completo (serie + correlativo): {composedNumber}
                </p>
              ) : null}
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-muted">
                Fecha de expedición <span className="text-danger-emphasis">*</span>
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
                <p id="invoice-error-issueDate" className="mt-1 text-sm text-danger-emphasis">
                  {formFieldErrors.issueDate}
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-muted">
                Fecha de operación{" "}
                <span className="font-normal text-fg-subtle">(si difiere)</span>
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
                <p id="invoice-error-fechaOperacion" className="mt-1 text-sm text-danger-emphasis">
                  {formFieldErrors.fechaOperacion}
                </p>
              ) : null}
              <p id="fechaOperacionHint" className="mt-1 text-xs text-fg-subtle">
                No puede ser posterior a la fecha de expedición (salvo régimen 14 o 15).
              </p>
            </label>
          </div>
        </section>

        {/* ── Tipo de factura ──────────────────────────────────────────── */}
        <section className="rounded border border-outline-soft bg-surface p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-subtle">
            Tipo de factura
          </h2>
          <label className="block max-w-md">
            <span className="mb-1 block text-sm font-medium text-fg-muted">Tipo</span>
            <select
              value={tipoFactura}
              onChange={(e) => applyTipoFactura(e.target.value as "F1" | "F2")}
              className="w-full rounded border border-outline px-3 py-2 text-sm"
            >
              <option value="F1">F1 — Factura completa (con destinatario)</option>
              <option value="F2">F2 — Simplificada (ticket ≤ 3.000 €, sin cliente)</option>
            </select>
          </label>
          {tipoFactura === "F2" && totalCents > 300_000 ? (
            <p className="mt-2 text-sm text-danger-emphasis">
              El total supera 3.000 € — no válido para factura simplificada F2.
            </p>
          ) : null}
        </section>

        {/* ── Emisor ───────────────────────────────────────────────────── */}
        <section className="rounded border border-outline-soft bg-surface p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-subtle">
            Emisor
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-muted">Nombre</span>
              <input
                type="text"
                name="createdByFirstName"
                defaultValue={defaultCreatedByFirstName}
                className="w-full rounded border border-outline px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-muted">Apellidos</span>
              <input
                type="text"
                name="createdByLastName"
                defaultValue={defaultCreatedByLastName}
                className="w-full rounded border border-outline px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        {/* ── Datos del destinatario ───────────────────────────────────── */}
        {tipoFactura === "F1" ? (
        <section className="rounded border border-outline-soft bg-surface p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">
              Destinatario
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSelectCustomerModal(true)}
                className="text-sm text-fg-subtle hover:text-fg hover:underline"
              >
                Seleccionar cliente
              </button>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(true)}
                className="text-sm text-accent hover:underline"
              >
                + Nuevo destinatario
              </button>
            </div>
          </div>

          <p className="text-xs text-fg-subtle">
            Para clientes en la UE u otros países, elige <strong>Identificación extranjera (ID_OTRO)</strong>.
            «Comprobar con Hacienda» solo aplica a NIF/CIF españoles.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-fg-muted">
                Razón social / Nombre <span className="text-danger-emphasis">*</span>
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
                <p id="invoice-error-customerName" className="mt-1 text-sm text-danger-emphasis">
                  {formFieldErrors.customerName}
                </p>
              ) : null}
            </label>
            <div className="sm:col-span-2">
              <DestinatarioIdFields
                idScheme={customerIdScheme}
                onSchemeChange={(s) => {
                  setCustomerIdScheme(s);
                  setVnifFeedback(null);
                  if (s === "NIF") {
                    setCustomerIdType("");
                    setCustomerCodigoPais("");
                    setCustomerForeignId("");
                  } else {
                    setCustomerNif("");
                  }
                  setFormFieldErrors((p) =>
                    stripFormFieldErrors(
                      p,
                      "customerNif",
                      "customerIdType",
                      "customerCodigoPais",
                      "customerForeignId"
                    )
                  );
                }}
                nif={customerNif}
                onNifChange={(v) => {
                  setCustomerNif(v);
                  setVnifFeedback(null);
                  setFormFieldErrors((p) => stripFormFieldErrors(p, "customerNif"));
                }}
                idType={customerIdType}
                onIdTypeChange={(v) => {
                  setCustomerIdType(v);
                  setFormFieldErrors((p) => stripFormFieldErrors(p, "customerIdType"));
                }}
                codigoPais={customerCodigoPais}
                onCodigoPaisChange={(v) => {
                  setCustomerCodigoPais(v);
                  setFormFieldErrors((p) => stripFormFieldErrors(p, "customerCodigoPais"));
                }}
                foreignId={customerForeignId}
                onForeignIdChange={(v) => {
                  setCustomerForeignId(v);
                  setFormFieldErrors((p) => stripFormFieldErrors(p, "customerForeignId"));
                }}
                errors={{
                  customerNif: formFieldErrors?.customerNif,
                  customerIdType: formFieldErrors?.customerIdType,
                  customerCodigoPais: formFieldErrors?.customerCodigoPais,
                  customerForeignId: formFieldErrors?.customerForeignId,
                }}
                showVnif={customerIdScheme === "NIF"}
                vnifSlot={
                  <button
                    type="button"
                    onClick={runVerifyRecipientNif}
                    disabled={vnifPending || !customerNif.trim() || !customerName.trim()}
                    className="btn btn-md btn-secondary shrink-0 self-start"
                  >
                    {vnifPending ? "Comprobando…" : "Comprobar con Hacienda"}
                  </button>
                }
              />
            </div>
            {vnifFeedback ? (
              <div
                className={`sm:col-span-2 rounded border px-3 py-2 text-sm ${
                  vnifFeedback.variant === "ok"
                    ? "border-success-outline bg-success text-success-deep"
                    : vnifFeedback.variant === "warn"
                      ? "border-warning-outline bg-warning text-warning-foreground"
                      : "border-danger-outline bg-danger text-danger-foreground"
                }`}
              >
                {vnifFeedback.text}
              </div>
            ) : null}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-muted">Correo</span>
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
                <p id="invoice-error-customerEmail" className="mt-1 text-sm text-danger-emphasis">
                  {formFieldErrors.customerEmail}
                </p>
              ) : null}
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-muted">
                Tipo de persona
                <span className="ml-1 text-fg-subtle cursor-help" title="J: empresa o autónomo con NIF empresa. F: persona física con DNI/NIE.">(?)</span>
              </span>
              <select
                value={customerTipoPersona}
                onChange={(e) => setCustomerTipoPersona(e.target.value)}
                className="w-full rounded border border-outline px-3 py-2 text-sm"
              >
                <option value="J">J – Persona jurídica</option>
                <option value="F">F – Persona física</option>
              </select>
              <p className="mt-1 text-xs text-fg-subtle">
                Jurídica: empresa, sociedad o autónomo con NIF-empresa. Física: persona con DNI o NIE.
              </p>
            </label>
          </div>
        </section>
        ) : (
          <p className="rounded border border-outline-soft bg-surface-muted px-4 py-3 text-sm text-fg-muted">
            Factura simplificada sin identificación del destinatario (art. 61.d LIVA). El importe total
            no puede superar 3.000 €.
          </p>
        )}

        {/* ── Descripción de la operación (opcional, colapsada por defecto) ─ */}
        <section>
          {!showOperationDescription && !operationNotes.trim() ? (
            <button
              type="button"
              onClick={() => setShowOperationDescription(true)}
              className="text-sm font-medium text-accent hover:underline"
            >
              + Añadir descripción de la operación (opcional)
            </button>
          ) : !showOperationDescription && operationNotes.trim() ? (
            <div className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="notes" value={operationNotes} />
              <p className="text-sm text-fg-muted">Descripción de la operación añadida.</p>
              <button
                type="button"
                onClick={() => setShowOperationDescription(true)}
                className="text-sm text-accent hover:underline"
              >
                Editar
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">
                  Descripción de la operación
                </h2>
                <button
                  type="button"
                  onClick={() => setShowOperationDescription(false)}
                  className="text-sm text-fg-subtle hover:text-fg hover:underline"
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
                  className="w-full rounded border border-outline px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-fg-subtle">
                  Si lo dejas en blanco, usaremos las descripciones de las líneas como
                  <code className="mx-1 rounded bg-surface-muted px-1 py-0.5 text-[11px]">
                    DescripcionOperacion
                  </code>
                  para AEAT. Es obligatorio que haya algún texto entre este campo y las líneas.
                </span>
              </label>
            </>
          )}
        </section>

        {/* ── Líneas ───────────────────────────────────────────────────── */}
        <section className="rounded border border-outline-soft bg-surface p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-subtle">
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
        <div className="ml-auto max-w-xs rounded border border-outline-soft bg-surface-hover p-4 text-sm">
          <div className="flex justify-between gap-4 text-fg-muted">
            <span>Base imponible</span>
            <span>{formatCents("EUR", totals.base)}</span>
          </div>
          <div className="flex justify-between gap-4 text-fg-muted">
            <span>Cuota IVA</span>
            <span>{formatCents("EUR", totals.cuota)}</span>
          </div>
          <div className="mt-2 flex justify-between gap-4 border-t border-outline-soft pt-2 font-semibold">
            <span>Importe total</span>
            <span>{formatCents("EUR", totalCents)}</span>
          </div>
        </div>

        {/* ── Buttons ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <SubmitButton
            label="Guardar borrador"
            variant="secondary"
            onClick={() => {
              if (sendToAeatRef.current) sendToAeatRef.current.value = "0";
            }}
          />
          <SubmitButton
            label="Validar y enviar a Veri*Factu"
            variant="cta"
            onClick={() => {
              if (sendToAeatRef.current) sendToAeatRef.current.value = "1";
            }}
          />
          <Link
            href="/invoices"
            className="btn btn-md btn-secondary"
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


