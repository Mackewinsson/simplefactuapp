"use client";

import {
  AEAT_DEST_ID_TYPES,
  type CustomerIdScheme,
  requiresCodigoPais,
} from "@/lib/invoices/destinatario-id";

type Props = {
  idScheme: CustomerIdScheme;
  onSchemeChange: (scheme: CustomerIdScheme) => void;
  nif: string;
  onNifChange: (v: string) => void;
  idType: string;
  onIdTypeChange: (v: string) => void;
  codigoPais: string;
  onCodigoPaisChange: (v: string) => void;
  foreignId: string;
  onForeignIdChange: (v: string) => void;
  errors?: {
    customerNif?: string;
    customerIdType?: string;
    customerCodigoPais?: string;
    customerForeignId?: string;
  };
  nifInputId?: string;
  showVnif?: boolean;
  vnifSlot?: React.ReactNode;
};

const inputErrorRing = "border-danger-emphasis ring-1 ring-danger-ring";
const inputNormal = "border-outline";

export function DestinatarioIdFields({
  idScheme,
  onSchemeChange,
  nif,
  onNifChange,
  idType,
  onIdTypeChange,
  codigoPais,
  onCodigoPaisChange,
  foreignId,
  onForeignIdChange,
  errors,
  nifInputId = "invoice-field-customerNif",
  showVnif = true,
  vnifSlot,
}: Props) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-fg-muted">Tipo de identificación</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="customerIdSchemeRadio"
              checked={idScheme === "NIF"}
              onChange={() => onSchemeChange("NIF")}
            />
            NIF / CIF español
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="customerIdSchemeRadio"
              checked={idScheme === "ID_OTRO"}
              onChange={() => onSchemeChange("ID_OTRO")}
            />
            Identificación extranjera (ID_OTRO)
          </label>
        </div>
      </fieldset>

      {idScheme === "NIF" ? (
        <div>
          <label htmlFor={nifInputId} className="mb-1 block text-sm font-medium text-fg-muted">
            NIF / CIF <span className="text-danger-emphasis">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id={nifInputId}
              type="text"
              value={nif}
              onChange={(e) => onNifChange(e.target.value)}
              placeholder="B12345678"
              aria-invalid={errors?.customerNif ? true : undefined}
              className={`min-w-0 flex-1 rounded border px-3 py-2 text-sm ${
                errors?.customerNif ? inputErrorRing : inputNormal
              }`}
            />
            {showVnif ? vnifSlot : null}
          </div>
          {errors?.customerNif ? (
            <p className="mt-1 text-sm text-danger-emphasis">{errors.customerNif}</p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-fg-muted">
              Tipo ID (AEAT) <span className="text-danger-emphasis">*</span>
            </span>
            <select
              id="invoice-field-customerIdType"
              value={idType}
              onChange={(e) => onIdTypeChange(e.target.value)}
              className={`w-full rounded border px-3 py-2 text-sm ${
                errors?.customerIdType ? inputErrorRing : inputNormal
              }`}
            >
              <option value="">Seleccionar…</option>
              {AEAT_DEST_ID_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors?.customerIdType ? (
              <p className="mt-1 text-sm text-danger-emphasis">{errors.customerIdType}</p>
            ) : null}
          </label>
          {requiresCodigoPais(idType) ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-muted">
                Código país (ISO-2) <span className="text-danger-emphasis">*</span>
              </span>
              <input
                id="invoice-field-customerCodigoPais"
                type="text"
                value={codigoPais}
                onChange={(e) => onCodigoPaisChange(e.target.value.toUpperCase())}
                placeholder="FR"
                maxLength={2}
                className={`w-full rounded border px-3 py-2 text-sm uppercase ${
                  errors?.customerCodigoPais ? inputErrorRing : inputNormal
                }`}
              />
              {errors?.customerCodigoPais ? (
                <p className="mt-1 text-sm text-danger-emphasis">{errors.customerCodigoPais}</p>
              ) : null}
            </label>
          ) : null}
          <label className={`block ${requiresCodigoPais(idType) ? "" : "sm:col-span-2"}`}>
            <span className="mb-1 block text-sm font-medium text-fg-muted">
              Identificador <span className="text-danger-emphasis">*</span>
            </span>
            <input
              id="invoice-field-customerForeignId"
              type="text"
              value={foreignId}
              onChange={(e) => onForeignIdChange(e.target.value)}
              placeholder={idType === "02" ? "NIF-IVA UE" : "Número de documento"}
              className={`w-full rounded border px-3 py-2 text-sm ${
                errors?.customerForeignId ? inputErrorRing : inputNormal
              }`}
            />
            {errors?.customerForeignId ? (
              <p className="mt-1 text-sm text-danger-emphasis">{errors.customerForeignId}</p>
            ) : null}
          </label>
        </div>
      )}
    </div>
  );
}
