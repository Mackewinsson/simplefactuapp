/**
 * Unit checks for Verifactu JSON builders (run: npx tsx scripts/test-verifactu-payloads.ts)
 */
import assert from "node:assert/strict";
import type { Invoice, InvoiceItem, UserVerifactuAccount } from "@prisma/client";
import { buildSendInvoicePayload } from "../lib/simplefactu/build-send-invoice-payload";
import { buildCancelInvoicePayload } from "../lib/simplefactu/build-cancel-invoice-payload";
import { formatSimplefactuHttpError } from "../lib/simplefactu/api-errors";

process.env.VERIFACTU_SI_ID = process.env.VERIFACTU_SI_ID || "01";

const accountBase: UserVerifactuAccount = {
  userId: "user_test",
  simplefactuTenantId: "sf_user_test",
  apiKeyEncrypted: "enc",
  issuerNif: "B12345678",
  issuerLegalName: "Test SL",
  certificateUploadedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const item: InvoiceItem = {
  id: "it1",
  invoiceId: "inv1",
  description: "Service",
  quantity: 1,
  unitPriceCents: 10000,
  discountCents: 0,
  discountConcept: null,
  lineTotalCents: 10000,
  claveRegimen: "01",
  calificacion: "S1",
  tipoImpositivo: "21.0",
};

const invoiceBase: Invoice & { items: InvoiceItem[] } = {
  id: "inv1",
  userId: "user_test",
  number: "2026/F-001",
  issueDate: new Date(Date.UTC(2026, 2, 15)),
  dueDate: null,
  fechaOperacion: null,
  customerName: "Cliente SA",
  customerEmail: null,
  customerNif: "A12345678",
  customerTipoPersona: null,
  customerIdScheme: "NIF",
  customerIdType: null,
  customerCodigoPais: null,
  customerForeignId: null,
  currency: "EUR",
  subtotalCents: 10000,
  taxCents: 2100,
  totalCents: 12100,
  taxRatePercent: 21,
  notes: null,
  createdByFirstName: null,
  createdByLastName: null,
  aeatStatus: "NOT_SENT",
  aeatJobId: null,
  aeatLastError: null,
  aeatCsv: null,
  aeatQrText: null,
  aeatIdempotencyKey: null,
  aeatCancellationJobId: null,
  aeatCancellationStatus: "NONE",
  aeatCancellationLastError: null,
  aeatCancellationIdempotencyKey: null,
  aeatUpdatedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [item],
};

const send = buildSendInvoicePayload(invoiceBase, accountBase);
assert.equal(send.fecha, "15-03-2026");
assert.equal(send.numSerie, "2026/F-001");
assert.equal(send.tipoFactura, "F1");
assert.equal((send.detalles as { base: number }[])[0].base, 100);
assert.equal((send.detalles as { cuota: number }[])[0].cuota, 21);
// notes is null → falls back to item descriptions ("Service")
assert.equal(send.descripcion, "Service");

// notes wins over item description when present
const sendWithNotes = buildSendInvoicePayload(
  { ...invoiceBase, notes: "Servicios de consultoría enero 2026" },
  accountBase
);
assert.equal(sendWithNotes.descripcion, "Servicios de consultoría enero 2026");

// notes blank + items without description → throws (no more silent "Operación sujeta")
const itemNoDesc: InvoiceItem = { ...item, description: "" };
assert.throws(
  () => buildSendInvoicePayload({ ...invoiceBase, notes: null, items: [itemNoDesc] }, accountBase),
  /descripción de la operación/
);

const cancel = buildCancelInvoicePayload(invoiceBase, accountBase);
assert.equal((cancel.facturaAnulada as { fechaExpedicionFacturaAnulada: string }).fechaExpedicionFacturaAnulada, "15-03-2026");
assert.equal((cancel.facturaAnulada as { numSerieFacturaAnulada: string }).numSerieFacturaAnulada, "2026/F-001");

assert.ok(formatSimplefactuHttpError(402, { message: "cap" }).includes("Límite del plan"));
assert.ok(formatSimplefactuHttpError(429, { retryAfterSeconds: 30 }).includes("30"));

// Exempt E1 → causaExencion, no calif/cuota
const itemE1: InvoiceItem = {
  ...item,
  description: "Consulta médica",
  unitPriceCents: 20000,
  lineTotalCents: 20000,
  calificacion: "E1",
  tipoImpositivo: "0.0",
};
const invoiceE1: Invoice & { items: InvoiceItem[] } = {
  ...invoiceBase,
  subtotalCents: 20000,
  taxCents: 0,
  totalCents: 20000,
  taxRatePercent: 0,
  items: [itemE1],
};
const sendE1 = buildSendInvoicePayload(invoiceE1, accountBase);
const detE1 = (sendE1.detalles as Record<string, unknown>[])[0];
assert.equal(detE1.causaExencion, "E1");
assert.equal(detE1.base, 200);
assert.equal(detE1.calif, undefined);
assert.equal(detE1.cuota, undefined);
assert.equal(sendE1.cuotaTotal, 0);
assert.equal(sendE1.total, 200);

// Not subject N1 → calif only, no tipo/cuota
const itemN1: InvoiceItem = {
  ...item,
  description: "Operación no sujeta",
  calificacion: "N1",
  tipoImpositivo: "0.0",
};
const invoiceN1: Invoice & { items: InvoiceItem[] } = {
  ...invoiceBase,
  subtotalCents: 10000,
  taxCents: 0,
  totalCents: 10000,
  items: [itemN1],
};
const sendN1 = buildSendInvoicePayload(invoiceN1, accountBase);
const detN1 = (sendN1.detalles as Record<string, unknown>[])[0];
assert.equal(detN1.calif, "N1");
assert.equal(detN1.causaExencion, undefined);
assert.equal(detN1.tipo, undefined);
assert.equal(detN1.cuota, undefined);

console.log("test-verifactu-payloads: OK");
