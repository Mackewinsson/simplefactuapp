/**
 * Unit checks for Verifactu JSON builders (run: npx tsx scripts/test-verifactu-payloads.ts)
 */
import assert from "node:assert/strict";
import type { Invoice, InvoiceItem, UserVerifactuAccount } from "@prisma/client";
import { buildSendInvoicePayload } from "../lib/simplefactu/build-send-invoice-payload";
import { buildCancelInvoicePayload } from "../lib/simplefactu/build-cancel-invoice-payload";
import { formatSimplefactuHttpError } from "../lib/simplefactu/api-errors";
import { verifactuQrPayload } from "../lib/pdf/verifactu-qr-content";

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

const cancel = buildCancelInvoicePayload(invoiceBase, accountBase);
assert.equal((cancel.facturaAnulada as { fechaExpedicionFacturaAnulada: string }).fechaExpedicionFacturaAnulada, "15-03-2026");
assert.equal((cancel.facturaAnulada as { numSerieFacturaAnulada: string }).numSerieFacturaAnulada, "2026/F-001");

assert.ok(formatSimplefactuHttpError(402, { message: "cap" }).includes("Plan limit"));
assert.ok(formatSimplefactuHttpError(429, { retryAfterSeconds: 30 }).includes("30"));

// verifactuQrPayload now always builds the URL from invoice data (not from stored aeatQrText/csv)
const qrUrl = verifactuQrPayload({
  issuerNif: "B12345678",
  number: "2026/F-001",
  issueDate: new Date("2026-05-01"),
  totalCents: 121000,
});
assert.ok(qrUrl?.includes("nif=B12345678"), "QR URL must contain nif param");
assert.ok(qrUrl?.includes("numserie="), "QR URL must contain numserie param");
assert.ok(qrUrl?.includes("importe="), "QR URL must contain importe param");
assert.equal(verifactuQrPayload({ number: "", issueDate: new Date(), totalCents: 0 }), null);

console.log("test-verifactu-payloads: OK");
