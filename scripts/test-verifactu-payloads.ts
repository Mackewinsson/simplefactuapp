/**
 * Unit checks for Verifactu JSON builders (run: npx tsx scripts/test-verifactu-payloads.ts)
 */
import assert from "node:assert/strict";
import type { Invoice, InvoiceItem, UserVerifactuAccount } from "@prisma/client";
import { buildSendInvoicePayload } from "../lib/simplefactu/build-send-invoice-payload";
import { buildCancelInvoicePayload } from "../lib/simplefactu/build-cancel-invoice-payload";
import { formatSimplefactuHttpError, formatUserFacingError } from "../lib/simplefactu/api-errors";

process.env.VERIFACTU_SI_ID = process.env.VERIFACTU_SI_ID || "01";

const accountBase: UserVerifactuAccount = {
  userId: "user_test",
  simplefactuTenantId: "sf_user_test",
  apiKeyEncrypted: "enc",
  issuerNif: "B12345678",
  issuerLegalName: "Test SL",
  certificateUploadedAt: null,
  vnifVerifiedAt: null,
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
  tipoFactura: "F1",
  aeatEstadoEnvio: null,
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
assert.ok(
  formatSimplefactuHttpError(403, {
    message: "Este tenant solo puede emitir facturas para el NIF B12345678.",
  }).includes("Ajustes → Verifactu")
);
assert.ok(
  formatSimplefactuHttpError(400, {
    details: [{ field: "descripcion", message: "descripcion is required" }],
  }).includes("descripcion")
);
assert.ok(
  formatSimplefactuHttpError(409, {
    error: "Chain Continuity Error",
    message: "Huella mismatch",
  }).includes("Encadenamiento roto")
);
assert.ok(formatUserFacingError("[4116] formato incorrecto").includes("NIF del ObligadoEmision"));

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

// ID_OTRO destinatario (NIF-IVA UE, sin codigoPais)
const invoiceIdOtro: Invoice & { items: InvoiceItem[] } = {
  ...invoiceBase,
  customerName: "Cliente FR SA",
  customerNif: null,
  customerIdScheme: "ID_OTRO",
  customerIdType: "02",
  customerForeignId: "FR12345678901",
  customerCodigoPais: null,
};
const sendIdOtro = buildSendInvoicePayload(invoiceIdOtro, accountBase);
assert.equal(sendIdOtro.destNif, undefined);
assert.deepEqual(sendIdOtro.destIdOtro, { idType: "02", id: "FR12345678901" });

const invoiceIdOtroPassport: Invoice & { items: InvoiceItem[] } = {
  ...invoiceIdOtro,
  customerIdType: "03",
  customerForeignId: "X1234567",
  customerCodigoPais: "US",
};
const sendPassport = buildSendInvoicePayload(invoiceIdOtroPassport, accountBase);
assert.deepEqual(sendPassport.destIdOtro, {
  idType: "03",
  id: "X1234567",
  codigoPais: "US",
});

const invoiceF2: Invoice & { items: InvoiceItem[] } = {
  ...invoiceBase,
  tipoFactura: "F2",
  customerName: "—",
  customerNif: null,
  subtotalCents: 5000,
  taxCents: 1050,
  totalCents: 6050,
};
const sendF2 = buildSendInvoicePayload(invoiceF2, accountBase);
assert.equal(sendF2.tipoFactura, "F2");
assert.equal(sendF2.facturaSinIdentifDestinatarioArt61d, "S");
assert.equal(sendF2.destNif, undefined);
assert.equal(sendF2.destNombre, undefined);

// Multi-line items with different VAT rates and discounts grouped correctly
const item21: InvoiceItem = {
  id: "it21",
  invoiceId: "inv_multi",
  description: "Producto A (21%)",
  quantity: 2,
  unitPriceCents: 5000,
  discountCents: 1000, // base = 10000 - 1000 = 9000 -> 90.00
  discountConcept: "Promo",
  lineTotalCents: 9000,
  claveRegimen: "01",
  calificacion: "S1",
  tipoImpositivo: "21.0",
};

const item10: InvoiceItem = {
  id: "it10",
  invoiceId: "inv_multi",
  description: "Producto B (10%)",
  quantity: 1,
  unitPriceCents: 4000,
  discountCents: 0,
  discountConcept: null,
  lineTotalCents: 4000,
  claveRegimen: "01",
  calificacion: "S1",
  tipoImpositivo: "10.0",
};

const invoiceMulti: Invoice & { items: InvoiceItem[] } = {
  ...invoiceBase,
  id: "inv_multi",
  number: "2026/F-MULTI",
  subtotalCents: 13000,
  taxCents: 2290, // 9000 * 0.21 = 1890; 4000 * 0.10 = 400
  totalCents: 15290,
  items: [item21, item10],
};

const sendMulti = buildSendInvoicePayload(invoiceMulti, accountBase);
assert.equal(sendMulti.numSerie, "2026/F-MULTI");
const detallesMulti = sendMulti.detalles as Record<string, unknown>[];
assert.equal(detallesMulti.length, 2);
assert.deepEqual(detallesMulti[0], { clave: "01", calif: "S1", tipo: 21, base: 90, cuota: 18.9 });
assert.deepEqual(detallesMulti[1], { clave: "01", calif: "S1", tipo: 10, base: 40, cuota: 4 });

console.log("test-verifactu-payloads: OK");
