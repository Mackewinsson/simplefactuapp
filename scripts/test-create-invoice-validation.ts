import assert from "node:assert/strict";
import { validateCreateInvoiceClientPayload } from "../lib/invoices/create-invoice-validation";

const baseItem = {
  description: "Servicio",
  quantity: 1,
  unitPrice: "100.00",
  discountCents: 0,
  claveRegimen: "01",
  calificacion: "S1",
  tipoImpositivo: "21.0",
};

const base = {
  number: "2026/F-001",
  issueDate: "2026-05-21",
  customerName: "Cliente SA",
  customerNif: "B12345678",
  customerIdScheme: "NIF" as const,
  tipoFactura: "F2" as const,
  notes: "Venta mostrador",
  sendToAeat: "0" as const,
  items: [baseItem],
};

// F2 without destinatario — must pass
const ok = validateCreateInvoiceClientPayload({
  ...base,
  customerNif: undefined,
});
assert.equal(ok.ok, true, ok.ok ? "" : ok.errors.join("; "));

// F2 with stale destinatario from FormData — preprocess strips and passes
const okStale = validateCreateInvoiceClientPayload({
  ...base,
  customerNif: "B12345678",
  customerForeignId: "X",
  customerIdType: "03",
});
assert.equal(okStale.ok, true, okStale.ok ? "" : okStale.errors.join("; "));

// F1 still requires NIF
const f1fail = validateCreateInvoiceClientPayload({
  ...base,
  tipoFactura: "F1",
  customerNif: undefined,
});
assert.equal(f1fail.ok, false);
assert.ok(
  f1fail.formFieldErrors?.customerNif?.includes("obligatorio") ||
    f1fail.errors.some((e) => e.includes("obligatorio"))
);

console.log("test-create-invoice-validation: OK");
