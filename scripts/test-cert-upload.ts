/**
 * Unit checks for uploadCertificateAction in app/(chrome)/settings/verifactu/actions.ts (run: npx tsx scripts/test-cert-upload.ts)
 */
import assert from "node:assert/strict";
import { encryptSecret } from "../lib/verifactu/crypto";

// Bypass Next.js 'server-only' package restriction in standalone test scripts
try {
  const serverOnlyPath = require.resolve("server-only");
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as any;

  const clerkPath = require.resolve("@clerk/nextjs/server");
  require.cache[clerkPath] = {
    id: clerkPath,
    filename: clerkPath,
    loaded: true,
    exports: {
      auth: async () => ({ userId: "user_test_1" }),
      clerkClient: async () => ({
        users: {
          getUser: async () => ({
            emailAddresses: [{ id: "em1", emailAddress: "test@example.com" }],
            primaryEmailAddressId: "em1",
          }),
        },
      }),
    },
  } as any;

  const nextCachePath = require.resolve("next/cache");
  require.cache[nextCachePath] = {
    id: nextCachePath,
    filename: nextCachePath,
    loaded: true,
    exports: {
      revalidatePath: () => {},
    },
  } as any;
} catch {}

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";
process.env.SIMPLEFACTU_API_BASE_URL = "http://localhost:3000/v1";
process.env.VERIFACTU_ENCRYPTION_KEY = Buffer.alloc(32, "b").toString("base64");
process.env.SIMPLEFACTU_ADMIN_KEY = "test_admin_key";

const testEncryptedKey = encryptSecret("mock_api_key_123");

let mockUserAccount: any = {
  userId: "user_test_1",
  simplefactuTenantId: "sf_user_test_1",
  apiKeyEncrypted: testEncryptedKey,
  issuerNif: "B12345678",
  certificateUploadedAt: null,
};
let mockApiResponse: { status: number; body: any } = {
  status: 200,
  body: { message: "Certificado subido correctamente", certificate: { nif: "B12345678" } },
};

// Mock Prisma
(globalThis as any).prisma = {
  userVerifactuAccount: {
    findUnique: async () => mockUserAccount,
    update: async ({ data }: any) => {
      mockUserAccount = { ...mockUserAccount, ...data };
      return mockUserAccount;
    },
  },
};

// Mock fetch for API client
(globalThis as any).fetch = async (url: string) => {
  if (url.includes("/admin/")) {
    return { ok: true, status: 200, json: async () => ({ apiKey: { key: "mock_api_key" } }) };
  }
  return {
    ok: mockApiResponse.status >= 200 && mockApiResponse.status < 300,
    status: mockApiResponse.status,
    json: async () => mockApiResponse.body,
    text: async () => JSON.stringify(mockApiResponse.body),
  };
};

async function runTests() {
  const { uploadCertificateAction } = await import("../app/(chrome)/settings/verifactu/actions");

  // Helper to mock FormData with File
  function createCertFormData(file: File | null, passphrase: string): FormData {
    const fd = new FormData();
    if (file) {
      fd.append("pfxFile", file);
    }
    fd.append("pfxPassphrase", passphrase);
    return fd;
  }

  // 1. Missing file returns error
  const fdNoFile = createCertFormData(null, "secret123");
  const resNoFile = await uploadCertificateAction(null, fdNoFile);
  assert.equal(resNoFile.ok, false);
  if (!resNoFile.ok) {
    assert.match(resNoFile.errors[0], /archivo \.pfx o \.p12/);
  }

  // 2. Missing passphrase returns error
  const fakeFile = new File([Buffer.from("dummy pfx content")], "cert.pfx", { type: "application/x-pkcs12" });
  const fdNoPass = createCertFormData(fakeFile, "");
  const resNoPass = await uploadCertificateAction(null, fdNoPass);
  assert.equal(resNoPass.ok, false);
  if (!resNoPass.ok) {
    assert.match(resNoPass.errors[0], /contraseña del PFX/);
  }

  // 3. API returns 422 wrong_passphrase
  mockApiResponse = { status: 422, body: { code: "wrong_passphrase", message: "Bad pass" } };
  const fdWrongPass = createCertFormData(fakeFile, "wrong");
  const resWrongPass = await uploadCertificateAction(null, fdWrongPass);
  assert.equal(resWrongPass.ok, false);
  if (!resWrongPass.ok) {
    assert.match(resWrongPass.errors[0], /contraseña no coincide/);
  }

  // 4. API returns 422 cert_nif_mismatch
  mockApiResponse = {
    status: 422,
    body: { code: "cert_nif_mismatch", message: "El NIF del certificado no coincide con el emisor" },
  };
  const fdMismatch = createCertFormData(fakeFile, "pass123");
  const resMismatch = await uploadCertificateAction(null, fdMismatch);
  assert.equal(resMismatch.ok, false);
  if (!resMismatch.ok) {
    assert.match(resMismatch.errors[0], /NIF del certificado no coincide/);
  }

  // 5. API returns 422 legacy_rc2 format warning
  mockApiResponse = {
    status: 422,
    body: { code: "legacy_rc2", message: "Formato RC2 antiguo" },
  };
  const fdRc2 = createCertFormData(fakeFile, "pass123");
  const resRc2 = await uploadCertificateAction(null, fdRc2);
  assert.equal(resRc2.ok, false);
  if (!resRc2.ok) {
    assert.match(resRc2.errors[0], /formato antiguo \(RC2\)/);
  }

  // 6. Happy path: API returns 200 and updates certificateUploadedAt in Prisma
  mockUserAccount.issuerNif = "B12345678";
  mockApiResponse = {
    status: 200,
    body: { message: "OK", certificate: { nif: "B12345678" } },
  };
  const fdHappy = createCertFormData(fakeFile, "correct_pass");
  const resHappy = await uploadCertificateAction(null, fdHappy);
  assert.equal(resHappy.ok, true);
  if (resHappy.ok) {
    assert.match(resHappy.message, /Certificado subido/);
  }
  assert.ok(mockUserAccount.certificateUploadedAt instanceof Date);

  console.log("✓ test-cert-upload: OK");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
