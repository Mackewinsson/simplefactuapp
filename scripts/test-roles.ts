/**
 * Tests for role system helpers. Run: pnpm exec tsx scripts/test-roles.ts
 *
 * devForceRole lives in a "server-only" module so we replicate the pure logic
 * here rather than importing it (tsx triggers the server-only guard).
 */
import assert from "node:assert/strict";
import { isOnboardingExemptPath } from "../lib/verifactu/onboarding-paths";

const tests: Array<{ name: string; fn: () => void }> = [];
function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

// ---------------------------------------------------------------------------
// devForceRole logic (replicated from lib/auth/app-role.ts)
// ---------------------------------------------------------------------------
type AppRole = "admin" | "partner" | "user";

function devForceRoleLogic(
  nodeEnv: string | undefined,
  envValue: string | undefined
): AppRole | null {
  if (nodeEnv !== "development") return null;
  const forced = envValue?.trim().toLowerCase();
  if (forced === "admin" || forced === "partner" || forced === "user") return forced;
  return null;
}

test("devForceRole: returns null in production", () => {
  assert.equal(devForceRoleLogic("production", "admin"), null);
  assert.equal(devForceRoleLogic("production", "partner"), null);
});

test("devForceRole: returns null when env is empty", () => {
  assert.equal(devForceRoleLogic("development", undefined), null);
  assert.equal(devForceRoleLogic("development", ""), null);
  assert.equal(devForceRoleLogic("development", "  "), null);
});

test("devForceRole: returns partner when set", () => {
  assert.equal(devForceRoleLogic("development", "partner"), "partner");
  assert.equal(devForceRoleLogic("development", "  Partner "), "partner");
  assert.equal(devForceRoleLogic("development", "PARTNER"), "partner");
});

test("devForceRole: returns admin when set", () => {
  assert.equal(devForceRoleLogic("development", "admin"), "admin");
  assert.equal(devForceRoleLogic("development", " ADMIN "), "admin");
});

test("devForceRole: returns user when set", () => {
  assert.equal(devForceRoleLogic("development", "user"), "user");
});

test("devForceRole: returns null for invalid values", () => {
  assert.equal(devForceRoleLogic("development", "superadmin"), null);
  assert.equal(devForceRoleLogic("development", "integrador"), null);
  assert.equal(devForceRoleLogic("development", "root"), null);
});

// ---------------------------------------------------------------------------
// isOnboardingExemptPath
// ---------------------------------------------------------------------------

test("onboarding exempt: /admin paths", () => {
  assert.equal(isOnboardingExemptPath("/admin"), true);
  assert.equal(isOnboardingExemptPath("/admin/users"), true);
  assert.equal(isOnboardingExemptPath("/admin/tenants/123"), true);
});

test("onboarding exempt: /admin-access-denied", () => {
  assert.equal(isOnboardingExemptPath("/admin-access-denied"), true);
});

test("onboarding exempt: /partner paths", () => {
  assert.equal(isOnboardingExemptPath("/partner"), true);
  assert.equal(isOnboardingExemptPath("/partner/tenants/new"), true);
  assert.equal(isOnboardingExemptPath("/partner/tenants/abc"), true);
});

test("onboarding exempt: /partner-access-denied", () => {
  assert.equal(isOnboardingExemptPath("/partner-access-denied"), true);
});

test("onboarding exempt: /settings paths", () => {
  assert.equal(isOnboardingExemptPath("/settings"), true);
  assert.equal(isOnboardingExemptPath("/settings/verifactu"), true);
  assert.equal(isOnboardingExemptPath("/settings/billing"), true);
});

test("onboarding exempt: auth paths", () => {
  assert.equal(isOnboardingExemptPath("/sign-in"), true);
  assert.equal(isOnboardingExemptPath("/sign-up"), true);
});

test("onboarding exempt: /onboarding paths", () => {
  assert.equal(isOnboardingExemptPath("/onboarding"), true);
  assert.equal(isOnboardingExemptPath("/onboarding/step-2"), true);

  // Welcome (account type picker)
  assert.equal(isOnboardingExemptPath("/welcome"), true);
  assert.equal(isOnboardingExemptPath("/welcome/"), true);
});

test("onboarding exempt: /legal paths", () => {
  assert.equal(isOnboardingExemptPath("/legal"), true);
  assert.equal(isOnboardingExemptPath("/legal/privacy"), true);
});

test("onboarding NOT exempt: regular app paths", () => {
  assert.equal(isOnboardingExemptPath("/invoices"), false);
  assert.equal(isOnboardingExemptPath("/invoices/new"), false);
  assert.equal(isOnboardingExemptPath("/customers"), false);
  assert.equal(isOnboardingExemptPath("/products"), false);
  assert.equal(isOnboardingExemptPath("/"), false);
  assert.equal(isOnboardingExemptPath("/docs"), false);
});

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
let passed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}
console.log(`\n${passed}/${tests.length} passed`);
