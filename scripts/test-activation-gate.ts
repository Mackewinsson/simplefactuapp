/**
 * Pure helpers for activation sandbox flag (no DB).
 */
import assert from "node:assert/strict";
import { test } from "node:test";

function isSandboxAutoApproveActivationFromEnv(env: NodeJS.ProcessEnv): boolean {
  if (env.SANDBOX_AUTO_APPROVE_ACTIVATION === "true") return true;
  return env.SANDBOX_AUTO_APPROVE_INTEGRATORS === "true";
}

test("sandbox activation: dedicated flag", () => {
  assert.equal(
    isSandboxAutoApproveActivationFromEnv({ SANDBOX_AUTO_APPROVE_ACTIVATION: "true" }),
    true
  );
});

test("sandbox activation: inherits integrator flag", () => {
  assert.equal(
    isSandboxAutoApproveActivationFromEnv({ SANDBOX_AUTO_APPROVE_INTEGRATORS: "true" }),
    true
  );
});

test("sandbox activation: off by default", () => {
  assert.equal(isSandboxAutoApproveActivationFromEnv({}), false);
  assert.equal(
    isSandboxAutoApproveActivationFromEnv({ SANDBOX_AUTO_APPROVE_ACTIVATION: "false" }),
    false
  );
});

console.log("activation-gate tests ok");
