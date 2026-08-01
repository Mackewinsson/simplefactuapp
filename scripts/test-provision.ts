/**
 * Unit checks for lib/verifactu/provision.ts (run: npx tsx scripts/test-provision.ts)
 */
import assert from "node:assert/strict";

// Bypass Next.js 'server-only' package restriction
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
      auth: async () => ({ userId: "user_new_123" }),
      clerkClient: async () => ({
        users: {
          getUser: async () => ({
            emailAddresses: [{ id: "em1", emailAddress: "clerk@example.com" }],
            primaryEmailAddressId: "em1",
          }),
        },
      }),
    },
  } as any;
} catch {}

// Mock global fetch and env variables
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";
process.env.SIMPLEFACTU_API_BASE_URL = "http://localhost:3000/v1";
process.env.SIMPLEFACTU_ADMIN_KEY = "test_admin_key";
process.env.VERIFACTU_ENCRYPTION_KEY = Buffer.alloc(32, "c").toString("base64");

let mockAccountStore = new Map<string, any>();
let probeHttpStatus = 404;
let lastAdminCalls: { url: string; body: any }[] = [];

// Mock Prisma
(globalThis as any).prisma = {
  userVerifactuAccount: {
    findUnique: async ({ where }: any) => mockAccountStore.get(where.userId) ?? null,
    findFirst: async ({ where }: any) => {
      for (const val of mockAccountStore.values()) {
        if (val.simplefactuTenantId === where.simplefactuTenantId) return val;
      }
      return null;
    },
    create: async ({ data }: any) => {
      mockAccountStore.set(data.userId, data);
      return data;
    },
    update: async ({ where, data }: any) => {
      const existing = mockAccountStore.get(where.userId) || {};
      const updated = { ...existing, ...data };
      mockAccountStore.set(where.userId, updated);
      return updated;
    },
  },
};

// Mock fetch for API probe and admin endpoints
(globalThis as any).fetch = async (url: string, opts: any = {}) => {
  if (url.includes("/admin/")) {
    const body = opts.body ? JSON.parse(opts.body) : {};
    lastAdminCalls.push({ url, body });
    if (url.includes("/admin/tenants")) {
      return { ok: true, status: 201, text: async () => "{}" };
    }
    if (url.includes("/admin/api-keys")) {
      return {
        ok: true,
        status: 201,
        json: async () => ({ apiKey: { key: "new_provisioned_key_999" } }),
      };
    }
  }
  // Probe endpoint call
  if (url.includes("/jobs/__probe_nonexistent__")) {
    return {
      ok: false,
      status: probeHttpStatus,
      json: async () => ({ error: "Not Found" }),
    };
  }
  return { ok: true, status: 200, json: async () => ({}) };
};

async function runTests() {
  const { encryptSecret } = await import("../lib/verifactu/crypto");
  const { ensureVerifactuApiKey, BFF_KEY_SCOPES } = await import("../lib/verifactu/provision");

  // 1. Verify BFF_KEY_SCOPES
  assert.ok(BFF_KEY_SCOPES.includes("invoices:write"));
  assert.ok(BFF_KEY_SCOPES.includes("invoices:read"));
  assert.ok(BFF_KEY_SCOPES.includes("nif:read"));

  // 2. First-time provisioning: no row in DB → provisions tenant + key
  mockAccountStore.clear();
  lastAdminCalls = [];

  const resNew = await ensureVerifactuApiKey("user_new_123");
  assert.equal(resNew.tenantId, "sf_user_new_123");
  assert.equal(resNew.apiKey, "new_provisioned_key_999");
  assert.equal(lastAdminCalls.length, 2);
  assert.equal(lastAdminCalls[0].body.notificationEmail, "clerk@example.com");

  const storedRow = mockAccountStore.get("user_new_123");
  assert.ok(storedRow);
  assert.equal(storedRow.simplefactuTenantId, "sf_user_new_123");

  // 3. Existing row with valid key (probe returns 404): reuses cached key without re-provisioning
  probeHttpStatus = 404; // probe fails to find job, but key is valid (not 401)
  lastAdminCalls = [];

  const resCached = await ensureVerifactuApiKey("user_new_123");
  assert.equal(resCached.tenantId, "sf_user_new_123");
  assert.equal(resCached.apiKey, "new_provisioned_key_999");
  assert.equal(lastAdminCalls.length, 0); // No admin calls needed

  // 4. Existing row with revoked key (probe returns 401): rotates API key
  probeHttpStatus = 401; // Key revoked by API
  lastAdminCalls = [];

  const resRotated = await ensureVerifactuApiKey("user_new_123");
  assert.equal(resRotated.tenantId, "sf_user_new_123");
  assert.equal(resRotated.apiKey, "new_provisioned_key_999");
  assert.equal(lastAdminCalls.length, 2); // Re-provisioned via admin API

  console.log("✓ test-provision: OK");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
