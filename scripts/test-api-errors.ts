/**
 * Unit checks for TLS/network mapping in lib/simplefactu/api-errors.ts
 * Run: pnpm exec tsx scripts/test-api-errors.ts
 */
import assert from "node:assert/strict";
import {
  formatSimplefactuNetworkError,
  formatVerifactuActionError,
  wrapSimplefactuFetchError,
} from "../lib/simplefactu/api-errors";

const tests: Array<{ name: string; fn: () => void }> = [];

function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

function fetchFailedWithCause(code: string, message: string): TypeError {
  const cause = Object.assign(new Error(message), { code });
  const err = new TypeError("fetch failed");
  err.cause = cause;
  return err;
}

test("CERT_HAS_EXPIRED is not shown as raw fetch failed", () => {
  const err = fetchFailedWithCause("CERT_HAS_EXPIRED", "certificate has expired");
  const msg = formatVerifactuActionError(err);
  assert.notEqual(msg, "fetch failed");
  assert.match(msg, /caducado/i);
  assert.match(msg, /CERT_HAS_EXPIRED/);
  assert.match(msg, /certbot renew/);
});

test("formatSimplefactuNetworkError maps CERT_HAS_EXPIRED from cause.code", () => {
  const err = fetchFailedWithCause("CERT_HAS_EXPIRED", "certificate has expired");
  assert.equal(formatSimplefactuNetworkError(err), formatVerifactuActionError(err));
});

test("certificate has expired in cause.message without code still maps", () => {
  const cause = new Error("certificate has expired");
  const err = new TypeError("fetch failed");
  err.cause = cause;
  const msg = formatSimplefactuNetworkError(err);
  assert.match(msg, /caducado/i);
});

test("self-signed TLS is distinct from expiry", () => {
  const err = fetchFailedWithCause("DEPTH_ZERO_SELF_SIGNED_CERT", "self-signed certificate");
  const msg = formatVerifactuActionError(err);
  assert.notEqual(msg, "fetch failed");
  assert.match(msg, /no es de confianza/i);
  assert.doesNotMatch(msg, /caducado/i);
});

test("ECONNREFUSED keeps the connection-refused copy", () => {
  const err = fetchFailedWithCause("ECONNREFUSED", "connect ECONNREFUSED");
  const msg = formatVerifactuActionError(err);
  assert.match(msg, /conexión rechazada/i);
});

test("wrapSimplefactuFetchError replaces fetch failed for admin/partner callers", () => {
  const raw = fetchFailedWithCause("CERT_HAS_EXPIRED", "certificate has expired");
  const wrapped = wrapSimplefactuFetchError(raw);
  assert.notEqual(wrapped.message, "fetch failed");
  assert.match(wrapped.message, /caducado/i);
  assert.equal(wrapped.cause, raw);
  // Second format pass (admin page) must keep the Spanish message.
  assert.equal(formatVerifactuActionError(wrapped), wrapped.message);
});

test("unknown TypeError fetch failed stays generic, not raw fetch failed", () => {
  const err = new TypeError("fetch failed");
  const msg = formatVerifactuActionError(err);
  assert.equal(msg, "No se pudo contactar con el servicio de registro Verifactu. Revisa la red e inténtalo de nuevo.");
});

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
