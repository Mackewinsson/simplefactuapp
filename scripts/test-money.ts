/**
 * Minimal tests for lib/money.ts. Run: pnpm exec tsx scripts/test-money.ts
 */
import assert from "node:assert";
import { parseDecimalToCents, formatCents } from "../lib/money";

const tests: Array<{ name: string; fn: () => void }> = [];

function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

// parseDecimalToCents
test("parseDecimalToCents: empty string returns 0", () => {
  assert.strictEqual(parseDecimalToCents(""), 0);
  assert.strictEqual(parseDecimalToCents("   "), 0);
});

test("parseDecimalToCents: integer euros to cents", () => {
  assert.strictEqual(parseDecimalToCents("0"), 0);
  assert.strictEqual(parseDecimalToCents("1"), 100);
  assert.strictEqual(parseDecimalToCents("12"), 1200);
  assert.strictEqual(parseDecimalToCents("100"), 10000);
});

test("parseDecimalToCents: decimal to cents (no float errors)", () => {
  assert.strictEqual(parseDecimalToCents("0.01"), 1);
  assert.strictEqual(parseDecimalToCents("0.99"), 99);
  assert.strictEqual(parseDecimalToCents("12.34"), 1234);
  assert.strictEqual(parseDecimalToCents("12.3"), 1230);
  assert.strictEqual(parseDecimalToCents("99.99"), 9999);
});

test("parseDecimalToCents: trims input", () => {
  assert.strictEqual(parseDecimalToCents("  12.34  "), 1234);
});

test("parseDecimalToCents: negative amounts", () => {
  assert.strictEqual(parseDecimalToCents("-1"), -100);
  assert.strictEqual(parseDecimalToCents("-0.01"), -1);
});

test("formatCents: formats with currency", () => {
  assert.ok(formatCents("EUR", 1234).includes("12"));
  assert.ok(formatCents("EUR", 1234).includes("34"));
  assert.ok(formatCents("USD", 100).includes("1"));
});

test("formatCents: round-trip with parseDecimalToCents", () => {
  const cents = parseDecimalToCents("19.99");
  assert.strictEqual(cents, 1999);
  const formatted = formatCents("EUR", cents);
  assert.ok(formatted.includes("19") && formatted.includes("99"));
});

// Run
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
