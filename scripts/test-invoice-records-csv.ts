/**
 * CSV export helpers (run: pnpm exec tsx scripts/test-invoice-records-csv.ts)
 */
import assert from "node:assert/strict";
import { invoiceRecordsToCsv } from "../lib/simplefactu/invoice-records-csv";
import type { InvoiceRecordRow } from "../lib/simplefactu/invoice-records";

const sample: InvoiceRecordRow = {
  id: "rec-1",
  tenantId: "sf_test",
  numSerie: "2026/F-001",
  fecha: "21-05-2026",
  tipo: "ALTA",
  estado: "Correcto",
  csv: "A-TESTCSV",
  nifEmisor: "B12345678",
  serie: "2026",
  huella: "ABC123",
  huellaAnterior: null,
  numeroInstalacion: "20260521-120000-ABCD1234",
  fechaHoraHusoGenRegistro: "2026-05-21T12:00:00+02:00",
  createdAt: "2026-05-21T10:00:00.000Z",
};

const csv = invoiceRecordsToCsv([sample]);
assert.ok(csv.startsWith("numSerie,fecha,tipo,estado"), "header present");
assert.ok(csv.includes("2026/F-001"), "numSerie exported");
assert.ok(csv.includes('"A-TESTCSV"') || csv.includes("A-TESTCSV"), "csv field exported");

const withComma: InvoiceRecordRow = {
  ...sample,
  id: "rec-2",
  numSerie: '2026,"special"',
};
const csvQuoted = invoiceRecordsToCsv([withComma]);
assert.ok(csvQuoted.includes('""special""') || csvQuoted.includes('"2026,"'), "quotes escaped");

console.log("test-invoice-records-csv: OK");
