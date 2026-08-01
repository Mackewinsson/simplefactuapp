/**
 * Unit checks for lib/simplefactu/job-sync.ts (run: npx tsx scripts/test-job-sync.ts)
 */
import assert from "node:assert/strict";

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";

// Mock Prisma on globalThis before importing job-sync
let mockInvoice: any = null;
let lastUpdateData: any = null;

const mockPrisma = {
  invoice: {
    findFirst: async ({ where }: any) => {
      if (mockInvoice && mockInvoice.id === where.id && mockInvoice.userId === where.userId) {
        return mockInvoice;
      }
      return null;
    },
    update: async ({ where, data }: any) => {
      lastUpdateData = data;
      if (mockInvoice && mockInvoice.id === where.id) {
        mockInvoice = { ...mockInvoice, ...data };
      }
      return mockInvoice;
    },
  },
};

(globalThis as any).prisma = mockPrisma;

import type { SimplefactuClient } from "../lib/simplefactu/client";

function createMockClient(responseObj: any, status = 200, throwError = false): SimplefactuClient {
  return {
    getJob: async (_jobId: string) => {
      if (throwError) {
        throw new Error("Network connection reset");
      }
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => responseObj,
      } as Response;
    },
  } as unknown as SimplefactuClient;
}

async function runTests() {
  const { syncJobStatusToInvoice, resyncVerifactuQrFromJob } = await import("../lib/simplefactu/job-sync");

  // Test 1: Missing invoice returns non-ok terminal
  mockInvoice = null;
  const resMissing = await syncJobStatusToInvoice(createMockClient({}), {
    invoiceId: "inv_missing",
    userId: "user_1",
    jobId: "job_1",
    kind: "SEND_INVOICE",
  });
  assert.equal(resMissing.ok, false);
  assert.equal(resMissing.terminal, true);
  assert.match(resMissing.message, /Factura no encontrada/);

  // Test 2: Network failure returns non-terminal networkFailure flag
  mockInvoice = { id: "inv_1", userId: "user_1", aeatStatus: "PENDING" };
  const resNetwork = await syncJobStatusToInvoice(createMockClient({}, 500, true), {
    invoiceId: "inv_1",
    userId: "user_1",
    jobId: "job_1",
    kind: "SEND_INVOICE",
  });
  assert.equal(resNetwork.ok, false);
  assert.equal(resNetwork.terminal, false);
  assert.equal(resNetwork.networkFailure, true);

  // Test 3: SEND_INVOICE SUCCEEDED maps CSV, QR, aeatStatus and aeatEstadoEnvio
  mockInvoice = { id: "inv_1", userId: "user_1", number: "2026/F-001", aeatStatus: "PENDING" };
  const jobSucceeded = {
    status: "SUCCEEDED",
    result: {
      qrInfo: { csv: "CSV_12345", qrText: "https://aeat.es/qr?csv=CSV_12345" },
      response: {
        aeatResponse: {
          RegFactuSistemaFacturacionSal: {
            Estado: "Correcto",
          },
        },
      },
    },
  };
  const resSucceeded = await syncJobStatusToInvoice(createMockClient(jobSucceeded), {
    invoiceId: "inv_1",
    userId: "user_1",
    jobId: "job_1",
    kind: "SEND_INVOICE",
  });
  assert.equal(resSucceeded.ok, true);
  assert.equal(resSucceeded.terminal, true);
  assert.equal(lastUpdateData.aeatStatus, "SUCCEEDED");
  assert.equal(lastUpdateData.aeatEstadoEnvio, "Correcto");
  assert.equal(lastUpdateData.aeatCsv, "CSV_12345");
  assert.equal(lastUpdateData.aeatQrText, "https://aeat.es/qr?csv=CSV_12345");
  assert.equal(lastUpdateData.aeatLastError, null);

  // Test 4: SEND_INVOICE FAILED (retryable) maps aeatStatus FAILED and terminal false
  mockInvoice = { id: "inv_1", userId: "user_1", aeatStatus: "PENDING" };
  const jobFailed = {
    status: "FAILED",
    lastError: "AEAT returned status: Incorrecto",
  };
  const resFailed = await syncJobStatusToInvoice(createMockClient(jobFailed), {
    invoiceId: "inv_1",
    userId: "user_1",
    jobId: "job_1",
    kind: "SEND_INVOICE",
  });
  assert.equal(resFailed.ok, false);
  assert.equal(resFailed.terminal, false);
  assert.equal(lastUpdateData.aeatStatus, "FAILED");
  assert.match(lastUpdateData.aeatLastError, /Incorrecto/);

  // Test 5: SEND_INVOICE DEAD (permanent) maps aeatStatus DEAD and terminal true
  mockInvoice = { id: "inv_1", userId: "user_1", number: "2026/F-001", aeatStatus: "PENDING" };
  const jobDead = {
    status: "DEAD",
    lastError: "SOAP fault",
    result: {
      aeatErrors: [{ code: "4001", description: "Certificado no válido" }],
    },
  };
  const resDead = await syncJobStatusToInvoice(createMockClient(jobDead), {
    invoiceId: "inv_1",
    userId: "user_1",
    jobId: "job_1",
    kind: "SEND_INVOICE",
  });
  assert.equal(resDead.ok, false);
  assert.equal(resDead.terminal, true);
  assert.equal(lastUpdateData.aeatStatus, "DEAD");
  assert.match(lastUpdateData.aeatLastError, /\[4001\] Certificado no válido/);

  // Test 6: CANCEL_INVOICE SUCCEEDED maps aeatCancellationStatus SUCCEEDED
  mockInvoice = { id: "inv_1", userId: "user_1", number: "2026/F-001", aeatCancellationStatus: "PENDING" };
  const cancelSucceeded = { status: "SUCCEEDED" };
  const resCancelSucceeded = await syncJobStatusToInvoice(createMockClient(cancelSucceeded), {
    invoiceId: "inv_1",
    userId: "user_1",
    jobId: "job_cancel_1",
    kind: "CANCEL_INVOICE",
  });
  assert.equal(resCancelSucceeded.ok, true);
  assert.equal(resCancelSucceeded.terminal, true);
  assert.equal(lastUpdateData.aeatCancellationStatus, "SUCCEEDED");
  assert.equal(lastUpdateData.aeatCancellationLastError, null);

  // Test 7: CANCEL_INVOICE DEAD maps aeatCancellationStatus DEAD
  mockInvoice = { id: "inv_1", userId: "user_1", number: "2026/F-001", aeatCancellationStatus: "PENDING" };
  const cancelDead = { status: "DEAD", lastError: "Cancel failed" };
  const resCancelDead = await syncJobStatusToInvoice(createMockClient(cancelDead), {
    invoiceId: "inv_1",
    userId: "user_1",
    jobId: "job_cancel_1",
    kind: "CANCEL_INVOICE",
  });
  assert.equal(resCancelDead.ok, false);
  assert.equal(resCancelDead.terminal, true);
  assert.equal(lastUpdateData.aeatCancellationStatus, "DEAD");
  assert.match(lastUpdateData.aeatCancellationLastError, /Cancel failed/);

  // Test 8: resyncVerifactuQrFromJob updates QR and CSV for SUCCEEDED invoice
  mockInvoice = { id: "inv_1", userId: "user_1", aeatStatus: "SUCCEEDED", aeatQrText: "old_qr" };
  const resyncJob = {
    status: "SUCCEEDED",
    result: {
      qrInfo: { csv: "NEW_CSV", qrText: "https://aeat.es/qr?new" },
    },
  };
  const resResync = await resyncVerifactuQrFromJob(createMockClient(resyncJob), {
    invoiceId: "inv_1",
    userId: "user_1",
    jobId: "job_1",
  });
  assert.equal(resResync.ok, true);
  assert.equal(lastUpdateData.aeatQrText, "https://aeat.es/qr?new");
  assert.equal(lastUpdateData.aeatCsv, "NEW_CSV");

  console.log("✓ test-job-sync: OK");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
